import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { createClient } from '@supabase/supabase-js';
import { normalizePlanId } from '@/lib/pricing';

function getProfileTierFromPlan(planType?: string | null) {
    switch (normalizePlanId(planType)) {
        case 'starter':
            return 'starter';
        case 'pro':
            return 'pro';
        case 'scale':
            return 'scale';
        default:
            return 'free';
    }
}

function getPaymentStatus(eventType: string, fallbackStatus?: string | null) {
    if (fallbackStatus) return fallbackStatus;

    switch (eventType) {
        case 'payment.failed':
            return 'failed';
        case 'refund.succeeded':
            return 'refunded';
        default:
            return 'succeeded';
    }
}

function getPaymentId(payload: any) {
    return payload?.payment_id || payload?.payment?.payment_id || payload?.data?.payment_id || null;
}

async function getUserIdFromSubscriptionPayload(supabaseAdmin: any, subscription: any) {
    if (subscription?.metadata?.user_id) {
        return subscription.metadata.user_id;
    }

    if (!subscription?.subscription_id) {
        return null;
    }

    const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('dodo_subscription_id', subscription.subscription_id)
        .maybeSingle();

    return data?.user_id || null;
}

async function getUserIdFromPaymentPayload(supabaseAdmin: any, payment: any) {
    if (payment?.metadata?.user_id) {
        return payment.metadata.user_id;
    }

    const paymentId = getPaymentId(payment);
    if (!paymentId) {
        return null;
    }

    const { data } = await supabaseAdmin
        .from('payment_transactions')
        .select('user_id')
        .eq('dodo_payment_id', paymentId)
        .maybeSingle();

    return data?.user_id || null;
}

async function logPaymentTransaction(supabaseAdmin: any, payment: any, eventType: string) {
    const userId = await getUserIdFromPaymentPayload(supabaseAdmin, payment);
    const paymentId = getPaymentId(payment);

    console.log('>>> WEBHOOK: Processing payment transaction:', { 
        userId, 
        paymentId, 
        rawMetadata: payment.metadata 
    });

    if (!userId || !paymentId) {
        console.error('>>> WEBHOOK: Skipping log - Missing userId or paymentId');
        return;
    }

    const normalizedPlanType = normalizePlanId(payment.metadata?.plan_type);
    const billingCycle = payment.metadata?.billing_cycle || 'monthly';
    const status = getPaymentStatus(eventType, payment.status);

    const { error } = await supabaseAdmin
        .from('payment_transactions')
        .upsert({
            dodo_payment_id: paymentId,
            user_id: userId,
            plan_type: normalizedPlanType,
            billing_cycle: billingCycle,
            status,
            created_at: payment.created_at || new Date().toISOString(),
            total_price_cents: payment.total_amount || payment.amount || 0,
            currency: payment.currency || payment.payment?.currency || 'USD',
            tax_price_cents: payment.tax || 0,
            usd_price_cents: payment.metadata?.original_price_usd 
                ? parseInt(payment.metadata.original_price_usd) * 100
                : (payment.currency === 'USD' ? (payment.total_amount || 0) : parseInt(payment.metadata?.mrr_cents || '0')),
            mrr_cents: parseInt(payment.metadata?.mrr_cents || '0'),
            tax_country: payment.billing?.country || payment.customer?.billing_address?.country,
            metadata: {
                ...payment.metadata,
                event_type: eventType,
                refund_id: payment.refund_id,
                settlement_amount: payment.settlement_amount,
                settlement_currency: payment.settlement_currency,
                invoice_url: payment.invoice_url,
            },
        }, { onConflict: 'dodo_payment_id' });

    if (error) {
        console.error('>>> WEBHOOK: Supabase Error during payment log:', error.message);
    } else {
        console.log('>>> WEBHOOK: Successfully logged payment to database');
    }
}

function getWebhookClients() {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!apiKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
        return null;
    }

    return {
        dodo: new DodoPayments({
            bearerToken: apiKey,
            environment: process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode',
            webhookKey: webhookSecret,
        }),
        supabaseAdmin: createClient(supabaseUrl, serviceRoleKey),
        webhookSecret,
    };
}

export async function POST(req: NextRequest) {
    console.log('>>> WEBHOOK: Received POST request');
    const clients = getWebhookClients();
    if (!clients) {
        console.error('>>> WEBHOOK: Configuration missing in environment variables');
        return NextResponse.json(
            { error: 'Webhook integrations are not configured on this environment' },
            { status: 500 }
        );
    }

    const { dodo, supabaseAdmin, webhookSecret } = clients;
    console.log('>>> WEBHOOK: Using secret starting with:', webhookSecret.substring(0, 8) + '...');
    const payload = await req.text();
    const signature = req.headers.get('x-dodo-signature');
    
    console.log('>>> WEBHOOK: Signature Present:', !!signature);

    try {
        // Verify webhook signature using the SDK's unwrap method
        const event = dodo.webhooks.unwrap(payload, {
            headers: Object.fromEntries(req.headers.entries()),
            key: webhookSecret
        });

        console.log('>>> WEBHOOK: Event verified SUCCESS:', event.type);

        switch (event.type) {
            case 'subscription.active':
            case 'subscription.updated': {
                const subscription = event.data as any;
                const userId = await getUserIdFromSubscriptionPayload(supabaseAdmin, subscription);
                const planType = normalizePlanId(subscription.metadata?.plan_type);
                const newSubscriptionId = subscription.subscription_id;

                console.log('>>> WEBHOOK: Processing subscription update:', { 
                    userId, 
                    planType, 
                    subscriptionId: newSubscriptionId,
                    status: subscription.status 
                });

                if (userId) {
                    // 1. Fetch current subscription from DB to check for upgrade
                    const { data: existingSub } = await supabaseAdmin
                        .from('subscriptions')
                        .select('dodo_subscription_id, status')
                        .eq('user_id', userId)
                        .single();

                    // 2. PERFECT UPGRADE LOGIC: If they have another active sub, cancel it in Dodo
                    if (existingSub && 
                        existingSub.dodo_subscription_id && 
                        existingSub.dodo_subscription_id !== newSubscriptionId &&
                        existingSub.status === 'active') {
                        
                        console.log(`Auto-cancelling old subscription ${existingSub.dodo_subscription_id} for user ${userId} (Upgrade to ${newSubscriptionId})`);
                        try {
                            await dodo.subscriptions.update(existingSub.dodo_subscription_id, { 
                                status: 'cancelled' 
                            });
                        } catch (cancelErr: any) {
                            console.error('Failed to auto-cancel old subscription:', cancelErr.message);
                            // We continue anyway so the new sub is recorded
                        }
                    }

                    // 3. Update DB with new sub status
                    await supabaseAdmin
                        .from('subscriptions')
                        .upsert({
                            user_id: userId,
                            dodo_subscription_id: newSubscriptionId,
                            dodo_customer_id: subscription.customer?.customer_id || subscription.customer_id,
                            plan_type: planType,
                            billing_cycle: subscription.metadata?.billing_cycle || 'monthly',
                            status: subscription.status,
                            mrr_cents: parseInt(subscription.metadata?.mrr_cents || '0'),
                            current_period_end: subscription.next_billing_date,
                            cancel_at_period_end: subscription.cancel_at_period_end || false,
                        }, { onConflict: 'user_id' });

                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .update({ subscription_tier: getProfileTierFromPlan(planType) })
                        .eq('id', userId);

                    if (profileError) {
                        console.error('>>> WEBHOOK: Error updating profile tier:', profileError.message);
                    } else {
                        console.log('>>> WEBHOOK: Successfully updated user profile and subscription');
                    }
                } else {
                    console.error('>>> WEBHOOK: Skipping subscription update - User ID not found');
                }
                break;
            }
            case 'payment.succeeded': {
                const payment = event.data as any;
                await logPaymentTransaction(supabaseAdmin, payment, event.type);
                break;
            }
            case 'subscription.cancelled': {
                const subscription = event.data as any;
                const userId = await getUserIdFromSubscriptionPayload(supabaseAdmin, subscription);

                if (userId) {
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({ status: 'canceled' })
                        .eq('user_id', userId);

                    await supabaseAdmin
                        .from('profiles')
                        .update({ subscription_tier: 'free' })
                        .eq('id', userId);
                }
                break;
            }
            case 'subscription.expired': {
                const subscription = event.data as any;
                const userId = await getUserIdFromSubscriptionPayload(supabaseAdmin, subscription);

                if (userId) {
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            status: 'canceled',
                            current_period_end: subscription.ended_at || subscription.next_billing_date || new Date().toISOString(),
                            cancel_at_period_end: true,
                        })
                        .eq('user_id', userId);

                    await supabaseAdmin
                        .from('profiles')
                        .update({ subscription_tier: 'free' })
                        .eq('id', userId);
                }
                break;
            }
            case 'payment.failed':
            case 'refund.succeeded': {
                const payment = event.data as any;
                await logPaymentTransaction(supabaseAdmin, payment, event.type);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('>>> WEBHOOK: Error during processing:', err.message);
        if (err.message.includes('Invalid signature') || err.message.includes('not match')) {
            console.error('>>> WEBHOOK: SIGNATURE MISMATCH. Check DODO_PAYMENTS_WEBHOOK_SECRET.');
        }
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
}

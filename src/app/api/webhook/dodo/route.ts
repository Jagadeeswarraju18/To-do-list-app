import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { createClient } from '@supabase/supabase-js';

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
            webhookKey: webhookSecret,
        }),
        supabaseAdmin: createClient(supabaseUrl, serviceRoleKey),
        webhookSecret,
    };
}

export async function POST(req: NextRequest) {
    const clients = getWebhookClients();
    if (!clients) {
        return NextResponse.json(
            { error: 'Webhook integrations are not configured on this environment' },
            { status: 500 }
        );
    }

    const { dodo, supabaseAdmin, webhookSecret } = clients;
    const payload = await req.text();
    const signature = req.headers.get('x-dodo-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    try {
        // Verify webhook signature using the SDK's unwrap method
        const event = dodo.webhooks.unwrap(payload, {
            headers: Object.fromEntries(req.headers.entries()),
            key: webhookSecret
        });

        console.log('Webhook event received:', event.type);

        switch (event.type) {
            case 'subscription.active':
            case 'subscription.updated': {
                const subscription = event.data as any; // Narrowing to any for simplified access to common props
                const userId = subscription.metadata?.user_id;
                const planType = subscription.metadata?.plan_type;
                const newSubscriptionId = subscription.subscription_id;

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
                            plan_type: planType || 'starter',
                            billing_cycle: subscription.metadata?.billing_cycle || 'monthly',
                            status: subscription.status,
                            mrr_cents: parseInt(subscription.metadata?.mrr_cents || '0'),
                            current_period_end: subscription.next_billing_date,
                            cancel_at_period_end: subscription.cancel_at_period_end || false,
                        }, { onConflict: 'user_id' });
                }
                break;
            }
            case 'payment.succeeded': {
                const payment = event.data as any;
                const userId = payment.metadata?.user_id;

                if (userId) {
                    // 1. Log the transaction
                    await supabaseAdmin
                        .from('payment_transactions')
                        .upsert({
                            dodo_payment_id: payment.payment_id,
                            userId: userId,
                            plan_type: payment.metadata?.plan_type || 'unknown',
                            billing_cycle: payment.metadata?.billing_cycle || 'monthly',
                            status: payment.status || 'succeeded',
                            created_at: new Date().toISOString(),
                            total_price_cents: payment.total_amount,
                            currency: payment.currency,
                            tax_price_cents: payment.tax || 0,
                            usd_price_cents: parseInt(payment.metadata?.original_price_usd || '0') * 100,
                            mrr_cents: parseInt(payment.metadata?.mrr_cents || '0'),
                            tax_country: payment.billing?.country,
                            metadata: {
                                ...payment.metadata,
                                settlement_amount: payment.settlement_amount,
                                settlement_currency: payment.settlement_currency,
                                invoice_url: payment.invoice_url
                            }
                        }, { onConflict: 'dodo_payment_id' });

                    // 2. Optionally update subscription status if not already handled by subscription events
                    // This is a safety net for one-time payments or initial subscription captures
                }
                break;
            }
            case 'subscription.cancelled': {
                const subscription = event.data as any;
                const userId = subscription.metadata?.user_id;

                if (userId) {
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({ status: 'canceled' })
                        .eq('user_id', userId);
                }
                break;
            }
            // Add more cases as needed (payment.succeeded, etc.)
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }
}

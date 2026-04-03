import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseApiClient } from '@supabase/supabase-js';
import { normalizePlanId, PLAN_BY_ID } from '@/lib/pricing';

function getDodoClient() {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) return null;
    const mode = process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode';
    return new DodoPayments({ 
        bearerToken: apiKey,
        environment: mode as 'live_mode' | 'test_mode'
    });
}

export async function POST(req: NextRequest) {
    try {
        const dodo = getDodoClient();
        if (!dodo) return NextResponse.json({ error: 'Payments not configured' }, { status: 500 });

        const supabase = createClient();
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { planId, billingCycle = 'monthly' } = body;
        const normalizedPlanId = normalizePlanId(planId);
        const plan = PLAN_BY_ID[normalizedPlanId];
        if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

        let productId = '';
        const normalizedBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
        let price = normalizedBillingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

        // DYNAMIC SWITCH LOGIC
        if (normalizedPlanId === 'starter') {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const adminClient = createSupabaseApiClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
            const { count } = await adminClient
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('plan_type', 'starter')
                .eq('status', 'active');

            if ((count || 0) < 10) {
                // Use $15 Promo ID (User is recreating this now)
                productId = (process.env.DODO_PAYMENTS_PRODUCT_STARTER_PROMO || '').trim();
                price = 15;
            } else {
                // Use $19 Regular ID
                productId = (process.env.DODO_PAYMENTS_PRODUCT_STARTER || '').trim();
                price = 19;
            }
        } else {
            if (normalizedPlanId === 'pro') productId = (process.env.DODO_PAYMENTS_PRODUCT_PRO || '').trim();
            if (normalizedPlanId === 'scale') productId = (process.env.DODO_PAYMENTS_PRODUCT_SCALE || '').trim();
        }

        const session = await dodo.checkoutSessions.create({
            product_cart: [{
                product_id: productId,
                quantity: 1,
            }],
            customer: { email: user.email! },
            metadata: {
                user_id: user.id,
                plan_type: normalizedPlanId,
                billing_cycle: normalizedBillingCycle,
                mrr_cents: (price * 100).toString(),
                original_price_usd: price.toString(),
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/founder/settings/success?session_id={checkout_session_id}`,
        });

        return NextResponse.json({ url: session.checkout_url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

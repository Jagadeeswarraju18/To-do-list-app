import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { createClient } from '@/lib/supabase/server';

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
});

// Map plan types to Dodo Payments Product IDs
const PLAN_PRODUCT_MAPPING: Record<string, string> = {
    'starter': 'pdt_0NaU6c5M4YvwAgt2CrbWH',
    'pro': 'pdt_0NaU6ggtnzI3ubzMxoqhh',
    'ultra': 'pdt_0NaU6jiAbYoMeoZKf3O7p',
};

const PLAN_PRICES: Record<string, string> = {
    'starter': '15',
    'pro': '39',
    'ultra': '69',
};

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await req.json();

        if (!planId || !PLAN_PRODUCT_MAPPING[planId]) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const productId = PLAN_PRODUCT_MAPPING[planId];

        // Create a Dodo checkout session
        const session = await dodo.checkoutSessions.create({
            product_cart: [{
                product_id: productId,
                quantity: 1,
            }],
            customer: {
                email: user.email!,
                name: user.user_metadata?.full_name || user.email!.split('@')[0],
            },
            billing_address: {
                country: 'US', // Default
            },
            metadata: {
                user_id: user.id,
                plan_type: planId,
                original_price_usd: PLAN_PRICES[planId],
                billing_cycle: 'monthly',
                mrr_cents: (parseInt(PLAN_PRICES[planId]) * 100).toString(),
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/success?session_id={checkout_session_id}`,
        });

        return NextResponse.json({ url: session.checkout_url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

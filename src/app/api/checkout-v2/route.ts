import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseApiClient } from '@supabase/supabase-js';
import { normalizePlanId, PLAN_BY_ID } from '@/lib/pricing';

function getDodoClient() {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
        return null;
    }
    // Explicitly set environment to handle test keys correctly
    const mode = process.env.DODO_PAYMENTS_MODE === 'test' ? 'test_mode' : 'live_mode';
    return new DodoPayments({ 
        bearerToken: apiKey,
        environment: mode as 'live_mode' | 'test_mode'
    });
}

const PLAN_PRODUCT_MAPPING: Record<string, string> = {
    starter: process.env.DODO_PAYMENTS_PRODUCT_STARTER || process.env.DODO_PAYMENTS_PRODUCT_STARTUP || '',
    pro: process.env.DODO_PAYMENTS_PRODUCT_PRO || process.env.DODO_PAYMENTS_PRODUCT_SCALE || '',
    scale: process.env.DODO_PAYMENTS_PRODUCT_SCALE || process.env.DODO_PAYMENTS_PRODUCT_UNLIMITED || '',
};

export async function POST(req: NextRequest) {
    console.log('>>> API CHECKOUT V2: Request started');
    try {
        const dodo = getDodoClient();
        if (!dodo) {
            console.error('>>> API CHECKOUT V2: Dodo client not configured');
            return NextResponse.json(
                { error: 'Payments are not configured on this environment' },
                { status: 500 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('>>> API CHECKOUT V2: Env Check:', {
            hasUrl: !!supabaseUrl,
            urlLength: supabaseUrl?.length,
            hasAnonKey: !!supabaseAnonKey,
            anonKeyLength: supabaseAnonKey?.length,
        });

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase environment variables are missing on the server.');
        }

        const supabase = createClient();
        const authHeader = req.headers.get("authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        console.log('>>> API CHECKOUT V2: Headers check - AuthHeader:', !!authHeader, 'BearerToken:', !!bearerToken);

        let { data: { user }, error: authError } = await supabase.auth.getUser();

        if ((!user || authError) && bearerToken && supabaseUrl && supabaseAnonKey) {
            console.log('>>> API CHECKOUT V2: Primary auth failed, trying Bearer token...');
            const apiSupabase = createSupabaseApiClient(supabaseUrl, supabaseAnonKey);
            const tokenLookup = await apiSupabase.auth.getUser(bearerToken);
            user = tokenLookup.data.user;
            authError = tokenLookup.error;
        }

        if (authError || !user) {
            console.error('>>> API CHECKOUT V2: Auth Failure:', authError?.message || 'No user found after both attempts');
            return NextResponse.json({ 
                error: `UNAUTHORIZED_CHECKOUT_V2_SIGNAL: ${authError?.message || 'NO_USER_FOUND'}`,
                details: "Multiple auth attempts failed. Ensure your session token is valid.",
                timestamp: new Date().toISOString()
            }, { status: 401 });
        }

        console.log('>>> API CHECKOUT V2: User verified:', user.email);

        const body = await req.json();
        console.log('>>> API CHECKOUT V2: Body:', JSON.stringify(body));
        const { planId, billingCycle = 'monthly' } = body;
        const normalizedPlanId = normalizePlanId(planId);

        if (normalizedPlanId === 'free' || !PLAN_PRODUCT_MAPPING[normalizedPlanId]) {
            console.error('>>> API CHECKOUT V2: Invalid plan:', normalizedPlanId);
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const productId = PLAN_PRODUCT_MAPPING[normalizedPlanId];
        const plan = PLAN_BY_ID[normalizedPlanId];
        const normalizedBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
        const price = normalizedBillingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

        console.log('>>> API CHECKOUT V2: Initiating Dodo session create for product:', productId);

        try {
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
                    plan_type: normalizedPlanId,
                    original_price_usd: price.toString(),
                    billing_cycle: normalizedBillingCycle,
                    mrr_cents: (price * 100).toString(),
                },
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/success?session_id={checkout_session_id}`,
            });

            console.log('>>> API CHECKOUT V2: Dodo session SUCCESS:', session.checkout_url);
            return NextResponse.json({ url: session.checkout_url });
        } catch (dodoError: any) {
            console.error('>>> API CHECKOUT V2: Dodo SDK Error:', dodoError);
            return NextResponse.json({ 
                error: `DODO_SDK_ERROR: ${dodoError.message || 'Unknown Dodo error'}`,
                status: dodoError.status || 500
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('>>> API CHECKOUT V2: Top-level Error:', error);
        return NextResponse.json({ error: `INTERNAL_V2_EXCEPTION: ${error.message || 'Internal Server Error'}` }, { status: 500 });
    }
}

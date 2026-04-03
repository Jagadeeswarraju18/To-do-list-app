ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;

CREATE POLICY "Users can view own transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

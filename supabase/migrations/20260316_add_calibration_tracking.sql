-- Add calibration_sent_at to products table to prevent calibration email spam
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS calibration_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.products.calibration_sent_at IS 'Timestamp of the last AI keyword calibration email sent to the user for this product.';

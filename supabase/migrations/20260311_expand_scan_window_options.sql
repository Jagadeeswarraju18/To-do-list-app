ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_scan_window_check;

ALTER TABLE public.products
    ADD CONSTRAINT products_scan_window_check
    CHECK (scan_window IN ('24h', '72h', '7d', '30d', '90d', '180d'));

-- Add 'impression' to the allowed event types for creator_analytics
-- We need to drop the existing check constraint and add a new one

ALTER TABLE public.creator_analytics DROP CONSTRAINT IF EXISTS creator_analytics_event_type_check;

ALTER TABLE public.creator_analytics ADD CONSTRAINT creator_analytics_event_type_check 
CHECK (event_type IN ('profile_view', 'link_click', 'deal_request', 'impression'));

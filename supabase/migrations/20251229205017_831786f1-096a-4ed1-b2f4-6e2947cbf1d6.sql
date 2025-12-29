-- Add mojo_cosmetics column to user_progress table to persist cosmetic data
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS mojo_cosmetics jsonb DEFAULT '{"owned": ["color-default"], "equipped": {"color": "color-default", "hat": null, "face": null, "accessory": null}}'::jsonb;
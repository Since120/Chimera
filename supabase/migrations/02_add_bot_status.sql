-- Add bot_status column to guilds table
ALTER TABLE public.guilds ADD COLUMN IF NOT EXISTS bot_status TEXT NOT NULL DEFAULT 'active';

-- Create an enum type for bot_status
CREATE TYPE public.bot_status_enum AS ENUM ('active', 'inactive', 'pending_invite');

-- Convert the column to use the enum type
ALTER TABLE public.guilds 
  ALTER COLUMN bot_status TYPE public.bot_status_enum 
  USING bot_status::public.bot_status_enum;

-- Set default value to 'active'
ALTER TABLE public.guilds 
  ALTER COLUMN bot_status SET DEFAULT 'active'::public.bot_status_enum;

-- Update existing records to have 'active' status
UPDATE public.guilds SET bot_status = 'active'::public.bot_status_enum WHERE bot_status IS NULL;

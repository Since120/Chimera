-- 1. Tabelle permissions erstellen
CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    permission_key TEXT NOT NULL UNIQUE,
    description TEXT NULL,
    module TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permissions_permission_key ON public.permissions(permission_key);
COMMENT ON TABLE public.permissions IS 'Definiert atomare Berechtigungen im System.';

-- 2. Tabelle guild_discord_role_permissions erstellen
CREATE TABLE IF NOT EXISTS public.guild_discord_role_permissions (
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    discord_role_id TEXT NOT NULL,
    permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (guild_id, discord_role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_gdrp_guild_id ON public.guild_discord_role_permissions(guild_id);
CREATE INDEX IF NOT EXISTS idx_gdrp_discord_role_id ON public.guild_discord_role_permissions(discord_role_id);
CREATE INDEX IF NOT EXISTS idx_gdrp_permission_id ON public.guild_discord_role_permissions(permission_id);
COMMENT ON TABLE public.guild_discord_role_permissions IS 'Verknüpft Discord-Rollen direkt mit Berechtigungen pro Guild.';

-- 3. Tabelle guild_user_permissions erstellen
CREATE TABLE IF NOT EXISTS public.guild_user_permissions (
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    user_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (guild_id, user_profile_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_gup_guild_id ON public.guild_user_permissions(guild_id);
CREATE INDEX IF NOT EXISTS idx_gup_user_profile_id ON public.guild_user_permissions(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_gup_permission_id ON public.guild_user_permissions(permission_id);
COMMENT ON TABLE public.guild_user_permissions IS 'Verknüpft User direkt mit Berechtigungen pro Guild (für Ausnahmen/individuelle Rechte).';

-- 4. Initiale Permissions einfügen
INSERT INTO public.permissions (permission_key, description, module) VALUES
    ('category:create', 'Allows creating new categories', 'Dynamic Voices'),
    ('category:read', 'Allows viewing categories and their details', 'Dynamic Voices'),
    ('category:update', 'Allows editing existing categories (name, switches, etc.)', 'Dynamic Voices'),
    ('category:delete', 'Allows deleting categories (if empty)', 'Dynamic Voices'),
    ('category:manage_permissions', 'Allows assigning Discord roles to categories for view/connect', 'Dynamic Voices'),
    ('zone:create', 'Allows creating new zones within categories', 'Dynamic Voices'),
    ('zone:read', 'Allows viewing zones and their details', 'Dynamic Voices'),
    ('zone:update', 'Allows editing existing zones (name, key, points, etc.)', 'Dynamic Voices'),
    ('zone:delete', 'Allows deleting zones', 'Dynamic Voices'),
    ('admin:read:permissions', 'Allows viewing permission assignments', 'Admin'),
    ('admin:assign:permissions', 'Allows assigning/revoking permissions to roles/users', 'Admin')
ON CONFLICT (permission_key) DO NOTHING;

-- 5. Überprüfung der erstellten Tabellen und Daten
-- Überprüfung der Tabelle permissions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'permissions'
ORDER BY ordinal_position;

-- Überprüfung der Tabelle guild_discord_role_permissions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'guild_discord_role_permissions'
ORDER BY ordinal_position;

-- Überprüfung der Tabelle guild_user_permissions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'guild_user_permissions'
ORDER BY ordinal_position;

-- Überprüfung der eingefügten Permissions
SELECT id, permission_key, description, module
FROM public.permissions
ORDER BY id;

-- Überprüfung der Indizes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('permissions', 'guild_discord_role_permissions', 'guild_user_permissions')
ORDER BY tablename, indexname;

-- Überprüfung der Fremdschlüssel
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('guild_discord_role_permissions', 'guild_user_permissions')
ORDER BY tc.table_name, kcu.column_name;

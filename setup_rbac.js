const { createClient } = require('@supabase/supabase-js');

// Supabase-Konfiguration
const supabaseUrl = 'https://sntjwhlryzozusnpaglx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudGp3aGxyeXpvenVzbnBhZ2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzg5MjQ3NCwiZXhwIjoyMDI5NDY4NDc0fQ.nt-wbK4-QwsHHBExlnUZn-UXD5U4-xd2JGO_LnZ5YXo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRBAC() {
  try {
    // 1. Tabelle permissions erstellen
    console.log('Erstelle permissions Tabelle...');
    const createPermissionsTable = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });

    if (createPermissionsTable.error) {
      throw new Error(`Fehler beim Erstellen der permissions Tabelle: ${createPermissionsTable.error.message}`);
    }
    console.log('permissions Tabelle erfolgreich erstellt.');

    // 2. Tabelle guild_discord_role_permissions erstellen
    console.log('Erstelle guild_discord_role_permissions Tabelle...');
    const createGuildDiscordRolePermissionsTable = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });

    if (createGuildDiscordRolePermissionsTable.error) {
      throw new Error(`Fehler beim Erstellen der guild_discord_role_permissions Tabelle: ${createGuildDiscordRolePermissionsTable.error.message}`);
    }
    console.log('guild_discord_role_permissions Tabelle erfolgreich erstellt.');

    // 3. Tabelle guild_user_permissions erstellen
    console.log('Erstelle guild_user_permissions Tabelle...');
    const createGuildUserPermissionsTable = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });

    if (createGuildUserPermissionsTable.error) {
      throw new Error(`Fehler beim Erstellen der guild_user_permissions Tabelle: ${createGuildUserPermissionsTable.error.message}`);
    }
    console.log('guild_user_permissions Tabelle erfolgreich erstellt.');

    // 4. Initiale Permissions einfügen
    console.log('Füge initiale Permissions ein...');
    const insertInitialPermissions = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });

    if (insertInitialPermissions.error) {
      throw new Error(`Fehler beim Einfügen der initialen Permissions: ${insertInitialPermissions.error.message}`);
    }
    console.log('Initiale Permissions erfolgreich eingefügt.');

    // 5. Überprüfen der erstellten Tabellen und eingefügten Daten
    console.log('Überprüfe erstellte Tabellen und Daten...');

    // Überprüfe permissions Tabelle
    const checkPermissionsTable = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'permissions'
        ORDER BY ordinal_position;
      `
    });

    if (checkPermissionsTable.error) {
      throw new Error(`Fehler beim Überprüfen der permissions Tabelle: ${checkPermissionsTable.error.message}`);
    }
    console.log('permissions Tabelle Struktur:', checkPermissionsTable.data);

    // Überprüfe guild_discord_role_permissions Tabelle
    const checkGuildDiscordRolePermissionsTable = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'guild_discord_role_permissions'
        ORDER BY ordinal_position;
      `
    });

    if (checkGuildDiscordRolePermissionsTable.error) {
      throw new Error(`Fehler beim Überprüfen der guild_discord_role_permissions Tabelle: ${checkGuildDiscordRolePermissionsTable.error.message}`);
    }
    console.log('guild_discord_role_permissions Tabelle Struktur:', checkGuildDiscordRolePermissionsTable.data);

    // Überprüfe guild_user_permissions Tabelle
    const checkGuildUserPermissionsTable = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'guild_user_permissions'
        ORDER BY ordinal_position;
      `
    });

    if (checkGuildUserPermissionsTable.error) {
      throw new Error(`Fehler beim Überprüfen der guild_user_permissions Tabelle: ${checkGuildUserPermissionsTable.error.message}`);
    }
    console.log('guild_user_permissions Tabelle Struktur:', checkGuildUserPermissionsTable.data);

    // Überprüfe eingefügte Permissions
    const checkPermissions = await supabase.rpc('execute_sql', {
      sql: `
        SELECT id, permission_key, description, module
        FROM public.permissions
        ORDER BY id;
      `
    });

    if (checkPermissions.error) {
      throw new Error(`Fehler beim Überprüfen der eingefügten Permissions: ${checkPermissions.error.message}`);
    }
    console.log('Eingefügte Permissions:', checkPermissions.data);

    console.log('RBAC-Setup erfolgreich abgeschlossen!');
  } catch (error) {
    console.error('Fehler beim RBAC-Setup:', error);
  }
}

setupRBAC();

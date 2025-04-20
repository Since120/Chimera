import requests
import json

# Supabase-Konfiguration
supabase_url = 'https://sntjwhlryzozusnpaglx.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudGp3aGxyeXpvenVzbnBhZ2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTI0NzQsImV4cCI6MjAyOTQ2ODQ3NH0.Nt-wbK4-QwsHHBExlnUZn-UXD5U4-xd2JGO_LnZ5YXo'

headers = {
    'apikey': supabase_key,
    'Authorization': f'Bearer {supabase_key}',
    'Content-Type': 'application/json'
}

def execute_sql(sql):
    url = f'{supabase_url}/rest/v1/rpc/execute_sql'
    data = {
        'sql': sql
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        print(f'Fehler beim Ausführen der SQL-Abfrage: {response.text}')
        return None
    return response.json()

def setup_rbac():
    try:
        # 1. Tabelle permissions erstellen
        print('Erstelle permissions Tabelle...')
        create_permissions_table_sql = '''
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
        '''
        result = execute_sql(create_permissions_table_sql)
        if result is None:
            return
        print('permissions Tabelle erfolgreich erstellt.')

        # 2. Tabelle guild_discord_role_permissions erstellen
        print('Erstelle guild_discord_role_permissions Tabelle...')
        create_guild_discord_role_permissions_table_sql = '''
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
        '''
        result = execute_sql(create_guild_discord_role_permissions_table_sql)
        if result is None:
            return
        print('guild_discord_role_permissions Tabelle erfolgreich erstellt.')

        # 3. Tabelle guild_user_permissions erstellen
        print('Erstelle guild_user_permissions Tabelle...')
        create_guild_user_permissions_table_sql = '''
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
        '''
        result = execute_sql(create_guild_user_permissions_table_sql)
        if result is None:
            return
        print('guild_user_permissions Tabelle erfolgreich erstellt.')

        # 4. Initiale Permissions einfügen
        print('Füge initiale Permissions ein...')
        insert_initial_permissions_sql = '''
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
        '''
        result = execute_sql(insert_initial_permissions_sql)
        if result is None:
            return
        print('Initiale Permissions erfolgreich eingefügt.')

        # 5. Überprüfen der erstellten Tabellen und eingefügten Daten
        print('Überprüfe erstellte Tabellen und Daten...')

        # Überprüfe permissions Tabelle
        check_permissions_table_sql = '''
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'permissions'
        ORDER BY ordinal_position;
        '''
        result = execute_sql(check_permissions_table_sql)
        if result is None:
            return
        print('permissions Tabelle Struktur:')
        for column in result:
            print(f"  {column['column_name']} ({column['data_type']}, {column['is_nullable']})")

        # Überprüfe guild_discord_role_permissions Tabelle
        check_guild_discord_role_permissions_table_sql = '''
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'guild_discord_role_permissions'
        ORDER BY ordinal_position;
        '''
        result = execute_sql(check_guild_discord_role_permissions_table_sql)
        if result is None:
            return
        print('guild_discord_role_permissions Tabelle Struktur:')
        for column in result:
            print(f"  {column['column_name']} ({column['data_type']}, {column['is_nullable']})")

        # Überprüfe guild_user_permissions Tabelle
        check_guild_user_permissions_table_sql = '''
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'guild_user_permissions'
        ORDER BY ordinal_position;
        '''
        result = execute_sql(check_guild_user_permissions_table_sql)
        if result is None:
            return
        print('guild_user_permissions Tabelle Struktur:')
        for column in result:
            print(f"  {column['column_name']} ({column['data_type']}, {column['is_nullable']})")

        # Überprüfe eingefügte Permissions
        check_permissions_sql = '''
        SELECT id, permission_key, description, module
        FROM public.permissions
        ORDER BY id;
        '''
        result = execute_sql(check_permissions_sql)
        if result is None:
            return
        print('Eingefügte Permissions:')
        for permission in result:
            print(f"  {permission['id']}: {permission['permission_key']} - {permission['description']} ({permission['module']})")

        # Überprüfe Indizes
        check_indexes_sql = '''
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename IN ('permissions', 'guild_discord_role_permissions', 'guild_user_permissions')
        ORDER BY tablename, indexname;
        '''
        result = execute_sql(check_indexes_sql)
        if result is None:
            return
        print('Indizes:')
        for index in result:
            print(f"  {index['indexname']}: {index['indexdef']}")

        # Überprüfe Fremdschlüssel
        check_foreign_keys_sql = '''
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
        '''
        result = execute_sql(check_foreign_keys_sql)
        if result is None:
            return
        print('Fremdschlüssel:')
        for fk in result:
            print(f"  {fk['constraint_name']}: {fk['table_name']}.{fk['column_name']} -> {fk['foreign_table_name']}.{fk['foreign_column_name']}")

        print('RBAC-Setup erfolgreich abgeschlossen!')
    except Exception as e:
        print(f'Fehler beim RBAC-Setup: {e}')

if __name__ == '__main__':
    setup_rbac()

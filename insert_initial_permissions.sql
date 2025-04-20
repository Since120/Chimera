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
    -- Permissions für die Admin-Verwaltung der Rechte selbst
    ('admin:read:permissions', 'Allows viewing permission assignments', 'Admin'),
    ('admin:assign:permissions', 'Allows assigning/revoking permissions to roles/users', 'Admin')
ON CONFLICT (permission_key) DO NOTHING;

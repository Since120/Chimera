CREATE TABLE public.permissions (
    id SERIAL PRIMARY KEY,
    permission_key TEXT NOT NULL UNIQUE,
    description TEXT NULL,
    module TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_permissions_permission_key ON public.permissions(permission_key);
COMMENT ON TABLE public.permissions IS 'Definiert atomare Berechtigungen im System.';

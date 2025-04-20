CREATE TABLE public.guild_user_permissions (
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    user_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (guild_id, user_profile_id, permission_id)
);

CREATE INDEX idx_gup_guild_id ON public.guild_user_permissions(guild_id);
CREATE INDEX idx_gup_user_profile_id ON public.guild_user_permissions(user_profile_id);
CREATE INDEX idx_gup_permission_id ON public.guild_user_permissions(permission_id);
COMMENT ON TABLE public.guild_user_permissions IS 'Verknüpft User direkt mit Berechtigungen pro Guild (für Ausnahmen/individuelle Rechte).';

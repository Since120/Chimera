CREATE TABLE public.guild_discord_role_permissions (
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    discord_role_id TEXT NOT NULL,
    permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (guild_id, discord_role_id, permission_id)
);

CREATE INDEX idx_gdrp_guild_id ON public.guild_discord_role_permissions(guild_id);
CREATE INDEX idx_gdrp_discord_role_id ON public.guild_discord_role_permissions(discord_role_id);
CREATE INDEX idx_gdrp_permission_id ON public.guild_discord_role_permissions(permission_id);
COMMENT ON TABLE public.guild_discord_role_permissions IS 'Verknüpft Discord-Rollen direkt mit Berechtigungen pro Guild.';

export interface GuildDto {
    id: string;
    discord_id: string;
    name: string;
    icon_url?: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
}
export interface GuildMemberDto {
    id: string;
    guild_id: string;
    user_id: string;
    discord_roles: string[];
    created_at: string;
    updated_at: string;
}
export interface GuildSelectionInfoDto {
    id: string;
    discord_id: string;
    name: string;
    icon_url?: string;
    is_admin: boolean;
}

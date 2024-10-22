export type UserAuth = {
    is_authorized: boolean;
    is_registered?: boolean;
    steamid?: string;
    name?: string;
    surname?: string;
    steam_name?: string;
    refresh_time?: number;
}
export enum AppRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GAMER = 'gamer', // alias accepted from frontend sessions
}

export const ALL_ROLES: string[] = ['admin', 'moderator', 'user', 'gamer'];

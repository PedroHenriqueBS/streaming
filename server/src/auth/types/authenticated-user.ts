export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

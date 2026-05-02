export interface AuthUser {
  id: number;
  username: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

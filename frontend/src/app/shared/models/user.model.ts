export interface UserDto {
  id: number;
  username: string;
  name: string;
  roles: string[];
}

export interface UserRegisterRequest {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  name: string;
  user: UserDto;
}

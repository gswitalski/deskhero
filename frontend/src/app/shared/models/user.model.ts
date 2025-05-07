export interface UserDto {
  id: number;
  username: string;
  name: string;
}

export interface UserRegisterRequest {
  username: string;
  name: string;
  password: string;
}

export interface UserRegisterResponse {
  message: string;
  user: UserDto;
  token: string;
}

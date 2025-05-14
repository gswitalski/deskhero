export interface DeskDto {
  deskId: number;
  roomName: string;
  deskNumber: string;
}

export interface DeskRequestDto {
  roomName: string;
  deskNumber: string;
}

export interface DeleteDeskResponseDto {
  message: string;
}

export interface LoginRequestDto {
  user_email: string;
  password: string;
}

export interface UserDataDto {
  user_uuid: string;
  domain_uuid: string;
  contact_uuid: string | null;
  username: string;
  user_email: string;
  user_status: string | null;
  api_key: string;
  user_totp_secret: string | null;
  user_enabled: string;
  add_user: string | null;
  add_date: string | null;
  insert_date: string | null;
  insert_user: string | null;
  update_date: string;
  update_user: string;
}

export interface AvailableExtensionsDto {
  api_key: string;
  extension_uuid: string;
  domain_uuid: string;
  extension: string;
  password: string;
}


export interface LoginResponseDto {
  data: UserDataDto;
  available_extensions: AvailableExtensionsDto;
}

export interface ApiErrorDto {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
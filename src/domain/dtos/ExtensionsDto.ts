export interface ExtensionListRequestDto {
  token: string;
}

export interface ExtensionItemDto {
  extension_uuid: string;
  domain_uuid: string;
  extension: string;
  password: string;
  description?: string;
  enabled?: boolean;
}

export interface ExtensionListResponseDto {
  data: ExtensionItemDto[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
  };
}
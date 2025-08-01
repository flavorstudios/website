export interface MediaVariant {
  url: string;
  width: number;
  height: number;
}

export interface MediaDoc {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  createdAt: string;
  updatedAt: string;
  variants?: MediaVariant[];
}
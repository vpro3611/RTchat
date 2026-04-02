export interface Attachment {
  id: string;
  blobId: string;
  type: 'image' | 'video' | 'file';
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

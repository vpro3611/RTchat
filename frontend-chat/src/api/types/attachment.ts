export interface Attachment {
  id: string;
  blobId: string;
  type: 'image' | 'video' | 'file' | 'voice';
  name: string;
  mimeType: string;
  size: number;
  duration?: number;
  createdAt: string;
}

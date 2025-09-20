export type Attachment = {
  id: number;
  url: string;
  mime?: string | null;
  size?: number;
  original_name?: string | null;
  type: 'image'|'video'|'audio'|'file';
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

export type Message = {
  id: number;
  project_id?: number;
  body: string;
  created_at?: string;
  sender?: { id: number; name: string };
  attachments?: Attachment[];
};

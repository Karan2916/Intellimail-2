export interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

export interface Email {
  id: string;
  threadId: string;
  sender: string;
  subject: string;
  body: string; // The full HTML body
  snippet: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  type: string; // MIME type
  size: number;
  attachmentId: string;
  messageId: string;
}

export enum Tone {
  FORMAL = 'Formal',
  FRIENDLY = 'Friendly',
  PROFESSIONAL = 'Professional',
  CONCISE = 'Concise',
  PERSUASIVE = 'Persuasive',
}

export enum ActiveView {
  INBOX = 'inbox',
  SUMMARY = 'summary',
  COMPOSE = 'compose',
  SEARCH = 'search',
  PRIVACY = 'privacy',
}

export type Theme = 'light' | 'dark';
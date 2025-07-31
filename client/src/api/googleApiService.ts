import type { UserInfo, Email, Attachment } from '../types';

const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Helper to decode base64url
function base64UrlDecode(str: string): string {
  if (!str) return "";
  try {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    // Decode from base64, then decode URI-encoded UTF-8 characters
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    console.error("Failed to decode base64url string:", e);
    return "Error: Could not decode email content.";
  }
}

// Helper to parse sender name
const parseSender = (fromHeader: string): string => {
  if (!fromHeader) return 'Unknown Sender';
  const match = fromHeader.match(/^(.*)<.*>$/);
  return match ? match[1].trim().replace(/"/g, '') : fromHeader;
};

// Recursive function to find the email body and attachments
const getParts = (message: any, parts: any[]): { body: string, htmlBody: string, attachments: Attachment[] } => {
    let body = '';
    let htmlBody = '';
    const attachments: Attachment[] = [];

    parts.forEach(part => {
        const filename = part.filename;
        const attachmentId = part.body.attachmentId;

        if (filename && attachmentId) {
            attachments.push({
                name: filename,
                type: part.mimeType,
                size: part.body.size,
                attachmentId: attachmentId,
                messageId: message.id
            });
        } else if (part.mimeType === 'text/plain' && !body) {
            body = part.body.data || '';
        } else if (part.mimeType === 'text/html' && !htmlBody) {
            htmlBody = part.body.data || '';
        }

        if (part.parts) {
            const subParts = getParts(message, part.parts);
            body = body || subParts.body;
            htmlBody = htmlBody || subParts.htmlBody;
            attachments.push(...subParts.attachments);
        }
    });

    return { body, htmlBody, attachments };
};


export const getUserInfo = async (accessToken: string): Promise<UserInfo> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  const data = await response.json();
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
};

export const fetchGmailEmails = async (accessToken: string): Promise<Email[]> => {
  const listResponse = await fetch(`${GMAIL_API_BASE_URL}/messages?maxResults=20`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!listResponse.ok) throw new Error('Failed to fetch email list');
  const { messages } = await listResponse.json();

  if (!messages) return [];

  const emailPromises = messages.map(async (message: any) => {
    const msgResponse = await fetch(`${GMAIL_API_BASE_URL}/messages/${message.id}?format=full`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!msgResponse.ok) {
        console.error(`Failed to fetch email ${message.id}`);
        return null;
    }
    const msgData = await msgResponse.json();
    const payload = msgData.payload;
    const headers = payload.headers;
    
    const findHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let finalBody = '';
    let attachments: Attachment[] = [];

    if (payload.parts) {
      // Handle multipart emails
      const { body, htmlBody, attachments: foundAttachments } = getParts(msgData, payload.parts);
      finalBody = htmlBody ? base64UrlDecode(htmlBody) : base64UrlDecode(body);
      attachments = foundAttachments;
    } else if (payload.body && payload.body.data) {
      // Handle simple emails where the body is at the top level
      finalBody = base64UrlDecode(payload.body.data);
    }

    return {
      id: msgData.id,
      threadId: msgData.threadId,
      subject: findHeader('subject'),
      sender: parseSender(findHeader('from')),
      snippet: msgData.snippet,
      body: finalBody,
      timestamp: new Date(parseInt(msgData.internalDate)).toLocaleString(),
      isRead: !msgData.labelIds.includes('UNREAD'),
      attachments: attachments
    };
  });
  
  const emails = (await Promise.all(emailPromises)).filter(e => e !== null) as Email[];
  return emails;
};

export const sendGmail = async (accessToken: string, to: string, from: string, subject: string, body: string): Promise<void> => {
    const message = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      body
    ].join('\n');

    // Safe Base64url encoding for UTF-8 characters
    const raw = btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_');

    const response = await fetch(`${GMAIL_API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${error.error.message}`);
    }
};
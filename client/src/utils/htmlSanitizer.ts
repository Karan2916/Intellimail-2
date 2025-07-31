
/**
 * A simple HTML sanitizer that removes script tags, "on" event attributes, and javascript: URIs
 * to prevent basic XSS attacks. This is not as robust as a library like DOMPurify
 * but serves as a basic layer of protection for this application's context.
 * @param html The HTML string to sanitize.
 * @returns A sanitized HTML string.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  let sanitized = html;
  
  // 1. Remove <script>...</script> tags and their content
  sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, '');
  
  // 2. Remove on... event handlers (e.g., onload, onclick)
  sanitized = sanitized.replace(/ on\w+=(['"]?)(?:(?!\1).)*\1/gim, '');
  
  // 3. Remove javascript: from href/src attributes
  sanitized = sanitized.replace(/ (href|src)=(['"]?)javascript:.+?\2/gim, ' $1="#"');

  return sanitized;
};

/**
 * Encodes a positive integer to a base-26 string (a-z).
 * 1 → a, 2 → b, ..., 26 → z, 27 → aa, 28 → ab, ...
 */
export function encodeSequential(n: number): string {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result || 'a';
}

/**
 * Validates whether a given string is a valid absolute HTTP or HTTPS URL.
 */
export function validateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Simple edge spam domain filter.
 * Blocks common temporary email services, spam redirects, and known malicious hosts.
 */
const BLOCKED_DOMAINS = [
  'spambog.com',
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'yopmail.com',
  'getairmail.com',
  'dispostable.com',
  'bit.ly',
  'tinyurl.com',
  't.co',
  'ow.ly'
];

export function isSpamOrMalicious(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(blocked => 
      hostname === blocked || hostname.endsWith('.' + blocked)
    );
  } catch {
    return true;
  }
}

export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generates a random 6-character Base62 short code.
 * Provides 62^6 = ~56.8 Billion variations.
 */
export function generateShortCode(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * 62);
    result += BASE62_CHARS[randomIndex];
  }
  return result;
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
  'bit.ly', // Prevent nesting recursion
  'tinyurl.com',
  't.co',
  'ow.ly'
];

export function isSpamOrMalicious(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    
    // Check direct blocks and subdomains
    return BLOCKED_DOMAINS.some(blocked => 
      hostname === blocked || hostname.endsWith('.' + blocked)
    );
  } catch {
    return true; // If we can't parse it, treat it as unsafe/malformed
  }
}

// Anti-bypass content filter for in-app chat.
// Blocks messages that try to move the conversation off-platform via
// phone numbers, emails, external URLs, or third-party messaging handles.
// Better to over-block than under-block for the MVP.

// Rule: reject if 7+ consecutive digits (with optional space/dot/dash separators).
const SEVEN_DIGITS  = /\+?\d(?:[\s.-]?\d){6,}/;
const EMAIL         = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const URL           = /\b(?:https?:\/\/)?[a-z0-9-]+\.[a-z]{2,}(\/\S*)?/i;
const HANDLE        = /\b(whatsapp|telegram|signal|viber|insta(gram)?|wa\.me|t\.me)\b|@[\w._]{2,}/i;

const APP_DOMAINS = [
  'iran-tour-advisor.com',
  'irantouradvisor.com',
  'localhost',
];

function shortSample(match) {
  return String(match).trim().slice(0, 20);
}

function isAllowedUrl(match) {
  const m = String(match).toLowerCase().trim();
  const host = m.replace(/^https?:\/\//, '').split(/[\/?#]/)[0];
  return APP_DOMAINS.some(
    (d) => host === d || host.endsWith('.' + d)
  );
}

export function detectContactInfo(text) {
  if (!text || typeof text !== 'string') return null;

  const emailMatch = text.match(EMAIL);
  if (emailMatch) return { reason: 'email', sample: shortSample(emailMatch[0]) };

  const handleMatch = text.match(HANDLE);
  if (handleMatch) return { reason: 'handle', sample: shortSample(handleMatch[0]) };

  const urlMatch = text.match(URL);
  if (urlMatch && !isAllowedUrl(urlMatch[0])) {
    return { reason: 'url', sample: shortSample(urlMatch[0]) };
  }

  const phoneMatch = text.match(SEVEN_DIGITS);
  if (phoneMatch) return { reason: 'phone', sample: shortSample(phoneMatch[0]) };

  return null;
}

// Quick test (manual): detectContactInfo("call me at 0912 345 6789")
//   should return { reason: 'phone', sample: '0912 345 6789' }

const crypto = require('node:crypto');

const ITERATIONS = 210_000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const FORMAT = 'pbkdf2_sha256';

function pepper() {
  return process.env.ACCESS_HASH_SECRET || '';
}

function normalizePasscode(value) {
  return String(value || '').trim();
}

function hashPasscode(passcode) {
  const normalized = normalizePasscode(passcode);
  if (!normalized) return null;

  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.pbkdf2Sync(`${pepper()}${normalized}`, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('base64url');
  return `${FORMAT}$${ITERATIONS}$${salt}$${hash}`;
}

function verifyPasscode(passcode, storedHash) {
  const normalized = normalizePasscode(passcode);
  if (!normalized || !storedHash) return false;

  const [format, iterationsText, salt, expected] = String(storedHash).split('$');
  if (format !== FORMAT || !iterationsText || !salt || !expected) return false;

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;

  const actual = crypto.pbkdf2Sync(`${pepper()}${normalized}`, salt, iterations, KEY_LENGTH, DIGEST).toString('base64url');
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function sanitizeAccessPayload(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeAccessPayload);

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === 'accessCode' ? undefined : sanitizeAccessPayload(child)
    ]).filter(([, child]) => child !== undefined)
  );
}

module.exports = {
  hashPasscode,
  sanitizeAccessPayload,
  verifyPasscode
};

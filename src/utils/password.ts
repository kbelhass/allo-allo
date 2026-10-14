// Lightweight password hashing using the browser's native Web Crypto API.
// Not bank-grade security, but far better than storing/comparing plaintext,
// and needs zero extra npm dependency.
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

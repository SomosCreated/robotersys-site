export function isSpam(input: { website?: string; _elapsed?: number }): boolean {
  if (input.website && input.website.length > 0) return true;
  if (typeof input._elapsed === 'number' && input._elapsed < 1500) return true;
  return false;
}

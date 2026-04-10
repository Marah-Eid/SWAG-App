/**
 * Formats a UTC timestamp string to 12-hour time (e.g. "3:07 PM")
 * using the device's real local clock.
 *
 * Uses getHours()/getMinutes() instead of Intl.DateTimeFormat because
 * React Native's Hermes JS engine does not reliably apply the device
 * timezone through Intl — causing times to appear hours behind.
 *
 * @param {string|null} utcString - UTC ISO string from backend e.g. "2026-04-10T14:23:00" or "2026-04-10T14:23:00Z"
 * @returns {string} Local time in 12-hour format, e.g. "3:07 PM"
 */
export function formatChatTime(utcString) {
  if (!utcString) return '';

  // Ensure the string is treated as UTC by the Date parser.
  // Without 'Z', some engines parse it as local time — which is wrong.
  const normalized = utcString.endsWith('Z') ? utcString : utcString + 'Z';
  const date = new Date(normalized);

  // getHours() and getMinutes() always use the device's local timezone.
  // This works correctly in Hermes (React Native) on all Android/iOS phones.
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;           // convert 0 → 12, 13 → 1, etc.
  const mm = String(minutes).padStart(2, '0');

  return `${hours}:${mm} ${ampm}`;    // e.g. "3:07 PM"
}

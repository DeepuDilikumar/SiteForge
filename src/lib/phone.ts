import type { CountryCode } from "@/lib/places/types";

const DIAL_CODES: Record<CountryCode, string> = { IN: "91", US: "1", GB: "44", AU: "61" };

/** Normalise a phone number to E.164 (e.g. "+919447012345") using the business country. */
export function toE164(phone: string, country: CountryCode): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const dial = DIAL_CODES[country];
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits.length >= 8 ? `+${digits}` : null;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (country === "US") {
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return digits.length === 10 ? `+1${digits}` : null;
  }
  if (digits.startsWith(dial) && digits.length > 10) return `+${digits}`;
  digits = digits.replace(/^0+/, "");
  return digits.length >= 8 ? `+${dial}${digits}` : null;
}

export function waDigits(phone: string, country: CountryCode): string | null {
  const e164 = toE164(phone, country);
  return e164 ? e164.slice(1) : null;
}

/** Whether the number is likely a mobile, so WhatsApp is worth offering. */
export function isMobileCapable(phone: string, country: CountryCode): boolean {
  const e164 = toE164(phone, country);
  if (!e164) return false;
  const national = e164.slice(1 + DIAL_CODES[country].length);
  switch (country) {
    case "IN":
      return national.length === 10 && /^[6-9]/.test(national);
    case "GB":
      return national.startsWith("7");
    case "AU":
      return national.startsWith("4");
    case "US":
      return false;
  }
}

export function telHref(phone: string, country: CountryCode): string {
  return `tel:${toE164(phone, country) ?? phone.replace(/[^\d+]/g, "")}`;
}

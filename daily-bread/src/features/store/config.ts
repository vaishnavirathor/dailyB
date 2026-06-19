/**
 * Pilot ordering flow, zero payment-SDK dependencies:
 * - UPI-first on Android via the upi://pay intent (GPay/PhonePe/Paytm
 *   all register the scheme) — exactly how India pays
 * - WhatsApp-to-order as the universal fallback (and iOS/web primary)
 *
 * TODO(launch): replace BOTH placeholders with the real store WhatsApp
 * business number (digits only) and a real UPI VPA.
 */
export const ORDER_WHATSAPP_NUMBER = '919999999999';
export const STORE_UPI_VPA = 'dailybread@upi';
export const STORE_PAYEE_NAME = 'Daily Bread Store';

export function whatsappOrderUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** upi://pay deep link per the NPCI linking spec. */
export function upiPayUrl(options: {
  vpa: string;
  payeeName: string;
  amountInr: number;
  note: string;
}): string {
  const params = new URLSearchParams({
    pa: options.vpa,
    pn: options.payeeName,
    am: options.amountInr.toFixed(2),
    cu: 'INR',
    tn: options.note.slice(0, 80),
  });
  return `upi://pay?${params.toString()}`;
}

export function formatInr(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

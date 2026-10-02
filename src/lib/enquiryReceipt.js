export function createEnquiryReceiptNumber(now = new Date(), uuid = globalThis.crypto.randomUUID()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = uuid.replaceAll("-", "").slice(0, 8).toUpperCase();
  return `CP-${date}-${suffix}`;
}

export function createWhatsAppReceiptUrl(whatsappNumber, enquiry) {
  const destination = String(whatsappNumber ?? "").replace(/\D/g, "");
  if (destination.length < 8) return "";

  const message = [
    "ANSARI PAINTS",
    `Receipt number: ${enquiry.receiptNumber}`,
    `Customer name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email || "Not provided"}`,
    `City: ${enquiry.city || "Not provided"}`,
    `Product/project interest: ${enquiry.interest || "Not specified"}`,
    `Customer message: ${enquiry.message}`,
    "Status: NEW",
  ].join("\n");

  return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
}

/**
 * Notification Service Utility
 * Supports WhatsApp, SMS, and Email placeholders.
 */

export const sendNotification = async ({
  type,
  to,
  message,
}: {
  type: "WHATSAPP" | "SMS" | "EMAIL";
  to: string;
  message: string;
}) => {
  console.log(`[NOTIFICATION SERVICE] Sending ${type} to ${to}: ${message}`);

  // Implementation Logic (Placeholder for Twilio/SendGrid)
  // if (type === "WHATSAPP") { ... call WhatsApp Business API ... }
  // if (type === "SMS") { ... call Twilio SMS API ... }

  return { success: true, timestamp: new Date() };
};

export const getBookingConfirmationTemplate = (clientName: string, eventDate: string, hallName: string) => {
  return `Hi ${clientName}! Your booking at ${hallName} for ${eventDate} has been confirmed. Thank you for choosing us! - Lincoz MMS`;
};

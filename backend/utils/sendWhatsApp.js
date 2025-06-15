import axios from "axios";

/**
 *  to    – MSISDN in international format, e.g. 2347067419330
 *  body  – plain-text message
 */
export async function sendWhatsApp({ to, body }) {
  const token = process.env.WHATSAPP_TOKEN; // -—  ‘EAAG…’
  const phoneId = process.env.WHATSAPP_PHONE_ID; // -—  ‘11 22 33 44 55’
  if (!token || !phoneId) throw new Error("WhatsApp env vars missing");

  await axios.post(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

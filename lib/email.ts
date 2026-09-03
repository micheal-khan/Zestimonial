import { Resend } from 'resend';

export async function sendTestimonialRequest(input: { to: string; clientName: string; workspaceName: string; collectionUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const };
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from, to: input.to, subject: `${input.workspaceName} would love your feedback`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#21322b"><h1 style="font-size:28px">Hi ${escapeHtml(input.clientName)},</h1><p style="font-size:16px;line-height:1.7">${escapeHtml(input.workspaceName)} would love to hear about your experience. It takes less than two minutes and you won’t need an account.</p><a href="${input.collectionUrl}" style="display:inline-block;margin-top:16px;background:#21322b;color:white;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Share your testimonial</a><p style="margin-top:28px;color:#748079;font-size:13px">Sent with Zestimonial</p></div>`,
  });
  if (result.error) throw new Error(result.error.message);
  return { sent: true, id: result.data?.id };
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!); }

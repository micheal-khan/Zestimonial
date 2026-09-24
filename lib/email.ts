import { Resend } from 'resend';

export async function sendTestimonialRequest(input: { to: string; clientName: string; workspaceName: string; collectionUrl: string; reminder?: boolean }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const };
  const resend = new Resend(apiKey);
  const subject = input.reminder ? `A quick reminder from ${input.workspaceName}` : `${input.workspaceName} would love your feedback`;
  const body = input.reminder
    ? `Just a friendly nudge in case this got buried. ${escapeHtml(input.workspaceName)} would still love to hear about your experience. It only takes a couple of minutes.`
    : `${escapeHtml(input.workspaceName)} would love to hear about your experience. It takes less than two minutes and you won’t need an account.`;
  const result = await resend.emails.send({
    from, to: input.to, subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#21322b"><h1 style="font-size:28px">Hi ${escapeHtml(input.clientName)},</h1><p style="font-size:16px;line-height:1.7">${body}</p><a href="${escapeHtml(input.collectionUrl)}" style="display:inline-block;margin-top:16px;background:#21322b;color:white;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Share your testimonial</a><p style="margin-top:28px;color:#748079;font-size:13px">Sent with Zestimonial</p></div>`,
  });
  if (result.error) throw new Error(result.error.message);
  return { sent: true, id: result.data?.id };
}

export async function sendNewTestimonialNotification(input: { to: string; workspaceName: string; authorName: string; quote: string; dashboardUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const };
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: `New testimonial from ${input.authorName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#21322b"><p style="margin:0;color:#5a6b62;font-weight:bold;font-size:12px;letter-spacing:.08em">ZESTIMONIAL</p><h1 style="font-size:28px;margin:14px 0">A new client story is ready to review</h1><p style="font-size:16px;line-height:1.7"><strong>${escapeHtml(input.authorName)}</strong> shared a testimonial for ${escapeHtml(input.workspaceName)}.</p><blockquote style="margin:22px 0;padding:18px;border-left:4px solid #d9f75b;background:#f6f8f3;font-size:16px;line-height:1.65">“${escapeHtml(input.quote)}”</blockquote><a href="${escapeHtml(input.dashboardUrl)}" style="display:inline-block;background:#21322b;color:white;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Review testimonial</a><p style="margin-top:28px;color:#748079;font-size:13px">Sent with Zestimonial</p></div>`,
  });
  if (result.error) throw new Error(result.error.message);
  return { sent: true, id: result.data?.id };
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!); }

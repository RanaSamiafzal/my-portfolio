import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Inquiry notifications via Resend (preferred) or SMTP fallback.
 *
 * Env (Resend — recommended):
 *   RESEND_API_KEY   from https://resend.com/api-keys
 *   MAIL_FROM        e.g. "Ranasami <onboarding@resend.dev>" until domain is verified
 *   MAIL_TO          where notifications go (your Gmail)
 *   MAIL_AUTOREPLY   "true" to confirm to the visitor (needs verified domain for best deliverability)
 *
 * Env (SMTP fallback):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */

export type Inquiry = {
  name: string;
  /** Email or phone, as the visitor typed it. */
  contact: string;
  message: string;
  company?: string | null;
  interest?: string | null;
  source: string;
};

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function hasMail() {
  return Boolean(process.env.RESEND_API_KEY) || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress() {
  return process.env.MAIL_FROM?.trim() || "Ranasami Portfolio <onboarding@resend.dev>";
}

function toAddress() {
  return process.env.MAIL_TO?.trim() || process.env.SMTP_USER || "";
}

function buildInquiryHtml(inq: Inquiry) {
  const rows: [string, string][] = [
    ["Name", inq.name],
    ["Contact", inq.contact],
    ...(inq.company ? ([["Company", inq.company]] as [string, string][]) : []),
    ...(inq.interest ? ([["Interest", inq.interest]] as [string, string][]) : []),
    ["Source", inq.source],
  ];

  const replyHint = isEmail(inq.contact)
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#86efac">Reply to this email to answer <strong style="color:#f5f1ea">${escape(inq.name)}</strong> directly.</p>`
    : `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#a3a3a3">Contact is not an email — reach out via phone/WhatsApp.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New inquiry</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a0a0a;border:1px solid #1f3a26;border-radius:16px;overflow:hidden">
          <tr>
            <td style="padding:28px 28px 20px;border-bottom:1px solid #1f3a26;background:linear-gradient(180deg,#0f1a12 0%,#0a0a0a 100%)">
              <p style="margin:0 0 8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#00ff41">New inquiry · ranasami.dev</p>
              <h1 style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#f5f1ea">Someone reached out</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#a3a3a3">${escape(inq.name)}${inq.interest ? ` · ${escape(inq.interest)}` : ""}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                ${rows
                  .map(
                    ([k, v], i) => `
                <tr>
                  <td style="padding:10px 0;border-top:${i === 0 ? "none" : "1px solid #1a1a1a"};width:110px;vertical-align:top;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#4ade80">${escape(k)}</td>
                  <td style="padding:10px 0;border-top:${i === 0 ? "none" : "1px solid #1a1a1a"};font-size:15px;color:#f5f1ea;word-break:break-word">${escape(v)}</td>
                </tr>`,
                  )
                  .join("")}
              </table>
              <div style="margin-top:20px;padding:16px 18px;background:#050505;border:1px solid #1f3a26;border-radius:12px">
                <p style="margin:0 0 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4ade80">Message</p>
                <p style="margin:0;font-size:15px;line-height:1.65;color:#e7e5e4;white-space:pre-wrap">${escape(inq.message)}</p>
              </div>
              ${replyHint}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #1f3a26">
              <p style="margin:0;font-size:12px;color:#737373">Also saved to your <a href="https://ranasami.dev/admin" style="color:#00ff41;text-decoration:none">admin inbox</a> when the database is connected.</p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#525252">Automated notification from your portfolio contact form.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildInquiryText(inq: Inquiry) {
  const rows: [string, string][] = [
    ["Name", inq.name],
    ["Contact", inq.contact],
    ...(inq.company ? ([["Company", inq.company]] as [string, string][]) : []),
    ...(inq.interest ? ([["Interest", inq.interest]] as [string, string][]) : []),
    ["Source", inq.source],
  ];
  return `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${inq.message}`;
}

function buildAutoreplyHtml(name: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#050505;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0a0a0a;border:1px solid #1f3a26;border-radius:16px">
        <tr><td style="padding:28px">
          <p style="margin:0 0 8px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#00ff41">ranasami.dev</p>
          <h1 style="margin:0 0 12px;font-size:20px;color:#f5f1ea">Thanks, ${escape(name)}</h1>
          <p style="margin:0;font-size:15px;line-height:1.65;color:#a3a3a3">Your message reached me. I usually reply within a day.</p>
          <p style="margin:20px 0 0;font-size:14px;color:#f5f1ea">— Rana Muhammad Sami<br /><span style="color:#737373">Full Stack Engineer</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

let smtpTransport: Transporter | null = null;

function getSmtp() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP is not configured");
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  smtpTransport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return smtpTransport;
}

async function sendViaResend(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });
  if (error) throw new Error(error.message || "Resend send failed");
}

async function sendViaSmtp(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  await getSmtp().sendMail(opts);
}

async function sendEmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  if (process.env.RESEND_API_KEY) return sendViaResend(opts);
  return sendViaSmtp(opts);
}

/** Emails the owner about a new inquiry, and optionally confirms receipt to the visitor. */
export async function sendInquiryEmails(inq: Inquiry) {
  if (!hasMail()) throw new Error("Mail is not configured");

  const from = fromAddress();
  const to = toAddress();
  if (!to) throw new Error("MAIL_TO is not set");

  const replyTo = isEmail(inq.contact) ? inq.contact : undefined;
  const subject = `New inquiry from ${inq.name}${inq.interest ? ` · ${inq.interest}` : ""}`;

  await sendEmail({
    from,
    to,
    replyTo,
    subject,
    text: buildInquiryText(inq),
    html: buildInquiryHtml(inq),
  });

  if (process.env.MAIL_AUTOREPLY === "true" && replyTo) {
    await sendEmail({
      from,
      to: replyTo,
      subject: "Thanks — I got your message",
      text: `Hi ${inq.name},\n\nThanks for reaching out — your message reached me and I'll reply within a day or two.\n\n— Rana Muhammad Sami\nFull Stack Engineer`,
      html: buildAutoreplyHtml(inq.name),
    });
  }
}

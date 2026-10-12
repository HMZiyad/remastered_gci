import nodemailer from "nodemailer";

// Lazy-initialized transporter singleton
let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!user || !pass) {
    console.warn("[Email] SMTP credentials (SMTP_USER / SMTP_PASS) not configured in environment.");
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed/proxy TLS failures
      },
    });
  }

  return transporter;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Generic mail sender wrapper with safe error boundary
 */
export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mailer = getEmailTransporter();
    if (!mailer) {
      return { success: false, error: "SMTP is not configured in environment variables." };
    }

    const fromName = process.env.SMTP_FROM_NAME || "Good Car Imports";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "info@goodcarimports.com";

    const info = await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]+>/g, ""),
      html: options.html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Email] Failed to send email:", error?.message || error);
    return { success: false, error: error?.message || "Unknown mail delivery failure" };
  }
}

/**
 * Dispatches an admin notification when a new inquiry/booking is placed
 */
export async function sendInquiryNotification(inquiry: {
  id: number;
  type: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  interested_in?: string | null;
  message?: string | null;
  vehicle_id?: number | null;
}) {
  const adminEmail = process.env.SMTP_ADMIN_EMAIL || process.env.SMTP_USER || "goodcarimports.bd@gmail.com";
  const inquiryTypeLabel = inquiry.type === "booking" ? "Vehicle Booking" : "Direct Contact Inquiry";
  const subject = `[${inquiryTypeLabel}] #${inquiry.id}: ${inquiry.full_name} (${inquiry.interested_in || "General"})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b101b; color: #f3f4f6; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0d131f 0%, #1a2234 100%); border-bottom: 2px solid #d4af37; padding: 24px 32px; text-align: left; }
        .brand { font-size: 20px; font-weight: 800; color: #d4af37; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .badge { display: inline-block; background-color: rgba(212, 175, 55, 0.15); color: #e6c86e; border: 1px solid rgba(212, 175, 55, 0.3); padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; text-transform: uppercase; margin-top: 8px; }
        .body { padding: 32px; }
        .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .table td { padding: 12px 14px; border-bottom: 1px solid #1f293d; font-size: 14px; }
        .table td.label { width: 35%; color: #9ca3af; font-weight: 600; }
        .table td.value { color: #f3f4f6; font-weight: 500; }
        .message-box { background-color: #0d131f; border-left: 3px solid #d4af37; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #d1d5db; margin-top: 10px; }
        .footer { background-color: #0d131f; border-top: 1px solid #1f293d; padding: 18px 32px; text-align: center; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; background-color: #d4af37; color: #0b101b; padding: 10px 22px; text-decoration: none; font-weight: 700; border-radius: 6px; font-size: 13px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="brand">GOOD CAR IMPORTS</h1>
          <span class="badge">${inquiryTypeLabel}</span>
        </div>
        <div class="body">
          <h2 class="title">New Customer Lead Received</h2>
          <table class="table">
            <tr>
              <td class="label">Customer Name</td>
              <td class="value"><strong>${inquiry.full_name}</strong></td>
            </tr>
            <tr>
              <td class="label">Phone Number</td>
              <td class="value"><a href="tel:${inquiry.phone || ""}" style="color: #60a5fa; text-decoration: none;">${inquiry.phone || "Not Provided"}</a></td>
            </tr>
            <tr>
              <td class="label">Email Address</td>
              <td class="value"><a href="mailto:${inquiry.email || ""}" style="color: #60a5fa; text-decoration: none;">${inquiry.email || "Not Provided"}</a></td>
            </tr>
            <tr>
              <td class="label">Vehicle / Interest</td>
              <td class="value" style="color: #d4af37; font-weight: 700;">${inquiry.interested_in || "General Fleet"}</td>
            </tr>
            ${inquiry.vehicle_id ? `<tr><td class="label">Vehicle ID</td><td class="value">#${inquiry.vehicle_id}</td></tr>` : ""}
          </table>

          ${
            inquiry.message
              ? `<div style="margin-top: 16px;">
                  <strong style="font-size: 13px; color: #9ca3af; text-transform: uppercase;">Message / Note:</strong>
                  <div class="message-box">${inquiry.message.replace(/\n/g, "<br/>")}</div>
                </div>`
              : ""
          }

          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000/admin/inquiries" class="btn">View in Admin Portal</a>
          </div>
        </div>
        <div class="footer">
          Good Car Imports • 56 Inner Circular Road, Dhaka • Automated Lead Notification
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    replyTo: inquiry.email || undefined,
    subject,
    html,
  });
}

/**
 * Dispatches an admin notification when a new bespoke pre-order is placed
 */
export async function sendPreOrderNotification(preOrder: {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  make_model?: string | null;
  region_of_origin?: string | null;
  body_style?: string | null;
  year_from?: number | null;
  year_to?: number | null;
  budget_min_bdt?: bigint | number | null;
  budget_max_bdt?: bigint | number | null;
  timeline?: string | null;
  color_preference?: string | null;
  additional_notes?: string | null;
}) {
  const adminEmail = process.env.SMTP_ADMIN_EMAIL || process.env.SMTP_USER || "goodcarimports.bd@gmail.com";
  const vehicleName = preOrder.make_model || "Bespoke Request";
  const subject = `[Bespoke Pre-Order] #${preOrder.id}: ${preOrder.full_name} — ${vehicleName}`;

  const formatBdt = (amount: bigint | number | null | undefined) => {
    if (!amount) return "Flexible";
    return `BDT ${Number(amount).toLocaleString("en-BD")}`;
  };

  const budgetDisplay =
    preOrder.budget_min_bdt || preOrder.budget_max_bdt
      ? `${formatBdt(preOrder.budget_min_bdt)} – ${formatBdt(preOrder.budget_max_bdt)}`
      : "Not Specified";

  const yearDisplay =
    preOrder.year_from || preOrder.year_to
      ? `${preOrder.year_from || "Any"} - ${preOrder.year_to || "Present"}`
      : "Flexible";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b101b; color: #f3f4f6; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0d131f 0%, #1a2234 100%); border-bottom: 2px solid #d4af37; padding: 24px 32px; text-align: left; }
        .brand { font-size: 20px; font-weight: 800; color: #d4af37; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .badge { display: inline-block; background-color: rgba(96, 165, 250, 0.15); color: #93c5fd; border: 1px solid rgba(96, 165, 250, 0.3); padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; text-transform: uppercase; margin-top: 8px; }
        .body { padding: 32px; }
        .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .table td { padding: 12px 14px; border-bottom: 1px solid #1f293d; font-size: 14px; }
        .table td.label { width: 35%; color: #9ca3af; font-weight: 600; }
        .table td.value { color: #f3f4f6; font-weight: 500; }
        .message-box { background-color: #0d131f; border-left: 3px solid #d4af37; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #d1d5db; margin-top: 10px; }
        .footer { background-color: #0d131f; border-top: 1px solid #1f293d; padding: 18px 32px; text-align: center; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; background-color: #d4af37; color: #0b101b; padding: 10px 22px; text-decoration: none; font-weight: 700; border-radius: 6px; font-size: 13px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="brand">GOOD CAR IMPORTS</h1>
          <span class="badge">Bespoke Import Pre-Order</span>
        </div>
        <div class="body">
          <h2 class="title">New Vehicle Pre-Order Request</h2>
          <table class="table">
            <tr>
              <td class="label">Client Name</td>
              <td class="value"><strong>${preOrder.full_name}</strong></td>
            </tr>
            <tr>
              <td class="label">Phone</td>
              <td class="value"><a href="tel:${preOrder.phone}" style="color: #60a5fa; text-decoration: none;">${preOrder.phone}</a></td>
            </tr>
            ${
              preOrder.whatsapp
                ? `<tr><td class="label">WhatsApp</td><td class="value"><a href="https://wa.me/${preOrder.whatsapp.replace(/[^0-9]/g, "")}" style="color: #34d399; text-decoration: none;">${preOrder.whatsapp}</a></td></tr>`
                : ""
            }
            ${
              preOrder.email
                ? `<tr><td class="label">Email</td><td class="value"><a href="mailto:${preOrder.email}" style="color: #60a5fa; text-decoration: none;">${preOrder.email}</a></td></tr>`
                : ""
            }
            <tr>
              <td class="label">Target Vehicle</td>
              <td class="value" style="color: #d4af37; font-weight: 700; font-size: 15px;">${preOrder.make_model}</td>
            </tr>
            <tr>
              <td class="label">Estimated Budget</td>
              <td class="value" style="color: #34d399; font-weight: 600;">${budgetDisplay}</td>
            </tr>
            <tr>
              <td class="label">Body Style / Year</td>
              <td class="value">${preOrder.body_style || "Any"} (${yearDisplay})</td>
            </tr>
            <tr>
              <td class="label">Origin / Timeline</td>
              <td class="value">${preOrder.region_of_origin || "Japan"} • ${preOrder.timeline || "Standard"}</td>
            </tr>
            ${
              preOrder.color_preference
                ? `<tr><td class="label">Color Preference</td><td class="value">${preOrder.color_preference}</td></tr>`
                : ""
            }
          </table>

          ${
            preOrder.additional_notes
              ? `<div style="margin-top: 16px;">
                  <strong style="font-size: 13px; color: #9ca3af; text-transform: uppercase;">Customer Notes:</strong>
                  <div class="message-box">${preOrder.additional_notes.replace(/\n/g, "<br/>")}</div>
                </div>`
              : ""
          }

          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000/admin/inquiries" class="btn">Open Lead in Admin Portal</a>
          </div>
        </div>
        <div class="footer">
          Good Car Imports • Japanese Auction & Import Concierge
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    replyTo: preOrder.email || undefined,
    subject,
    html,
  });
}

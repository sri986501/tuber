import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Simple in-memory sliding window rate limiter
// Limits each IP to 5 submissions every 15 minutes
interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
}
const ipRateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Basic email format verification regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: NextRequest) {
  try {
    // 1. Identify Client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous-client";

    const now = Date.now();
    const rateData = ipRateLimits.get(ip);

    if (rateData) {
      if (now - rateData.firstRequestTime < RATE_LIMIT_WINDOW_MS) {
        if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            {
              success: false,
              message: "Too many contact enquiries from this network. Please wait a few minutes before trying again.",
            },
            { status: 429 }
          );
        }
        rateData.count += 1;
      } else {
        // Reset window
        ipRateLimits.set(ip, { count: 1, firstRequestTime: now });
      }
    } else {
      ipRateLimits.set(ip, { count: 1, firstRequestTime: now });
    }

    // 2. Parse payload safely
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { name, email, category, subject, message, botField } = body;

    // 3. Honeypot check (hidden field submitted by automated spam bots)
    if (botField && String(botField).trim().length > 0) {
      // Reject bot submission without throwing loud errors
      return NextResponse.json(
        { success: true, message: "Your message has been processed." },
        { status: 200 }
      );
    }

    // 4. Server-Side Data Validation
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanCategory = typeof category === "string" ? category.trim() : "General Enquiry";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid name between 2 and 100 characters." },
        { status: 422 }
      );
    }

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid, properly formatted email address." },
        { status: 422 }
      );
    }

    if (!cleanSubject || cleanSubject.length < 3 || cleanSubject.length > 150) {
      return NextResponse.json(
        { success: false, message: "Please provide a subject line between 3 and 150 characters." },
        { status: 422 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 10 || cleanMessage.length > 3000) {
      return NextResponse.json(
        { success: false, message: "Message must be between 10 and 3,000 characters." },
        { status: 422 }
      );
    }

    // 5. Check Environment Credentials
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || "DROP Website <onboarding@resend.dev>";

    // If unconfigured or placeholder, do not pretend it was delivered
    const isUnconfigured =
      !apiKey ||
      apiKey.includes("123456789") ||
      apiKey.trim() === "" ||
      !toEmail ||
      toEmail.includes("example.com");

    if (isUnconfigured) {
      return NextResponse.json(
        {
          success: false,
          providerStatus: "unconfigured",
          message:
            "Email service is not yet configured with active credentials. The form validated your submission, but RESEND_API_KEY and CONTACT_TO_EMAIL must be supplied in .env.local to deliver to a real inbox.",
          details: "Configuration pending in environment variables.",
        },
        { status: 503 }
      );
    }

    // 6. Deliver via Resend
    const resend = new Resend(apiKey);
    const submissionTime = new Date().toISOString();

    const emailSubject = `[DROP Enquiry] ${cleanSubject} (${cleanCategory})`;

    const textContent = [
      `New enquiry received via the DROP website contact form:`,
      `----------------------------------------------------`,
      `Timestamp: ${submissionTime}`,
      `Category:  ${cleanCategory}`,
      `Name:      ${cleanName}`,
      `Email:     ${cleanEmail}`,
      `Subject:   ${cleanSubject}`,
      `----------------------------------------------------`,
      `Message:`,
      cleanMessage,
      `----------------------------------------------------`,
      `Sent securely via DROP website contact API`,
    ].join("\n");

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #08172B; background: #F7FAFF; border-radius: 12px; border: 1px solid #E2E8F0;">
        <div style="border-bottom: 2px solid #00E5F0; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #050B18; font-size: 20px;">DROP — New Website Enquiry</h2>
          <p style="margin: 4px 0 0; color: #64748B; font-size: 13px;">Submitted on ${submissionTime}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 100px;"><strong>From:</strong></td>
            <td style="padding: 8px 0; color: #050B18;">${cleanName.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #050B18;"><a href="mailto:${encodeURIComponent(cleanEmail)}" style="color: #1677FF;">${cleanEmail.replace(/</g, "&lt;")}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Category:</strong></td>
            <td style="padding: 8px 0; color: #050B18;">${cleanCategory.replace(/</g, "&lt;")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Subject:</strong></td>
            <td style="padding: 8px 0; color: #050B18;">${cleanSubject.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
          </tr>
        </table>

        <div style="background: #FFFFFF; padding: 18px; border-radius: 8px; border: 1px solid #CBD5E1; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px; color: #08172B; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message Content</h4>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 14px; color: #1E293B;">${cleanMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>

        <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
          DROP Student Creative Technology Project • Reply directly to this email to contact the sender.
        </p>
      </div>
    `;

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: cleanEmail,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    });

    if (sendResult.error) {
      console.error("[DROP Contact API] Resend error:", sendResult.error);
      return NextResponse.json(
        {
          success: false,
          providerStatus: "failed",
          message:
            "The email delivery provider encountered an issue while processing your message. Please try again or reach out directly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      providerStatus: "accepted",
      message: "Thank you! Your message has been accepted and dispatched to the DROP inbox.",
    });
  } catch (error) {
    console.error("[DROP Contact API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your message. Please try again later.",
      },
      { status: 500 }
    );
  }
}

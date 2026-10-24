import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, Database, Cookie, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "Honest privacy notice detailing how DROP handles contact form data, cookies, and communications.",
};

export default function PrivacyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="py-14 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-drop-cyan/20 pb-8 space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
            Transparency & Data Handling
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-drop-white tracking-tight">
            Privacy Notice
          </h1>
          <p className="text-sm text-drop-muted">
            Last revised: {lastUpdated} • DROP Student Creative Technology Project
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4 text-drop-muted text-base leading-relaxed">
          <p>
            DROP is a student-led educational and experimental technology initiative. We respect the privacy of every individual who visits this site or contacts our team. This notice honestly details what information this website collects, how it is processed, and what third-party services are involved.
          </p>
        </section>

        {/* Section 1: Contact Form */}
        <section className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-drop-white font-display text-xl font-bold">
            <Mail className="w-5 h-5 text-drop-cyan" />
            <h2>1. Information Submitted via the Contact Form</h2>
          </div>
          <p className="text-sm text-drop-muted leading-relaxed">
            When you choose to communicate with us using our Contact page, we collect only the information you explicitly provide:
          </p>
          <ul className="list-disc list-inside text-sm text-drop-muted space-y-1.5 pl-2">
            <li>Your full name</li>
            <li>Your email address</li>
            <li>The enquiry category and subject</li>
            <li>The message content you write</li>
            <li>The timestamp of your submission</li>
          </ul>
          <p className="text-sm text-drop-muted leading-relaxed">
            <strong className="text-drop-white">Purpose:</strong> We use this information solely to review your inquiry and write back to you directly. We do not sell, rent, or share this data with marketers or advertisers.
          </p>
        </section>

        {/* Section 2: Email Transmission Provider */}
        <section className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-drop-white font-display text-xl font-bold">
            <Lock className="w-5 h-5 text-drop-cyan" />
            <h2>2. Third-Party Service: Transactional Email (Resend)</h2>
          </div>
          <p className="text-sm text-drop-muted leading-relaxed">
            To ensure reliable email delivery, the contact form dispatches submissions via <strong className="text-drop-white">Resend</strong> (a developer transactional email platform).
          </p>
          <p className="text-sm text-drop-muted leading-relaxed">
            When you submit an inquiry, your name, email, and message body are transmitted over encrypted HTTPS to Resend&apos;s API, which generates an email delivered to our team destination address. Resend processes email metadata in accordance with their privacy standards and transactional delivery terms.
          </p>
        </section>

        {/* Section 3: Cookies and Tracking */}
        <section className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-drop-white font-display text-xl font-bold">
            <Cookie className="w-5 h-5 text-drop-cyan" />
            <h2>3. Cookies and Analytics</h2>
          </div>
          <p className="text-sm text-drop-muted leading-relaxed">
            <strong className="text-drop-white">We do not set tracking cookies.</strong>
          </p>
          <p className="text-sm text-drop-muted leading-relaxed">
            This website does not load Google Analytics, Meta Pixel, tracking beacons, cross-site trackers, or commercial advertising networks. You can browse all projects and exploratory research completely free of tracking scripts.
          </p>
        </section>

        {/* Section 4: Security and Rate Limiting */}
        <section className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-drop-white font-display text-xl font-bold">
            <Database className="w-5 h-5 text-drop-cyan" />
            <h2>4. Rate Limiting and Server Logs</h2>
          </div>
          <p className="text-sm text-drop-muted leading-relaxed">
            To protect our server API from denial-of-service attacks and automated spam bots, our backend temporarily evaluates client IP addresses in volatile server memory. These rate-limiting counts expire after 15 minutes and are never used to profile or track visitor identities across visits.
          </p>
        </section>

        {/* Section 5: Your Rights */}
        <section className="space-y-4 text-drop-muted text-sm leading-relaxed border-t border-drop-cyan/15 pt-8">
          <h2 className="font-display text-lg font-bold text-drop-white">
            5. Contacting Us Regarding Your Data
          </h2>
          <p>
            If you have submitted a message to DROP and wish to have your contact details or previous email thread purged from our inbox, you may simply reach out to us at any time via the{" "}
            <Link href="/contact" className="text-drop-cyan underline hover:text-drop-white">
              contact form
            </Link>{" "}
            or email us directly.
          </p>
        </section>
      </div>
    </div>
  );
}

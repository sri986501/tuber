"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw, Mail, MessageSquare, Info } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  botField: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    category: "General Enquiry",
    subject: "",
    message: "",
    botField: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "unconfigured" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name cannot exceed 100 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g., alex@example.com).";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters.";
    } else if (formData.subject.trim().length > 150) {
      newErrors.subject = "Subject cannot exceed 150 characters.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message content is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please share a little more detail (at least 10 characters).";
    } else if (formData.message.trim().length > 3000) {
      newErrors.message = "Message exceeds the maximum limit of 3,000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        setStatusMessage(result.message || "Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          category: "General Enquiry",
          subject: "",
          message: "",
          botField: "",
        });
      } else if (result.providerStatus === "unconfigured") {
        setSubmitStatus("unconfigured");
        setStatusMessage(result.message);
      } else {
        setSubmitStatus("error");
        setStatusMessage(
          result.message || "We could not deliver your message. Please verify your details and retry."
        );
      }
    } catch {
      setSubmitStatus("error");
      setStatusMessage(
        "A network communication failure occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-14 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
            Connect With DROP
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-drop-white tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-base text-drop-muted leading-relaxed">
            Have thoughts on one of our prototypes, want to talk about creative technology, or interested in student collaboration? Send us a direct note.
          </p>
        </div>

        {/* Live Provider Status Notification */}
        {submitStatus === "unconfigured" && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-amber-300">
                  Email Service Configuration Note
                </p>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {statusMessage}
                </p>
                <p className="text-xs text-amber-200/80 pt-1">
                  <strong>Setup action:</strong> To enable real production inbox delivery, create a free API key at <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline hover:text-white">Resend.com</a> and add <code className="bg-amber-950/40 px-1 py-0.5 rounded">RESEND_API_KEY</code> and <code className="bg-amber-950/40 px-1 py-0.5 rounded">CONTACT_TO_EMAIL</code> to your <code className="bg-amber-950/40 px-1 py-0.5 rounded">.env.local</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === "success" && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-200"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-base text-emerald-300">
                  Transmission Confirmed
                </h2>
                <p className="mt-1 text-sm text-emerald-200/90 leading-relaxed">
                  {statusMessage}
                </p>
                <p className="mt-2 text-xs text-emerald-300/80">
                  We check enquiries regularly and will reply to your submitted email address.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-200"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-rose-300">Delivery Error</p>
                <p className="text-xs text-rose-200/90 leading-relaxed">{statusMessage}</p>
                <p className="text-xs text-rose-200/80">
                  You can review your inputs below and click &quot;Retry Submission&quot;.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form Card */}
        <div className="rounded-3xl border border-drop-cyan/20 bg-gradient-to-b from-drop-midnight to-drop-navy p-6 sm:p-10 shadow-2xl shadow-drop-cyan/5">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Honeypot Field (Invisible to human visitors, traps spam bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_hp">Leave this field blank</label>
              <input
                id="website_hp"
                type="text"
                name="website_hp"
                tabIndex={-1}
                autoComplete="off"
                value={formData.botField}
                onChange={(e) => setFormData({ ...formData, botField: e.target.value })}
              />
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-drop-white mb-2"
                >
                  Full Name <span className="text-drop-cyan">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  placeholder="e.g. Maya Lin"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-drop-navy/90 border ${
                    errors.name
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-drop-cyan/20 focus:border-drop-cyan focus:ring-drop-cyan"
                  } text-drop-white placeholder:text-drop-muted/50 text-sm focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-drop-white mb-2"
                >
                  Email Address <span className="text-drop-cyan">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={254}
                  placeholder="e.g. maya@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-drop-navy/90 border ${
                    errors.email
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-drop-cyan/20 focus:border-drop-cyan focus:ring-drop-cyan"
                  } text-drop-white placeholder:text-drop-muted/50 text-sm focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Category & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label
                  htmlFor="contact-category"
                  className="block text-xs font-semibold uppercase tracking-wider text-drop-white mb-2"
                >
                  Enquiry Category
                </label>
                <select
                  id="contact-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-drop-navy/90 border border-drop-cyan/20 focus:border-drop-cyan focus:ring-2 focus:ring-drop-cyan text-drop-white text-sm focus:outline-none transition-all"
                >
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Project Feedback">Project Feedback</option>
                  <option value="Student Collaboration">Student Collaboration</option>
                  <option value="Creative Coding / IoT Idea">Creative Coding / IoT Idea</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold uppercase tracking-wider text-drop-white mb-2"
                >
                  Subject <span className="text-drop-cyan">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Thoughts on the Ripple ambient experiment"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (errors.subject) setErrors({ ...errors, subject: undefined });
                  }}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? "subject-error" : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-drop-navy/90 border ${
                    errors.subject
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-drop-cyan/20 focus:border-drop-cyan focus:ring-drop-cyan"
                  } text-drop-white placeholder:text-drop-muted/50 text-sm focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.subject && (
                  <p id="subject-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.subject}
                  </p>
                )}
              </div>
            </div>

            {/* Message Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold uppercase tracking-wider text-drop-white"
                >
                  Message <span className="text-drop-cyan">*</span>
                </label>
                <span className="text-[11px] text-drop-muted">
                  {formData.message.length} / 3000 chars
                </span>
              </div>
              <textarea
                id="contact-message"
                required
                rows={5}
                maxLength={3000}
                placeholder="What would you like to discuss, build, or ask?"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (errors.message) setErrors({ ...errors, message: undefined });
                }}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`w-full px-4 py-3 rounded-xl bg-drop-navy/90 border ${
                  errors.message
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-drop-cyan/20 focus:border-drop-cyan focus:ring-drop-cyan"
                } text-drop-white placeholder:text-drop-muted/50 text-sm focus:outline-none focus:ring-2 transition-all resize-y`}
              />
              {errors.message && (
                <p id="message-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.message}
                </p>
              )}
            </div>

            {/* Submission Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-drop-muted text-center sm:text-left">
                Messages are delivered directly to the project inbox. We do not sell data or send spam.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-drop-white bg-gradient-to-r from-drop-blue via-drop-cyan to-drop-violet hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-drop-cyan/20 transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-drop-white" />
                    <span>Sending Enquiry...</span>
                  </>
                ) : submitStatus === "error" ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Retry Submission</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Informative FAQ / Note */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-drop-cyan/15 bg-drop-midnight/50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-drop-cyan text-sm font-semibold">
              <Mail className="w-4 h-4" />
              <span>Response Expectations</span>
            </div>
            <p className="text-xs text-drop-muted leading-relaxed">
              Because DROP is a student-led project around our university study schedules, we typically review messages within 48 to 72 hours.
            </p>
          </div>

          <div className="rounded-2xl border border-drop-cyan/15 bg-drop-midnight/50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-drop-cyan text-sm font-semibold">
              <MessageSquare className="w-4 h-4" />
              <span>Open Collaboration</span>
            </div>
            <p className="text-xs text-drop-muted leading-relaxed">
              We welcome questions about our prototypes, hardware configurations, or creative coding approaches. Learning in public is part of our goal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";
import { ArrowUp, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-drop-cyan/15 bg-drop-navy relative overflow-hidden" role="contentinfo">
      {/* Subtle top glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-drop-cyan/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="lg" withTagline={true} />
            <p className="text-drop-muted text-sm leading-relaxed max-w-sm mt-3">
              An emerging student-led creative technology initiative exploring software, connected systems, and digital experiences through experimentation and curiosity.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-drop-midnight text-drop-cyan border border-drop-cyan/25">
                <Sparkles className="w-3.5 h-3.5" />
                Build. Connect. Grow.
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-drop-white">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm" role="list">
              <li>
                <Link
                  href="/"
                  className="text-drop-muted hover:text-drop-cyan transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-drop-muted hover:text-drop-cyan transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
                >
                  About Our Ethos
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-drop-muted hover:text-drop-cyan transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
                >
                  Project Experiments
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-drop-muted hover:text-drop-cyan transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
                >
                  Areas of Exploration
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-drop-muted hover:text-drop-cyan transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
                >
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Exploration & Honesty statement */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-drop-white">
              Project Statement
            </h3>
            <p className="text-drop-muted text-xs leading-relaxed">
              DROP is non-commercial, non-agency research in progress. We build openly, learn from mistakes, and share code prototypes to connect with other curious creators.
            </p>
            <div className="pt-2">
              <Link
                href="/privacy"
                className="text-xs text-drop-muted/80 hover:text-drop-cyan underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
              >
                Privacy Notice & Data Practices
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-drop-cyan/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-drop-muted">
          <p>© {new Date().getFullYear()} DROP. Student-led Creative Technology. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-drop-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
            >
              Privacy Notice
            </Link>
            <Link
              href="/contact"
              className="hover:text-drop-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan rounded"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowLeft, Home, Compass, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Ripple Icon badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-drop-midnight border border-drop-cyan/30 flex items-center justify-center text-drop-cyan shadow-xl shadow-drop-cyan/10 relative">
          <span className="font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-drop-cyan to-drop-violet">
            404
          </span>
          <span className="absolute -inset-2 rounded-3xl border border-drop-cyan/20 animate-ping opacity-30 pointer-events-none" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-drop-white">
            Wave Out of Bounds
          </h1>
          <p className="text-sm text-drop-muted leading-relaxed">
            The page or experiment you are looking for does not exist or has been relocated to another laboratory track.
          </p>
        </div>

        {/* Quick Links */}
        <div className="pt-4 flex flex-col gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-drop-white bg-gradient-to-r from-drop-blue to-drop-violet hover:from-drop-cyan hover:to-drop-blue transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/projects"
              className="text-xs text-drop-muted hover:text-drop-cyan transition-colors"
            >
              Browse Projects
            </Link>
            <span className="text-drop-muted/40">•</span>
            <Link
              href="/explore"
              className="text-xs text-drop-muted hover:text-drop-cyan transition-colors"
            >
              Areas of Exploration
            </Link>
            <span className="text-drop-muted/40">•</span>
            <Link
              href="/contact"
              className="text-xs text-drop-muted hover:text-drop-cyan transition-colors"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

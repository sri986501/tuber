import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Terminal, ShieldCheck, HeartHandshake, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about DROP's purpose, student-led ethos, creative process, technical interests, and commitment to building useful things.",
};

export default function AboutPage() {
  return (
    <div className="py-14 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
            Our Ethos & Purpose
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-drop-white tracking-tight">
            Curiosity as a Catalyst.
          </h1>
          <p className="text-base sm:text-lg text-drop-muted leading-relaxed">
            DROP is an emerging student-led initiative exploring the intersection of modern software, connected physical devices, and digital experiences.
          </p>
        </div>

        {/* Core Narrative */}
        <section className="space-y-6 text-drop-muted text-base sm:text-lg leading-relaxed border-l-2 border-drop-cyan/30 pl-6 sm:pl-8">
          <p>
            The name <strong className="text-drop-white font-semibold">DROP</strong> comes from a simple physical metaphor: when a single droplet hits a quiet surface of water, the resulting ripples travel far beyond the point of impact. We believe that small, focused projects—built with intention and care—can spark deeper insights and inspire larger positive outcomes.
          </p>
          <p>
            We are not a commercial creative agency, nor are we pitching client contracts or venture-backed valuations. We are students fascinated by how computer code meets the tangible world. We learn by building, breaking, measuring, and refining.
          </p>
          <p>
            In an era where software often feels bloated and repetitive, our goal is to understand first principles: What makes an interface feel lightweight and responsive? How can hardware sensors communicate safely? And how can we make technology more accessible to everyone?
          </p>
        </section>

        {/* How We Work - The Process */}
        <section className="space-y-8">
          <div className="border-b border-drop-cyan/15 pb-4">
            <h2 className="font-display text-2xl font-bold text-drop-white">
              Our Creative & Technical Process
            </h2>
            <p className="text-sm text-drop-muted mt-1">
              A four-step cycle that prioritizes learning and honest evaluation over vanity metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-drop-cyan/15 border border-drop-cyan/30 flex items-center justify-center text-drop-cyan font-bold text-sm">
                01
              </div>
              <h3 className="font-display text-lg font-bold text-drop-white">
                Observe & Inquire
              </h3>
              <p className="text-sm text-drop-muted leading-relaxed">
                We identify specific questions: Can we simulate fluid wave dynamics without a heavy 3D engine? Can an IoT node run for months on a tiny solar cell?
              </p>
            </div>

            <div className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-drop-blue/15 border border-drop-blue/30 flex items-center justify-center text-drop-blue font-bold text-sm">
                02
              </div>
              <h3 className="font-display text-lg font-bold text-drop-white">
                Prototype Rapidly
              </h3>
              <p className="text-sm text-drop-muted leading-relaxed">
                We build working code and breadboard circuits. We value working software in the hands of real testers far above abstract conceptual slide decks.
              </p>
            </div>

            <div className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-drop-violet/15 border border-drop-violet/30 flex items-center justify-center text-drop-violet font-bold text-sm">
                03
              </div>
              <h3 className="font-display text-lg font-bold text-drop-white">
                Test & Refine
              </h3>
              <p className="text-sm text-drop-muted leading-relaxed">
                We audit for accessibility (WCAG), measure runtime frame rates, test keyboard navigation, and check resilience under poor network conditions.
              </p>
            </div>

            <div className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/50 p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                04
              </div>
              <h3 className="font-display text-lg font-bold text-drop-white">
                Reflect & Share
              </h3>
              <p className="text-sm text-drop-muted leading-relaxed">
                We document our findings openly, write honest retrospectives on what failed, and preserve reusable code for our community.
              </p>
            </div>
          </div>
        </section>

        {/* Guiding Principles */}
        <section className="space-y-8">
          <div className="border-b border-drop-cyan/15 pb-4">
            <h2 className="font-display text-2xl font-bold text-drop-white">
              Guiding Commitments
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl border border-drop-cyan/15 bg-drop-navy/60 p-5">
              <Compass className="w-5 h-5 text-drop-cyan flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-bold text-drop-white">Authentic Progress Over Polish</h3>
                <p className="text-sm text-drop-muted mt-1 leading-relaxed">
                  We never disguise early student experiments as enterprise solutions. We label prototypes clearly and publish truthful performance data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-drop-cyan/15 bg-drop-navy/60 p-5">
              <ShieldCheck className="w-5 h-5 text-drop-cyan flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-bold text-drop-white">Privacy by Architecture</h3>
                <p className="text-sm text-drop-muted mt-1 leading-relaxed">
                  We design our tools and hardware to respect human dignity. We do not implement covert trackers, invasive cookies, or unnecessary telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-drop-cyan/15 bg-drop-navy/60 p-5">
              <BookOpen className="w-5 h-5 text-drop-cyan flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-bold text-drop-white">Open Learning Culture</h3>
                <p className="text-sm text-drop-muted mt-1 leading-relaxed">
                  We welcome questions, peer reviews, and mentorship. Pair-programming, code critique, and cross-disciplinary curiosity are central to how we grow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="pt-8 text-center space-y-4 border-t border-drop-cyan/15">
          <h2 className="font-display text-2xl font-bold text-drop-white">
            Curious to see what we are currently building?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-drop-white bg-gradient-to-r from-drop-blue to-drop-violet hover:from-drop-cyan hover:to-drop-blue transition-all"
            >
              <span>Browse Project Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-drop-white bg-drop-midnight border border-drop-cyan/25 hover:border-drop-cyan/50 transition-all"
            >
              <span>Get in Touch</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

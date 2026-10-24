import Link from "next/link";
import { DropletCanvas } from "@/components/DropletCanvas";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS, EXPLORATION_AREAS } from "@/lib/data";
import { ArrowRight, Sparkles, Compass, Lightbulb, Code2, Cpu, Globe } from "lucide-react";

export default function HomePage() {
  const featuredProjects = PROJECTS.filter((p) => p.featured);

  return (
    <div className="relative overflow-hidden">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-drop-midnight/90 border border-drop-cyan/25 text-drop-cyan">
                <span className="w-2 h-2 rounded-full bg-drop-cyan animate-pulse" />
                <span>Student-Led Creative Technology Lab</span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-drop-white tracking-tight leading-[1.1]">
                Small Steps. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-drop-cyan via-drop-blue to-drop-violet">
                  Big Ideas.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-drop-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
                DROP is a student-led creative technology project exploring ideas through software, connected systems, and digital experiences.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/projects"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-drop-white bg-gradient-to-r from-drop-blue via-drop-cyan to-drop-violet hover:opacity-95 shadow-lg shadow-drop-cyan/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan"
                >
                  <span>Explore Our Work</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-drop-white bg-drop-midnight/80 hover:bg-drop-midnight border border-drop-cyan/25 hover:border-drop-cyan/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan"
                >
                  <span>Get in Touch</span>
                </Link>
              </div>

              {/* Tagline micro note */}
              <p className="text-xs uppercase tracking-widest text-drop-muted/70 pt-2 font-mono">
                Build • Connect • Grow
              </p>
            </div>

            {/* Right Visual: Droplet & Ripple Canvas */}
            <div className="lg:col-span-6 w-full">
              <DropletCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BRIEF INTRODUCTION SECTION
          ========================================================================= */}
      <section className="py-16 sm:py-20 border-t border-drop-cyan/10 bg-drop-midnight/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
              What We Are
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-drop-white">
              A single drop triggers a expanding ripple.
            </h2>
            <p className="text-base text-drop-muted leading-relaxed">
              We started DROP as university students curious about how hardware, graphics code, and accessible web experiences intersect. Instead of waiting for finished commercial contracts, we prototype small ideas openly—learning from broken circuits, failed builds, and creative breakthroughs.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SELECTED PROJECTS SECTION
          ========================================================================= */}
      <section className="py-20 sm:py-24 border-t border-drop-cyan/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
                Laboratory Prototypes
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-drop-white">
                Selected Work & Experiments
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-drop-cyan hover:underline"
            >
              <span>View all projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          AREAS OF EXPLORATION PREVIEW
          ========================================================================= */}
      <section className="py-20 sm:py-24 border-t border-drop-cyan/10 bg-gradient-to-b from-drop-midnight/30 to-drop-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
              Curiosity Domains
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-drop-white">
              Areas of Active Exploration
            </h2>
            <p className="mt-3 text-drop-muted text-base">
              These represent our current lines of inquiry and experimentation, not commercial services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXPLORATION_AREAS.slice(0, 3).map((area) => (
              <div
                key={area.id}
                className="rounded-2xl border border-drop-cyan/20 bg-drop-midnight/40 p-6 space-y-4 hover:border-drop-cyan/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-drop-navy border border-drop-cyan/20 flex items-center justify-center text-drop-cyan">
                  {area.id === "web-dev" && <Globe className="w-5 h-5" />}
                  {area.id === "software" && <Code2 className="w-5 h-5" />}
                  {area.id === "iot" && <Cpu className="w-5 h-5" />}
                </div>
                <h3 className="font-display text-lg font-bold text-drop-white">
                  {area.title}
                </h3>
                <p className="text-sm text-drop-muted leading-relaxed">
                  {area.tagline}
                </p>
                <div className="pt-2">
                  <span className="text-xs text-drop-cyan font-medium">
                    {area.currentExperiments.length} active experiments →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:text-left">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-drop-cyan hover:underline"
            >
              <span>Discover all exploration areas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OUR APPROACH STATEMENT
          ========================================================================= */}
      <section className="py-20 sm:py-24 border-t border-drop-cyan/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-drop-cyan/20 bg-gradient-to-r from-drop-midnight via-drop-navy to-drop-midnight p-8 sm:p-12 lg:p-16">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-drop-cyan/15 text-drop-cyan border border-drop-cyan/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Approach</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-drop-white leading-tight">
                Curiosity First. Built Openly. Grounded in Learning.
              </h2>
              <p className="text-drop-muted text-base leading-relaxed">
                We believe that mastery begins with genuine curiosity. By starting with small experiments—whether simulating ripple physics on a canvas or transmitting sensor telemetry over radio packets—we turn theoretical concepts into tangible, tested reality.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-1.5 border-l-2 border-drop-cyan/40 pl-4">
                  <h4 className="text-drop-white font-semibold text-sm">Observe</h4>
                  <p className="text-xs text-drop-muted">
                    Notice frictions and opportunities in everyday digital interactions.
                  </p>
                </div>
                <div className="space-y-1.5 border-l-2 border-drop-blue/40 pl-4">
                  <h4 className="text-drop-white font-semibold text-sm">Prototype</h4>
                  <p className="text-xs text-drop-muted">
                    Quickly construct minimal working tests with real code and hardware.
                  </p>
                </div>
                <div className="space-y-1.5 border-l-2 border-drop-violet/40 pl-4">
                  <h4 className="text-drop-white font-semibold text-sm">Share</h4>
                  <p className="text-xs text-drop-muted">
                    Document the results openly to spark conversation and peer feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTACT CTA BANNER
          ========================================================================= */}
      <section className="py-20 sm:py-24 border-t border-drop-cyan/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-drop-white">
            Have a question, feedback, or an idea to discuss?
          </h2>
          <p className="text-drop-muted text-base max-w-xl mx-auto leading-relaxed">
            We are always eager to talk with fellow students, engineers, designers, and educators. Drop us a note via our contact form.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-drop-white bg-gradient-to-r from-drop-blue to-drop-violet hover:from-drop-cyan hover:to-drop-blue transition-all shadow-lg shadow-drop-cyan/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan"
            >
              <span>Open Contact Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

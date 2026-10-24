import type { Metadata } from "next";
import Link from "next/link";
import { EXPLORATION_AREAS } from "@/lib/data";
import { Globe, Layers, Radio, Code2, Cpu, HelpCircle, FlaskConical, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Explore DROP's focus areas: Web development, Software systems, IoT and microcontrollers, Creative coding, and emerging technologies.",
};

const ICON_MAP = {
  Globe: Globe,
  Layers: Layers,
  Radio: Radio,
  Code: Code2,
  Cpu: Cpu,
};

export default function ExplorePage() {
  return (
    <div className="py-14 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
            Research Horizons
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-drop-white tracking-tight">
            Areas of Exploration
          </h1>
          <p className="text-base sm:text-lg text-drop-muted leading-relaxed">
            These are our student inquiry tracks—domains where we tinker, build proof-of-concepts, and test emerging ideas. They are open areas of study, not prepackaged commercial services.
          </p>
        </div>

        {/* Detailed Areas List */}
        <div className="space-y-12">
          {EXPLORATION_AREAS.map((area, index) => {
            const IconComponent = ICON_MAP[area.iconName] || Globe;

            return (
              <section
                key={area.id}
                className="rounded-3xl border border-drop-cyan/20 bg-gradient-to-br from-drop-midnight/90 to-drop-navy/95 p-6 sm:p-10 lg:p-12 transition-all duration-300 hover:border-drop-cyan/40"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Title & Overview */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-drop-navy border border-drop-cyan/25 flex items-center justify-center text-drop-cyan shadow-md shadow-drop-cyan/10">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider text-drop-muted">
                        Track 0{index + 1}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-drop-white">
                      {area.title}
                    </h2>

                    <p className="text-sm font-semibold text-drop-cyan">
                      {area.tagline}
                    </p>

                    <p className="text-sm text-drop-muted leading-relaxed">
                      {area.description}
                    </p>

                    {/* Tech chips */}
                    <div className="pt-2">
                      <p className="text-xs uppercase tracking-wider text-drop-muted/70 font-semibold mb-2">
                        Tooling & Languages Explored:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {area.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md text-xs bg-drop-navy text-drop-muted border border-drop-cyan/15 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Questions & Current Experiments */}
                  <div className="lg:col-span-7 space-y-6 lg:pl-6 lg:border-l lg:border-drop-cyan/15">
                    {/* Active Questions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-drop-white">
                        <HelpCircle className="w-4 h-4 text-drop-blue" />
                        <span>Core Questions We Are Investigating</span>
                      </div>
                      <ul className="space-y-2.5" role="list">
                        {area.questionsExplored.map((q, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-drop-muted flex items-start gap-2.5 leading-relaxed bg-drop-navy/40 p-3 rounded-xl border border-drop-cyan/10"
                          >
                            <span className="text-drop-cyan font-mono font-bold text-xs mt-0.5">
                              ?
                            </span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Current Experiments */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-drop-white">
                        <FlaskConical className="w-4 h-4 text-drop-cyan" />
                        <span>Current Lab Experiments</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {area.currentExperiments.map((exp, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-drop-midnight border border-drop-cyan/20 text-xs text-drop-white flex items-center gap-2.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-drop-cyan flex-shrink-0" />
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom invitation */}
        <div className="rounded-3xl border border-drop-cyan/20 bg-gradient-to-r from-drop-midnight to-drop-navy p-8 sm:p-10 text-center space-y-4">
          <h3 className="font-display text-2xl font-bold text-drop-white">
            Have an experiment or research idea in mind?
          </h3>
          <p className="text-drop-muted text-sm max-w-xl mx-auto">
            We are always enthusiastic about testing ideas across these domains or trying out new hardware components.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-drop-white bg-gradient-to-r from-drop-blue to-drop-violet hover:from-drop-cyan hover:to-drop-blue transition-all"
            >
              <span>Share an Idea</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

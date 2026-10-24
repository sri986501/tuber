"use client";

import { useState } from "react";
import { PROJECTS } from "@/lib/data";
import { ProjectCard } from "@/components/ProjectCard";
import { Sparkles, Filter, Info } from "lucide-react";

const CATEGORIES = [
  "All",
  "Creative Coding",
  "Connected Systems",
  "Software",
  "Web & UI",
] as const;

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProjects =
    selectedCategory === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-14 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-drop-cyan">
            Laboratory Archive
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-drop-white tracking-tight">
            Projects & Prototypes
          </h1>
          <p className="text-base sm:text-lg text-drop-muted leading-relaxed">
            A transparent record of student software, micro-controllers, and visual computing experiments. Every project is labeled by its current development stage.
          </p>
        </div>

        {/* Concept Notice */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-drop-cyan/25 bg-drop-midnight/60 p-4 sm:p-5 flex items-start gap-3 text-drop-muted text-xs sm:text-sm">
          <Info className="w-5 h-5 text-drop-cyan flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-drop-white font-medium">Concept & Lab Prototype Notice:</strong>{" "}
            These builds represent authentic learning explorations conducted in student labs and personal testbeds. Projects tagged as <span className="text-drop-violet font-semibold">Experiment</span> or <span className="text-drop-cyan font-semibold">In Progress</span> are ongoing research models rather than commercial production products.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <div className="flex items-center gap-2 mr-2 text-xs text-drop-muted font-medium">
            <Filter className="w-3.5 h-3.5 text-drop-cyan" />
            <span>Category:</span>
          </div>
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan ${
                  isActive
                    ? "bg-gradient-to-r from-drop-blue to-drop-violet text-drop-white shadow-md shadow-drop-blue/25"
                    : "bg-drop-midnight/80 text-drop-muted hover:text-drop-white hover:bg-drop-midnight border border-drop-cyan/15"
                }`}
              >
                {category}
                {category === "All" && ` (${PROJECTS.length})`}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Bottom Note */}
        <div className="pt-10 text-center border-t border-drop-cyan/10">
          <p className="text-xs text-drop-muted">
            New experiments are documented as code commits pass testbed checks. Have suggestions for an experiment?{" "}
            <a href="/contact" className="text-drop-cyan hover:underline">
              Send your ideas via our contact form
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

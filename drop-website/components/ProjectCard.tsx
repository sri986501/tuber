import { Project } from "@/lib/types";
import { StatusBadge } from "./Badge";
import { ExternalLink, GitBranch, Terminal } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-drop-cyan/20 bg-gradient-to-b from-drop-midnight/80 to-drop-navy/90 p-6 sm:p-7 transition-all duration-300 hover:border-drop-cyan/50 hover:shadow-xl hover:shadow-drop-cyan/10">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-drop-cyan">
            {project.category}
          </span>
          <StatusBadge status={project.status} />
        </div>

        <h3 className="font-display text-xl font-bold text-drop-white group-hover:text-drop-cyan transition-colors">
          {project.title}
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-drop-muted">
          {project.description}
        </p>

        {project.highlightNote && (
          <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-drop-navy/60 border border-drop-cyan/10 p-2.5 text-xs text-drop-muted/90">
            <Terminal className="w-3.5 h-3.5 text-drop-cyan flex-shrink-0 mt-0.5" />
            <span>{project.highlightNote}</span>
          </div>
        )}
      </div>

      {/* Bottom Tech & Links */}
      <div className="mt-6 pt-5 border-t border-drop-cyan/10">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 rounded-md text-xs bg-drop-midnight text-drop-muted border border-drop-cyan/10"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-drop-cyan hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan"
            >
              <span>View Prototype</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-drop-muted/70 italic">
              Prototype in internal testbed
            </span>
          )}

          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-drop-muted hover:text-drop-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-drop-cyan"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

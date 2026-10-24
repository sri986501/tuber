import { ProjectStatus } from "@/lib/types";

interface BadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: BadgeProps) {
  const styles: Record<ProjectStatus, { bg: string; text: string; dot: string; border: string }> = {
    Experiment: {
      bg: "bg-drop-violet/15",
      text: "text-drop-violet",
      dot: "bg-drop-violet",
      border: "border-drop-violet/30",
    },
    "In Progress": {
      bg: "bg-drop-cyan/15",
      text: "text-drop-cyan",
      dot: "bg-drop-cyan",
      border: "border-drop-cyan/30",
    },
    Completed: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      border: "border-emerald-500/30",
    },
  };

  const style = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      <span>{status}</span>
    </span>
  );
}

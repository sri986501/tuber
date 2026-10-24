export type ProjectStatus = "Experiment" | "In Progress" | "Completed";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "Software" | "Connected Systems" | "Creative Coding" | "Web & UI";
  technologies: string[];
  status: ProjectStatus;
  demoUrl?: string;
  sourceUrl?: string;
  featured?: boolean;
  highlightNote?: string;
}

export interface ExplorationArea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: "Globe" | "Cpu" | "Code" | "Layers" | "Radio";
  questionsExplored: string[];
  currentExperiments: string[];
  technologies: string[];
}

export interface ContactFormInput {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  botField?: string; // honeypot
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
  providerStatus?: "accepted" | "unconfigured" | "failed";
  details?: string;
}

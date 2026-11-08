export interface Skill {
  name: string;
  image: string;
  level?: number;
  category: 'frontend' | 'backend' | 'tools';
  useCase?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string[];
  current?: boolean;
  icon?: string;
}

export interface ShowcaseMedia {
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  tag: string;
}

export interface ShowcaseCapability {
  icon: string;
  title: string;
  description: string;
}

export interface ShowcaseVideo {
  src: string;
  poster?: string;
  title: string;
  subtitle?: string;
}

export interface FeaturedShowcase {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  video: ShowcaseVideo;
  gallery: ShowcaseMedia[];
  capabilities: ShowcaseCapability[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface ProjectVideo {
  src: string;
  poster?: string;
  title?: string;
  subtitle?: string;
}

export interface ProjectMedia {
  title: string;
  url: string;
  description?: string;
  tag?: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category?: 'web' | 'mobile' | 'api' | 'tools' | 'ai';
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  demoVideo?: ProjectVideo;
  gallery?: ProjectMedia[];
  highlights?: string[];
}

export interface Certification {
  name: string;
  image: string;
  issuer?: string;
  date?: string;
  credentialId?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  duration: string;
  cgpa?: string;
  description?: string;
  achievements?: string[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  description: string;
  email: string;
  linkedin: string;
  github?: string;
  phone?: string;
  location?: string;
  resumeUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentType?: 'markdown' | 'html' | 'text'; // Default: 'markdown'
  featuredImage: string;
  author: string;
  publishDate: string;
  readTime: number;
  tags: string[];
  category: string;
  featured?: boolean;
  likes?: number;
  views?: number;
  isExternal?: boolean;
  externalUrl?: string;
  externalPlatform?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface Portfolio {
  personalInfo: PersonalInfo;
  skills: Skill[];
  experience: Experience[];
  featuredShowcase?: FeaturedShowcase;
  projects: Project[];
  certifications: Certification[];
  education: Education[];
  blogPosts: BlogPost[];
}

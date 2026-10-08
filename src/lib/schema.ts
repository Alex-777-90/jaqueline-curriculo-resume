import { z } from "zod";

export function isSafeUrl(value: string): boolean {
  if (!value) return true;
  if (/^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value) && !value.includes(".."))
    return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function videoEmbed(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : ["www.youtube.com", "youtube.com", "m.youtube.com"].includes(host)
          ? url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]
          : null;
    if (id && /^[\w-]{11}$/.test(id))
      return `https://www.youtube-nocookie.com/embed/${id}`;
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const match = url.pathname.match(/^\/(?:video\/)?(\d+)$/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch {
    /* Invalid input is rejected by schema. */
  }
  return null;
}
export function isVideoUrl(value: string): boolean {
  if (!value) return true;
  if (!isSafeUrl(value)) return false;
  return Boolean(videoEmbed(value)) || /\.(mp4|webm)(?:[?#].*)?$/i.test(value);
}
const text = z.string().max(12000);
const short = z.string().max(300);
const required = short.trim().min(1, "Preencha este campo.");
const url = z
  .string()
  .max(2048)
  .refine(isSafeUrl, "Use um endereço HTTPS válido.");
const id = required;
const lines = z.array(text).max(80);
const base = { id };
const experiences = z
  .array(
    z.object({
      ...base,
      company: required,
      role: required,
      period: short,
      location: short,
      summary: text,
      bullets: lines,
      tags: lines,
    }),
  )
  .max(60);
export const contentSchema = z.object({
  profile: z.object({
    name: required,
    role: required,
    eyebrow: short,
    headline: text,
    intro: text,
    summary: lines,
    location: short,
    email: z.string().email("E-mail inválido."),
    linkedin: url,
    whatsapp: z
      .string()
      .max(20)
      .regex(/^\+?[\d\s()-]*$/, "Use apenas números, DDD e código do país."),
    photo: url,
    background: url,
    resume: url,
    availability: text,
    contactTitle: text,
    contactText: text,
  }),
  settings: z.object({
    palette: z.enum(["rose", "plum", "sage"]),
    siteTitle: required,
    description: text,
    showHighlights: z.boolean(),
    showSkills: z.boolean(),
    showExperiences: z.boolean(),
    showEducation: z.boolean(),
    showCertificates: z.boolean(),
    showProjects: z.boolean(),
    showVideos: z.boolean(),
    showLanguages: z.boolean(),
  }),
  highlights: z
    .array(z.object({ ...base, value: required, label: required, note: text }))
    .max(6),
  skills: z
    .array(
      z.object({ ...base, title: required, description: text, items: lines }),
    )
    .max(20),
  experiences,
  education: z
    .array(
      z.object({
        ...base,
        degree: required,
        institution: required,
        period: short,
        location: short,
        description: text,
      }),
    )
    .max(30),
  certificates: z
    .array(
      z.object({
        ...base,
        title: required,
        institution: short,
        date: short,
        description: text,
        url,
        image: url,
      }),
    )
    .max(100),
  languages: z
    .array(z.object({ ...base, name: required, level: short }))
    .max(20),
  projects: z
    .array(
      z.object({
        ...base,
        title: required,
        description: text,
        image: url,
        url,
        tags: lines,
      }),
    )
    .max(30),
  videos: z
    .array(
      z.object({
        ...base,
        title: required,
        description: text,
        url: url.refine(
          (v) => Boolean(v) && isVideoUrl(v),
          "Use YouTube, Vimeo ou um arquivo MP4/WebM.",
        ),
        poster: url,
      }),
    )
    .max(20),
});
export type Content = z.infer<typeof contentSchema>;
export type ContentRecord = {
  data: Content;
  revision: number;
  updated_at: string;
};
export type CollectionKey =
  | "highlights"
  | "skills"
  | "experiences"
  | "education"
  | "certificates"
  | "languages"
  | "projects"
  | "videos";

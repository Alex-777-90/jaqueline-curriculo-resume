import { createClient } from "@supabase/supabase-js";
import initialContent from "../content.json";
import { contentSchema, type Content, type ContentRecord } from "./schema";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
export const configured =
  /^https:\/\/[a-zA-Z0-9.-]+\.(supabase\.co|supabase\.in)$/.test(url) &&
  key.length > 30 &&
  !key.includes("SUBSTITUIR");
export const supabase = configured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;
export const seed = contentSchema.parse(initialContent);
export async function readContent(): Promise<ContentRecord> {
  if (!supabase)
    return { data: structuredClone(seed), revision: 0, updated_at: "" };
  const { data, error } = await supabase
    .from("site_content")
    .select("data, revision, updated_at")
    .eq("id", "main")
    .single();
  if (error || !data)
    throw new Error(
      "Não foi possível carregar o conteúdo. Tente novamente em instantes.",
    );
  return { ...data, data: contentSchema.parse(data.data) };
}
export async function isEditor(): Promise<boolean> {
  if (!supabase) return false;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return false;
  const { data, error: permissionError } = await supabase
    .from("site_editors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (permissionError)
    throw new Error(
      "Não foi possível verificar a permissão de edição. Confira a configuração do banco.",
    );
  return !!data;
}
export async function saveContent(
  content: Content,
  revision: number,
): Promise<ContentRecord> {
  if (!supabase)
    throw new Error("Conecte o Supabase para publicar alterações.");
  const payload = contentSchema.parse(content);
  const { data, error } = await supabase
    .from("site_content")
    .update({ data: payload, revision: revision + 1 })
    .eq("id", "main")
    .eq("revision", revision)
    .select("data, revision, updated_at")
    .maybeSingle();
  if (error)
    throw new Error(
      "Não foi possível salvar. Verifique sua conexão e a permissão de edição.",
    );
  if (!data)
    throw new Error(
      "O conteúdo mudou em outra sessão ou sua permissão expirou. Exporte seu rascunho antes de recarregar.",
    );
  return { ...data, data: contentSchema.parse(data.data) };
}
export type MediaKind = "image" | "pdf" | "video";
const fileTypes: Record<MediaKind, Record<string, string>> = {
  image: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  pdf: { "application/pdf": "pdf" },
  video: { "video/mp4": "mp4", "video/webm": "webm" },
};
export function validateFile(file: File, kind: MediaKind): string {
  const ext = fileTypes[kind][file.type];
  if (!ext)
    throw new Error(
      kind === "image"
        ? "Escolha uma imagem JPG, PNG ou WebP."
        : kind === "pdf"
          ? "Escolha um PDF."
          : "Escolha um vídeo MP4 ou WebM.",
    );
  const limit = kind === "image" ? 5 : 20;
  if (file.size > limit * 1024 * 1024)
    throw new Error(`O limite deste arquivo é ${limit} MB.`);
  if (!file.size) throw new Error("O arquivo está vazio.");
  return ext;
}
export async function uploadMedia(
  file: File,
  kind: MediaKind,
): Promise<string> {
  if (!supabase) throw new Error("Conecte o Supabase para enviar arquivos.");
  const extension = validateFile(file, kind);
  const path = `site/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("curriculo-media")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error)
    throw new Error(
      "Não foi possível enviar o arquivo. Verifique a conexão e a permissão de edição.",
    );
  return supabase.storage.from("curriculo-media").getPublicUrl(path).data
    .publicUrl;
}

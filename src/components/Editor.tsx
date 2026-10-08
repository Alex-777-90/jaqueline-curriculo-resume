import { useEffect, useId, useState, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  Eye,
  FileText,
  GraduationCap,
  ImagePlus,
  Languages,
  LayoutTemplate,
  LogOut,
  Monitor,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Video,
  BriefcaseBusiness,
  X,
  RotateCcw,
} from "lucide-react";
import {
  contentSchema,
  type CollectionKey,
  type Content,
  type ContentRecord,
} from "../lib/schema";
import {
  readContent,
  saveContent,
  uploadMedia,
  type MediaKind,
} from "../lib/backend";
import Portfolio, { AssetImage } from "./Portfolio";

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "lines" | "image" | "pdf" | "video" | "url";
  hint?: string;
};
type Item = Record<string, string | string[]>;
const collections: Record<
  CollectionKey,
  { title: string; singular: string; description: string; fields: FieldDef[] }
> = {
  highlights: {
    title: "Destaques",
    singular: "destaque",
    description:
      "Números e realizações que ajudam a contar sua história. Use apenas resultados comprováveis.",
    fields: [
      { key: "value", label: "Número ou destaque (ex.: 6 anos)" },
      { key: "label", label: "Título" },
      { key: "note", label: "Contexto do resultado", type: "textarea" },
    ],
  },
  skills: {
    title: "Competências",
    singular: "grupo de competências",
    description: "Organize seus conhecimentos por área de atuação.",
    fields: [
      { key: "title", label: "Nome do grupo" },
      { key: "description", label: "Descrição curta" },
      { key: "items", label: "Competências — uma por linha", type: "lines" },
    ],
  },
  experiences: {
    title: "Experiências",
    singular: "experiência",
    description:
      "Adicione cargos, revise as atividades e mantenha sua trajetória em ordem.",
    fields: [
      { key: "company", label: "Empresa" },
      { key: "role", label: "Cargo" },
      { key: "period", label: "Período" },
      { key: "location", label: "Cidade / estado" },
      { key: "summary", label: "Resumo da atuação", type: "textarea" },
      {
        key: "bullets",
        label: "Atividades e resultados — um por linha",
        type: "lines",
      },
      {
        key: "tags",
        label: "Competências em destaque — uma por linha",
        type: "lines",
      },
    ],
  },
  education: {
    title: "Formação acadêmica",
    singular: "formação",
    description: "Graduação, pós-graduação e outras formações acadêmicas.",
    fields: [
      { key: "degree", label: "Curso / título" },
      { key: "institution", label: "Instituição" },
      { key: "period", label: "Período" },
      { key: "location", label: "Local" },
      { key: "description", label: "Detalhes (opcional)", type: "textarea" },
    ],
  },
  certificates: {
    title: "Cursos e certificados",
    singular: "curso",
    description:
      "Inclua seus cursos e, se quiser, a imagem ou o PDF do certificado.",
    fields: [
      { key: "title", label: "Nome do curso" },
      { key: "institution", label: "Instituição" },
      { key: "date", label: "Data" },
      { key: "description", label: "Descrição (opcional)", type: "textarea" },
      { key: "url", label: "Certificado em PDF ou link", type: "pdf" },
      {
        key: "image",
        label: "Imagem do certificado (opcional)",
        type: "image",
      },
    ],
  },
  languages: {
    title: "Idiomas",
    singular: "idioma",
    description: "Informe os idiomas e seu nível de conhecimento.",
    fields: [
      { key: "name", label: "Idioma" },
      { key: "level", label: "Nível" },
    ],
  },
  projects: {
    title: "Projetos",
    singular: "projeto",
    description:
      "Apresente cases, trabalhos e projetos que possam ser compartilhados publicamente.",
    fields: [
      { key: "title", label: "Título do projeto" },
      {
        key: "description",
        label: "Contexto, contribuição e resultado",
        type: "textarea",
      },
      { key: "image", label: "Imagem do projeto", type: "image" },
      { key: "url", label: "Link do projeto (opcional)", type: "url" },
      {
        key: "tags",
        label: "Tecnologias ou competências — uma por linha",
        type: "lines",
      },
    ],
  },
  videos: {
    title: "Vídeos",
    singular: "vídeo",
    description:
      "Use um link do YouTube/Vimeo ou envie um MP4/WebM de até 20 MB. A seção é opcional.",
    fields: [
      { key: "title", label: "Título do vídeo" },
      { key: "description", label: "Descrição (opcional)", type: "textarea" },
      { key: "url", label: "Vídeo", type: "video" },
      { key: "poster", label: "Capa do vídeo (opcional)", type: "image" },
    ],
  },
};
const tabs = [
  { id: "profile", label: "Apresentação", icon: UserRound },
  { id: "highlights", label: "Destaques", icon: LayoutTemplate },
  { id: "skills", label: "Competências", icon: ShieldCheck },
  { id: "experiences", label: "Experiências", icon: BriefcaseBusiness },
  { id: "education", label: "Formação", icon: GraduationCap },
  { id: "certificates", label: "Cursos", icon: FileText },
  { id: "languages", label: "Idiomas", icon: Languages },
  { id: "projects", label: "Projetos", icon: Monitor },
  { id: "videos", label: "Vídeos", icon: Video },
  { id: "settings", label: "Aparência e seções", icon: Settings2 },
] as const;
const profileFields: FieldDef[] = [
  { key: "name", label: "Nome completo" },
  { key: "role", label: "Título profissional" },
  { key: "eyebrow", label: "Área em destaque" },
  { key: "headline", label: "Chamada principal", type: "textarea" },
  { key: "intro", label: "Apresentação curta", type: "textarea" },
  {
    key: "summary",
    label: "Sobre você — um parágrafo por linha",
    type: "lines",
  },
  { key: "location", label: "Cidade / estado" },
  { key: "availability", label: "Áreas de atuação", type: "textarea" },
  { key: "email", label: "E-mail público de contato" },
  { key: "linkedin", label: "LinkedIn", type: "url" },
  {
    key: "whatsapp",
    label: "WhatsApp (opcional)",
    hint: "Código do país + DDD + número, por exemplo 5511999999999.",
  },
  {
    key: "contactTitle",
    label: "Título da seção de contato",
    type: "textarea",
  },
  { key: "contactText", label: "Texto de contato", type: "textarea" },
];

function Field({
  field,
  value,
  onChange,
  onUploading,
}: {
  field: FieldDef;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  onUploading: (delta: number) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const display = Array.isArray(value) ? value.join("\n") : value;
  const media =
    field.type === "image" || field.type === "pdf" || field.type === "video";
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    onUploading(1);
    try {
      onChange(await uploadMedia(file, field.type as MediaKind));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setBusy(false);
      onUploading(-1);
      event.target.value = "";
    }
  }
  return (
    <div
      className={`field ${field.type === "textarea" || field.type === "lines" || media ? "field-wide" : ""}`}
    >
      <label htmlFor={id}>{field.label}</label>
      {field.type === "textarea" || field.type === "lines" ? (
        <textarea
          id={id}
          rows={field.type === "lines" ? 5 : 3}
          value={display}
          onChange={(e) =>
            onChange(
              field.type === "lines"
                ? e.target.value.split("\n")
                : e.target.value,
            )
          }
        />
      ) : (
        <input
          id={id}
          value={display}
          onChange={(e) => onChange(e.target.value)}
          inputMode={media || field.type === "url" ? "url" : undefined}
          placeholder={
            media || field.type === "url" ? "https://… (opcional)" : undefined
          }
        />
      )}
      {field.hint && <small>{field.hint}</small>}
      {media && (
        <div className="media-field">
          <div className="media-actions">
            <label
              className={`button secondary upload-label ${busy ? "disabled" : ""}`}
            >
              <Upload size={15} />
              {busy ? "Enviando…" : "Escolher arquivo"}
              <input
                type="file"
                disabled={busy}
                accept={
                  field.type === "image"
                    ? "image/jpeg,image/png,image/webp"
                    : field.type === "pdf"
                      ? "application/pdf"
                      : "video/mp4,video/webm"
                }
                onChange={upload}
              />
            </label>
            {display && (
              <button
                type="button"
                className="text-button danger"
                disabled={busy}
                onClick={() => onChange("")}
              >
                <X size={14} />
                Remover
              </button>
            )}
          </div>
          <small>
            {field.type === "image"
              ? "JPG, PNG ou WebP · até 5 MB"
              : field.type === "pdf"
                ? "PDF · até 20 MB"
                : "MP4/WebM · até 20 MB, ou link do YouTube/Vimeo"}
          </small>
          {field.type === "image" && display && (
            <AssetImage
              className="upload-preview"
              src={display}
              alt="Prévia do arquivo selecionado"
            />
          )}
          <small>
            Arquivos enviados ficam públicos. A alteração no currículo aparece
            após salvar.
          </small>
        </div>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function normalize<T>(value: T): T {
  if (typeof value === "string") return value.trim() as T;
  if (Array.isArray(value))
    return value
      .map(normalize)
      .filter((v) => typeof v !== "string" || v.length > 0) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, normalize(v)]),
    ) as T;
  return value;
}
function downloadJson(data: Content) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "curriculo-jaqueline-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Editor({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => Promise<void>;
}) {
  const [record, setRecord] = useState<ContentRecord | null>(null);
  const [draft, setDraft] = useState<Content | null>(null);
  const [tab, setTab] = useState<string>("profile");
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const dirty =
    !!record &&
    !!draft &&
    JSON.stringify(record.data) !== JSON.stringify(draft);
  useEffect(() => {
    let active = true;
    readContent()
      .then((r) => {
        if (active) {
          setRecord(r);
          setDraft(structuredClone(r.data));
        }
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty || uploads) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty, uploads]);
  function update(group: "profile" | "settings", key: string, value: unknown) {
    setDraft((d) => (d ? { ...d, [group]: { ...d[group], [key]: value } } : d));
    setNotice("");
  }
  function changeItem(
    key: CollectionKey,
    index: number,
    field: string,
    value: string | string[],
  ) {
    setDraft((d) =>
      d
        ? {
            ...d,
            [key]: d[key].map((item, i) =>
              i === index ? { ...item, [field]: value } : item,
            ),
          }
        : d,
    );
    setNotice("");
  }
  function addItem(key: CollectionKey) {
    const item: Item = { id: crypto.randomUUID() };
    collections[key].fields.forEach((f) => {
      item[f.key] = f.type === "lines" ? [] : "";
    });
    setDraft((d) => (d ? ({ ...d, [key]: [...d[key], item] } as Content) : d));
    setNotice("");
  }
  function removeItem(key: CollectionKey, index: number) {
    if (
      !window.confirm(
        `Excluir este item de ${collections[key].title.toLowerCase()}? A exclusão só será publicada ao salvar.`,
      )
    )
      return;
    setDraft((d) =>
      d ? { ...d, [key]: d[key].filter((_, i) => i !== index) } : d,
    );
    setNotice("");
  }
  function moveItem(key: CollectionKey, index: number, delta: number) {
    setDraft((d) => {
      if (!d) return d;
      const list = [...d[key]];
      const other = index + delta;
      if (other < 0 || other >= list.length) return d;
      [list[index], list[other]] = [list[other], list[index]];
      return { ...d, [key]: list };
    });
    setNotice("");
  }
  function validate(): Content | null {
    if (!draft) return null;
    const result = contentSchema.safeParse(normalize(draft));
    if (!result.success) {
      const issue = result.error.issues[0];
      const root = String(issue.path[0]);
      setTab(root);
      setError(`Revise ${issue.path.join(" › ")}: ${issue.message}`);
      return null;
    }
    setError("");
    return result.data;
  }
  async function save() {
    const valid = validate();
    if (!valid || !record) return;
    setBusy(true);
    setNotice("");
    try {
      const saved = await saveContent(valid, record.revision);
      setRecord(saved);
      setDraft(structuredClone(saved.data));
      setNotice("Alterações publicadas com sucesso.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("O backup deve ter até 2 MB.");
      const parsed = contentSchema.parse(JSON.parse(await file.text()));
      if (
        !window.confirm(
          "Carregar este backup no rascunho? O site só mudará depois de salvar.",
        )
      )
        return;
      setDraft(parsed);
      setNotice(
        "Backup carregado no rascunho. Confira a prévia antes de publicar.",
      );
      setError("");
    } catch {
      setError("O arquivo não é um backup válido deste currículo.");
    } finally {
      event.target.value = "";
    }
  }
  const onUploading = (delta: number) => setUploads((n) => n + delta);
  if (!draft || !record)
    return (
      <main className="status-screen">
        {error ? (
          <>
            <h1>Não foi possível abrir o editor.</h1>
            <p>{error}</p>
            <button
              className="button primary"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
            <button className="text-button" onClick={onSignOut}>
              Sair
            </button>
          </>
        ) : (
          <p role="status">Carregando seu currículo…</p>
        )}
      </main>
    );
  if (preview)
    return (
      <div className="draft-preview">
        <div className="preview-toolbar">
          <span>
            <Eye size={16} /> Prévia das alterações ainda não publicadas
          </span>
          <button
            className="button secondary"
            onClick={() => setPreview(false)}
          >
            <X size={16} />
            Voltar ao editor
          </button>
        </div>
        <Portfolio content={draft} preview />
      </div>
    );
  const section = collections[tab as CollectionKey];
  return (
    <div className="admin-shell palette-rose">
      <aside className="admin-sidebar">
        <a className="editor-brand" href="/" target="_blank" rel="noreferrer">
          <span className="brand-symbol">
            JS<i>.</i>
          </span>
          <span>
            Meu currículo<small>PAINEL DE EDIÇÃO</small>
          </span>
        </a>
        <nav aria-label="Seções do editor">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => {
                setTab(t.id);
                setError("");
              }}
            >
              <t.icon size={18} />
              {t.label}
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>{email}</span>
          <button
            className="text-button"
            onClick={() => {
              if (
                !dirty ||
                window.confirm("Sair e descartar as alterações não publicadas?")
              )
                void onSignOut();
            }}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="editor-topbar">
          <div>
            <span className={`save-indicator ${dirty ? "unsaved" : ""}`} />
            {uploads
              ? "Enviando arquivo…"
              : dirty
                ? "Alterações não publicadas"
                : "Tudo salvo"}
            {record.updated_at && (
              <small>
                Última publicação:{" "}
                {new Date(record.updated_at).toLocaleString("pt-BR")}
              </small>
            )}
          </div>
          <div className="toolbar-actions">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="icon-button"
              aria-label="Abrir site publicado"
            >
              <ArrowUpRight size={19} />
            </a>
            <button
              className="button secondary"
              disabled={busy || uploads > 0}
              onClick={() => {
                if (validate()) setPreview(true);
              }}
            >
              <Eye size={16} /> Prévia
            </button>
            <button
              className="button primary"
              onClick={save}
              disabled={!dirty || busy || uploads > 0}
            >
              <Save size={16} />
              {busy ? "Publicando…" : "Salvar e publicar"}
            </button>
          </div>
        </header>
        <main className="editor-content">
          <div className="editor-heading">
            <div>
              <span className="eyebrow">SEU CURRÍCULO, DO SEU JEITO</span>
              <h1>
                {tab === "profile"
                  ? "Sua apresentação."
                  : tab === "settings"
                    ? "Aparência e seções."
                    : section?.title + "."}
              </h1>
              <p>
                {tab === "profile"
                  ? "Atualize suas informações e escolha como deseja se apresentar."
                  : tab === "settings"
                    ? "Personalize o visual e escolha o que aparece na página pública."
                    : section?.description}
              </p>
            </div>
            {section && (
              <button
                className="button primary"
                disabled={busy || uploads > 0}
                onClick={() => addItem(tab as CollectionKey)}
              >
                <Plus size={17} />
                Adicionar {section.singular}
              </button>
            )}
          </div>
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="notice success">
              <Check size={16} />
              {notice}
            </div>
          )}
          <fieldset className="editor-fieldset" disabled={busy || uploads > 0}>
            {tab === "profile" && (
              <>
                <section className="editor-card">
                  <h2>
                    <ImagePlus size={21} /> Sua imagem e seus arquivos
                  </h2>
                  <div className="form-grid">
                    {[
                      { key: "photo", label: "Foto de perfil", type: "image" },
                      {
                        key: "background",
                        label: "Imagem de fundo",
                        type: "image",
                      },
                      {
                        key: "resume",
                        label: "Currículo para download",
                        type: "pdf",
                      },
                    ].map((f) => (
                      <Field
                        key={f.key}
                        field={f as FieldDef}
                        value={draft.profile[f.key as keyof Content["profile"]]}
                        onChange={(v) => update("profile", f.key, v)}
                        onUploading={onUploading}
                      />
                    ))}
                  </div>
                  <p className="helper">
                    Sem foto, o site mostra suas iniciais. Ao atualizar os
                    textos, envie também um PDF atualizado para manter as duas
                    versões alinhadas.
                  </p>
                </section>
                <section className="editor-card">
                  <h2>Textos e informações</h2>
                  <div className="form-grid">
                    {profileFields.map((f) => (
                      <Field
                        key={f.key}
                        field={f}
                        value={draft.profile[f.key as keyof Content["profile"]]}
                        onChange={(v) => update("profile", f.key, v)}
                        onUploading={onUploading}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
            {section && (
              <div className="collection-list">
                {draft[tab as CollectionKey].length === 0 && (
                  <div className="empty-state">
                    <Plus size={30} />
                    <h2>Este espaço é seu.</h2>
                    <p>
                      Adicione o primeiro item quando quiser. Seções sem
                      conteúdo não aparecem no site.
                    </p>
                    <button
                      className="button secondary"
                      onClick={() => addItem(tab as CollectionKey)}
                    >
                      Adicionar {section.singular}
                    </button>
                  </div>
                )}
                {draft[tab as CollectionKey].map((item, i) => (
                  <section
                    className="editor-card collection-item"
                    key={item.id}
                  >
                    <div className="item-toolbar">
                      <h2>
                        <span className="item-number">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {("company" in item
                          ? item.company
                          : "title" in item
                            ? item.title
                            : "degree" in item
                              ? item.degree
                              : "name" in item
                                ? item.name
                                : "label" in item
                                  ? item.label
                                  : "") || "Novo item"}
                      </h2>
                      <div>
                        <button
                          className="icon-button"
                          disabled={i === 0}
                          aria-label={`Mover item ${i + 1} para cima`}
                          onClick={() => moveItem(tab as CollectionKey, i, -1)}
                        >
                          <ArrowUp size={17} />
                        </button>
                        <button
                          className="icon-button"
                          disabled={
                            i === draft[tab as CollectionKey].length - 1
                          }
                          aria-label={`Mover item ${i + 1} para baixo`}
                          onClick={() => moveItem(tab as CollectionKey, i, 1)}
                        >
                          <ArrowDown size={17} />
                        </button>
                        <button
                          className="icon-button danger"
                          aria-label={`Excluir item ${i + 1}`}
                          onClick={() => removeItem(tab as CollectionKey, i)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                    <div className="form-grid">
                      {section.fields.map((f) => (
                        <Field
                          key={f.key}
                          field={f}
                          value={(item as unknown as Item)[f.key]}
                          onChange={(v) =>
                            changeItem(tab as CollectionKey, i, f.key, v)
                          }
                          onUploading={onUploading}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
            {tab === "settings" && (
              <>
                <section className="editor-card">
                  <h2>Paleta de cores</h2>
                  <div className="palette-options">
                    {[
                      { id: "rose", label: "Vinho & rosé", color: "#7b3d50" },
                      {
                        id: "plum",
                        label: "Ameixa & lavanda",
                        color: "#684d79",
                      },
                      { id: "sage", label: "Verde & areia", color: "#4f6a5b" },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className={
                          draft.settings.palette === p.id
                            ? "palette-option selected"
                            : "palette-option"
                        }
                      >
                        <input
                          type="radio"
                          name="palette"
                          value={p.id}
                          checked={draft.settings.palette === p.id}
                          onChange={() => update("settings", "palette", p.id)}
                        />
                        <span style={{ background: p.color }} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </section>
                <section className="editor-card">
                  <h2>O que aparece no seu site</h2>
                  <p className="helper">
                    Desativar uma seção oculta o conteúdo sem apagá-lo.
                  </p>
                  <div className="section-toggles">
                    {[
                      ["showHighlights", "Destaques"],
                      ["showSkills", "Competências"],
                      ["showExperiences", "Experiências"],
                      ["showEducation", "Formação acadêmica"],
                      ["showCertificates", "Cursos e certificados"],
                      ["showLanguages", "Idiomas"],
                      ["showProjects", "Projetos"],
                      ["showVideos", "Vídeos"],
                    ].map(([key, label]) => (
                      <label className="switch-row" key={key}>
                        <span>{label}</span>
                        <input
                          type="checkbox"
                          role="switch"
                          checked={
                            draft.settings[
                              key as keyof Content["settings"]
                            ] as boolean
                          }
                          onChange={(e) =>
                            update("settings", key, e.target.checked)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </section>
                <section className="editor-card">
                  <h2>Identificação do site</h2>
                  <Field
                    field={{
                      key: "siteTitle",
                      label: "Título da aba do navegador",
                    }}
                    value={draft.settings.siteTitle}
                    onChange={(v) => update("settings", "siteTitle", v)}
                    onUploading={onUploading}
                  />
                  <Field
                    field={{
                      key: "description",
                      label: "Descrição do site",
                      type: "textarea",
                    }}
                    value={draft.settings.description}
                    onChange={(v) => update("settings", "description", v)}
                    onUploading={onUploading}
                  />
                </section>
                <section className="editor-card">
                  <h2>Cópia de segurança</h2>
                  <p className="helper">
                    O backup guarda textos e links dos arquivos. Ele não contém
                    os próprios arquivos enviados.
                  </p>
                  <div className="backup-actions">
                    <button
                      className="button secondary"
                      onClick={() => downloadJson(draft)}
                    >
                      <Download size={16} />
                      Exportar rascunho
                    </button>
                    <label className="button secondary upload-label">
                      <Upload size={16} />
                      Importar backup
                      <input
                        type="file"
                        accept="application/json,.json"
                        onChange={importBackup}
                      />
                    </label>
                  </div>
                </section>
              </>
            )}
          </fieldset>
          {dirty && (
            <div className="editor-bottom">
              <p>
                Confira a prévia e clique em <strong>Salvar e publicar</strong>{" "}
                para atualizar o site.
              </p>
              <button
                className="text-button"
                disabled={busy || uploads > 0}
                onClick={() => {
                  if (
                    window.confirm(
                      "Descartar todas as alterações não publicadas?",
                    )
                  ) {
                    setDraft(structuredClone(record.data));
                    setError("");
                    setNotice("");
                  }
                }}
              >
                <RotateCcw size={15} />
                Descartar alterações
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

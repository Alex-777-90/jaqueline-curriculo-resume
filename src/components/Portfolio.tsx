import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Download,
  Mail,
  BriefcaseBusiness,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  ChartNoAxesCombined,
  Ruler,
  GraduationCap,
  Plus,
  Minus,
  Play,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { type Content, videoEmbed } from "../lib/schema";

export function AssetImage({
  src,
  alt,
  className = "",
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <>{fallback}</>
  );
}
const icons = [ShieldCheck, ChartNoAxesCombined, Ruler];
function SectionHeading({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">
          <span>{index}</span> {label}
        </span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
function VideoCard({ video }: { video: Content["videos"][number] }) {
  const [play, setPlay] = useState(false);
  const embed = videoEmbed(video.url);
  return (
    <article className="video-card">
      {embed ? (
        <div className="video-shell">
          {play ? (
            <iframe
              title={video.title}
              src={embed}
              loading="lazy"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              className="video-cover"
              onClick={() => setPlay(true)}
              aria-label={`Reproduzir ${video.title}`}
            >
              <AssetImage src={video.poster} alt="" />
              <span className="play-icon">
                <Play size={28} />
              </span>
              <span>Reproduzir vídeo</span>
            </button>
          )}
        </div>
      ) : (
        <video
          controls
          preload="metadata"
          playsInline
          poster={video.poster || undefined}
          src={video.url}
        >
          Seu navegador não suporta este vídeo.{" "}
          <a href={video.url}>Abrir vídeo</a>
        </video>
      )}
      <h3>{video.title}</h3>
      <p>{video.description}</p>
    </article>
  );
}
export default function Portfolio({
  content,
  preview = false,
}: {
  content: Content;
  preview?: boolean;
}) {
  const { profile: p, settings: s } = content;
  const [menu, setMenu] = useState(false);
  const [allCourses, setAllCourses] = useState(false);
  useEffect(() => {
    if (preview) return;
    document.title = s.siteTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", s.description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", s.siteTitle);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", s.description);
  }, [s.siteTitle, s.description, preview]);
  const initials = p.name
    .split(" ")
    .filter(Boolean)
    .map((v) => v[0])
    .slice(0, 2)
    .join("");
  const visibleCourses = allCourses
    ? content.certificates
    : content.certificates.slice(0, 6);
  const nav = [
    { id: "sobre", label: "Sobre" },
    {
      id: "experiencia",
      label: "Experiência",
      hide: !s.showExperiences || !content.experiences.length,
    },
    {
      id: "formacao",
      label: "Formação",
      hide: !s.showEducation || !content.education.length,
    },
    {
      id: "cursos",
      label: "Cursos",
      hide: !s.showCertificates || !content.certificates.length,
    },
  ].filter((n) => !n.hide);
  return (
    <div className={`portfolio palette-${s.palette}`}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <a
            className="brand"
            href="#inicio"
            onClick={() => setMenu(false)}
            aria-label={`${p.name}, início`}
          >
            <span className="brand-symbol">
              {initials}
              <i>.</i>
            </span>
            <span>
              {p.name}
              <small>{p.eyebrow}</small>
            </span>
          </a>
          <nav
            aria-label="Navegação principal"
            className={menu ? "site-nav is-open" : "site-nav"}
          >
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)}>
                {n.label}
              </a>
            ))}
            <a
              href="#contato"
              className="nav-contact"
              onClick={() => setMenu(false)}
            >
              Vamos conversar <ArrowUpRight size={16} />
            </a>
          </nav>
          <button
            className="menu-toggle icon-button"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="conteudo">
        <section
          className="hero"
          id="inicio"
          style={
            {
              "--hero-background": p.background
                ? `url("${p.background}")`
                : "none",
            } as CSSProperties
          }
        >
          <div className="hero-grid wrap">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="tiny-line" /> {p.eyebrow}
              </span>
              <h1>
                {p.name}
                <span className="name-dot">.</span>
              </h1>
              <p className="hero-role">{p.role}</p>
              <h2 className="hero-headline">{p.headline}</h2>
              <p className="hero-intro">{p.intro}</p>
              <div className="hero-actions">
                <a
                  className="button primary"
                  href="#experiencia"
                  onClick={(e) => {
                    if (!s.showExperiences || !content.experiences.length) {
                      e.preventDefault();
                      document
                        .getElementById("sobre")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Conheça minha trajetória <ArrowRight size={17} />
                </a>
                {p.resume && (
                  <a
                    className="button secondary"
                    href={p.resume}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Download size={17} /> Currículo PDF
                  </a>
                )}
              </div>
              <span className="hero-location">
                <MapPin size={14} />
                {p.location}
              </span>
            </div>
            <div className="hero-visual">
              <div className="technical-label">
                <span>PROCESSOS · PRECISÃO · PESSOAS</span>
                <span>01 / QUALIDADE</span>
              </div>
              <div className={`portrait-frame ${p.photo ? "has-photo" : ""}`}>
                <AssetImage
                  src={p.photo}
                  alt={`Foto de ${p.name}`}
                  className="portrait-photo"
                  fallback={
                    <div className="monogram-art">
                      <div className="orbital orbital-one" />
                      <div className="orbital orbital-two" />
                      <span className="art-cross cross-a">+</span>
                      <span className="art-cross cross-b">+</span>
                      <span className="large-monogram">
                        {initials}
                        <i>.</i>
                      </span>
                      <span className="monogram-caption">
                        ENGENHARIA COM PROPÓSITO
                      </span>
                    </div>
                  }
                />
                <span className="portrait-coordinate">
                  QUALIDADE EM CADA DETALHE
                </span>
              </div>
              <div className="visual-note">
                <ShieldCheck size={25} />
                <span>
                  Uma visão integrada.
                  <br />
                  <strong>Da análise à melhoria.</strong>
                </span>
                <ArrowUpRight size={25} />
              </div>
            </div>
          </div>
        </section>
        {s.showHighlights && content.highlights.length > 0 && (
          <section
            className="highlights wrap"
            aria-label="Destaques profissionais"
          >
            {content.highlights.map((h) => (
              <div className="highlight" key={h.id}>
                <strong>{h.value}</strong>
                <div>
                  <h2>{h.label}</h2>
                  <p>{h.note}</p>
                </div>
              </div>
            ))}
          </section>
        )}
        <section className="section wrap about-section" id="sobre">
          <div>
            <span className="eyebrow">
              <span>01</span> SOBRE MIM
            </span>
            <h2>
              Qualidade é método.
              <br />
              <em>E também conexão.</em>
            </h2>
            <span className="signature">{p.name}</span>
          </div>
          <div className="about-text">
            {p.summary.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            {p.availability && (
              <div className="focus-note">
                <span className="small-label">ÁREAS DE ATUAÇÃO</span>
                <p>{p.availability}</p>
              </div>
            )}
          </div>
        </section>
        {s.showSkills && content.skills.length > 0 && (
          <section className="skills-band">
            <div className="wrap">
              <div className="skills-intro">
                <span className="eyebrow">COMPETÊNCIAS</span>
                <p>
                  Conhecimento aplicado.
                  <br />
                  <strong>Melhoria que acontece.</strong>
                </p>
              </div>
              <div className="skills-grid">
                {content.skills.map((skill, i) => {
                  const Icon = icons[i % icons.length];
                  return (
                    <article className="skill" key={skill.id}>
                      <Icon size={29} strokeWidth={1.4} />
                      <h3>{skill.title}</h3>
                      <p>{skill.description}</p>
                      <ul>
                        {skill.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        {s.showExperiences && content.experiences.length > 0 && (
          <section className="section wrap" id="experiencia">
            <SectionHeading
              index="02"
              label="EXPERIÊNCIA"
              title="Uma trajetória em evolução."
            >
              <p>
                Vivências que conectam a operação
                <br />à gestão da qualidade.
              </p>
            </SectionHeading>
            <div className="timeline">
              {content.experiences.map((exp, i) => (
                <article className="experience" key={exp.id}>
                  <div className="experience-date">
                    <span className="timeline-dot" />
                    <span>{exp.period}</span>
                    <small>{exp.location}</small>
                    {i === 0 && <span className="experience-index">01</span>}
                  </div>
                  <div className="experience-body">
                    <span className="company">{exp.company}</span>
                    <h3>{exp.role}</h3>
                    <p>{exp.summary}</p>
                    <div className="tags">
                      {exp.tags.map((tag, j) => (
                        <span key={j}>{tag}</span>
                      ))}
                    </div>
                    {exp.bullets.length > 0 && (
                      <details
                        className="experience-details"
                        open={i === 0 ? true : undefined}
                      >
                        <summary>
                          Atividades e contribuições{" "}
                          <Plus size={16} className="details-plus" />
                          <Minus size={16} className="details-minus" />
                        </summary>
                        <ul>
                          {exp.bullets.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {s.showProjects && content.projects.length > 0 && (
          <section className="section projects-section">
            <div className="wrap">
              <SectionHeading
                index="03"
                label="PROJETOS"
                title="Da ideia à prática."
              />
              <div className="project-grid">
                {content.projects.map((project) => (
                  <article key={project.id} className="project-card">
                    <AssetImage src={project.image} alt={project.title} />
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="tags">
                        {project.tags.map((t, i) => (
                          <span key={i}>{t}</span>
                        ))}
                      </div>
                      {project.url && (
                        <a
                          className="text-link"
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Conhecer projeto <ArrowUpRight size={16} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        {s.showEducation && content.education.length > 0 && (
          <section className="education-band" id="formacao">
            <div className="wrap education-layout">
              <div>
                <span className="eyebrow">FORMAÇÃO ACADÊMICA</span>
                <h2>
                  Uma base sólida.
                  <br />
                  <em>Aprendizado contínuo.</em>
                </h2>
              </div>
              <div>
                {content.education.map((e) => (
                  <article key={e.id} className="education">
                    <GraduationCap size={32} strokeWidth={1.4} />
                    <div>
                      <span className="small-label">{e.period}</span>
                      <h3>{e.degree}</h3>
                      <p>
                        {e.institution} · {e.location}
                      </p>
                      {e.description && <p>{e.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        {s.showCertificates && content.certificates.length > 0 && (
          <section className="section wrap" id="cursos">
            <SectionHeading
              index="03"
              label="CURSOS & CERTIFICAÇÕES"
              title="Conhecimento em movimento."
            >
              <span className="section-count">
                {String(content.certificates.length).padStart(2, "0")} formações
                complementares
              </span>
            </SectionHeading>
            <div className="certificate-grid">
              {visibleCourses.map((c, i) => (
                <article className="certificate" key={c.id}>
                  <div className="certificate-meta">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <time>{c.date}</time>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.institution}</p>
                  {c.description && (
                    <p className="certificate-description">{c.description}</p>
                  )}
                  {c.image && (
                    <a href={c.image} target="_blank" rel="noreferrer">
                      <AssetImage
                        src={c.image}
                        alt={`Certificado: ${c.title}`}
                        className="certificate-image"
                      />
                    </a>
                  )}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      Ver certificado <ExternalLink size={14} />
                    </a>
                  )}
                </article>
              ))}
            </div>
            {content.certificates.length > 6 && (
              <button
                className="button secondary more-courses"
                onClick={() => setAllCourses(!allCourses)}
              >
                {allCourses ? "Mostrar menos" : "Ver todos os cursos"}
                {allCourses ? <Minus size={16} /> : <Plus size={16} />}
              </button>
            )}
          </section>
        )}
        {s.showVideos && content.videos.length > 0 && (
          <section className="section wrap" id="videos">
            <SectionHeading
              index="04"
              label="APRESENTAÇÃO & VÍDEOS"
              title="Conheça mais do meu trabalho."
            />
            <div className="video-grid">
              {content.videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        )}
        {s.showLanguages && content.languages.length > 0 && (
          <section className="languages wrap" aria-label="Idiomas">
            <span className="small-label">IDIOMAS</span>
            {content.languages.map((l) => (
              <div key={l.id}>
                <strong>{l.name}</strong>
                <span>{l.level}</span>
              </div>
            ))}
          </section>
        )}
        <section className="contact-section" id="contato">
          <div className="wrap contact-grid">
            <div>
              <span className="eyebrow">PRÓXIMA CONEXÃO</span>
              <h2>{p.contactTitle}</h2>
              <p>{p.contactText}</p>
            </div>
            <div className="contact-links">
              <a href={`mailto:${p.email}`}>
                <Mail size={21} />
                <span>
                  <small>E-MAIL</small>
                  {p.email}
                </span>
                <ArrowUpRight size={23} />
              </a>
              {p.linkedin && (
                <a href={p.linkedin} target="_blank" rel="noreferrer">
                  <BriefcaseBusiness size={21} />
                  <span>
                    <small>LINKEDIN</small>Vamos nos conectar
                  </span>
                  <ArrowUpRight size={23} />
                </a>
              )}
              {p.whatsapp && (
                <a
                  href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={21} />
                  <span>
                    <small>WHATSAPP</small>Iniciar conversa
                  </span>
                  <ArrowUpRight size={23} />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <a className="brand-symbol" href="#inicio">
          {initials}
          <i>.</i>
        </a>
        <span>
          © {new Date().getFullYear()} {p.name}
          <small>{p.role}</small>
        </span>
        <a className="admin-link" href="/modificacao">
          Área de edição <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}

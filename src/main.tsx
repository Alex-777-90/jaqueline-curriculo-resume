import { StrictMode, lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Portfolio from "./components/Portfolio";
import { readContent } from "./lib/backend";
import type { Content } from "./lib/schema";
import "./styles.css";
const Admin = lazy(() => import("./components/Admin"));
function PublicSite() {
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const load = () =>
      readContent()
        .then((result) => {
          if (active) {
            setContent(result.data);
            setError("");
          }
        })
        .catch(() => {
          if (active) setError("Não foi possível carregar o currículo agora.");
        });
    void load();
    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [attempt]);
  if (content) return <Portfolio content={content} />;
  if (error)
    return (
      <main className="status-screen">
        <span className="brand-symbol">JS.</span>
        <h1>{error}</h1>
        <p>Confira a conexão e tente novamente.</p>
        <button
          className="button primary"
          onClick={() => {
            setError("");
            setAttempt(attempt + 1);
          }}
        >
          Tentar novamente
        </button>
      </main>
    );
  return <Loading />;
}
function Loading() {
  return (
    <div className="status-screen" role="status">
      <span className="brand-symbol">JS.</span>
      <p>Preparando os detalhes…</p>
    </div>
  );
}
function App() {
  const admin = window.location.pathname.replace(/\/$/, "") === "/modificacao";
  return admin ? (
    <Suspense fallback={<Loading />}>
      <Admin />
    </Suspense>
  ) : window.location.pathname === "/" ? (
    <PublicSite />
  ) : (
    <main className="status-screen">
      <h1>Página não encontrada</h1>
      <a className="button primary" href="/">
        Voltar ao currículo
      </a>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

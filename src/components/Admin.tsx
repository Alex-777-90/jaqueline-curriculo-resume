import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { configured, isEditor, supabase } from "../lib/backend";
import Editor from "./Editor";

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [recovery, setRecovery] = useState(
    new URLSearchParams(window.location.search).has("recuperar"),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    document.title = "Edição do currículo | Jaqueline Sousa";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    if (!supabase) {
      setSession(null);
      return () => meta.remove();
    }
    let active = true;
    void supabase.auth.getSession().then(({ data, error: e }) => {
      if (active) {
        setSession(data.session);
        if (e)
          setError("Não foi possível verificar sua sessão. Entre novamente.");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        setAllowed(null);
        setRecovery(false);
        setPassword("");
        setConfirmation("");
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
      meta.remove();
    };
  }, []);
  useEffect(() => {
    if (!session) {
      setAllowed(null);
      return;
    }
    let active = true;
    void isEditor()
      .then((value) => {
        if (active) setAllowed(value);
      })
      .catch((e: Error) => {
        if (active) {
          setAllowed(false);
          setError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [session?.user.id]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (recovery && session) {
        if (password.length < 12)
          throw new Error("Use uma senha com pelo menos 12 caracteres.");
        if (password !== confirmation)
          throw new Error("As senhas não coincidem.");
        const { error: e } = await supabase.auth.updateUser({ password });
        if (e)
          throw new Error(
            "Não foi possível atualizar a senha. Solicite um novo link ou tente outra senha.",
          );
        setRecovery(false);
        setPassword("");
        setConfirmation("");
        window.history.replaceState(null, "", "/modificacao");
        setNotice("Senha atualizada.");
      } else if (forgot) {
        const { error: e } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/modificacao?recuperar=1` },
        );
        if (e)
          throw new Error(
            "Não foi possível enviar o link. Aguarde alguns minutos e tente novamente.",
          );
        setNotice(
          "Se o e-mail estiver cadastrado, você receberá um link de recuperação. Abra-o neste mesmo navegador.",
        );
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (e)
          throw new Error(
            "E-mail ou senha inválidos, ou muitas tentativas. Confira os dados e tente novamente.",
          );
        setPassword("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }
  const signOut = async () => {
    if (!supabase) return;
    const { error: e } = await supabase.auth.signOut();
    if (e) setError("Não foi possível encerrar a sessão. Tente novamente.");
  };
  if (session === undefined || (session && allowed === null))
    return (
      <main className="status-screen" role="status">
        <LockKeyhole />
        <p>Verificando acesso…</p>
      </main>
    );
  if (session && allowed === false)
    return (
      <main className="status-screen">
        <LockKeyhole />
        <h1>Acesso não autorizado</h1>
        <p>
          {error || "Esta conta não tem permissão para editar este currículo."}
        </p>
        <button className="button primary" onClick={signOut}>
          <LogOut size={16} />
          Sair da conta
        </button>
        <a href="/">Voltar ao site</a>
      </main>
    );
  if (session && allowed && !recovery)
    return <Editor email={session.user.email || ""} onSignOut={signOut} />;
  return (
    <main className="login-page palette-rose">
      <a className="back-link" href="/">
        <ArrowLeft size={16} /> Voltar ao currículo
      </a>
      <div className="login-card">
        <span className="login-mark">
          JS<span>.</span>
        </span>
        <span className="eyebrow">ÁREA DE EDIÇÃO</span>
        <h1>
          {recovery && session
            ? "Crie uma nova senha."
            : forgot
              ? "Vamos recuperar seu acesso."
              : "Seu próximo capítulo\ncomeça aqui."}
        </h1>
        <p>
          {recovery && session
            ? "Use uma senha única com pelo menos 12 caracteres."
            : forgot
              ? "Informe seu e-mail para receber o link de recuperação."
              : "Entre para cuidar do seu currículo, atualizar sua trajetória e compartilhar novas conquistas."}
        </p>
        {!configured && (
          <div className="notice warning" role="status">
            <strong>Configuração inicial pendente</strong>
            <br />O site está em modo de visualização. Para ativar login e
            edição, configure o Supabase seguindo o arquivo LEIA-ME.md do
            projeto.
          </div>
        )}
        {recovery && !session && (
          <div className="notice warning">
            Se o link expirou, use “Esqueci minha senha” para solicitar outro.
          </div>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={!configured || busy}>
            {!(recovery && session) && (
              <label className="field">
                <span>E-mail</span>
                <div className="input-icon">
                  <Mail size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    placeholder="Seu e-mail de acesso"
                  />
                </div>
              </label>
            )}
            {!forgot && (
              <label className="field">
                <span>{recovery && session ? "Nova senha" : "Senha"}</span>
                <div className="input-icon">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      recovery ? "new-password" : "current-password"
                    }
                    minLength={recovery ? 12 : undefined}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}
            {recovery && session && (
              <label className="field">
                <span>Confirme a nova senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </label>
            )}
            {error && (
              <div className="notice error" role="alert">
                {error}
              </div>
            )}
            {notice && (
              <div className="notice success" role="status">
                {notice}
              </div>
            )}
            <button
              className="button primary login-submit"
              disabled={busy}
              type="submit"
            >
              {busy
                ? "Aguarde…"
                : recovery && session
                  ? "Salvar nova senha"
                  : forgot
                    ? "Enviar link de recuperação"
                    : "Entrar no painel"}
              <ArrowLeft className="arrow-forward" size={17} />
            </button>
            {!(recovery && session) && (
              <button
                type="button"
                className="text-button forgot-button"
                onClick={() => {
                  setForgot(!forgot);
                  setError("");
                  setNotice("");
                }}
              >
                {forgot ? "Voltar para o login" : "Esqueci minha senha"}
              </button>
            )}
          </fieldset>
        </form>
        <div className="login-footnote">
          <LockKeyhole size={13} /> Acesso exclusivo à administradora do
          currículo
        </div>
      </div>
      <span className="login-bottom">ENGENHARIA · QUALIDADE · EVOLUÇÃO</span>
    </main>
  );
}

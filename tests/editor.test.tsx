import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Editor from "../src/components/Editor";
import Portfolio from "../src/components/Portfolio";
import Admin from "../src/components/Admin";
import { seed, saveContent } from "../src/lib/backend";
vi.mock("../src/lib/backend", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/lib/backend")>();
  return {
    ...original,
    readContent: vi.fn(async () => ({
      data: structuredClone(original.seed),
      revision: 1,
      updated_at: "2026-10-08T00:00:00Z",
    })),
    saveContent: vi.fn(async (data, revision) => ({
      data,
      revision: revision + 1,
      updated_at: "2026-10-08T01:00:00Z",
    })),
  };
});
describe("Public presentation and real editing actions", () => {
  test("shows source content and expandable experience/courses; hides absent media", () => {
    render(<Portfolio content={seed} />);
    expect(
      screen.getByRole("heading", { name: "Jaqueline Sousa." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nexo International")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Conheça mais do meu trabalho." }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Estatística e Modelagem Computacional Básica"),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Ver todos os cursos" }),
    );
    expect(
      screen.getByText("Estatística e Modelagem Computacional Básica"),
    ).toBeInTheDocument();
  });
  test("mobile navigation button announces and changes expanded state", () => {
    render(<Portfolio content={seed} />);
    const menu = screen.getByRole("button", { name: "Abrir menu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menu);
    expect(screen.getByRole("button", { name: "Fechar menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    fireEvent.click(screen.getByRole("link", { name: "Experiência" }));
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
  test("creates and removes a job, reorders entries, previews and publishes edited content", async () => {
    render(<Editor email="editor@example.com" onSignOut={vi.fn()} />);
    const name = await screen.findByLabelText("Nome completo");
    fireEvent.change(name, { target: { value: "Jaqueline Sousa Atualizada" } });
    expect(screen.getByText("Alterações não publicadas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Experiências" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Adicionar experiência" }),
    );
    expect(screen.getAllByLabelText("Empresa")).toHaveLength(6);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Excluir item 6" }));
    expect(screen.getAllByLabelText("Empresa")).toHaveLength(5);
    fireEvent.click(
      screen.getByRole("button", { name: "Mover item 2 para cima" }),
    );
    expect(screen.getAllByLabelText("Empresa")[0]).toHaveValue("Pigma Gráfica");
    fireEvent.click(screen.getByRole("button", { name: "Prévia" }));
    expect(
      await screen.findByRole("heading", {
        name: "Jaqueline Sousa Atualizada.",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao editor" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar e publicar" }));
    expect(
      await screen.findByText("Alterações publicadas com sucesso."),
    ).toBeInTheDocument();
    expect(saveContent).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({
          name: "Jaqueline Sousa Atualizada",
        }),
        experiences: expect.arrayContaining([
          expect.objectContaining({ company: "Pigma Gráfica" }),
        ]),
      }),
      1,
    );
    expect(
      screen.getByRole("button", { name: "Salvar e publicar" }),
    ).toBeDisabled();
    confirm.mockRestore();
  });
  test("validation blocks incomplete new entries and does not publish them", async () => {
    vi.mocked(saveContent).mockClear();
    render(<Editor email="editor@example.com" onSignOut={vi.fn()} />);
    await screen.findByLabelText("Nome completo");
    fireEvent.click(screen.getByRole("button", { name: "Vídeos" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Adicionar vídeo" })[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar e publicar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Revise videos");
    expect(saveContent).not.toHaveBeenCalled();
  });
  test("missing backend never gives a fake editor session", async () => {
    render(<Admin />);
    expect(
      await screen.findByText("Configuração inicial pendente"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Entrar no painel" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Salvar e publicar" }),
    ).not.toBeInTheDocument();
  });
});

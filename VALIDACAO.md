# Validação realizada

- `npm run build`: TypeScript e build de produção concluídos.
- `npm test`: 19 testes aprovados em 3 arquivos.
- Conteúdo: 5 experiências e 9 cursos extraídos do currículo.
- Interface em DOM simulado: navegação, leitura, inclusão, exclusão, reordenação, prévia, publicação e validação de campos.
- SQL executado em PostgreSQL embarcado (PGlite): leitura anônima, bloqueio de escrita sem autorização, edição autorizada, revogação, upload por editora e conflito de revisão.
- Links, origem dos players e limites de upload verificados.

## Verificação ainda necessária na implantação

Revisão visual em navegador real, login/recuperação de senha com a conta do Supabase, upload no bucket real e acesso às duas rotas na Vercel. Não houve publicação nem criação de contas externas nesta entrega.

O build emite um aviso sobre o tamanho do pacote principal (~160 kB comprimidos); a compilação é concluída. O painel é carregado em um módulo separado.

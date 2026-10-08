# Site-currículo de Jaqueline Sousa

Projeto completo em React + TypeScript + Vite, preparado para Vercel. Supabase fornece autenticação, PostgreSQL e armazenamento de arquivos.

## O que está pronto

- Página pública `/`, com identidade em vinho e rosé, desenho técnico de fundo e adaptação para celular, tablet e computador.
- Cinco experiências, formação, nove cursos, competências, idiomas, contatos e destaques adaptados do currículo fornecido.
- PDF original disponível para download.
- Área `/modificacao` com login por e-mail e senha, recuperação de senha e encerramento de sessão.
- Edição de nome, apresentação, textos, contatos, foto, fundo e PDF.
- Inclusão, edição, exclusão e reordenação de experiências, cursos, formação, competências, destaques, idiomas, projetos e vídeos.
- Envio de imagens JPG/PNG/WebP, PDFs e vídeos MP4/WebM; suporte a links do YouTube e Vimeo.
- Três paletas: vinho/rosé, ameixa/lavanda e verde/areia.
- Seções que podem ser ativadas ou desativadas sem apagar conteúdo.
- Prévia do rascunho, publicação explícita, aviso de alterações pendentes e backup JSON.
- Proteção contra sobrescrever uma publicação feita em outra sessão.

O PDF não contém foto ou vídeos. Por isso, a página começa com um monograma e a seção de vídeos está desativada. Nenhuma foto, instituição ou experiência foi inventada. O resultado aproximado de 90% e o período de experiência de 6 anos foram informados no currículo de origem; revise-os quando necessário.

## Antes de começar

Instale o Node.js 24 LTS e use um projeto Supabase dedicado a este site. Você precisará de uma conta na Vercel e no Supabase. Custos, limites e condições dos serviços dependem do plano escolhido.

Não há senha padrão ou conta já criada. As senhas são tratadas pelo Supabase Auth, não ficam no código do site.

## 1. Conferir a página no computador

Abra a pasta que contém `package.json` no VS Code. No terminal:

```bash
npm ci
npm run dev
```

Abra o endereço exibido pelo terminal. A página pública funciona com o conteúdo inicial mesmo sem configurar Supabase. Nesse caso, `/modificacao` mostra o login desabilitado e uma mensagem de configuração pendente. Não há simulação de salvamento em localStorage.

## 2. Preparar o banco e os arquivos

1. Crie um projeto em https://supabase.com/dashboard e aguarde a inicialização.
2. Abra **SQL Editor > New query**.
3. Copie todo o arquivo `supabase/01-estrutura.sql`, cole e execute.
4. Em outra consulta, execute todo o arquivo `supabase/02-conteudo-inicial.sql`.

O primeiro arquivo cria as tabelas, as políticas de segurança e o bucket `curriculo-media`. O segundo insere o currículo inicial. Ambos podem ser executados novamente sem apagar edições já publicadas. Não use “Disable RLS”.

## 3. Criar o acesso da Jaqueline

1. No Supabase, abra **Authentication > Users** e use **Add user / Create new user**.
2. Informe o e-mail de acesso e uma senha única, com pelo menos 12 caracteres. Marque a confirmação automática do e-mail ao criar a conta administrativamente, se essa opção aparecer.
3. Abra `supabase/03-liberar-editora.sql`. O e-mail padrão é o do currículo. Altere apenas esse e-mail se ela escolher outro para entrar.
4. Execute esse arquivo no SQL Editor.
5. Na configuração do provedor de e-mail/autenticação, desative a inscrição pública de novas contas. Mantenha o login por e-mail habilitado.

Só cadastrar uma conta não autoriza edição. O UUID da usuária também precisa estar em `public.site_editors`. Mesmo que alguém crie ou obtenha outra conta no projeto, as políticas do banco e dos arquivos impedem a alteração deste currículo.

O e-mail de contato público, editável no site, é independente do e-mail usado no login. Alterar um não altera o outro.

## 4. Conectar o site ao Supabase

Nas configurações de API do projeto Supabase, copie:

- **Project URL**, no formato `https://SEU-PROJETO.supabase.co`;
- **Publishable key** (`sb_publishable_...`). Se seu projeto ainda utiliza chaves antigas, a chave pública `anon` também funciona.

Crie um arquivo `.env.local` na raiz do projeto, usando `.env.example` como modelo:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Nunca coloque `service_role`, `sb_secret`, senha do banco ou senha da usuária em uma variável `VITE_*`. Essas variáveis são incluídas no código entregue ao navegador. A chave pública é projetada para esse uso; a autorização é feita pelas políticas RLS.

Reinicie `npm run dev` depois de preencher o arquivo. Abra `/modificacao` e entre com a conta criada.

## 5. Publicar na Vercel

### Pelo GitHub

1. Crie um repositório para este projeto e envie o conteúdo desta pasta. Não envie `node_modules`, `dist` ou `.env.local`.
2. Na Vercel, escolha **Add New > Project** e importe esse repositório.
3. Selecione a pasta que contém `package.json` como **Root Directory**.
4. Use as configurações:

| Campo | Valor |
|---|---|
| Framework Preset | Vite |
| Node.js Version | 24.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Em **Environment Variables**, adicione as mesmas duas variáveis do passo anterior. Marque Production; use Preview somente se quiser que as prévias se conectem ao mesmo banco.
6. Clique em **Deploy**.

O nome sugerido do projeto é `jaqueline-curriculo`. Se estiver disponível, o endereço será semelhante a `https://jaqueline-curriculo.vercel.app`. O endereço definitivo é aquele que a Vercel atribuir; não está reservado.

Rotas previstas:

```text
https://SEU-DOMINIO.vercel.app/
https://SEU-DOMINIO.vercel.app/modificacao
```

O arquivo `vercel.json` já inclui a regra para abrir `/modificacao` diretamente ou atualizar essa página sem erro 404.

### Alternativa pelo terminal

Na raiz do projeto:

```bash
npx vercel
```

Siga a criação do projeto, configure as duas variáveis no painel da Vercel e então publique:

```bash
npx vercel --prod
```

Ao alterar variáveis na Vercel, faça um **Redeploy**: Vite utiliza esses valores durante a compilação.

## 6. Configurar recuperação de senha

No Supabase, abra **Authentication > URL Configuration**:

- **Site URL**: `https://SEU-DOMINIO.vercel.app`
- **Redirect URLs**: adicione `https://SEU-DOMINIO.vercel.app/modificacao?recuperar=1`
- Para testar localmente, adicione também `http://localhost:5173/modificacao?recuperar=1` (ou a porta usada pelo Vite).

Configure um provedor SMTP no Supabase para a entrega de e-mails em produção. O serviço de e-mail padrão pode ter restrições de destinatários e envio. Confirme as condições do seu projeto e teste a recuperação antes de entregar o acesso.

O fluxo de recuperação usa PKCE. Peça o link e abra-o no mesmo navegador/dispositivo. Na página, defina e confirme a nova senha. Se o link tiver expirado, solicite outro.

## Como ela faz as alterações

1. Acesse `/modificacao` e entre.
2. Escolha uma seção no menu.
3. Edite os campos ou use **Adicionar**. As setas mudam a ordem; a lixeira remove o item do rascunho.
4. Para fotos, PDFs e vídeos, use **Escolher arquivo**. Também é possível colar um endereço HTTPS.
5. Em **Aparência e seções**, escolha a paleta e ative/desative as partes do site.
6. Clique em **Prévia** para conferir o resultado.
7. Clique em **Salvar e publicar**. As mudanças passam a ser lidas do banco pelos visitantes, sem precisar fazer um novo deploy.

Os visitantes veem as atualizações ao abrir ou recarregar a página; a página também consulta novamente ao voltar para a aba. Não há transmissão em tempo real enquanto a aba fica aberta e ativa.

Alterações no código/design exigem novo deploy. Alterações feitas no painel não exigem.

### Fotos, arquivos e vídeos

- Imagens: JPG, PNG ou WebP, até 5 MB. Uma foto vertical com rosto centralizado funciona bem no cabeçalho.
- PDFs: até 20 MB.
- Vídeos enviados: MP4 ou WebM, até 20 MB. Para arquivos grandes, use YouTube ou Vimeo.
- Não há reprodução automática. Vídeos externos só carregam o player quando o visitante clica em reproduzir.
- Para exibir vídeos, adicione pelo menos um vídeo e ative a seção em **Aparência e seções**.
- Arquivos enviados ficam em um bucket público, pois compõem o currículo público. Envie somente conteúdo que pode ser divulgado.
- Remover a referência de uma foto, vídeo ou certificado no editor não apaga o arquivo físico. Isso evita quebrar versões em uso. Para apagar arquivos definitivamente, use **Storage > curriculo-media** no Supabase, verificando antes se algum conteúdo publicado ainda utiliza o link.

### Currículo em PDF

O PDF inicial é o arquivo original enviado. Alterar os textos do site não reescreve esse PDF automaticamente. Envie um PDF atualizado no campo **Currículo para download** para manter as versões alinhadas. Para retirar o botão de download, remova o endereço desse campo e publique.

### Backup e conflitos de edição

Em **Aparência e seções**, exporte o rascunho em JSON. O arquivo guarda os textos e os links, não os próprios arquivos de mídia. Guarde os originais das fotos, vídeos e PDFs separadamente.

Se duas sessões editarem ao mesmo tempo, a segunda publicação não sobrescreverá silenciosamente a primeira. Exporte seu rascunho, recarregue a página, compare as mudanças e aplique as que deseja manter. Importar um backup substitui o rascunho inteiro e só altera o site ao clicar em salvar.

## Organização dos arquivos

```text
src/components/Portfolio.tsx  Página pública
src/components/Admin.tsx      Login, sessão e recuperação
src/components/Editor.tsx     Formulários de edição
src/lib/backend.ts            Integração com Supabase
src/lib/schema.ts             Validação de dados, links e vídeos
src/content.json              Conteúdo inicial para visualização sem backend
src/styles.css                Estilos e responsividade
public/assets/                Desenho técnico, ícone e PDF original
supabase/                     Estrutura, dados iniciais e autorização da editora
tests/                        Testes funcionais e políticas de acesso
vercel.json                   Rotas e cabeçalhos da hospedagem
```

Depois de conectar o Supabase, o banco passa a ser a fonte do conteúdo. Editar somente `src/content.json` não altera o conteúdo já salvo no banco.

## Segurança e limites técnicos

- Senhas são gerenciadas pelo Supabase Auth; não são salvas nas tabelas do currículo.
- A sessão usa o armazenamento de autenticação do Supabase no navegador. Termine a sessão em computadores compartilhados.
- Leitura pública limitada ao currículo. Escrita permitida apenas a UUIDs autorizados em `site_editors`.
- Nenhum formulário permite dar permissão de edição a si mesmo.
- Tipos e tamanhos de arquivo são limitados no aplicativo e no bucket. SVG/HTML não são aceitos nos uploads.
- Conteúdo textual é renderizado como texto pelo React. Não existe editor de HTML arbitrário.
- Links de conteúdo aceitam HTTPS; vídeos incorporados ficam restritos a YouTube/Vimeo.
- Cabeçalhos de segurança e instruções para não indexar `/modificacao` estão no `vercel.json`.
- O projeto usa a URL padrão do Supabase. Se você usar domínio personalizado para a API, ajuste a validação de URL em `backend.ts` e a política `connect-src` em `vercel.json`.
- Títulos e descrição editados no painel atualizam o navegador. Para alterar as prévias estáticas de compartilhamento de redes sociais, ajuste também `index.html` e publique novamente. Este projeto é uma SPA, sem renderização dinâmica no servidor.

## Testes

```bash
npm test
npm run build
```

Os testes de banco executam SQL real em PostgreSQL embarcado via PGlite, com schemas equivalentes mínimos de Auth/Storage. Eles verificam acesso anônimo, usuário não autorizado, editora, revogação, uploads e conflitos de revisão. Os testes de interface usam DOM simulado.

A configuração final deve ser validada no seu Supabase e na Vercel: entrar, alterar um texto, salvar, abrir a página pública em outra janela, enviar uma imagem e recuperar senha. Os serviços externos não foram provisionados neste projeto; não foi possível executar uma sessão real com suas credenciais. A compilação e os testes automatizados não substituem revisão visual em navegador real.

## Solução de problemas

| Situação | O que verificar |
|---|---|
| Login informa configuração pendente | As duas variáveis estão preenchidas? Reiniciou o Vite ou fez redeploy? |
| Acesso não autorizado | A conta foi criada e o arquivo `03-liberar-editora.sql` foi executado para o e-mail correto? |
| Não carrega currículo | Execute os dois primeiros SQLs. Confira a URL, a chave pública e a disponibilidade do projeto Supabase. |
| Upload falha | Confira o bucket, as políticas, a autorização, o formato e o limite do arquivo. |
| Recuperação não chega | Confira SMTP, pasta de spam, e-mail cadastrado e limites do serviço. |
| Link de recuperação não funciona | Confira Redirect URLs e use o mesmo navegador em que pediu o link. |
| `/modificacao` dá 404 | Confira a inclusão de `vercel.json` na raiz importada. |
| Site não mostra alterações do painel | Verifique se clicou em salvar e se a página utiliza o mesmo projeto Supabase. |

## Referências técnicas

- Vite na Vercel: https://vercel.com/docs/frameworks/frontend/vite
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Segurança do Storage: https://supabase.com/docs/guides/storage/security/access-control
- Recuperação de senha: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

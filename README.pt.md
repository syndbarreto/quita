# Quita

Quita é uma aplicação de bem-estar mental onde os utilizadores atribuem as suas preocupações a bonecas, acompanham o progresso emocional através de jornais e libertam as preocupações resolvidas para o Bliss. Desenvolvida com JavaScript vanilla (ES Modules), json-server-auth e uma arquitetura multi-página.

---

## Requisitos

- Node.js 18+
- Python 3 (para servir o frontend)

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o chatbot

Copiar o ficheiro de exemplo e preencher as credenciais da API:

```bash
cp config/chat-config.example.js config/chat-config.js
```

Abrir `config/chat-config.js` e substituir os valores de exemplo:

```js
export const API_KEY = "your-api-key-here";
export const ENDPOINT  = "https://api.example.com/v1/chat/completions";
export const MODEL = "gpt-4o-mini";
```

> A página do chatbot carrega sem este passo — apenas falha ao enviar uma mensagem.

---

## Executar a aplicação

Abrir **dois terminais** na raiz do projeto e correr um comando em cada:

**Terminal 1 — Servidor da API (porta 3000)**
```bash
npm run api
```

**Terminal 2 — Frontend (porta 4173)**
```bash
npm run app
```

Abrir o browser em:

```
http://localhost:4173
```

---

## Credenciais de teste

| Perfil | Email | Password |
|---|---|---|
| Utilizador normal | `user@quita.com` | `user1234` |
| Administrador | `admin@quita.com` | `admin1234` |

---

## Funcionalidades

- **Criação de Quita** — atribuir uma preocupação a uma boneca através de um quiz guiado (Seed / Knot / Burden)
- **Metamorfose da boneca** — a boneca evolui de Worried → Calm → Happy à medida que são adicionados jornais
- **Check-in emocional** — registo diário de humor com histórico
- **Notificações** — sino na Home com badge de não lidas; acionado por eventos chave da app
- **Calming Tools** — respiração, grounding, sons e citações com favoritos
- **Vault** — arquivo pessoal de Quitas ativas (vista em grelha e lista)
- **Bliss** — Quitas libertadas com texto de reflexão
- **Chatbot** — assistente de reflexão com LLM real e streaming SSE
- **Painel de administração** — gerir utilizadores (ativar/desativar) e editar tools

---

## Estrutura do projeto

```
pages/        Páginas HTML
views/        View JS por página (DOM + eventos)
models/       Entidade Quita e coleção
services/     API, autenticação, tools, notificações, chat
css/          Estilos globais e por página
assets/       Imagens, fontes, ícones
config/       Configuração do chat (excluída do repo — ver configuração)
db.json       Base de dados simulada (json-server)
routes.json   Guards de acesso por coleção
```

---

## Notas de arquitetura

- **MPA** — cada página HTML carrega a sua própria view como `type="module"`
- **Sem innerHTML** — todo o DOM construído com `createElement` / `textContent`
- **Sem fetch nas views** — todas as chamadas de rede passam pelos `services/`
- **Autenticação** — token JWT guardado em `localStorage`; `userId` injetado automaticamente pelo `createOwnedRecord`
- **Guards** — `600` (apenas o dono) em quitas, journals, emotionalCheckins, notifications; `664` (leitura pública) em tools

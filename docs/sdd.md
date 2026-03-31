# 🛠️ Software Design Document (SDD)

**Projeto:** Hidden Friend
**Versão:** 1.0.0  
**Status:** ⚪ Aguardando Geração de Especificações.

## 🤖 1. Orquestração e Contexto de IA (MCP)
> Configuração dos servidores Model Context Protocol para a IDE Agêntica.

* **Figma/Stitch MCP:** `[LINK DO ARQUIVO FIGMA - A definir na Etapa 4]` (Ler design tokens, cores e hierarquia visual Mobile-First).
* **Supabase MCP:** Contexto do esquema PostgreSQL, tabelas `events` e `participants`, e políticas de Row Level Security (RLS).
* **GitHub MCP:** Leitura das Issues do Kanban (US01 a US11) para orientar a implementação das regras de negócio (Spec-Driven Development).

## 📦 2. Stack Tecnológica e Bibliotecas
> Definição estrita das tecnologias permitidas (package.json). Nenhuma dependência externa deve ser instalada sem refletir aqui.

* **Core:** Angular 18/19+ (Arquitetura estritamente Standalone e reatividade via Signals).
* **BaaS & Auth:** `@supabase/supabase-js` para autenticação e banco de dados.
* **Estilização & UI:** `[A DEFINIR: Tailwind CSS ou PrimeNG]` e biblioteca de ícones correspondente.
* **Utilitários:** `[A DEFINIR conforme necessidade, ex: date-fns para datas]`.

## 🗄️ 3. Arquitetura de Dados

### 📖 3.1. Glossário Técnico (Mapeamento)
| Termo PRD (PT-BR) | Entidade Técnica (EN) | Atributos Principais |
| :--- | :--- | :--- |
| Organizador | `auth.users` (Supabase) | `id`, `email` |
| Evento/Sorteio | `events` | `id`, `organizer_id`, `name`, `exchange_date`, `budget`, `location` |
| Participante | `participants` | `id`, `event_id`, `name`, `email`, `secret_token` (UUID), `drawn_participant_id` |
| Lista de Desejos | `wishlist` | Embutido em `participants` como `wishlist_items` (array de strings) ou campos `wishlist_1`, `wishlist_2`. |

### 📊 3.2. Diagrama ER (Mermaid)
> [O Código do Diagrama Mermaid será inserido aqui no próximo passo após a modelagem fina das tabelas]

## 📑 4. Contratos Globais (Interfaces & Types)
> Tipagem TypeScript baseada no banco de dados.

```typescript
export interface AppEvent {
  id: string;
  organizer_id: string;
  name: string;
  exchange_date: string;
  budget: number | null;
  location: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  email: string;
  secret_token: string;
  drawn_participant_id: string | null;
  wishlist_items: string[] | null;
}
```

## 🏗️ 5. Scaffolding Macro (Arquitetura Frontend)

### 📂 5.1. Estrutura de Pastas Base
* **`src/app/core/`**: Services globais singleton (Supabase), Interceptors (se houver API externa), Functional Guards (Auth).
* **`src/app/features/`**: Smart Components (Páginas: Login, Dashboard, Evento, Revelação) que gerenciam rotas e consomem services.
* **`src/app/shared/`**: UI Components (Dumb), pipes de formatação de moeda/data estritamente reutilizáveis.

### 🚦 5.2. Mapa de Rotas e Páginas (Features)
| Rota | Page Component | Functional Guard |
| :--- | :--- | :--- |
| `/login` | `src/app/features/auth/login.page.ts` | Público (Redireciona se logado) |
| `/dashboard` | `src/app/features/dashboard/dashboard.page.ts` | `authGuard` (Requer Login) |
| `/event/:id` | `src/app/features/event-details/event-details.page.ts` | `authGuard` (Valida dono do evento) |
| `/reveal/:token` | `src/app/features/reveal/reveal.page.ts` | `validTokenGuard` (Público, valida UUID) |

### 🧠 5.3. Core Services (Singleton)
| Service | Arquivo | Responsabilidade Macro |
| :--- | :--- | :--- |
| `AuthService` | `core/services/auth.service.ts` | Gerenciar sessão Supabase, login e logout. |
| `EventService` | `core/services/event.service.ts` | CRUD da tabela `events` atrelado ao usuário logado. |
| `ParticipantService` | `core/services/participant.service.ts` | CRUD da tabela `participants` e chamada do algoritmo de sorteio. |
| `RevealService` | `core/services/reveal.service.ts` | Validar token, salvar wishlist e buscar dados do participante sorteado (ReadOnly). |

## 🛡️ 6. Segurança (Supabase RLS)
> Políticas de acesso a nível de banco de dados.

| Tabela | Política (RLS) |
| :--- | :--- |
| `events` | **ALL:** `auth.uid() = organizer_id` (Apenas o dono pode ver, criar, editar ou deletar seu evento). |
| `participants` | **ALL:** Requer join com `events` onde `auth.uid() = events.organizer_id` (Organizador gerencia os participantes do seu próprio evento). |
| `participants` | **SELECT/UPDATE:** Público, filtrado estritamente pela cláusula `WHERE secret_token = {token_da_url}` (Permite ao participante atualizar sua wishlist e ver quem tirou, sem expor os demais). |

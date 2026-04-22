# 🛠️ Software Design Document (SDD)

**Projeto:** [Hidden Friend]  
**Versão:** 1.0.0  
**Status:** ⚪ Aguardando Geração de Especificações.

---

## 🤖 1. Orquestração e Contexto de IA (MCP)

> Configuração dos servidores Model Context Protocol para a IDE Agêntica.

- **Figma MCP:** `[LINK DO ARQUIVO FIGMA]` (Ler design tokens, cores e hierarquia visual)
- **Supabase MCP:** Contexto do banco de dados real e políticas de RLS
- **GitHub MCP:** Leitura das Issues do Kanban para orientar a implementação (Spec-Driven)

---

## 📦 2. Stack Tecnológica e Bibliotecas

> Definição estrita das tecnologias permitidas (package.json). Nenhuma dependência externa deve ser instalada sem refletir aqui.

* **Core:** Angular 21+ (Standalone / Signals).
* **BaaS & Auth:** Supabase-js.
* **Estilização & UI:** Tailwind CSS, Spartan UI (HLM), Lucide Angular (Ícones).
* **Utilitários:** [Ex: date-fns para datas, zod para schemas].

## 🗄️ 3. Arquitetura de Dados

### 📖 3.1. Glossário Técnico (Mapeamento)

| Termo PRD (PT-BR)        | Entidade Técnica (EN - snake_case) | Atributos Principais                                                               |
| :----------------------- | :--------------------------------- | :--------------------------------------------------------------------------------- |
| Evento                   | `events`                           | `id`, `organizer_id`, `name`, `date`, `location`, `suggested_gift_value`, `status` |
| Organizador              | `users`                            | `id`, `email`, `password_hash`, `created_at`                                       |
| Participante             | `participants`                     | `id`, `event_id`, `name`, `email`, `token`, `confirmed_at`                         |
| Sorteio                  | `draws`                            | `id`, `event_id`, `performed_at`                                                   |
| Resultado do Sorteio     | `draw_results`                     | `id`, `draw_id`, `giver_participant_id`, `receiver_participant_id`                 |
| Amigo Secreto (Sorteado) | `draw_results`                     | `giver_participant_id`, `receiver_participant_id`                                  |
| Lista de Desejos         | `wishlists`                        | `id`, `participant_id`, `wish_1`, `wish_2`, `wish_3`, `created_at`                 |
| Link de Acesso           | `participant_access_tokens`        | `id`, `participant_id`, `token`, `expires_at`, `created_at`                        |

---

### 📊 3.2. Diagrama ER (Mermaid)

```mermaid
erDiagram

    users {
        uuid id PK
        string email
        string password_hash
        timestamp created_at
    }

    events {
        uuid id PK
        uuid organizer_id FK
        string name
        date date
        string location
        numeric suggested_gift_value
        string status
        timestamp created_at
    }

    participants {
        uuid id PK
        uuid event_id FK
        string name
        string email
        string token
        timestamp confirmed_at
        timestamp created_at
    }

    draws {
        uuid id PK
        uuid event_id FK
        timestamp performed_at
    }

    draw_results {
        uuid id PK
        uuid draw_id FK
        uuid giver_participant_id FK
        uuid receiver_participant_id FK
    }

    wishlists {
        uuid id PK
        uuid participant_id FK
        string wish_1
        string wish_2
        string wish_3
        timestamp created_at
    }

    participant_access_tokens {
        uuid id PK
        uuid participant_id FK
        string token
        timestamp expires_at
        timestamp created_at
    }

    users ||--o{ events : organizes
    events ||--o{ participants : has
    events ||--o{ draws : has
    draws ||--o{ draw_results : generates
    participants ||--|| wishlists : has
    participants ||--o{ draw_results : giver
    participants ||--o{ draw_results : receiver
    participants ||--o{ participant_access_tokens : has
````

---

## 📑 4. Contratos Globais (Interfaces & Types)

📁 **Localização:** `src/app/core/models/`

```ts
// user.model.ts
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}
```

```ts
// event.model.ts
export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  date: string;
  location: string;
  suggested_gift_value: number;
  status: string;
  created_at: string;
}
```

```ts
// participant.model.ts
export interface Participant {
  id: string;
  event_id: string;
  name: string;
  email: string;
  token: string;
  confirmed_at: string | null;
  created_at: string;
}
```

```ts
// draw.model.ts
export interface Draw {
  id: string;
  event_id: string;
  performed_at: string;
}
```

```ts
// draw-result.model.ts
export interface DrawResult {
  id: string;
  draw_id: string;
  giver_participant_id: string;
  receiver_participant_id: string;
}
```

```ts
// wishlist.model.ts
export interface Wishlist {
  id: string;
  participant_id: string;
  wish_1: string;
  wish_2: string;
  wish_3: string;
  created_at: string;
}
```

```ts
// participant-access-token.model.ts
export interface ParticipantAccessToken {
  id: string;
  participant_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
```

---

## 🏗️ 5. Scaffolding Macro (Arquitetura Frontend)

### 📂 5.1. Estrutura de Pastas Global (Workspace)
O projeto utiliza uma estrutura de Monorepo para separar a documentação, o backend (futuro) e o frontend.

* **`docs/`**: Documentação oficial do projeto (PRD, SDD, manuais).
* **`apps/api/`**: Reservado para o Backend/Servidor (Node/Supabase Edge Functions).
* **`apps/web/`**: Aplicação Frontend principal (Angular + Tailwind).
---

### 🚦 5.2. Mapa de Rotas e Páginas (Features)

| Rota                                | Page Component                                                    | Guard                   |
| :---------------------------------- | :---------------------------------------------------------------- | :---------------------- |
| `/login`                            | `features/auth/login/login.page.ts`                               | Público                 |
| `/register`                         | `features/auth/register/register.page.ts`                         | Público                 |
| `/events`                           | `features/events/event-list/event-list.page.ts`                   | `auth.guard.ts`         |
| `/events/create`                    | `features/events/event-create/event-create.page.ts`               | `auth.guard.ts`         |
| `/events/:eventId`                  | `features/events/event-detail/event-detail.page.ts`               | `auth.guard.ts`         |
| `/events/:eventId/manage`           | `features/events/event-manage/event-manage.page.ts`               | `auth.guard.ts`         |
| `/events/:eventId/participants`     | `features/participants/participant-list/participant-list.page.ts` | `auth.guard.ts`         |
| `/events/:eventId/participants/add` | `features/participants/participant-add/participant-add.page.ts`   | `auth.guard.ts`         |
| `/events/:eventId/draw`             | `features/draw/draw-execute/draw-execute.page.ts`                 | `auth.guard.ts`         |
| `/events/:eventId/results`          | `features/draw/draw-result/draw-result.page.ts`                   | `auth.guard.ts`         |
| `/events/:eventId/wishlist`         | `features/wishlist/wishlist-form/wishlist-form.page.ts`           | `auth.guard.ts`         |
| `/access/:token`                    | `features/public/access/access.page.ts`                           | Público                 |
| `/confirm/:token`                   | `features/public/confirm-identity/confirm-identity.page.ts`       | `event-access.guard.ts` |
| `/reveal/:token`                    | `features/public/reveal/reveal.page.ts`                           | `event-access.guard.ts` |

---

### 🧠 5.3. Core Services (Singleton)
| Service              | Arquivo                  | Responsabilidade Macro                                                                         |
| :------------------- | :----------------------- | :--------------------------------------------------------------------------------------------- |
| `AuthService`        | `auth.service.ts`        | Gerenciar autenticação com Supabase (login, registro, logout, sessão).                         |
| `EventService`       | `event.service.ts`       | CRUD de eventos e gestão de status do evento.                                                  |
| `ParticipantService` | `participant.service.ts` | Gerenciar participantes (adicionar, listar, remover, validar identidade).                      |
| `DrawService`        | `draw.service.ts`        | Executar o sorteio respeitando as regras de negócio (RN01, RN02, RN05) e persistir resultados. |
| `WishlistService`    | `wishlist.service.ts`    | Gerenciar lista de desejos dos participantes (criar, atualizar, buscar).                       |
| `AccessService`      | `access.service.ts`      | Validar tokens de acesso, controlar fluxo de acesso público (US06, US07, RN03, RN04).          |
| `SupabaseService`    | `supabase.service.ts`    | Instância central do client Supabase e configuração de conexão.                                |


## 🛡️ 6. Segurança (Supabase RLS)
| Tabela                      | Política (RLS)                                                                                                                                                                                                                                        |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                     | **SELECT/UPDATE**: Apenas o próprio usuário (`auth.uid() = id`) <br> **INSERT**: Permitido via signup <br> **DELETE**: Apenas o próprio usuário                                                                                                       |
| `events`                    | **SELECT**: Apenas eventos do organizador (`auth.uid() = organizer_id`) <br> **INSERT**: Usuário autenticado <br> **UPDATE/DELETE**: Apenas o organizador (`auth.uid() = organizer_id`)                                                               |
| `participants`              | **SELECT**: Organizador do evento OU participante via token válido <br> **INSERT**: Organizador do evento <br> **UPDATE**: Organizador OU participante (para confirmação de identidade) <br> **DELETE**: Apenas organizador (antes do sorteio - RN05) |
| `draws`                     | **SELECT**: Apenas organizador do evento <br> **INSERT**: Apenas organizador ao executar sorteio <br> **UPDATE/DELETE**: ❌ Não permitido (imutável após criação - RN05)                                                                               |
| `draw_results`              | **SELECT**: Apenas o participante envolvido (`giver_participant_id` via token) OU organizador <br> **INSERT**: Sistema (via função segura no backend / RPC) <br> **UPDATE/DELETE**: ❌ Não permitido (RN03, RN05)                                      |
| `wishlists`                 | **SELECT**: Participante dono OU participante que o tirou <br> **INSERT**: Participante dono <br> **UPDATE**: Participante dono (antes da revelação - RN04) <br> **DELETE**: ❌ Não permitido                                                          |
| `participant_access_tokens` | **SELECT**: Sistema (validação de token) <br> **INSERT**: Organizador (ao criar participantes) <br> **UPDATE**: ❌ Não permitido <br> **DELETE**: Sistema (expiração/opcional cleanup)                                                                 |


## 🛡️ 7. Design Tokens (Variáveis CSS Base)
# Color Palette
Our color palette is designed to be clear and accessible in a **dark** interface.
 
*   **Primary Color:** `#6D28D9` (A vibrant purple, used for primary actions and key brand elements.)
*   **Secondary Color:** `#10B981` (A bright green, complementing the primary for secondary actions and highlights.)
*   **Neutral Color:** `#0F172A` (A very dark blue, serving as the base for backgrounds and text in dark mode.)
 
# Typography
Our typographic system utilizes the 'Inter' font family across all major text roles, ensuring consistency and readability.
 
*   **Headline Font:** Inter
*   **Body Font:** Inter
*   **Label Font:** Inter
 
# Shape and Form
The system adopts a moderate approach to corner rounding.
 
*   **Roundedness:** `2` (Moderate rounding, providing a friendly yet modern aesthetic.)
 
# Spacing
The layout density is set to a normal level, balancing information display with adequate whitespace.
 
*   **Spacing:** `2` (Normal spacing, providing a comfortable visual rhythm.)
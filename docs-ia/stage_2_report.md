# 🛡️ Relatório Técnico de Defesa - Etapa 2

Este documento apresenta a defesa conceitual e prática dos recursos implementados na **Etapa 2** (CRUD com Supabase e Integração RxJS-Signals) do **Hidden Friend**.

---

## 🗄️ [ID22] - Ciclo CRUD no Supabase Database

### 1. O Conceito (Em palavras simples)
É o banco de dados na nuvem que armazena todas as tabelas (eventos, participantes, desejos, sorteios). Ele substitui o banco local simulado (JSON Server) por um banco de dados PostgreSQL real, permitindo relacionamentos robustos entre tabelas e operações eficientes direto no servidor.

### 2. A Motivação (Por que aqui?)
Para persistir as informações da aplicação de forma permanente e integrada à segurança do organizador. Com o Supabase Database, implementamos consultas filtradas automaticamente via políticas de segurança (RLS) e conseguimos realizar inserções de dados em lote (*bulk insert*) ao sortear os amigos secretos, otimizando a performance e eliminando o risco de inconsistência de dados.

### 3. A Anatomia do Código
No arquivo [draw.service.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/draw/draw.service.ts):

```typescript
const { error: resultsError } = await this.supabaseService.client
  .from('draw_results')
  .insert(pairs);
```
*   `.from('draw_results')`: Define a tabela alvo da operação no banco de dados.
*   `.insert(pairs)`: Envia o array inteiro de givers/receivers para inserção simultânea (*bulk insert*), economizando requisições de rede.

### 4. O Teste do "E se eu tirar?"
Se você apagar esse CRUD real do Supabase:
1. Os dados voltarão a ser salvos em um mock que apaga as alterações sempre que o servidor web for reiniciado.
2. Ao realizar o sorteio, teríamos que disparar requisições em loops individuais no frontend (gerando lentidão e sobrecarga na rede). Se um participante falhar no meio do loop, o sorteio fica quebrado pela metade.

---

## 🔄 [ID25] - Ponte RxJS ➔ Signals (`toSignal()` / `toObservable()`)

### 1. O Conceito (Em palavras simples)
É o canal de comunicação entre os **Signals** (que controlam a renderização da tela de forma rápida e síncrona) e o **RxJS** (perfeito para tratar fluxos assíncronos e eventos ao longo do tempo, como requisições de rede ou debounce de pesquisas).

### 2. A Motivação (Por que aqui?)
Utilizamos essa integração no gerenciamento de estado dos eventos do Dashboard. Sempre que o organizador cria, edita ou exclui um evento, ele atualiza um sinalizador simples. Esse sinalizador é convertido em Observable, executa a busca assíncrona no Supabase usando operadores reativos que gerenciam a concorrência, e retorna os dados convertidos de volta em um Signal legível pelo template de forma síncrona.

### 3. A Anatomia do Código
No arquivo [event.service.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/events/event.service.ts):

```typescript
private events$ = toObservable(this.refreshSignal).pipe(
  tap(() => this.loadingSignal.set(true)),
  switchMap(() => from(this.fetchEventsFromSupabase())),
  tap(() => this.loadingSignal.set(false))
);
readonly events = toSignal(this.events$, { initialValue: [] as Event[] });
```
*   `toObservable(this.refreshSignal)`: Converte o Signal do gatilho de recarga em um fluxo Observable.
*   `switchMap(...)`: Garante que, caso haja múltiplas solicitações de recarga rápidas, as anteriores sejam canceladas, evitando *race conditions*.
*   `toSignal(this.events$)`: Transforma o resultado assíncrono do fluxo final de volta em um Signal imutável, permitindo que a tela renderize os eventos de forma simples e direta.

### 4. O Teste do "E se eu tirar?"
Se você remover essa ponte de integração:
1. O Dashboard perderá a reatividade automatizada: após deletar ou criar um evento, a tela não atualizará os dados sozinha e exigirá chamadas imperativas espalhadas pelo código.
2. Riscos de concorrência (*race conditions*): se o usuário clicar em atualizar duas vezes rapidamente, requisições lentas antigas podem sobrescrever os dados novos que chegaram primeiro.

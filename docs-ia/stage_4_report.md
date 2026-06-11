# 🛡️ Relatório Técnico de Defesa - Etapa 4

Este documento apresenta a defesa conceitual e prática dos recursos de interface, roteamento e performance implementados na **Etapa 4** do **Hidden Friend**.

---

## 📱 [ID3] - Configuração de PWA & Experiência Offline

### 1. O Conceito (Em palavras simples)
Transforma a aplicação web em um aplicativo instalável de visual nativo, configurando ícones, cores de tema de fundo e uma tela offline. O aplicativo monitora o estado da rede e se adapta se o sinal de internet sumir.

### 2. A Motivação (Por que aqui?)
Para dar o comportamento nativo (Mobile-First) ao acessar e interagir com o amigo secreto. Adicionalmente, adicionamos um detector de rede e um banner flutuante amigável para sinalizar o estado offline ao usuário, prevenindo cliques e envios desnecessários enquanto a conexão estiver inativa.

### 3. A Anatomia do Código
No arquivo [app.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/app.ts):

```typescript
protected isOffline = signal(!navigator.onLine);

@HostListener('window:offline')
protected onOffline(): void {
  this.isOffline.set(true);
}
```
*   `signal(!navigator.onLine)`: Inicializa o estado com a presença real de conexão do dispositivo.
*   `@HostListener('window:offline')`: Monitora o evento global do navegador para perda de conexão, alterando o Signal de forma reativa para disparar o banner no HTML.

---

## 🗺️ [ID18] - Estrutura de Navegação Aninhada (Rotas Filhas)

### 1. O Conceito (Em palavras simples)
É uma forma de estruturar caminhos na aplicação agrupando subpáginas dentro de uma rota pai que serve como um layout base comum.

### 2. A Motivação (Por que aqui?)
Utilizada para organizar as páginas autenticadas. A rota pai carrega o `AppShellComponent` (que contém o menu de navegação, a marca da aplicação e o botão de logout), e suas rotas filhas (`children`, ex: `/events`, `/events/new`) trocam apenas o miolo da tela. Isso economiza re-renderizações e duplicação de layout comum.

### 3. A Anatomia do Código
No arquivo [app.routes.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/app.routes.ts):

```typescript
// Protected routes (with AppShell layout serving as a parent view with its own nested children)
{
  path: '',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./shared/layout/app-shell').then((m) => m.AppShellComponent),
  children: [
    {
      path: 'events',
      loadChildren: () =>
        import('./features/events/events.routes').then((m) => m.EVENTS_ROUTES),
    }
  ]
}
```
*   `loadComponent: () => ...AppShellComponent`: Declara o componente pai que hospeda o `<router-outlet>` onde as rotas filhas serão injetadas.
*   `children`: O array de rotas filhas subordinadas a esse layout comum.

### 4. O Teste do "E se eu tirar?"
Se você remover as rotas filhas e o layout compartilhado:
1. Toda página precisará carregar e declarar individualmente o menu superior, botão de logout e containers centrais, gerando repetição desnecessária de código.
2. A transição entre páginas (como clicar de "Seus Eventos" para "Novo Evento") faria a barra de menu piscar ou sumir temporariamente enquanto reconstrói a árvore de componentes, prejudicando a fluidez visual da SPA.

---

## ⚡ [ID9] - Deferrable Views (`@defer`)

### 1. O Conceito (Em palavras simples)
Recurso nativo do Angular para adiar o carregamento de componentes pesados da tela até que certas condições sejam satisfeitas (como o navegador estar ocioso ou o elemento entrar na área visível da tela).

### 2. A Motivação (Por que aqui?)
Para acelerar o carregamento inicial do Dashboard de eventos. Os cartões que exibem os eventos (`EventCardComponent`) contêm diversos subcomponentes estilizados e ícones do Lucide. Ao envelopar cada cartão com `@defer (on idle)`, o Angular quebra esse bloco em um pedaço de JavaScript separado (lazy-loading), carregando-o apenas em segundo plano e mostrando um esqueleto pulsante (*skeleton loader*) de imediato.

### 3. A Anatomia do Código
No arquivo [dashboard.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/events/dashboard.ts):

```html
@defer (on idle) {
  <app-event-card [event]="event" />
} @placeholder {
  <div class="h-[188px] w-full rounded-xl bg-card border border-border/60 animate-pulse flex items-center justify-center text-muted-foreground text-xs">
    Carregando informações...
  </div>
}
```
*   `@defer (on idle)`: Comunica ao Angular para baixar o JavaScript do `EventCardComponent` apenas quando o navegador estiver ocioso (sem outras tarefas pesadas).
*   `@placeholder`: Conteúdo exibido instantaneamente como fallback visual até o carregamento real do componente finalizar.

### 4. O Teste do "E se eu tirar?"
Se você apagar o bloco `@defer`:
1. O tamanho do arquivo JavaScript inicial baixado no primeiro acesso ao Dashboard será maior, uma vez que o código dos cartões e ícones será empacotado na build principal.
2. A métrica de performance do Lighthouse (como *Largest Contentful Paint*) piorará, especialmente para usuários em dispositivos antigos ou conexões móveis.

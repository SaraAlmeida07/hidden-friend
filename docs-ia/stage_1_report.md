# 🛡️ Relatório Técnico de Defesa - Etapa 1

Este documento apresenta a defesa conceitual e prática dos recursos implementados na **Etapa 1** da modernização do **Hidden Friend**.

---

## 🔑 [ID21] - Autenticação e Sessão (JWT) no Supabase

### 1. O Conceito (Em palavras simples)
É o sistema que controla a identidade dos usuários. O **Supabase Auth** gerencia o cadastro, login e persistência da sessão do usuário de forma segura, emitindo tokens criptografados (JWT - JSON Web Tokens) que comprovam quem é o usuário em cada requisição.

### 2. A Motivação (Por que aqui?)
Substituímos o mock vulnerável que usava `localStorage` sem criptografia e requisições simuladas por um backend como serviço (BaaS) real. Com isso, os dados do organizador e dos sorteios são protegidos contra acessos mal-intencionados, vinculando-se diretamente ao identificador único (`user.id`) do Supabase Auth.

### 3. A Anatomia do Código
No arquivo [auth.service.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/core/auth/auth.service.ts#L22-L33):

```typescript
this.supabase.auth.onAuthStateChange((event, session) => {
  this.sessionSignal.set(session);
  if (session) {
    this.currentUserSignal.set(session.user);
  } else {
    this.currentUserSignal.set(null);
  }
});
```
*   `onAuthStateChange`: Escuta de forma reativa eventos de autenticação (login, logout, token renovado).
*   `sessionSignal.set(session)`: Atualiza o estado da sessão de forma reativa usando Angular Signals.
*   `currentUserSignal`: Expõe os dados do usuário conectado para toda a aplicação.

### 4. O Teste do "E se eu tirar?"
Se você apagar esse código:
1. A aplicação perde a reatividade ao estado de login (um usuário loga, mas a interface não atualiza).
2. Não haverá persistência: ao recarregar a página (F5), o usuário será deslogado imediatamente.
3. Não haverá token JWT ativo para autenticar as chamadas de banco de dados do Supabase.

---

## 🚦 [ID19] - Functional Route Guards & Resolvers

### 1. O Conceito (Em palavras simples)
*   **Guard (Guarda de Rota):** Um segurança na porta que decide se o usuário pode ou não entrar em um caminho/URL.
*   **Resolver (Pré-carregador):** Um garçom que traz os dados da cozinha (servidor) antes de você sentar na mesa (o componente carregar visualmente).

### 2. A Motivação (Por que aqui?)
*   Usamos o **Guard** para impedir que pessoas não logadas acessem a URL `/events`.
*   Usamos o **Resolver** para buscar os dados de um Amigo Secreto específico pelo ID antes que as páginas de *Gerenciamento*, *Edição* ou *Resultados* fossem abertas, eliminando estados parciais "quebrados" de carregamento lento (layout shifts).

### 3. A Anatomia do Código
*   **Guard:** Em [auth.guard.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/core/guards/auth.guard.ts#L5-L14):
    ```typescript
    export const authGuard: CanActivateFn = () => {
      const authService = inject(AuthService);
      const router = inject(Router);

      return toObservable(authService.isInitialized).pipe(
        filter((initialized) => initialized),
        take(1),
        map(() => {
          if (authService.isAuthenticated()) {
            return true;
          }
          return router.parseUrl('/auth/login');
        })
      );
    };
    ```
*   **Resolver:** Em [event.resolver.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/events/event.resolver.ts#L6-L23):
    ```typescript
    export const eventResolver: ResolveFn<Event> = async (route) => {
      const eventService = inject(EventService);
      const router = inject(Router);
      const id = route.paramMap.get('id');

      if (!id) {
        router.navigate(['/events']);
        throw new Error('Event ID is missing');
      }

      try {
        return await eventService.getEventById(id);
      } catch (error) {
        router.navigate(['/events']);
        throw error;
      }
    };
    ```
*   **Rotas:** Em [events.routes.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/events/events.routes.ts#L17-L21):
    ```typescript
    {
      path: ':id/manage',
      resolve: { event: eventResolver },
      loadComponent: () => import('./event-manage').then((m) => m.EventManageComponent),
    }
    ```

### 4. O Teste do "E se eu tirar?"
*   **Sem o Guard:** Qualquer usuário deslogado poderia digitar `/events` no navegador e visualizar componentes privados, violando a segurança.
*   **Sem o Resolver:** Ao abrir a página de edição de um evento, o formulário começaria em branco por milissegundos ou quebraria com erros de "undefined" antes que a requisição assíncrona terminasse de carregar.

---

## ⚡ [ID23] - Functional Interceptors

### 1. O Conceito (Em palavras simples)
É uma engrenagem que intercepta todas as requisições HTTP enviadas pela sua aplicação. Ele serve para carimbar informações extras (como o token JWT) no cabeçalho ou capturar erros de rede de forma centralizada.

### 2. A Motivação (Por que aqui?)
Evita a duplicação de lógica. Sem ele, teríamos que escrever manualmente a lógica de anexar o token de segurança injeção direta em cada chamada ao Supabase. Além disso, se o servidor responder "401 Não Autorizado", o interceptor desloga o usuário e o direciona ao login automaticamente.

### 3. A Anatomia do Código
No arquivo [auth.interceptor.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/core/interceptors/auth.interceptor.ts#L7-L32):

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = authService.currentSession();

  let authReq = req;

  if (session?.access_token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
```
*   `req.clone`: Cria uma cópia imutável da requisição para adicionar os novos headers com segurança.
*   `catchError((error) => ...)`: Trata de forma unificada falhas nas respostas HTTP.

### 4. O Teste do "E se eu tirar?"
1. **Falha de Autenticação:** As chamadas de dados para APIs externas ou rotas protegidas começarão a retornar erro 403/401 porque o cabeçalho `Authorization` estará em falta.
2. **Sessão Expirada "Zumbi":** Se a sessão do usuário expirar enquanto ele navega, a aplicação receberá erros silenciosos e a tela ficará estática em vez de redirecionar com segurança de volta para o login.

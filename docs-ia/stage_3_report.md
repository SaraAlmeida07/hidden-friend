# 🛡️ Relatório Técnico de Defesa - Etapa 3

Este documento apresenta a defesa conceitual e prática do recurso de **Formulários Reativos** implementado na **Etapa 3** do **Hidden Friend**.

---

## 📝 [ID24] - Formulários Reativos com Validações Rigorosas

### 1. O Conceito (Em palavras simples)
É uma abordagem estruturada do Angular para gerenciar dados inseridos pelo usuário. Em vez de declarar as regras de validação no próprio template HTML (Template-Driven), declaramos o estado e o comportamento das validações de forma explícita e controlada no código TypeScript (Reactive Forms).

### 2. A Motivação (Por que aqui?)
Utilizamos essa abordagem para robustecer as telas de Autenticação (Login e Cadastro), além de garantir o controle estrito das informações antes do envio para o Supabase Auth. Com os Formulários Reativos, conseguimos verificar se o formato do e-mail é válido, impor tamanhos mínimos de senha, e criar um validador personalizado que checa em tempo real se a senha informada coincide com a confirmação de senha, desabilitando o botão de envio enquanto houver algum erro de preenchimento.

### 3. A Anatomia do Código
No arquivo [register.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/auth/register.ts):

```typescript
protected form = this.fb.nonNullable.group({
  fullName: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required]
}, { validators: passwordsMatchValidator });
```
*   `this.fb.nonNullable.group(...)`: Instancia o formulário garantindo que os campos possuam valores padrão do tipo string ao invés de aceitarem valores nulos (`null`).
*   `Validators.email` e `Validators.minLength(8)`: Validam de forma nativa e síncrona o formato do e-mail e o comprimento mínimo da senha.
*   `{ validators: passwordsMatchValidator }`: Aplica um validador customizado a nível de grupo que compara os valores dos controles `password` e `confirmPassword`.

No HTML:
```html
<button hlmBtn type="submit" class="w-full" [disabled]="form.invalid || isLoading">
```
*   `[disabled]="form.invalid || isLoading"`: Desativa imperativamente a interação do usuário enquanto o formulário estiver em estado inválido ou enviando a requisição de rede.

### 4. O Teste do "E se eu tirar?"
Se você apagar esse sistema de validação reativa:
1. O usuário conseguirá submeter o formulário de cadastro com campos em branco, senhas curtas (menores que 8 dígitos) ou e-mails em formato inválido, resultando em requisições rejeitadas pelo Supabase Auth e sobrecarregando a banda de rede com erros evitáveis.
2. Sem o validador customizado `passwordsMatchValidator`, o sistema permitiria o envio de senhas diferentes no cadastro. O usuário digitaria uma senha incorreta no segundo campo e a conta seria criada com a senha errada, impossibilitando-o de fazer login no futuro.

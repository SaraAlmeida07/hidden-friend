# 🛡️ Relatório Técnico de Defesa - Etapa 6

Este documento apresenta a defesa conceitual e prática dos recursos de DevOps, CI/CD e infraestrutura de publicação implementados na **Etapa 6** do **Hidden Friend**.

---

## 🛠️ [ID27] - Integração Sem Conflitos via Pull Requests (CI)

### 1. O Conceito (Em palavras simples)
É uma esteira automatizada de verificação que roda em nuvem toda vez que alguém cria ou altera um Pull Request. Ela garante que novas modificações de código passem nos testes e compilem perfeitamente antes de serem mescladas com o código principal.

### 2. A Motivação (Por que aqui?)
Para manter o repositório remoto sempre íntegro e estável. Com a configuração do GitHub Actions, todo Pull Request com destino às branches `main` ou `develop` disparará um contêiner Linux para instalar as dependências do monorepo, buildar o projeto Angular (`npm run build:web`) e executar os testes unitários (`npm run test:web`). Caso qualquer passo falhe, o merge é bloqueado.

### 3. A Anatomia do Código
No arquivo [.github/workflows/ci.yml](file:///home/popolin/Documentos/UTFPR/hidden-friend/.github/workflows/ci.yml):

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
```
*   `on.pull_request.branches`: Define que o fluxo será acionado de forma automática a cada alteração ou abertura de Pull Request direcionado para `main` ou `develop`.

```yaml
steps:
  - name: Build web application
    run: npm run build:web

  - name: Run unit tests
    run: npm run test:web -- --watch=false
```
*   `npm run build:web`: Garante que a compilação do Angular no monorepo não possua erros de digitação ou imports inválidos.
*   `npm run test:web -- --watch=false`: Executa todos os testes unitários da aplicação de uma só vez (Vitest), assegurando que nenhuma regra de negócio tenha sido violada.

### 4. O Teste do "E se eu tirar?"
Se você remover o arquivo de CI (`ci.yml`):
1. O repositório poderá receber contribuições quebradas que impossibilitem o deploy ou interrompam o trabalho de outros membros da equipe.
2. A validação do código terá que ser feita manualmente em cada máquina local, aumentando o risco de falhas humanas passarem despercebidas.

---

## 🚀 [ID28] - Deploy Contínuo Automatizado no Monorepo (Vercel)

### 1. O Conceito (Em palavras simples)
É uma configuração que informa à plataforma de hospedagem (Vercel) como compilar o projeto de estrutura monorepo e como lidar com o roteamento interno do Angular.

### 2. A Motivação (Por que aqui?)
Como nosso projeto está organizado em monorepo (com a pasta `apps/web` e `apps/api`), a Vercel precisa saber onde encontrar a build do frontend e qual comando executar. Adicionalmente, as SPAs (Single Page Applications) precisam de reescrita de rotas para que o recarregamento de páginas internas não resulte em erros 404 no servidor.

### 3. A Anatomia do Código
No arquivo [vercel.json](file:///home/popolin/Documentos/UTFPR/hidden-friend/vercel.json):

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "apps/web/dist/web/browser",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*   `"buildCommand": "npm run build:web"`: Comando de build a ser acionado no servidor da Vercel.
*   `"outputDirectory": "apps/web/dist/web/browser"`: Aponta diretamente para a pasta de arquivos estáticos gerada pelo build do Angular no monorepo.
*   `"rewrites"`: Garante que qualquer rota acessada no navegador (como `/events/new` ou `/auth/login`) redirecione internamente para o `index.html`, permitindo ao roteador do Angular resolver a tela correta.

### 4. O Teste do "E se eu tirar?"
Se você remover o arquivo `vercel.json`:
1. O deploy na Vercel falhará porque a plataforma tentará rodar um build simples a partir do diretório raiz e não encontrará a pasta de distribuição padrão do Angular.
2. Caso o deploy funcionasse de alguma forma alternativa, recarregar a página `/events` no navegador retornaria o erro `404 Not Found` do servidor Vercel.

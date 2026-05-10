# 📄 Product Requirements Document (PRD)

**Projeto:** [Hidden Friend]  
**Versão:** 1.0.0  
**Status:** 🟡 Em Definição (MVP)

## 🎯 1. Visão Geral e Objetivo

### **O que é**

Plataforma digital (web mobile-first) para organização de eventos de amigo secreto.

### **Problema**

Organizar amigo secreto manualmente é confuso, sujeito a erros (ex: auto-sorteio), difícil de gerenciar em grupos grandes e pouco prático para compartilhar resultados com segurança.

### **Solução**

Um sistema simples onde um organizador cria o evento, convida participantes via link/token, e cada participante acessa de forma privada quem tirou — com automação do sorteio e distribuição segura.

## 📖 2. Glossário Ubíquo

- **Evento**
  É o encontro organizado para realizar o amigo secreto, contendo informações como nome, data, local e valor sugerido do presente.
- **Organizador**
  É a pessoa responsável por criar e gerenciar o evento, incluindo adicionar participantes e realizar o sorteio.
- **Participante**
  É a pessoa que faz parte do evento, podendo ser sorteada e também sortear alguém.
- **Sorteio**
  É o processo automático que define, de forma secreta, quem cada participante irá presentear.
- **Amigo Secreto (Sorteado)**
  É a pessoa que um participante tirou no sorteio e para quem deverá comprar um presente.
- **Lista de Desejos**
  É a lista com sugestões de presentes que cada participante informa para ajudar quem o tirou.

## 👤 3. Atores e Permissões

### **Organizador**

- Criar conta e autenticar-se
- Criar e configurar eventos de amigo secreto
- Gerar e compartilhar link/token de acesso
- Adicionar e remover participantes (manual)
- Executar o sorteio
- Gerenciar status do evento

### **Participante**

- Acessar evento via link/token
- Inserir ou confirmar seu nome (identidade no evento)
- Visualizar quem tirou (resultado individual e privado)

## 📝 4. Escopo Funcional (User Stories)

## 🔐 **Gestão do Organizador**

- **US01**: Como _organizador_, eu quero criar uma conta e fazer login para salvar e gerenciar (cadastrar, ler, editar e deletar) meus sorteios.
- **US02**: Como _organizador_, eu quero cadastrar um novo evento (nome, data, valor e local) para detalhar a troca de presentes.
- **US03**: Como _organizador_, eu quero adicionar participantes (nome e e-mail) para montar a lista do sorteio.
- **US04**: Como _organizador_, eu quero disparar o sorteio para que o sistema gere as combinações secretas.
- **US05**: Como _organizador_, eu quero copiar o link individual de cada amigo para enviá-los via WhatsApp ou e-mail.

---

## 🎁 **Experiência do Participante**

- **US06**: Como _participante_, eu quero confirmar minha identidade ao abrir o link para evitar que meu sorteado seja revelado por engano.
- **US07**: Como _participante_, eu quero visualizar o nome de quem eu tirei de forma oculta para manter o segredo.
- **US08**: Como _participante_, eu quero cadastrar minha lista de desejos (3 sugestões) antes de ver meu sorteado.
- **US09**: Como _participante_, eu quero ver as sugestões de presente da pessoa que eu tirei.

---

## ⚙️ **Experiência e Navegação**

- **US10**: Como _usuário_, eu quero navegar por uma interface responsiva e instalável (PWA) para que eu possa usar o sistema facilmente em qualquer dispositivo, mesmo com conexão limitada.
- **US11**: Como _usuário_, eu quero que o sistema carregue rapidamente e de forma progressiva para que a experiência seja fluida mesmo em redes lentas.

## 🛡️ 5. Regras de Negócio (Constraints)

- **RN01 - Quantidade mínima de participantes**
  O sorteio só pode ser realizado se houver pelo menos 3 participantes no evento.
- **RN02 - Proibição de auto-sorteio**
  Nenhum participante pode tirar a si mesmo no sorteio.
- **RN03 - Sigilo do resultado**
  Cada participante só pode visualizar o seu próprio amigo secreto, sendo proibido acessar o resultado de outros.
- **RN04 - Validação antes da revelação**
  O participante só pode visualizar quem tirou após confirmar sua identidade e cadastrar sua lista de desejos.
- **RN05 - Integridade do sorteio**
  Após o sorteio ser realizado, não é permitido adicionar ou remover participantes, nem alterar os resultados.

## 🚫 6. Fora de Escopo (Non-goals)

- Integração com pagamentos ou compra de presentes dentro da plataforma
- Sistema de chat ou comunicação em tempo real entre participantes
- Integração com redes sociais ou importação automática de contatos
- Algoritmos avançados de restrições complexas (ex: múltiplas regras condicionais sofisticadas)
- Gamificação, rankings ou elementos de competição
- Aplicativo nativo (foco inicial apenas em experiência web mobile-first)

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

- **Performance e Carregamento Progressivo**
  O sistema deve carregar rapidamente, mesmo em redes lentas, utilizando carregamento sob demanda. Isso é essencial para garantir uma boa experiência principalmente no momento crítico de acesso ao resultado do sorteio (US07) e navegação geral (US11).
- **Segurança e Privacidade dos Dados**
  O acesso às informações deve ser restrito e seguro, garantindo que cada participante visualize apenas seu próprio amigo secreto. Isso é fundamental para preservar a confiança no sistema e cumprir as regras de sigilo do sorteio (US06, US07).
- **Experiência Mobile-First e Responsiva**
  A interface deve ser pensada prioritariamente para dispositivos móveis, adaptando-se a diferentes tamanhos de tela. Isso é crítico, pois a maioria dos participantes acessará o sistema via link compartilhado em aplicativos como WhatsApp (US05, US10).
- **Reatividade e Atualização em Tempo Real Percebido**
  A interface deve responder imediatamente às ações do usuário (ex: cadastro, confirmação, visualização), sem necessidade de recarregar a página. Isso melhora a fluidez da experiência e reduz fricção nas interações principais (US03, US08).

## 🛠️ 8. Tech Stack Principal (Diretrizes)

A arquitetura do sistema será baseada nas seguintes diretrizes obrigatórias:

- **Frontend:** Angular 21+ (Arquitetura Standalone & Signals)
- **Backend & Autenticação:** Supabase (PostgreSQL + Row Level Security)
- **Estilização:** Tailwind CSS + UI Components (Spartan)
- **Hospedagem:** Render.com / Vercel
- **Controle de Versão**: Git/GitHub utilizando a metodologia Gitflow (branches main, develop e feature/[nome-da-feature]).

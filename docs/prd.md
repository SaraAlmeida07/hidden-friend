# 📄 Product Requirements Document (PRD)

**Projeto:** Hidden Friend  
**Versão:** 1.0.0  
**Status:** 🟡 Em Definição (MVP)

## 🎯 1. Visão Geral e Objetivo
O **Hidden Friend** é uma aplicação web mobile-first que moderniza e simplifica a experiência do tradicional "Amigo Secreto". O objetivo principal é eliminar o uso de papéis e automatizar o sorteio garantindo a privacidade. A plataforma resolve o problema de sorteios viciados (onde alguém tira a si mesmo) e a perda de informações, utilizando links únicos (tokens) para a revelação segura do amigo sorteado e integração de uma lista de desejos (wishlist).

## 📖 2. Glossário Ubíquo
* **Organizador:** Usuário que cria o evento e adiciona as pessoas.
* **Participante:** Pessoa que faz parte do sorteio.
* **Token UUID:** Código secreto e único gerado para cada participante, usado no link de revelação para garantir a privacidade.
* **Sorteio (Ciclo):** O processo automatizado que conecta todos os participantes em uma corrente única, garantindo que ninguém fique de fora ou tire a si mesmo.
* **Wishlist (Lista de Desejos):** Sugestões de presentes preenchidas pelo participante antes da revelação.

## 👤 3. Atores e Permissões
* **Organizador (Autenticado):** Precisa fazer login. Tem permissão para criar eventos, adicionar/editar participantes, gerar o sorteio e copiar os links de revelação. Não tem permissão para ver quem tirou quem.
* **Participante (Convidado):** Acessa o sistema apenas através do seu link secreto (Token UUID). Tem permissão para preencher sua Wishlist, visualizar exclusivamente o nome do amigo que tirou e as regras do evento .

## 📝 4. Escopo Funcional (User Stories)
**Gestão do Organizador:**
* US01: Como Organizador, eu quero criar uma conta e fazer login para salvar e gerenciar(cadastrar, ler, edidar e deletar) meus sorteios.
* US02: Como Organizador, eu quero cadastrar um novo evento (nome, data, valor e local) para detalhar a troca de presentes.
* US03: Como Organizador, eu quero adicionar participantes (nome e e-mail) para montar a lista do sorteio.
* US04: Como Organizador, eu quero disparar o sorteio para que o sistema gere as combinações secretas.
* US05: Como Organizador, eu quero copiar o link individual de cada amigo para enviá-los via WhatsApp ou E-mail.

**Experiência do Participante:**
* US06: Como Participante, eu quero confirmar minha identidade ao abrir o link para evitar que meu sorteado seja revelado por engano.
* US07: Como Participante, eu quero visualizar o nome de quem eu tirei de forma oculta para manter o segredo.
* US08: Como Participante, eu quero cadastrar minha lista de desejos (3 sugestões) antes de ver meu sorteado.
* US09: Como Participante, eu quero ver as sugestões de presente da pessoa que eu tirei.

## 🛡️ 5. Regras de Negócio (Constraints)
* **Mínimo de Participantes:** Um grupo precisa de no mínimo 3 pessoas cadastradas para que o botão de realizar sorteio seja liberado.
* **Regra Anti-Auto-Sorteio:** O algoritmo deve garantir obrigatoriamente que um participante nunca tire a si mesmo.
* **Ciclo Perfeito:** O sorteio deve formar uma corrente fechada (todos tiram e são tirados por exatamente uma pessoa).
* **Sigilo do Organizador:** O sistema não deve expor o resultado do sorteio em nenhuma tela do painel do organizador.
* **Pré-requisito de Revelação:** O participante só pode visualizar quem ele tirou após preencher sua própria lista de desejos.

## 🚫 6. Fora de Escopo (Non-goals)
* Envio automático de e-mails ou SMS pelo sistema (a distribuição dos links será manual pelo organizador).
* Chat interno ou troca de mensagens anônimas entre os participantes.
* Integração com lojas virtuais ou links de compra automatizados na Wishlist.
* **Funcionamento Offline Complexo:** O aplicativo não fará sincronização avançada de banco de dados em cache. O acesso a dados dinâmicos exigirá conexão com a internet.

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)
* **Usabilidade:** A interface deve ser estritamente *Mobile-First*, garantindo ótima visualização em telas pequenas.
* **Experiência PWA (App Nativo):** O projeto implementará as diretrizes visuais de um PWA, incluindo configuração do `manifest.webmanifest` (ícones, cores de tema, splash screen, modo standalone) e uma **tela amigável de Fallback Offline** (página estática indicando ausência de conexão), cumprindo o requisito de design sem exigir persistência de dados offline.
* **Performance:** Uso de reatividade fina (Signals) para garantir que as atualizações na tela sejam instantâneas e não recarreguem a página.
* **Segurança:** Proteção das rotas de revelação através de Functional Route Guards.

## 🛠️ 8. Tech Stack Principal (Diretrizes)
* **Front-End:** Angular 18/19+ (Arquitetura Standalone, Control Flow, Signals).
* **Estilização:** Framework CSS (A definir pela equipe de design: Tailwind CSS ou PrimeNG).
* **Backend-as-a-Service (BaaS):** Supabase (Authentication e PostgreSQL para gerenciamento de estado assíncrono).
* **Hospedagem / Deploy:** GitHub Pages ou Vercel.
* **Controle de Versão:** Git/GitHub utilizando a metodologia Gitflow (branches `main` e `develop`).
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

## 👤 3. Atores e Permissões

### **Organizador**

* Criar conta e autenticar-se
* Criar e configurar eventos de amigo secreto
* Gerar e compartilhar link/token de acesso
* Adicionar e remover participantes (manual)
* Executar o sorteio
* Gerenciar status do evento

### **Participante**

* Acessar evento via link/token
* Inserir ou confirmar seu nome (identidade no evento)
* Visualizar quem tirou (resultado individual e privado)

## 📝 4. Escopo Funcional (User Stories)

## 🔐 **Gestão do Organizador**
* **US01**: Como *organizador*, eu quero criar uma conta e fazer login para salvar e gerenciar (cadastrar, ler, editar e deletar) meus sorteios.
* **US02**: Como *organizador*, eu quero cadastrar um novo evento (nome, data, valor e local) para detalhar a troca de presentes.
* **US03**: Como *organizador*, eu quero adicionar participantes (nome e e-mail) para montar a lista do sorteio.
* **US04**: Como *organizador*, eu quero disparar o sorteio para que o sistema gere as combinações secretas.
* **US05**: Como *organizador*, eu quero copiar o link individual de cada amigo para enviá-los via WhatsApp ou e-mail.

---

## 🎁 **Experiência do Participante**
* **US06**: Como *participante*, eu quero confirmar minha identidade ao abrir o link para evitar que meu sorteado seja revelado por engano.
* **US07**: Como *participante*, eu quero visualizar o nome de quem eu tirei de forma oculta para manter o segredo.
* **US08**: Como *participante*, eu quero cadastrar minha lista de desejos (3 sugestões) antes de ver meu sorteado.
* **US09**: Como *participante*, eu quero ver as sugestões de presente da pessoa que eu tirei.

---

## ⚙️ **Experiência e Navegação**
* **US10**: Como *usuário*, eu quero navegar por uma interface responsiva e instalável (PWA) para que eu possa usar o sistema facilmente em qualquer dispositivo, mesmo com conexão limitada.
* **US11**: Como *usuário*, eu quero que o sistema carregue rapidamente e de forma progressiva para que a experiência seja fluida mesmo em redes lentas.

## 🛡️ 5. Regras de Negócio (Constraints)

## 🚫 6. Fora de Escopo (Non-goals)

* Integração com pagamentos ou compra de presentes dentro da plataforma
* Sistema de chat ou comunicação em tempo real entre participantes
* Integração com redes sociais ou importação automática de contatos
* Algoritmos avançados de restrições complexas (ex: múltiplas regras condicionais sofisticadas)
* Gamificação, rankings ou elementos de competição
* Aplicativo nativo (foco inicial apenas em experiência web mobile-first)

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

## 🛠️ 8. Tech Stack Principal (Diretrizes)
# 🛡️ Relatório Técnico de Defesa - Etapa 5

Este documento apresenta a defesa conceitual e prática dos testes de qualidade e regras de negócio implementados na **Etapa 5** do **Hidden Friend**.

---

## 🧪 [ID33] - Qualidade de Software e Testes de Regras de Negócio (TDD)

### 1. O Conceito (Em palavras simples)
Testes unitários são pequenos blocos de código escritos para testar se uma parte muito específica da nossa aplicação (como um serviço ou uma função) está funcionando de acordo com as regras de negócio, sem precisar interagir de fato com o banco de dados real ou com a interface gráfica.

### 2. A Motivação (Por que aqui?)
Implementamos testes unitários automatizados nos serviços principais (`DrawService` e `EventService`) utilizando **Vitest** para garantir que as regras mais críticas da aplicação nunca sejam quebradas:
1.  **Regra de Limite Mínimo (RN01/RN02):** Impedir a realização do sorteio se houver menos de 3 participantes.
2.  **Regra de Não Auto-sorteio (RN03):** Garantir que nenhum participante tire a si mesmo no sorteio.
3.  **Integridade do Fluxo:** Assegurar que o status do evento seja atualizado para `'draw_done'` no banco apenas após um sorteio válido.

### 3. A Anatomia do Código
No arquivo de testes [draw.service.spec.ts](file:///home/popolin/Documentos/UTFPR/hidden-friend/apps/web/src/app/features/draw/draw.service.spec.ts):

```typescript
it('should throw an error if trying to draw with less than 3 participants', async () => {
  const participants = generateMockParticipants(2);
  await expect(service.performDraw('event-1', participants)).rejects.toThrow(
    'Mínimo de 3 participantes necessário para o sorteio.'
  );
  expect(mockEventService.updateEvent).not.toHaveBeenCalled();
});
```
*   `expect(service.performDraw(...)).rejects.toThrow(...)`: Valida que o método lança um erro e rejeita a Promise caso a lista contenha apenas 2 participantes.
*   `expect(mockEventService.updateEvent).not.toHaveBeenCalled()`: Assegura que, em caso de erro, nenhuma chamada de alteração de status seja disparada para o `EventService`.

No mesmo arquivo, testando o sorteio e loop completo:
```typescript
for (const pair of insertedPairs) {
  expect(pair.giver_participant_id).not.toBe(pair.receiver_participant_id);
}
```
*   `expect(...).not.toBe(...)`: Garante que, ao iterar em todos os pares formados no sorteio, o ID do tirador (`giver`) seja diferente do ID do tirado (`receiver`), comprovando que ninguém se auto-sorteou.

### 4. O Teste do "E se eu tirar?"
Se você remover estes testes da aplicação:
1. Qualquer desenvolvedor (ou a própria IA) poderia futuramente alterar o algoritmo de embaralhamento dos participantes e, sem perceber, introduzir uma falha onde um participante pudesse tirar a si mesmo. Esse bug passaria silenciosamente até que usuários de produção reclamassem.
2. O sistema poderia falhar silenciosamente ao tentar atualizar o status do evento no banco de dados e não saberíamos que a falha ocorreu no fluxo de sorteio, atrasando o processo de correção e monitoramento de logs.

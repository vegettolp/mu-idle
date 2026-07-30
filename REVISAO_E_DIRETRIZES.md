# Diretrizes para Correção - MU Idle

Baseado na revisão arquitetural completa, este documento estabelece as diretrizes para cada correção.

---

## Prioridade ALTA

### 1. Hash de Senhas e Segurança no Servidor

**Problema**: `server/src/index.ts:28-31` armazena e compara senhas em texto puro.

**Diretrizes**:
- Instalar `bcrypt` no servidor
- No registro (`POST /api/auth/register`): aplicar `bcrypt.hash(password, 10)` antes de salvar no banco
- No login (`POST /api/auth/login`): buscar por email e comparar com `bcrypt.compare(password, user.password)`
- Remover a busca por `{ email, password }` — nunca comparar senha no SQL
- Tratar erros do Prisma com try/catch

### 2. Implementar JWT Real

**Problema**: `server/src/index.ts:39` retorna `token: 'jwt-token-simples'` (string fixa).

**Diretrizes**:
- Instalar `jsonwebtoken` no servidor
- Usar variável de ambiente `JWT_SECRET` (com fallback seguro em desenvolvimento)
- Gerar token real com `jwt.sign({ userId: user.id }, secret, { expiresIn: '24h' })`
- Criar middleware de autenticação para rotas protegidas (`/api/players`)
- Adicionar esquema de validação de input com tipos (remover `as any`)

### 3. Remover Dead Code - Dual Engines (Pixi.js)

**Problema**: Duas engines de renderização completas no cliente. A Pixi.js está inativa.

**Diretrizes**:
- Remover a dependência `pixi.js` do `client/package.json`
- Remover arquivos não utilizados:
  - `client/src/engine/core/GameEngine.ts`
  - `client/src/engine/entities/Player.ts`
  - `client/src/engine/entities/Monster.ts`
  - `client/src/engine/effects/ParticleSystem.ts` (manter pois é usado pelo Renderer via Canvas)
  - `client/src/components/game/GameCanvas.tsx`
- Remover imports não utilizados em arquivos que permanecem
- Verificar se o bundle build ainda funciona

**Nota**: Manter `ParticleSystem.ts` pois ele é usado pelo `Combat.ts` e `Renderer.ts` via Canvas 2D. Remover apenas entidades Pixi.

### 4. Interromper Game Loop no Reset

**Problema**: `GameLoop.ts:62` chama `resetGame()` mas o `requestAnimationFrame` anterior nunca é cancelado, criando loops concorrentes.

**Diretrizes**:
- `createGameLoop` deve retornar um objeto com `{ stop, isRunning }` em vez de apenas uma função cleanup
- Ou: usar uma variável `isActive` compartilhada via ref que o loop verifica a cada frame
- Abordagem recomendada: adicionar `stopRequested` flag que o loop verifica
- `resetGame` em App.tsx precisa sinalizar que o loop deve parar antes de criar outro
- O `useEffect` que cria o loop deve limpar corretamente o loop anterior quando `resetGame` é chamado
- Ideal: extrair o game loop para um hook customizado `useGameLoop` com cleanup explícito

---

## Prioridade MÉDIA

### 5. Unificar Definições de MonsterData

**Problema**: 4 interfaces `MonsterData` conflitantes em arquivos diferentes.

**Diretrizes**:
- Manter **uma única interface** `MonsterData` em `shared/types/index.ts` com todos os 23 campos
- Remover definições locais em:
  - `client/src/engine/Monster.ts` (interface local)
  - `client/src/engine/Skills.ts` (interface local)
- Atualizar imports para usar a definição centralizada
- Garantir campos opcionais onde apropriado

### 6. Corrigir Slots de Equipamento

**Problema**: PlayerData.equipment tem 9 slots, CharacterStats renderiza 16.

**Diretrizes**:
- Alinhar os 16 slots do `equipSlots` em `CharacterStats.tsx` com os slots reais do `PlayerData.equipment`
- Adicionar os slots faltantes em `Player.ts`: `shield, earring1, earring2, pet, wings, pentagram, artifact`
- Corrigir `items.ts` para usar os mesmos nomes de slot que o player espera:
  - `slot: 'ring'` → `slot: 'ring1'` ou criar lógica para distribuir entre ring1/ring2
- Atualizar `recalcStats` para considerar bônus de todos os slots

### 7. Consolidar Lógica de Level-Up

**Problema**: Level-up duplicado em `App.tsx:209` e `Combat.ts:175`.

**Diretrizes**:
- Extrair para uma função em `Formulas.ts`: `Formulas.levelUp(player)` ou similar
- Remover a lógica inline de `App.tsx` — ela deve chamar `onExp` que já existe no callback
- O callback `onExp` em `App.tsx:207-209` deve ser o único lugar que gerencia level-up

### 8. Limpar Estado Modular Global

**Problema**: `Renderer.ts` tem estado mutável no módulo que nunca é limpo.

**Diretrizes**:
- `bossAnimations`: limpar entradas de monstros mortos
- `floatingDamages`: resetar array no início de cada sessão/loop
- `deathStabFrame/deathStabTimer`: resetar ao parar o loop
- Alternativa: encapsular em uma classe de renderizador que mantém estado por instância

### 9. Capturar Input do Login

**Problema**: `LoginPage.tsx` campos sem `onChange`, valores digitados são ignorados.

**Diretrizes**:
- Adicionar estado `username` e `password` no componente
- Adicionar `onChange` nos inputs
- Conectar ao backend real (fazer chamada POST para `/api/auth/login`)
- Mostrar feedback visual de erro/sucesso

---

## Prioridade BAIXA

### 10. Adicionar Testes

**Problema**: Zero testes em todo o projeto.

**Diretrizes**:
- Configurar Vitest para o cliente
- Testar `Formulas.ts` (cálculos de dano, exp, HP)
- Testar `Skills.ts` (cálculos de skills)
- Testar servidor com Supertest + Fastify

### 11. Migrações Prisma

**Problema**: Schema existe mas sem histórico de migrações.

**Diretrizes**:
- Executar `npx prisma migrate dev --name init` para criar migração inicial
- Adicionar script no `package.json` para rodar migrações antes de iniciar
- Criar `.env.example` com `DATABASE_URL` e `JWT_SECRET`

### 12. Configurar Linter

**Problema**: Código com estilos inconsistentes.

**Diretrizes**:
- Adicionar `.prettierrc` com regras de formatação
- Adicionar `.eslintrc` configurado para TypeScript + React
- Adicionar script `npm run lint` e `npm run format`

### 13. Feedback de Inventário Cheio

**Problema**: Itens descartados silenciosamente quando inventário cheio.

**Diretrizes**:
- Quando `dropItem` falhar por inventário cheio, exibir notificação visual
- Pode ser um toast simples ou piscar o inventário na UI
- Idealmente o item deve cair no chão e poder ser pego depois

### 14. Documentação

**Problema**: Sem `.env.example` ou documentação para novos desenvolvedores.

**Diretrizes**:
- Criar `.env.example` com variáveis: `DATABASE_URL`, `JWT_SECRET`, `PORT`
- Adicionar seção no README com instruções de setup
- Adicionar commentários JSDoc nas funções principais

# Avaliação Arquitetural — MU Idle

Analisado o repositório completo (client, server, shared, tools, docker). Resumo da stack real: **React 18 + Vite + engine própria em Canvas 2D** no cliente; **Fastify + Prisma/SQLite + JWT/bcrypt** no servidor (somente auth); **`shared/` órfão**; **Dockerfile placeholder** (`fortune`). 78 testes Vitest passando no cliente.

---

## O que está bem arquitetado

- **Engine client modular e coerente**: `GameLoop` (orquestração), `Combat` (combate/AI), `Renderer` (desenho), `Skills`, `Spawner`, `SpriteAnimation`, `ParticleSystem` — boa separação para um motor customizado.
- **Fórmulas centralizadas** em `client/src/data/formulas.ts` com constantes por classe — correto e testado (34 testes).
- **Movimento grid + interpolação de pixels** (`Combat.ts:88`): abordagem padrão e sólida para jogo idle.
- **Segurança do servidor corrigida**: bcrypt com salt (`server/src/index.ts:73`), JWT real com expiração (:104), validação de input e middleware de auth (:36). Os problemas do `REVISAO_E_DIRETRIZES.md` foram endereçados.
- **Game loop com `stop()` + `cancelAnimationFrame`** (`GameLoop.ts:160`) e 78 testes unitários de fórmulas/combate/skills/spawner.

---

## Problemas críticos

**1. O jogo é 100% client-side; o servidor é só login.**
Não há persistência de progresso, inventário ou estado de jogo. O schema Prisma já tem `Player`/`Hunt` (`server/prisma/schema.prisma:18`) mas nenhum endpoint os usa — `GET /api/players` apenas lista todos os jogadores sem filtro. Para um idle web: **refresh = perder tudo**, sem anti-cheat, sem multiplayer. Esta é a lacuna arquitetural mais importante.

**2. `App.tsx` (518 linhas) é um god component.**
Todo estado de jogo, refs, loot, equip, level-up e UI ficam nele. `createGameLoop` recebe ~20 parâmetros de callback (`GameLoop.ts:15-42`). Há lógica duplicada de reset de players em `revivePlayersFn` (:81), `resetGame` (:124), `handleMapSelect` (:270) e `reviveCharacter` (:245).

**3. Estado dual `useState` + refs mutáveis + `forceUpdate()`.**
O estado de jogo vive em `playersRef`/`monstersRef` mutados imperativamente dentro do `requestAnimationFrame`, e a UI é re-renderizada via `useReducer` hack (`App.tsx:44`). Esse padrão misto é frágil, gera stale closures e torna o código difícil de raciocinar e testar.

**4. `shared/` é código morto.**
Nenhum arquivo importa `shared/types/index.ts`. Existem definições concorrentes: `client/src/types.ts` (`MonsterData` com 23 campos) vs `shared/types` (`Player`, `Monster` genéricos). O doc de revisão pedia unificação, mas `shared/` ficou órfão — o client usa seus tipos locais.

**5. Loop baseado em `frameCount` (frames), não em tempo.**
`GameLoop.ts:51` e cooldowns em `Combat.ts` contam frames. Num monitor 60Hz o jogo roda diferente de um 144Hz, e em aba oculta o `rAF` congela. Para idle web, lógica deve usar `delta-time` (`performance.now()`); progresso em background/offline é inviável no modelo atual.

**6. Sem entrega web real.**
O `Dockerfile` é placeholder e o `compose.yaml` mínimo. Não há script de build que sirva `client/dist` pelo servidor (o proxy `/api` do `vite.config.ts:8` só existe em dev), sem CI, sem lint/format configurado.

---

## Problemas médios

- **Sem roteador/estrutura de páginas**: alternância login→jogo por state em `App.tsx:383`; sem code-splitting.
- **Lógica de negócio não compartilhável**: `Formulas` só existe no client; para servidor autoritativo seria preciso reescrever ou empacotar.
- **Nomes mágicos acoplados**: `'Lord of Ferea'`, `'Ferea General'`, `'Giant'` espalhados em `GameLoop.ts`, `Combat.ts`, `Renderer.ts`, `Spawner.ts` — deveriam ser ids/tags.
- **Console.logs de debug no código**: `[WAVE]` em `GameLoop.ts:113-134`.
- **Estilos inconsistentes**: Tailwind instalado mas UI 100% inline em `App.tsx`.
- **CORS `origin: true`** (`server/src/index.ts:14`) e **JWT_SECRET fallback hardcoded** (:10) — aceitáveis em dev, revisar em produção.
- **Inventário cheio descarta itens** silenciosamente apesar do toast (`App.tsx:178`); sem validação de requisitos (`reqStr`/`reqAgi`) ao equipar.
- **`Monster.ts` é um re-export morto** (`export type { MonsterData } from '../types'`).

---

## Recomendações priorizadas

**Fase 1 — Fundamentar o web (baixo risco, alto impacto):**
- Extrair `App.tsx`: engine → classe `Game`/`GameState` independente do React + store explícita (Zustand ou Contexto dedicado); UI vira camada de apresentação pura.
- Converter loop para **delta-time** (velocidade independente de refresh rate).
- Adicionar React Router + lazy loading.

**Fase 2 — Servidor autoritativo (core do idle):**
- Endpoints REST para salvar/carregar progresso (player, inventário, zen) via token JWT; salvar em intervalos + no logout.
- Mover/validar `Formulas` num pacote compartilhado real e validar ações no servidor.

**Fase 3 — Qualidade/entrega:**
- Integrar ou remover `shared/`, unificar tipos; remover logs; `Dockerfile`/`compose` reais servindo o build; CI + ESLint/Prettier.

---

**Conclusão**: a base de engine e o backend de auth são bons e testados, mas a arquitetura **ainda é a de um jogo local single-session com um login de brinde**. Para "rodar web" com permanência e escala, as decisões críticas são as Fases 1 e 2 — hoje o maior risco é perder progresso no refresh e impossibilidade de evoluir para multiplayer/anti-cheat sem reescrita.

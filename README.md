# RoutineOS

![CI](https://github.com/Guilhermee10/Projeto-RoutineOS/actions/workflows/ci.yml/badge.svg)

Plataforma pessoal de organização, acompanhamento e otimização de rotina.

> Projeto em desenvolvimento (correção: edição de registros quebrava por campos extras no payload - whitelist de campos nos services).

## Como rodar

### 1. Subir o banco de dados (Postgres via Docker)

```bash
docker compose up -d
```

### 2. Configurar e rodar o backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Depois, acesse: `http://localhost:3333/api/health`

Resposta esperada:
```json
{ "status": "ok", "service": "routineos-backend" }
```

### Explorar o banco visualmente (opcional, mas útil)

```bash
npx prisma studio
```
Abre uma interface web em `http://localhost:5555` pra você ver as tabelas e os dados direto no navegador.

## Endpoints de autenticação (Sprint 3)

```
POST /api/auth/register   { "name", "email", "password" }
POST /api/auth/login      { "email", "password" }
POST /api/auth/logout
GET  /api/auth/me         (rota protegida, precisa do header Authorization: Bearer <token>)
```

## Endpoints de atividades e metas flexíveis (Sprint 4)

```
GET    /api/activities        (protegida)
POST   /api/activities        { "name", "category", "startTime", "endTime", "daysOfWeek", "priority"?, "location"?, "notes"? }
PUT    /api/activities/:id    (protegida)
DELETE /api/activities/:id    (protegida)

GET    /api/flexible-goals
POST   /api/flexible-goals    { "name", "durationMinutes", "frequencyPerWeek", "activityType", "fitMode"?, "suitableForCommute"? }
PUT    /api/flexible-goals/:id
DELETE /api/flexible-goals/:id
```

`suitableForCommute` (Sprint 7): marque `true` pra metas leves o suficiente pra sugerir durante o transporte (ex: inglês, revisão).

`daysOfWeek` é um array de números: `0` = domingo ... `6` = sábado. Ex: `[1,2,3,4,5]` = segunda a sexta.

Depois de baixar o zip, rode a migration desse sprint:
```bash
npx prisma migrate dev --name add_activity_and_flexible_goal
```

## Dashboard (Sprint 5)

```
GET /api/dashboard              (protegida - resumo de hoje)
GET /api/dashboard?date=2026-09-28   (resumo de uma data específica)
```

Retorna as atividades do dia, o total de minutos por categoria
(`categoryTotals`), e os espaços livres na agenda (`freeSlots`).

## Sono e Estudos (Sprint 6 - Parte 1)

```
GET    /api/sleep              (?from=2026-09-01&to=2026-09-30 opcional)
GET    /api/sleep/stats        (?goalMinutes=480 opcional, padrão 8h)
POST   /api/sleep              { "date", "wentToSleepAt", "wokeUpAt", "interruptions"?, "quality"?, "notes"? }
PUT    /api/sleep/:id
DELETE /api/sleep/:id

GET    /api/studies            (?from=&to= opcional)
GET    /api/studies/stats      (retorna total e distribuição por matéria)
POST   /api/studies            { "date", "subject", "durationMinutes", "content"?, "goal"?, "notes"? }
PUT    /api/studies/:id
DELETE /api/studies/:id
```

Depois de baixar o zip, rode a migration desse sprint:
```bash
npx prisma migrate dev --name add_sleep_and_study
```

## Treinos e Escala de Trabalho (Sprint 6 - Parte 2)

```
GET    /api/workouts           (?from=&to= opcional)
GET    /api/workouts/stats      (total, por tipo, média por semana)
POST   /api/workouts            { "date", "type", "durationMinutes", "objective"?, "notes"? }
PUT    /api/workouts/:id
DELETE /api/workouts/:id

GET    /api/work                (lista as escalas cadastradas)
GET    /api/work/hours          (?from=&to= opcional, padrão semana corrente)
POST   /api/work
PUT    /api/work/:id
DELETE /api/work/:id
```

Exemplo de escala REGULAR (segunda a sexta, 09:00-18:00, 1h de almoço):
```json
{
  "scaleType": "REGULAR",
  "startTime": "09:00",
  "endTime": "18:00",
  "breakMinutes": 60,
  "daysOfWeek": [1,2,3,4,5]
}
```

Exemplo de escala 12x36 (turno de 12h, folga de 1 dia, alternando):
```json
{
  "scaleType": "CYCLE",
  "startTime": "07:00",
  "endTime": "19:00",
  "breakMinutes": 60,
  "cycleStartDate": "2026-09-01",
  "workDaysInCycle": 1,
  "restDaysInCycle": 1
}
```

Depois de baixar o zip, rode a migration desse sprint:
```bash
npx prisma migrate dev --name add_workout_and_work_schedule
```

## Motor de Otimização (Sprint 7)

```
POST /api/optimization/analyze     (?date=2026-09-28 opcional - qualquer dia da semana a analisar)

GET   /api/scheduled-slots         (?status=SUGGESTED|CONFIRMED, ?from=, ?to=)
PATCH /api/scheduled-slots/:id/confirm
DELETE /api/scheduled-slots/:id    (rejeita/remove uma sugestão)
```

Fluxo típico:
1. Cadastre atividades fixas, uma escala de trabalho e algumas metas flexíveis (com `frequencyPerWeek` e, opcionalmente, `suitableForCommute: true`)
2. `POST /api/optimization/analyze` — o motor lê sua semana, encaixa as metas nos espaços livres (e nas janelas de transporte, se aplicável) e salva como sugestões
3. `GET /api/scheduled-slots?status=SUGGESTED` — veja o que foi sugerido
4. `PATCH /api/scheduled-slots/:id/confirm` — aprove as que fazem sentido (ou `DELETE` pra descartar)

O campo `unmet` na resposta do `/analyze` mostra metas que não couberam completamente na semana — sinal de rotina sobrecarregada.

**Premissa importante:** o motor assume que trabalho é configurado OU via `Activity` (categoria TRABALHO) OU via `WorkSchedule`, não os dois ao mesmo tempo (evita ter que detectar sobreposição entre as duas fontes).

**Janela de horário acordado:** "tempo livre" só é contado entre 06:00 e 23:00 (constante `WAKING_WINDOW` em `src/config/schedule.js`), pra o motor nunca sugerir atividades de madrugada. Dashboard, relatório e motor usam a mesma janela, então os números sempre batem.

Depois de baixar o zip, rode a migration desse sprint:
```bash
npx prisma migrate dev --name add_optimization_engine
```

## Metas e Relatório Semanal (Sprint 8)

```
GET    /api/goals
POST   /api/goals                { "name", "type", "targetValue", "period"?, "subject"? }
PUT    /api/goals/:id
DELETE /api/goals/:id
PATCH  /api/goals/:id/progress   { "increment": 3 }   (só metas PERSONALIZADA)

GET    /api/reports/weekly       (?date=2026-09-28 opcional)
```

Tipos de meta (`type`):
- `ESTUDO_HORAS` — soma minutos de `StudySession` no período (use `subject` pra filtrar, ex: "Inglês")
- `TREINO_QUANTIDADE` — conta os `Workout` no período
- `SONO_HORAS` — soma o sono registrado no período
- `PERSONALIZADA` — progresso manual via `/progress` (leitura, projetos, etc.)

`targetValue` é em minutos para metas de horas, e em quantidade para as demais. `period` é `SEMANAL` (padrão) ou `MENSAL`.

Exemplo — "estudar 10h de Python por semana":
```json
{ "name": "Python", "type": "ESTUDO_HORAS", "subject": "Python", "targetValue": 600 }
```

Depois de baixar o zip, rode a migration desse sprint:
```bash
npx prisma migrate dev --name add_goals
```

## Testes (Sprint 9)

```bash
npm test
```

Cobertura atual (Jest, só testes unitários de lógica pura):
- `timeUtils`: duração, cruzamento de meia-noite, detecção de conflito
- `statsUtils`: média, mínimo, máximo (com listas vazias)
- `dateUtils`: semana (segunda-domingo), mês, timezone (tudo em UTC)
- `dashboardUtils`: agregação por categoria, espaços livres, janela de horário acordado
- `workScheduleUtils`: escalas REGULAR e CYCLE (12x36, 15x2), inclusive datas anteriores ao início do ciclo
- `slotPoolUtils`: reserva/encolhimento de janelas de tempo
- `optimizationPlanner`: o motor de otimização inteiro (prioridade, fases de tempo livre vs. transporte, divisão de janela entre metas, integração com escala de trabalho) - **sem tocar em banco**, porque a lógica de decisão foi extraída pra uma função pura (`optimizationPlanner.js`), separada da camada que busca/salva dados (`optimizationService.js`)

**Cypress adiado de propósito:** o plano original colocava Cypress neste sprint, mas ainda não existe frontend React pra testar (Cypress testa telas, não API). Decidimos fechar o Jest agora e voltar ao Cypress quando o frontend existir.

## Frontend (Sprint F1 - Setup + Autenticação + Dashboard)

Esse sprint não estava no plano original — foi a lacuna que identificamos
antes de fazer o Cypress (não dá pra testar tela sem ter uma tela).

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173`. Com o backend rodando em paralelo
(`http://localhost:3333`), você deve conseguir:
1. Se cadastrar (`/register`)
2. Fazer login (`/login`)
3. Ver o Dashboard com as atividades de hoje, totais por categoria e
   espaços livres (os mesmos dados que testamos via Postman)

**Arquitetura:** Context API pra autenticação (sem Redux - complexidade
desnecessária pro tamanho do projeto), Axios com interceptors (token
automático em toda requisição + logout automático se o token expirar).

## Frontend Sprint F2 - Atividades

Tela em `/activities`: listar, criar, editar e remover atividades pela
interface (antes só dava pra fazer isso via Postman). O formulário
reaproveita o mesmo componente (`ActivityForm`) tanto pra criar quanto
pra editar - a diferença é só se `initialValues` já vem com um `id`.

## Frontend Sprint F3 - Sono, Estudos e Treinos

Três telas novas, mesmo padrão de sempre (lista + formulário + stats):
`/sleep`, `/study`, `/workouts`. Cada uma mostra as estatísticas
(`/stats` do backend) no topo, e a lista de registros embaixo.

Detalhe técnico: o backend devolve a data como ISO completo
(`2026-09-28T00:00:00.000Z`), mas o `<input type="date">` do navegador
só aceita `"2026-09-28"`. A conversão fica isolada em
`toDateInputValue()` (`src/utils/format.js`), aplicada só na hora de
abrir o formulário de edição.

## Frontend Sprint F4 - Metas Flexíveis e Escala de Trabalho

`/flexible-goals`: cadastro de metas sem horário fixo (nome, duração,
frequência semanal, se pode ser feita durante o transporte).

`/work-schedule`: cadastro da escala de trabalho. O formulário muda de
cara dependendo do tipo escolhido - `REGULAR` mostra os dias da semana
(chips, igual a Atividades); `CYCLE` mostra os campos de ciclo, com
atalhos pra 12x36 e 15x2 que preenchem os números automaticamente
(o usuário ainda pode ajustar). Mostra também as horas trabalhadas na
semana corrente (`GET /work/hours`).

## Frontend Sprint F5 - Motor de Otimização

`/optimization`: o botão "Analisar semana" chama `POST /optimization/analyze`
e recarrega a lista de sugestões. Cada sugestão aparece agrupada por dia,
com os botões Confirmar/Rejeitar - igual ao fluxo que testamos via Postman,
agora com interface. Metas que não couberam na semana (`unmet`) aparecem
num aviso no topo. Sugestões já confirmadas ficam numa seção separada,
com a opção de remover se mudar de ideia.

## Frontend Sprint F6 - Metas e Relatório Semanal

`/goals`: cada meta mostra uma barra de progresso (`goal.progress`, que
o backend já calcula). Metas `PERSONALIZADA` ganham botões `+1`/`-1`
pra registrar progresso manual.

`/reports`: tela só de leitura com os números da semana (sono, estudos
com comparação à semana anterior, treino, trabalho, transporte, maior
janela livre, % do tempo livre usado por metas confirmadas).

**Débito técnico registrado:** o `App.jsx` já tem 11 rotas repetindo o
mesmo padrão `<ProtectedRoute><Layout>...</Layout></ProtectedRoute>` -
dá pra refatorar pra um array de rotas + `.map()` quando sobrar tempo,
mas não é bloqueante.

## Tempo de deslocamento automático (Activity.commuteMinutes)

Cada atividade pode ter um `commuteMinutes` opcional. Quando preenchido,
o sistema passa a considerar automaticamente um bloco de `TRANSPORTE`
antes e depois dela (sem precisar cadastrar isso como atividade
separada). Esses blocos são calculados na hora (não existem no banco) e
entram no mesmo cálculo usado pelo dashboard, pelo relatório e pelo
motor de otimização - inclusive, uma meta flexível marcada como
`suitableForCommute` já pode ser sugerida automaticamente nesses
horários, sem nenhum código extra.

```json
POST /api/activities
{ "name": "Faculdade", "category": "FACULDADE", "startTime": "09:00", "endTime": "12:30", "daysOfWeek": [1,2,3,4,5], "commuteMinutes": 20 }
```

**Limitação conhecida:** o sistema não checa conflito de horário entre
o bloco de transporte gerado e outras atividades (só checa conflito
entre atividades "de verdade"). Se uma atividade muito cedo tiver um
deslocamento longo, o bloco de transporte pode, em teoria, começar
antes da janela de horário acordado (06:00) - isso não quebra nada, só
significa que uma parte pequena do deslocamento não entra no cálculo
de "tempo livre".

Depois de baixar o zip, rode a migration:
```bash
npx prisma migrate dev --name add_activity_commute_minutes
```

## Menu do Frontend: Diário vs. Configuração

O menu foi separado em dois grupos: **Diário** (Dashboard, Sono,
Estudos, Treinos - o que se usa todo dia) e **Configuração**
(Atividades, Trabalho, Metas Flexíveis, Metas, Otimização, Relatório -
o que se cadastra uma vez e raramente muda). Os links agora usam
`NavLink` do React Router, que marca automaticamente qual página está
ativa.

## Autenticação: Refresh Token + Rate Limiting

**Access token curto (15min) + refresh token longo (7 dias).** O
refresh token fica guardado no banco (hash SHA-256, nunca em texto
puro) numa tabela própria (`RefreshToken`), o que permite **revogar**
uma sessão antes dela expirar - algo que um JWT sozinho não permite.

```
POST /api/auth/register   -> { user, accessToken, refreshToken }
POST /api/auth/login      -> { user, accessToken, refreshToken }
POST /api/auth/refresh    { "refreshToken" } -> novo par de tokens
POST /api/auth/logout     { "refreshToken" } -> revoga o refresh token
```

**Rotação:** cada vez que `/refresh` é chamado, o refresh token usado
é revogado e um novo é emitido. Isso significa que cada refresh token
só serve uma vez - se alguém roubar um token antigo e tentar reusá-lo
depois do dono já ter renovado a sessão, a tentativa falha.

**No frontend**, isso é transparente: o `api.js` tem um interceptor
que, ao receber 401 numa rota protegida, tenta renovar o access token
automaticamente e refaz a requisição original - o usuário só é
deslogado de verdade se o refresh token também tiver expirado/sido
revogado.

**Rate limiting:** `/auth/login` e `/auth/register` aceitam no máximo
10 tentativas a cada 15 minutos por IP (`express-rate-limit`), pra
dificultar ataques de força bruta.

Depois de baixar o zip, rode a migration:
```bash
npx prisma migrate dev --name add_refresh_tokens
```

## Streaks (sequências)

```
GET /api/streaks   -> { sleep: {current, longest}, study: {...}, workout: {...} }
```

Calculado **na hora**, a partir dos registros de `SleepRecord`,
`StudySession` e `Workout` que já existem - nada fica salvo a mais no
banco (mesma filosofia de "não duplicar dado calculado" desde o
cálculo de duração no Sprint 4). `current` conta pra trás a partir de
hoje (ou de ontem, se hoje ainda não tem registro - assim o streak não
zera só porque o dia ainda não acabou). `longest` é o maior streak já
alcançado, olhando o histórico inteiro.

Aparece como uma seção no topo do Dashboard (`🔥 3 dias`), só quando
existe pelo menos um streak ativo ou um recorde pra mostrar.

## Check-in de Atividades

```
PATCH /api/activities/:id/checkin   { "date": "2026-10-03", "completed": true }
```

Marca se uma `Activity` foi **de fato feita** num dia específico -
diferente da atividade em si, que é só a recorrência planejada
("Academia toda Seg/Qua/Sex"). A regra é a mais simples possível: a
**existência** do registro já significa "feito" (sem campo
`completed` redundante) - marcar cria a linha, desmarcar apaga.

O `GET /api/dashboard` já devolve, pra cada item checável da agenda,
`checkable: true` e `completed: true/false`. Turno de trabalho e bloco
de transporte virtual vêm com `checkable: false` (não têm uma
`Activity` própria pra vincular um check-in). No Dashboard, aparece
como uma caixinha de marcar do lado de cada atividade, com um contador
"(2/5 feitas)" no título da seção.

Depois de baixar o zip, rode a migration:
```bash
npx prisma migrate dev --name add_activity_checkins
```

## Check-in de Metas

```
PATCH /api/goals/:id/checkin   { "date": "2026-10-04", "completed": true }
```

Mesmo padrão do check-in de atividades, só que pra `Goal`. É um sinal
de **hábito** ("toquei nessa meta hoje?"), separado do `progress`
(que mede horas/quantidade de verdade, calculado automaticamente a
partir de `StudySession`/`Workout`/`SleepRecord`, ou manual pra metas
`PERSONALIZADA`). `GET /api/goals` já devolve `checkedInToday` em cada
meta.

Aparece em dois lugares: um checkbox "feito hoje" ao lado de cada meta
na tela `/goals`, e um widget compacto **"🎯 Metas da Semana"** no
canto superior do Dashboard, listando todas as metas com a mesma
caixinha de marcar.

Depois de baixar o zip, rode a migration:
```bash
npx prisma migrate dev --name add_goal_checkins
```

## Grade Semanal de Hábitos

Inspirada num template de controle de hábitos do Notion. Tela nova em
`/habits`: linhas = suas atividades, colunas = os 7 dias da semana
(segunda a domingo), cada célula uma caixinha de marcar - exatamente
o check-in de atividades que já existia, só que numa visão da semana
inteira em vez de só hoje.

```
GET /api/activities/checkins   (?from=&to=, padrão: semana corrente)
```

Busca todos os check-ins de um intervalo de uma vez, pra montar a
grade sem precisar de 7 chamadas separadas (uma por dia). Dias em que
a atividade não está programada (fora do `daysOfWeek` dela) aparecem
com um traço, não uma caixinha vazia - não tem o que marcar ali.

Tem navegação entre semanas (← Semana anterior / Hoje / Próxima
semana →), reaproveitando o mesmo endpoint de check-in que já existia
- não precisou de nada novo no banco.

**Refatoração de bônus:** aproveitei pra resolver aquele débito
técnico anotado lá no Frontend Sprint F6 - o `App.jsx` tinha 11 blocos
de rota repetidos; virou um array + `.map()`.

## Notificações In-App

```
GET /api/notifications
```

Calculadas **na hora**, sem nada salvo no banco - mesmo espírito dos
streaks. Dois tipos:
- Atividade de hoje começando nos próximos 60min (`"Hora de Python -
  começa em 20min"`)
- Meta com 80%+ de progresso, mas ainda não batida (`"Meta 'Inglês' -
  você está a 1h40 de bater!"`)

**Trade-off documentado:** é a única parte do projeto que usa hora
LOCAL do servidor (`new Date().getHours()`) em vez de UTC - "está
chegando" só faz sentido comparado ao relógio de parede real. Isso
assume que o servidor roda no mesmo fuso do usuário (razoável pra um
app pessoal de uma pessoa só).

No frontend, um sininho (🔔) no cabeçalho, com contador, revalida a
cada 1 minuto (`NotificationBell.jsx`) - não é push de verdade (exigiria
WebSocket ou Service Worker), é polling simples, suficiente pro escopo
do projeto.

## Calendário Semanal Visual

```
GET /api/calendar/weekly   (?date= opcional - qualquer dia da semana a visualizar)
```

Diferente da Grade de Hábitos (que é só um checklist), essa é uma
visão tipo Google Calendar: os blocos de verdade, posicionados por
horário, nos 7 dias da semana - janela de 06:00 às 23:00 (mesma
`WAKING_WINDOW` do resto do app).

Junta **4 fontes diferentes** num só bloco por dia: `Activity`,
deslocamento automático (`commuteMinutes`), turno de `WorkSchedule`, e
metas flexíveis já **confirmadas** pelo motor de otimização (sugestão
pendente não entra - só o que já virou compromisso de verdade). Cada
categoria tem uma cor (`CATEGORY_COLORS` no frontend).

Tecnicamente, o `calendarService.js` não inventa nada novo - ele só
reaproveita `buildCommuteBlocksForActivity` e `isWorkingOnDate`, as
mesmas funções que o Dashboard e o motor de otimização já usam. Isso
garante que o calendário sempre bate com o que as outras telas mostram.

## Dashboard: Grade de Hábitos embutida + Layout em Colunas

A grade de hábitos (antes só em `/habits`) virou um componente
reutilizável (`components/HabitWeekGrid.jsx`, autocontido - busca os
próprios dados) e agora aparece **também** no Dashboard, não só na
página dela. A página `/habits` virou uma casca fina que só renderiza
esse componente.

O Dashboard também ganhou um layout em duas colunas
(`.dashboard-grid`, CSS Grid) em vez de tudo empilhado numa coluna só:
Metas da Semana + Streaks lado a lado, depois a grade de hábitos
(largura inteira, porque a tabela precisa do espaço), depois Resumo do
dia + Agenda lado a lado, e Espaços livres no final. Em telas estreitas
(celular), a grade vira uma coluna só automaticamente.

## Resumo Semanal por IA

```
POST /api/reports/weekly/ai-summary   (?date= via body, opcional)
```

Pega os mesmos dados do `/reports/weekly` e pede pra API da Anthropic
(modelo Claude) transformar os números num parágrafo curto em
português, com um destaque da semana e uma sugestão prática. Usa o
pacote oficial `@anthropic-ai/sdk`.

**Configuração (opcional):** sem `ANTHROPIC_API_KEY` no `.env`, o
endpoint responde com um erro 503 claro (`"Resumo por IA não está
configurado..."`) em vez de quebrar o resto do app - o resto do
RoutineOS funciona 100% sem essa variável. Pra habilitar, pegue uma
key em https://console.anthropic.com e preencha:
```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-5
```

**Por que é POST, não GET:** essa chamada aciona a API externa de
verdade (custa tempo, e em produção custaria dinheiro) - não é uma
leitura "de graça" que devesse disparar sozinha. Fica explícito que o
usuário pediu, com um botão "Gerar resumo" na tela `/reports`.

## Whitelist de campos nas escritas (create/update)

Bug que originou isso: ao **editar** uma atividade, o formulário
reenviava de volta o objeto inteiro que recebeu da API - incluindo
`id`, `createdAt`, `userId` e o `durationMinutes` (campo calculado, que
nem existe no banco). O Prisma rejeita a escrita inteira ao ver um
campo desconhecido.

Corrigido em duas camadas (defesa em profundidade):
- **Backend:** todo `create`/`update` dos services passa o body por
  `pickFields(data, UPDATABLE_FIELDS)` (`utils/pickFields.js`) - só
  campos da lista passam, o resto é descartado em silêncio. Vale pra
  Activity, Sleep, Study, Workout, FlexibleGoal, WorkSchedule e Goal.
  (Em Goal, `manualProgress` fica de fora de propósito: só muda pelo
  endpoint `/progress`.)
- **Frontend:** os formulários montam o payload de envio campo a campo,
  em vez de `...form`.

O teste `pickFields.test.js` usa o payload real do erro como caso de
regressão.

## Stack

Node.js · Express · PostgreSQL · React · Cypress · Jest · Docker · AWS

## Estrutura do projeto

```
routineos/
├── backend/      # API REST (Node.js + Express)
├── frontend/     # Interface (React + Vite)
├── cypress/      # Testes E2E
└── .github/      # Pipelines de CI/CD
```

## Redesign da interface (dark mode)

- **Design system** em `frontend/src/styles/` (tokens → base → layout → components → dashboard → pages): cores, escala tipográfica, espaçamento de 4px, raios e animações como variáveis CSS. Acento único índigo/violeta; verde = feito, amarelo = atenção, vermelho = problema, cinza = neutro.
- **Navegação**: `config/navigation.js` é a fonte única da Sidebar (fixa no desktop, compacta no tablet, drawer no celular).
- **Dashboard**: StatCards, RoutineScore (anel 0-100), TodayTimeline, TimeDistribution, HabitTracker, FreeTimeCard, GoalsCard e SuggestionCard (só com dados reais).
- **Novas telas**: `/diary` (agenda de qualquer dia) e `/settings`.
- **Lógica pura testável** em `utils/` (`habits`, `routine`, `timeline`, `suggestions`, `greeting`); estado dos hábitos centralizado em `hooks/useHabitWeek`.
- Nenhuma rota, endpoint ou regra de negócio foi removida.

## Zerar progresso de metas

- `PATCH /api/goals/:id/reset` grava `progressResetAt` na meta (e zera o `manualProgress`). Depois disso, só contam registros **criados** depois do reset (`utils/goalProgressUtils.js`). Nenhum estudo/treino/sono é apagado.
- Migration nova: `npx prisma migrate dev --name add_goal_progress_reset`.
- Meta de estudo sem "matéria" soma TODO o estudo da semana - por isso várias metas podiam mostrar o mesmo valor. A lista agora mostra "todas as matérias" nesse caso.

## Anotações

- **Model `Note`** (`title`, `content`, `tags[]`, `pinned`, `archived`, `goalId?`). Migration: `npx prisma migrate dev --name add_notes`.
- **API** `/api/notes`: `GET /` (filtros `q`, `tag`, `goalId`, `archived`, `limit`), `GET /tags`, `POST /`, `PUT /:id` (parcial, serve pra fixar/arquivar), `DELETE /:id`.
- **Conteúdo em texto puro**: `- item` (lista), `- [ ] tarefa` / `- [x] feita` (checklist). Sem editor rico: o editor é um `<textarea>` com botões de lista/checklist e continuação automática com Enter. O parser fica em `frontend/src/utils/noteContent.js`.
- Tags normalizadas (minúsculas, sem repetição, máx. 10) em `backend/src/utils/noteUtils.js`, com testes Jest. A nota pode ser ligada a uma meta; apagar a meta não apaga a nota.
- Tela `/notes` (busca, filtro por tag, fixar, arquivar, checklist clicável) e cartão "Anotações" no Dashboard com nota rápida.

## Folgas fixas em escalas de ciclo

`WorkSchedule.daysOff` (`Int[]`, padrão vazio) guarda dias da semana de folga fixa por cima de um ciclo (ex: 15x2, mas nunca aos domingos). `isWorkingOnDate` checa isso antes do cálculo do ciclo; o ciclo continua contando pelo calendário. Migration: `npx prisma migrate dev --name add_work_days_off`.

## Estudos só contam para metas vinculadas

- `StudySession.goalId` (opcional) liga a sessão a uma meta de `ESTUDO_HORAS`. O progresso da meta soma **apenas** as sessões com o `goalId` dela (`goalService.calculateProgress`); registrar um estudo sozinho nunca preenche meta nenhuma. O filtro antigo por "matéria" na meta deixou de ser usado.
- `studyService` valida que a meta é do usuário e do tipo certo. Sessões antigas ficam sem vínculo (as metas voltam a 0).
- Migration: `npx prisma migrate dev --name link_study_to_goal`.

## Treinos também só contam para metas vinculadas

`Workout.goalId` (opcional, meta `TREINO_QUANTIDADE`). A validação de "meta do usuário + tipo certo" ficou em `services/goalLinkService.js`, usada por estudos e treinos. Sono continua automático. Migration: `npx prisma migrate dev --name link_workout_to_goal`.

## Segurança

Resumo das práticas aplicadas e checklist de publicação em [SECURITY.md](SECURITY.md). Novidades: validação de variáveis de ambiente na partida (`src/config/env.js`), CORS restrito (`CORS_ORIGIN`), limite de body, rate limit geral, bcrypt custo 12, senha mínima de 8 caracteres, login com tempo constante, JWT com algoritmo fixado, Postgres local só em `127.0.0.1` e Dependabot.

## Testes E2E (Cypress)

Os testes ficam em `cypress/e2e/` e cobrem: autenticação, atividades (criar/editar/remover e check-in), metas com vínculo de estudo (regressão do bug de "estudo marca meta sozinho"), anotações com checklist e escala de trabalho com folgas.

**Pré-requisitos** (cada um num terminal, a partir da raiz do projeto):

```
docker compose up -d                                   # banco
cd backend;  $env:AUTH_RATE_LIMIT_MAX=1000; npm run dev  # API (PowerShell)
cd frontend; npm run dev                               # frontend em :5173
npm install                                            # na raiz, 1ª vez (instala o Cypress)
npm run cy:open                                        # interface visual
npm run cy:run                                         # ou: roda tudo sem interface
```

- `AUTH_RATE_LIMIT_MAX` só existe para os testes (eles criam vários usuários em poucos minutos); em produção o limite é sempre 10.
- Cada teste cria um usuário novo (`e2e+...@routineos.test`) direto pela API e injeta o token no navegador (`cypress/support/commands.js`), em vez de logar pela tela toda vez. Só `auth.cy.js` usa a tela de login.
- Para limpar os usuários de teste do banco de desenvolvimento:
  `docker exec -it routineos-postgres psql -U routineos_user -d routineos -c "DELETE FROM users WHERE email LIKE 'e2e+%@routineos.test';"`

## Docker

**Desenvolvimento (padrão):** `docker compose up -d` sobe só o Postgres; backend e frontend rodam com `npm run dev`.

**Sistema inteiro em containers** (banco + migrations + API + frontend):

```
# 1) na raiz, crie o .env a partir do modelo e preencha o JWT_SECRET
copy .env.example .env
# 2) suba tudo
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d --build
```

- Frontend: http://localhost:8080 · API: http://localhost:3333/api/health
- Ordem de subida: `postgres` (healthcheck) → `migrate` (roda `prisma migrate deploy` e termina) → `backend` → `frontend`.
- Imagem do backend em estágios (`build`/`migrate`/`runtime`): a final só tem dependências de produção e roda como usuário `node`, não root. O frontend é compilado pelo Vite e servido por nginx sem root.
- `JWT_SECRET` é obrigatório (o compose recusa subir sem ele) e, em produção, o backend recusa segredo fraco.
- Parar: `docker compose -f docker-compose.yml -f docker-compose.app.yml down` (adicione `-v` só se quiser apagar o banco).

## CI (GitHub Actions)

`.github/workflows/ci.yml` roda a cada push na `main` e em todo pull request:

| Job | O que faz |
|---|---|
| `secrets-check` | falha se algum `.env`/`*.env` estiver versionado |
| `backend` | `prisma generate`, testes Jest e `npm audit` (alta/crítica) |
| `frontend` | build de produção e `npm audit` |
| `e2e` | sobe Postgres + API + frontend e roda o Cypress (anexa capturas se falhar) |

Segurança do pipeline: permissões mínimas (`contents: read`), segredos de CI só de um banco descartável, `concurrency` para cancelar execuções antigas. Evolução possível: fixar as actions por SHA e proteger a `main` exigindo CI verde.

## Fuso horário (data local do usuário)

O servidor roda em UTC (AWS), mas "hoje" precisa ser o dia do usuário. O frontend envia `X-Client-Date` e `X-Client-Time` em toda requisição (interceptor do Axios); o middleware `clientClock` valida os valores e os guarda em um `AsyncLocalStorage`, de onde `getToday()` os lê. Sem o header (ou com valor inválido), cai no relógio do servidor.


#!/usr/bin/env node
/** ARCHIVED one-off seed (2026-08). Do not re-run against current .courses — content already authored.
 *  Kept for archaeology only. Prefer editing YAML under .courses/ + yarn content:compile.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function write(rel, content) {
  const filePath = path.join(repoRoot, rel);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

// --- U02 unit manifest ---
await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/unit.yaml',
  `# U02 — manifest юнита (порядок уроков).
id: U02
stageId: S01
title: Объекты, массивы и мутация
titleEn: Objects, Arrays & Mutation

lessons:
  - lessons/l005
  - lessons/l006
  - lessons/l007

activities: activities
`,
);

// --- L005 ---
await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l005/lesson.yaml',
  `id: L005
order: 5
title: Объекты, доступ к свойствам и ownership
titleEn: Objects, Property Access & Ownership
essence: >-
  Own vs inherited, dot vs bracket, prototype lookup. Интервьюер проверяет, понимаете ли вы, откуда берётся свойство.
depth: mechanism
required: true

insights:
  - insights/01-own-vs-inherited.md
  - insights/02-dot-vs-bracket.md

activities:
  - activities/p01-single-choice.yaml
  - activities/p02-predict-output.yaml
  - activities/p03-single-choice.yaml
  - activities/r01-revision.yaml
  - activities/i01-phrasing.yaml
`,
);

await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l005/insights/01-own-vs-inherited.md',
  `---
id: i01
kind: insight
title: Own vs inherited
minutes: 3
---

# Own vs inherited

У plain object свойства делятся на **own** (на самом объекте) и **inherited** (из prototype chain).

\`\`\`js
const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

console.log(child.a); // 1 — inherited
console.log(Object.hasOwn(child, 'a')); // false
console.log(Object.hasOwn(child, 'b')); // true
\`\`\`

**Own** проверяют через \`Object.hasOwn(obj, key)\` или \`obj.hasOwnProperty(key)\` (осторожно, если \`hasOwnProperty\` переопределён).

На интервью важно: чтение \`obj.key\` идёт по цепочке прототипов; запись own-свойства не мутирует прототип (обычно создаёт shadowing).

## Production note

Не полагайтесь на inherited keys без явной проверки — особенно при merge конфигов и сериализации API-ответов.
`,
);

await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l005/insights/02-dot-vs-bracket.md',
  `---
id: i02
kind: insight
title: Dot vs bracket
minutes: 2
---

# Dot vs bracket

- **Dot** (\`obj.name\`) — когда ключ известен как идентификатор.
- **Bracket** (\`obj[key]\`) — динамический ключ, ключ с пробелами, символы, вычисляемое имя.

\`\`\`js
const row = { 'user id': 42 };
// row.user id — SyntaxError
row['user id']; // 42

const field = 'status';
row[field] = 'active';
\`\`\`

Computed property names в литерале: \`{ [field]: value }\`.

## Anti-pattern

Хранить «магические строки» ключей по всему коду без констант — сложно рефакторить и ловить опечатки.
`,
);

const l005Activities = {
  'p01-single-choice.yaml': `id: p01
kind: single_choice
phase: practice
prompt: |
  Как надёжно проверить, что свойство \`name\` — **own** у объекта \`user\`?
options:
  - id: a
    text: "\`user.name !== undefined\`"
  - id: b
    text: "\`Object.hasOwn(user, 'name')\`"
    correct: true
  - id: c
    text: "\`'name' in user && typeof user.name === 'string'\`"
  - id: d
    text: "\`user.hasOwnProperty\` без вызова"
explain: |
  \`in\` и truthy-check не отличают own от inherited. \`Object.hasOwn\` — стандартная own-проверка.
`,
  'p02-predict-output.yaml': `id: p02
kind: predict_output
phase: practice
code: |
  const base = { x: 1 };
  const child = Object.create(base);
  child.y = 2;
  console.log(child.x, Object.hasOwn(child, 'x'));
question: Что выведет?
choices:
  - id: a
    text: "1 false"
    correct: true
  - id: b
    text: "1 true"
  - id: c
    text: "undefined false"
  - id: d
    text: "2 false"
explain: |
  \`x\` читается из прототипа, но не own у \`child\`. \`Object.hasOwn(child, 'x')\` → \`false\`.
`,
  'p03-single-choice.yaml': `id: p03
kind: single_choice
phase: practice
prompt: |
  Когда **обязательно** нужен bracket-доступ?
options:
  - id: a
    text: Для любого string-ключа — dot устарел
  - id: b
    text: Когда имя свойства в переменной или содержит недопустимые для dot символы
    correct: true
  - id: c
    text: Только для массивов, объекты всегда через dot
  - id: d
    text: Только в strict mode
explain: |
  Bracket — для динамических ключей и «нестандартных» имён (\`'user id'\`, \`Symbol\`).
`,
  'r01-revision.yaml': `id: r01
kind: single_choice
phase: revision
prompt: |
  Что вернёт \`Object.hasOwn({ toString: 1 }, 'toString')\`?
options:
  - id: a
    text: "false — всегда inherited"
  - id: b
    text: "true — own shadowing"
    correct: true
  - id: c
    text: "TypeError"
  - id: d
    text: "undefined"
explain: |
  Own-свойство с тем же именем **затеняет** inherited. \`hasOwn\` смотрит только на объект, не на prototype.
hints:
  - title: Own vs inherited
    markdown: |
      \`Object.hasOwn(obj, key)\` — own only. \`'key' in obj\` — own или inherited.
  - title: Shadowing
    markdown: |
      Запись \`obj.toString = 1\` создаёт own-свойство; метод из \`Object.prototype\` для этого объекта не вызывается.
`,
  'i01-phrasing.yaml': `id: i01
kind: interview_phrasing
phase: phrasing
prompt: |
  Объясните вслух: чем own-свойство отличается от inherited и как проверить own.
rubric: |
  Ожидаемые пункты (30–60 сек):
  - prototype chain при чтении
  - \`Object.hasOwn\` vs \`'key' in obj\`
  - shadowing own-свойством
  - один короткий пример
sampleAnswer: |
  При чтении JS ищет свойство на объекте, затем по цепочке прототипов. Own — только на самом объекте;
  inherited — с прототипа. \`Object.hasOwn\` проверяет own; оператор \`in\` — и own, и inherited.
  Если записать own-свойство с тем же именем, оно затеняет унаследованное.
`,
};

for (const [name, body] of Object.entries(l005Activities)) {
  await write(
    `.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l005/activities/${name}`,
    body,
  );
}

// --- L006 ---
await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l006/lesson.yaml',
  `id: L006
order: 6
title: Массивы, iteration и transformations
titleEn: Arrays, Iteration & Transformations
essence: >-
  \`map\`/\`filter\`/\`reduce\` vs мутирующие методы; holes vs empty. Выбор метода и побочные эффекты.
depth: trace
required: true

insights:
  - insights/01-immutable-iterators.md
  - insights/02-holes-vs-empty.md

activities:
  - activities/p01-single-choice.yaml
  - activities/p02-predict-output.yaml
  - activities/p03-single-choice.yaml
  - activities/p04-predict-output.yaml
  - activities/r01-revision.yaml
  - activities/i01-phrasing.yaml
`,
);

await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l006/insights/01-immutable-iterators.md',
  `---
id: i01
kind: insight
title: Immutable iterators
minutes: 3
---

# Immutable iterators

| Метод | Мутирует? | Возвращает |
|---|---|---|
| \`map\`, \`filter\`, \`slice\`, \`concat\` | нет | новый массив |
| \`push\`, \`pop\`, \`splice\`, \`sort\` | да | varies |

\`\`\`js
const ids = users.map((u) => u.id);
const active = users.filter((u) => u.active);
const sum = nums.reduce((acc, n) => acc + n, 0);
\`\`\`

В React state и props предпочитайте **не мутировать** исходный массив — возвращайте новую ссылку.

## Best practice

Цепочки \`filter → map\` читаемы для UI-данных; для больших коллекций иногда один \`reduce\` или один проход — меньше аллокаций.
`,
);

await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l006/insights/02-holes-vs-empty.md',
  `---
id: i02
kind: insight
title: Holes vs empty slots
minutes: 2
---

# Holes vs empty slots

**Hole** (пропуск) — отсутствующий элемент: \`const a = [1, , 3]\` или \`delete a[1]\`.

- \`forEach\`, \`map\`, \`filter\` **пропускают** holes.
- \`for...of\` и spread **видят** holes как \`undefined\` (или пропуск в некоторых случаях — проверяйте версию).

\`\`\`js
[1, , 3].map((x) => x * 2); // [2, empty, 6] — callback не вызван для hole
Array.from([1, , 3]); // [1, undefined, 3]
\`\`\`

## Production note

API и JSON не имеют holes — это артефакт sparse arrays. В UI-коде лучше \`.filter(Boolean)\` или явные \`undefined\`.
`,
);

const l006Activities = {
  'p01-single-choice.yaml': `id: p01
kind: single_choice
phase: practice
prompt: |
  Какой метод **не мутирует** исходный массив?
options:
  - id: a
    text: "\`arr.sort()\`"
  - id: b
    text: "\`arr.splice(0, 1)\`"
  - id: c
    text: "\`arr.filter(fn)\`"
    correct: true
  - id: d
    text: "\`arr.push(x)\`"
explain: |
  \`filter\` возвращает новый массив. \`sort\`, \`splice\`, \`push\` мутируют \`arr\`.
`,
  'p02-predict-output.yaml': `id: p02
kind: predict_output
phase: practice
code: |
  const a = [1, 2, 3];
  const b = a.map((n) => n * 2);
  a.push(4);
  console.log(b.length, a.length);
question: Что выведет?
choices:
  - id: a
    text: "3 4"
    correct: true
  - id: b
    text: "4 4"
  - id: c
    text: "3 3"
  - id: d
    text: "4 3"
explain: |
  \`map\` создал новый массив длиной 3; \`push\` мутировал только \`a\`.
`,
  'p03-single-choice.yaml': `id: p03
kind: single_choice
phase: practice
prompt: |
  Когда \`reduce\` предпочтительнее цепочки \`filter().map()\`?
options:
  - id: a
    text: Никогда — reduce всегда хуже читается
  - id: b
    text: Когда нужен один проход и промежуточные массивы лишние
    correct: true
  - id: c
    text: Только для сортировки
  - id: d
    text: Только если массив пустой
explain: |
  Один проход — меньше аллокаций; но читаемость важнее, пока нет perf-проблемы.
`,
  'p04-predict-output.yaml': `id: p04
kind: predict_output
phase: practice
code: |
  let count = 0;
  [1, , 3].forEach(() => count++);
  console.log(count);
question: Сколько раз вызовется callback?
choices:
  - id: a
    text: "2"
    correct: true
  - id: b
    text: "3"
  - id: c
    text: "1"
  - id: d
    text: "0"
explain: |
  \`forEach\` пропускает **hole** в середине; вызывается для 1 и 3.
`,
  'r01-revision.yaml': `id: r01
kind: single_choice
phase: revision
prompt: |
  Что безопаснее для React state: \`items.push(x)\` или \`setItems([...items, x])\`?
options:
  - id: a
    text: "\`push\` — быстрее и React сам отследит"
  - id: b
    text: "\`[...items, x]\` — новая ссылка, immutability"
    correct: true
  - id: c
    text: Оба эквивалентны при functional update
  - id: d
    text: "\`push\` только в class components"
explain: |
  Мутация массива in-place не меняет reference → React может не перерендерить. Spread/concat дают новую ссылку.
hints:
  - title: Immutable update
    markdown: |
      \`setItems([...items, x])\` или \`setItems((prev) => [...prev, x])\` — типичный паттерн.
  - title: Anti-pattern
    markdown: |
      \`items.push(x); setItems(items)\` — та же ссылка, баг в списках и memo.
`,
  'i01-phrasing.yaml': `id: i01
kind: interview_phrasing
phase: phrasing
prompt: |
  Объясните вслух: чем \`map\`/\`filter\` отличаются от \`push\`/\`splice\` и почему это важно в React.
rubric: |
  - non-mutating vs mutating
  - новая ссылка для reconciliation
  - holes vs dense arrays (кратко)
sampleAnswer: |
  \`map\` и \`filter\` возвращают новые массивы и не меняют исходник; \`push\` и \`splice\` мутируют.
  В React обновление state должно давать новую reference, иначе компонент может не увидеть изменение.
  Sparse holes в массивах ведут себя иначе в \`forEach\` и spread — в данных UI лучше явные значения.
`,
};

for (const [name, body] of Object.entries(l006Activities)) {
  await write(
    `.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l006/activities/${name}`,
    body,
  );
}

// --- L007 ---
await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l007/lesson.yaml',
  `id: L007
order: 7
title: Mutation, shallow copies и reference identity
titleEn: Mutation, Shallow Copies & Reference Identity
essence: >-
  Почему \`{...obj}\` не глубокая копия и как identity ломает React state. Immutable update вложенного объекта.
depth: application
required: true

insights:
  - insights/01-shallow-copy.md
  - insights/02-reference-identity.md

activities:
  - activities/p01-single-choice.yaml
  - activities/p02-predict-output.yaml
  - activities/p03-predict-output.yaml
  - activities/p04-single-choice.yaml
  - activities/r01-revision.yaml
  - activities/i01-phrasing.yaml
`,
);

await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l007/insights/01-shallow-copy.md',
  `---
id: i01
kind: insight
title: Shallow copy
minutes: 3
---

# Shallow copy

Spread и \`Object.assign\` копируют **первый уровень**; вложенные объекты остаются **общими ссылками**.

\`\`\`js
const state = { user: { name: 'Ann' }, tags: ['a'] };
const next = { ...state, user: { ...state.user, name: 'Bob' } };
// или: tags: [...state.tags, 'b']
\`\`\`

**Deep clone** (\`structuredClone\`, JSON round-trip с ограничениями) нужен реже — чаще точечный immutable update.

## Anti-pattern

\`const next = { ...state }; next.user.name = 'Bob'\` — мутирует вложенный объект, shared с \`state\`.
`,
);

await write(
  '.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l007/insights/02-reference-identity.md',
  `---
id: i02
kind: insight
title: Reference identity
minutes: 2
---

# Reference identity

\`===\` для объектов сравнивает **ссылки**, не структуру.

\`\`\`js
const a = { n: 1 };
const b = { n: 1 };
console.log(a === b); // false
console.log(a === a); // true
\`\`\`

React \`memo\`, \`useEffect\` deps и \`useMemo\` часто завязаны на reference equality.

## Best practice

При обновлении state создавайте новые ссылки на изменённые ветки; неизменённые ветки можно переиспользовать (structural sharing).
`,
);

const l007Activities = {
  'p01-single-choice.yaml': `id: p01
kind: single_choice
phase: practice
prompt: |
  Что верно про \`const copy = { ...original }\`?
options:
  - id: a
    text: Глубокая копия всех уровней
  - id: b
    text: Shallow copy: вложенные объекты shared
    correct: true
  - id: c
    text: Копирует только enumerable own keys прототипа
  - id: d
    text: Всегда быстрее \`structuredClone\`
explain: |
  Spread копирует own enumerable properties первого уровня; nested — по ссылке.
`,
  'p02-predict-output.yaml': `id: p02
kind: predict_output
phase: practice
code: |
  const a = { x: { n: 1 } };
  const b = { ...a };
  b.x.n = 2;
  console.log(a.x.n);
question: Что выведет?
choices:
  - id: a
    text: "2"
    correct: true
  - id: b
    text: "1"
  - id: c
    text: "undefined"
  - id: d
    text: "TypeError"
explain: |
  \`b.x\` и \`a.x\` — одна ссылка; мутация через \`b\` видна в \`a\`.
`,
  'p03-predict-output.yaml': `id: p03
kind: predict_output
phase: practice
code: |
  const prev = { items: [1] };
  const next = { ...prev, items: [...prev.items, 2] };
  console.log(prev.items === next.items, prev === next);
question: Какие два boolean?
choices:
  - id: a
    text: "false false"
    correct: true
  - id: b
    text: "true false"
  - id: c
    text: "false true"
  - id: d
    text: "true true"
explain: |
  Новый массив \`items\` → \`prev.items !== next.items\`; новый объект \`next\` → \`prev !== next\`.
`,
  'p04-single-choice.yaml': `id: p04
kind: single_choice
phase: practice
prompt: |
  Безопасный immutable update \`user.profile.city\` в state?
options:
  - id: a
    text: "\`state.user.profile.city = 'X'; return state\`"
  - id: b
    text: "Spread на каждом уровне до \`city\`"
    correct: true
  - id: c
    text: "\`JSON.parse(JSON.stringify(state))\` всегда лучший путь"
  - id: d
    text: "\`Object.freeze(state)\` перед setState"
explain: |
  Нужны новые объекты на пути от root до изменённого поля; freeze не создаёт копию для React.
`,
  'r01-revision.yaml': `id: r01
kind: single_choice
phase: revision
prompt: |
  Почему \`setState(obj)\` с тем же \`obj\` после мутации полей может не обновить UI?
options:
  - id: a
    text: React сравнивает reference; ссылка не изменилась
    correct: true
  - id: b
    text: React всегда deep-equal сравнивает
  - id: c
    text: Strict mode блокирует мутации
  - id: d
    text: "\`setState\` клонирует автоматически"
explain: |
  In-place mutation + та же reference → bail-out. Нужен новый объект (или functional update с новой структурой).
hints:
  - title: Shallow vs deep
    markdown: |
      \`{ ...state, nested: { ...state.nested, x: 1 } }\` — типичный shallow path.
  - title: structuredClone
    markdown: |
      \`structuredClone(state)\` — deep copy для редких случаев; не замена точечных updates в hot paths.
`,
  'i01-phrasing.yaml': `id: i01
kind: interview_phrasing
phase: phrasing
prompt: |
  Объясните вслух: shallow copy, reference identity и один пример immutable update вложенного state.
rubric: |
  - spread = один уровень
  - \`===\` для объектов
  - пример update nested field
  - связь с React re-render
sampleAnswer: |
  Spread и assign делают shallow copy: вложенные объекты общие. \`===\` сравнивает ссылки.
  Чтобы обновить вложенное поле immutably, копируем каждый уровень на пути.
  React полагается на новую reference корня state, чтобы запланировать re-render.
`,
};

for (const [name, body] of Object.entries(l007Activities)) {
  await write(
    `.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/lessons/l007/activities/${name}`,
    body,
  );
}

// --- U02 unit pool ---
const u02Pool = {
  'r-u02-has-own.yaml': `id: r-u02-has-own
kind: single_choice
phase: revision
tags: [objects, prototype]
reinforces: [L005]
source: original
prompt: |
  Чем \`Object.hasOwn(obj, 'k')\` отличается от \`'k' in obj\`?
options:
  - id: a
    text: "\`hasOwn\` — только own; \`in\` — own или inherited"
    correct: true
  - id: b
    text: Эквивалентны в ES2022+
  - id: c
    text: "\`in\` только для массивов"
  - id: d
    text: "\`hasOwn\` проверяет значение, не ключ"
explain: |
  \`in\` обходит prototype chain; \`hasOwn\` — только собственные свойства.
hints:
  - title: Own vs inherited
    markdown: |
      Для сериализации и merge конфигов часто нужны только own keys: \`Object.keys\`, \`hasOwn\`.
`,
  'r-u02-map-vs-push.yaml': `id: r-u02-map-vs-push
kind: single_choice
phase: revision
tags: [arrays, immutability]
reinforces: [L006]
source: original
prompt: |
  После \`const items = [1]; items.push(2); setItems(items)\` список может не обновиться. Почему?
options:
  - id: a
    text: "\`push\` мутирует массив, reference \`items\` не меняется"
    correct: true
  - id: b
    text: "\`push\` запрещён в strict mode"
  - id: c
    text: React не поддерживает числа в массивах
  - id: d
    text: Нужен \`useMemo\`
explain: |
  Новая reference обязательна для корректного update; используйте \`[...items, 2]\`.
hints:
  - title: Immutable list update
    markdown: |
      \`setItems((prev) => [...prev, item])\` — безопасный паттерн.
`,
  'r-u02-shallow-spread.yaml': `id: r-u02-shallow-spread
kind: single_choice
phase: revision
tags: [mutation, spread]
reinforces: [L007]
source: original
prompt: |
  \`const b = { ...a }; b.nested.x = 1\` — что мутируется?
options:
  - id: a
    text: "\`a.nested\` и \`b.nested\` — одна ссылка"
    correct: true
  - id: b
    text: Только \`b\`, \`a\` изолирован
  - id: c
    text: Ошибка runtime
  - id: d
    text: Копируется deep автоматически
explain: |
  Shallow spread не клонирует \`nested\`; мутация затрагивает оба объекта.
hints:
  - title: Nested update
    markdown: |
      \`{ ...a, nested: { ...a.nested, x: 1 } }\` — immutable path.
`,
  'r-u02-object-is-ref.yaml': `id: r-u02-object-is-ref
kind: single_choice
phase: revision
tags: [references, equality]
reinforces: [L007]
source: original
prompt: |
  \`{} === {}\` — результат?
options:
  - id: a
    text: "true"
  - id: b
    text: "false"
    correct: true
  - id: c
    text: "TypeError"
  - id: d
    text: "undefined"
explain: |
  Разные объекты в heap — разные ссылки, даже при одинаковой структуре.
hints:
  - title: Reference identity
    markdown: |
      Deep equality — отдельные утилиты (\`lodash.isEqual\`) или сравнение полей вручную.
`,
};

for (const [name, body] of Object.entries(u02Pool)) {
  await write(
    `.courses/frontend/stacks/react/content/s01-js-core/u02-objects-arrays-mutation/activities/${name}`,
    body,
  );
}

// --- Stage pool (cross-unit recall) ---
const stagePool = {
  'r-s01-u01-u02-bridge.yaml': `id: r-s01-u01-u02-bridge
kind: single_choice
phase: revision
tags: [const, references, mutation]
reinforces: [L001, L007]
source: original
prompt: |
  \`const state = { count: 0 }; state.count++\` — ошибка?
options:
  - id: a
    text: Нет — \`const\` не запрещает мутацию по ссылке; для React нужен immutable update
    correct: true
  - id: b
    text: Да — \`const\` делает объект frozen
  - id: c
    text: Да — только \`let\` для полей
  - id: d
    text: Зависит от \`use strict\`
explain: |
  Связка U01 (\`const\` = binding) и U02 (mutation + React): инкремент поля мутирует объект; setState требует новой reference.
hints:
  - title: U01 → U02
    markdown: |
      \`const\` фиксирует ссылку; immutability для UI — отдельное правило (новый объект/spread).
`,
  'r-s01-array-spread.yaml': `id: r-s01-array-spread
kind: single_choice
phase: revision
tags: [arrays, spread]
reinforces: [L006, L007]
source: original
prompt: |
  \`[...arr, x]\` vs \`arr.push(x)\` в контексте React state?
options:
  - id: a
    text: Spread создаёт новый массив; push мутирует in-place
    correct: true
  - id: b
    text: Эквивалентны для React
  - id: c
    text: push быстрее и React это понимает
  - id: d
    text: Spread работает только с объектами
explain: |
  Immutable list update — новая reference массива.
`,
  'r-s01-null-object-access.yaml': `id: r-s01-null-object-access
kind: single_choice
phase: revision
tags: [typeof, objects]
reinforces: [L002, L005]
source: original
prompt: |
  Безопасный доступ к \`user?.address?.city\` когда \`user\` может быть \`null\`?
options:
  - id: a
    text: Optional chaining (\`?.\`) коротко и без лишних typeof
    correct: true
  - id: b
    text: "\`typeof user === 'object'\` достаточно — null object"
  - id: c
    text: "\`user && user.address.city\` — то же что ?. без разницы"
  - id: d
    text: "\`JSON.parse\` перед доступом"
explain: |
  \`typeof null === 'object'\` — помните из U01; optional chaining — production pattern для nested access.
hints:
  - title: typeof null
    markdown: |
      \`user != null && user.address?.city\` — явная guard-форма без optional chaining на root.
`,
};

for (const [name, body] of Object.entries(stagePool)) {
  await write(`.courses/frontend/stacks/react/content/s01-js-core/activities/${name}`, body);
}

// --- QA Java demo ---
await write(
  '.courses/qa-java-automation/course.yaml',
  `id: qa-java-automation
title: QA Automation (Java)
titleEn: QA Automation (Java)
description: Автотесты на Java — Selenium, Maven, TestNG и CI/CD.
status: coming-soon
statusLabel: Скоро

stages:
  - s01-foundations
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/stage.yaml',
  `id: S01
title: Основы Java и Selenium
titleEn: Java & Selenium Foundations

units:
  - u01-java-selenium
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/u01-java-selenium/unit.yaml',
  `id: U01
stageId: S01
title: JDK, Maven и WebDriver
titleEn: JDK, Maven & WebDriver

lessons:
  - lessons/l001
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/u01-java-selenium/lessons/l001/lesson.yaml',
  `id: L001
order: 1
title: JDK, Maven и первый WebDriver
titleEn: JDK, Maven & First WebDriver
essence: >-
  Структура Java-проекта автотестов: JDK, Maven, зависимости Selenium, базовый запуск браузера.
depth: application
required: true

insights:
  - insights/01-maven-layout.md

activities:
  - activities/p01-single-choice.yaml
  - activities/r01-revision.yaml
  - activities/i01-phrasing.yaml
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/u01-java-selenium/lessons/l001/insights/01-maven-layout.md',
  `---
id: i01
kind: insight
title: Maven layout
minutes: 3
---

# Maven layout

Типичный Java automation project:

\`\`\`text
pom.xml
src/test/java/...   # тесты (TestNG/JUnit)
src/main/java/...   # page objects, helpers (опционально)
\`\`\`

**JDK** — компиляция и runtime. **Maven** — зависимости (Selenium, TestNG), lifecycle (\`test\`, \`package\`).

WebDriver — API к браузеру; драйвер (ChromeDriver) должен match версии браузера.

## Best practice

Page Object Model: локаторы и действия в классе страницы, тест — сценарий без «сырых» XPath в каждой строке.
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/u01-java-selenium/lessons/l001/activities/p01-single-choice.yaml',
  `id: p01
kind: single_choice
phase: practice
prompt: |
  Где в Maven-проекте обычно лежат автотесты?
options:
  - id: a
    text: "\`src/test/java\`"
    correct: true
  - id: b
    text: "\`src/main/resources only\`"
  - id: c
    text: "\`target/test-sources\`"
  - id: d
    text: "\`WEB-INF/tests\`"
explain: |
  Конвенция Maven: production code в \`src/main\`, тесты в \`src/test\`.
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/u01-java-selenium/lessons/l001/activities/r01-revision.yaml',
  `id: r01
kind: single_choice
phase: revision
prompt: |
  Зачем Page Object Model в Selenium?
options:
  - id: a
    text: Скрыть локаторы и действия страницы, упростить поддержку тестов
    correct: true
  - id: b
    text: Заменить TestNG
  - id: c
    text: Убрать необходимость в waits
  - id: d
    text: Только для API-тестов
explain: |
  POM снижает дублирование локаторов и облегчает рефакторинг UI.
hints:
  - title: POM
    markdown: |
      Один класс на страницу/компонент; тест вызывает методы \`loginPage.submit()\`, не \`driver.findElement(...)\` напрямую.
`,
);

await write(
  '.courses/qa-java-automation/content/s01-foundations/u01-java-selenium/lessons/l001/activities/i01-phrasing.yaml',
  `id: i01
kind: interview_phrasing
phase: phrasing
prompt: |
  Объясните вслух: из чего состоит минимальный Java+Selenium проект и роль Maven.
rubric: |
  - pom.xml, dependencies
  - src/test/java
  - WebDriver + driver binary
  - POM (кратко)
sampleAnswer: |
  Maven описывает зависимости и фазы сборки в pom.xml. Тесты живут в src/test/java.
  Selenium WebDriver управляет браузером; нужен matching driver. Page Objects инкапсулируют UI для поддерживаемых тестов.
`,
);

console.log('Seeded U02, stage pools, and QA demo under .courses/');

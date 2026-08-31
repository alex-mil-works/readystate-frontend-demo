---
id: i02
kind: insight
title: ES Modules
minutes: 4
---

# ES Modules: export и import

## Named exports

```js
// math.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;
```

```js
// app.js
import { PI, add } from './math.js';
```

Можно переименовывать при импорте:

```js
import { add as sum } from './math.js';
```

## Default export

Один на модуль — «главная» сущность:

```js
// Person.js
export default class Person { ... }
```

```js
import Person from './Person.js';

// имя при импорте — произвольное
```

## Namespace import

```js
import * as math from './math.js';

math.add(1, 2);
math.PI;
```

## Ключевые свойства ES Modules

1. **Статическая структура** — imports/exports анализируются до выполнения. Нельзя делать условный import.
2. **Strict mode** — модули всегда в strict mode.
3. **Singleton** — модуль исполняется **один раз**, результат кешируется.
4. **Live bindings** — named export — живая ссылка на binding (если значение изменится в модуле, импортёр увидит новое значение).

## CommonJS vs ES Modules

|              | CommonJS                       | ES Modules            |
| ------------ | ------------------------------ | --------------------- |
| Синтаксис    | `require()` / `module.exports` | `import` / `export`   |
| Загрузка     | runtime                        | static (compile-time) |
| Tree-shaking | нет                            | да                    |
| Default      | `module.exports = ...`         | `export default ...`  |

В React-экосистеме используются ES Modules. Vite, webpack, esbuild полагаются на static imports для tree-shaking.

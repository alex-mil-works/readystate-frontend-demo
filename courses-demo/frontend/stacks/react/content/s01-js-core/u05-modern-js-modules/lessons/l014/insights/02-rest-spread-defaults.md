---
id: i02
kind: insight
title: Rest, spread и defaults
minutes: 4
---

# Rest parameters, spread operator и default values

## Rest parameters (`...`)

Собирает оставшиеся аргументы в **настоящий массив**:

```js
function sum(...nums) {
  return nums.reduce((a, n) => a + n, 0);
}
sum(1, 2, 3); // 6
```

Rest должен быть последним параметром.

## Spread operator (`...`)

Раскладывает iterable (массив, строку, Set) в отдельные элементы:

```js
const a = [1, 2];
const b = [0, ...a, 3]; // [0, 1, 2, 3]

Math.max(...a); // 2
```

Spread для объектов — shallow copy (как `Object.assign`):

```js
const next = { ...prev, name: 'Bob' };
```

Помните из L007: spread копирует **один уровень**, вложенные объекты — shared references.

## Default values

```js
function greet(name = 'World') {
  return `Hello, ${name}!`;
}
```

Default срабатывает при `undefined`, **не** при `null` (см. L011).

## Комбинация

Деструктуризация + rest + defaults — частый паттерн:

```js
function config({ host = 'localhost', port = 3000, ...rest } = {}) {
  return { host, port, ...rest };
}
config({ port: 8080, debug: true });
// { host: 'localhost', port: 8080, debug: true }
```

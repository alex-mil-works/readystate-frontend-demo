---
id: i02
kind: insight
title: Nullish coalescing и NaN
minutes: 3
---

# `??` и `||`

**Logical OR (`||`)** возвращает первый **truthy** операнд:

```js
0 || 42; // 42  — 0 falsy
'' || 'default'; // 'default'
```

**Nullish coalescing (`??`)** — только для `null` / `undefined`:

```js
0 ?? 42; // 0
'' ?? 'default'; // ''
null ?? 'x'; // 'x'
```

Для дефолтов props/API, где `0` или `''` — валидные значения, предпочитай **`??`** (production pattern). `||` здесь — типичный антипаттерн.

```jsx
// count может быть 0 — это нормально
const pageSize = props.pageSize ?? 10;
```

## NaN

`NaN` — единственное число, не равное самому себе через `===`. Проверка: **`Number.isNaN(x)`** (не глобальный `isNaN`, который coercion).

```js
Number.isNaN(NaN); // true
Number.isNaN('hello'); // false
isNaN('hello'); // true — coercion!
```

На границе API: после `parseInt`/`Number()` всегда валидируй результат перед использованием.

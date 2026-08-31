---
id: i02
kind: insight
title: call, apply, bind
minutes: 4
---

# `call`, `apply` и `bind`

## `call` — вызов с явным this

```js
function greet(greeting) {
  return `${greeting}, ${this.name}!`;
}
greet.call({ name: 'Alice' }, 'Hi'); // 'Hi, Alice!'
```

Аргументы передаются **по одному**.

## `apply` — то же, но аргументы массивом

```js
greet.apply({ name: 'Bob' }, ['Hello']); // 'Hello, Bob!'
```

Мнемоника: **a**pply → **a**rray.

## `bind` — возвращает новую функцию

```js
const greetAlice = greet.bind({ name: 'Alice' });
greetAlice('Hey'); // 'Hey, Alice!'
```

`bind` **не вызывает** функцию, а создаёт копию с привязанным `this`.

## Partial application через bind

```js
function multiply(a, b) {
  return a * b;
}
const double = multiply.bind(null, 2);
double(5); // 10
double(10); // 20
```

## `call`/`apply`/`bind` на arrow — noop для this

Arrow function игнорирует `this`, переданный через `call`/`apply`/`bind` — всегда использует лексический `this`:

```js
const arrow = () => this;
arrow.call({ x: 1 }); // всё равно внешний this
```

Но `bind` на arrow **может** частично применить аргументы (partial application работает).

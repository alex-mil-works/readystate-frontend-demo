---
id: i01
kind: insight
title: Четыре правила this
minutes: 5
---

# `this` в обычных функциях

`this` в JavaScript определяется **способом вызова**, а не местом определения функции. Четыре правила (по приоритету, от высшего к низшему):

## 1. `new` binding (конструктор)

```js
function User(name) {
  this.name = name;
}
const u = new User('Alex');
// this → новый объект {name: 'Alex'}
```

## 2. Explicit binding (`call` / `apply` / `bind`)

```js
function greet() {
  return this.name;
}
greet.call({ name: 'Bob' }); // 'Bob'
```

## 3. Implicit binding (метод объекта)

```js
const obj = {
  name: 'Cat',
  say() {
    return this.name;
  },
};
obj.say(); // 'Cat' — this = obj
```

Ловушка: если извлечь метод, контекст теряется:

```js
const fn = obj.say;
fn(); // undefined (strict) или global name (sloppy)
```

## 4. Default binding

Вызов «просто функции» — `this` = `undefined` в strict mode, `globalThis` (window) в sloppy mode.

```js
'use strict';
function who() {
  return this;
}
who(); // undefined
```

## Мнемоника

«Кто вызвал — тот и `this`». Если слева от точки есть объект — это implicit. Если нет — default.

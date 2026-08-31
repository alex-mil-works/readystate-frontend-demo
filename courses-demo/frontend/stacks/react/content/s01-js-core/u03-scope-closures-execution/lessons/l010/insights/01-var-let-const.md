---
id: i01
kind: insight
title: var, let и const
minutes: 4
---

# Три способа объявить переменную

## `var` — function scope

`var` видна во всей функции, независимо от блока, где объявлена:

```js
function example() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 — var не ограничен блоком if
}
```

Это counter-intuitive: `x` «утекает» из блока `if` наружу.

## `let` — block scope

`let` ограничена ближайшим блоком `{}`:

```js
function example() {
  if (true) {
    let y = 2;
  }
  console.log(y); // ReferenceError — y не видна за пределами if
}
```

## `const` — block scope + нельзя переприсвоить

`const` работает как `let`, но запрещает переприсваивание binding:

```js
const z = 3;
z = 4; // TypeError: Assignment to constant variable
```

Помните из U01: `const` не делает объект immutable — он фиксирует **ссылку**, не содержимое.

## Что выбирать в продуктовом коде

1. **`const`** по умолчанию — ясный сигнал «binding не меняется».
2. **`let`** — когда нужно переприсваивание (счётчики, аккумуляторы).
3. **`var`** — в новом коде почти не нужен. Если видите `var`, это legacy или осознанное решение (например, function-scope scoping в скриптах без модулей).

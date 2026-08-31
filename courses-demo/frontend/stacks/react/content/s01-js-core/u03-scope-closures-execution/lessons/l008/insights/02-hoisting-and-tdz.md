---
id: i02
kind: insight
title: Hoisting и TDZ
minutes: 5
---

# Hoisting и Temporal Dead Zone

## Что такое hoisting

Движок обрабатывает объявления **до** выполнения кода. `var` и `function` declaration поднимаются в начало scope:

```js
console.log(a); // undefined — объявление поднято, но не инициализация
var a = 5;
```

Фактический порядок исполнения:

```js
var a; // hoisted
console.log(a); // undefined
a = 5;
```

**Function declarations** поднимаются целиком — и имя, и тело:

```js
greet(); // 'hi' — работает
function greet() {
  console.log('hi');
}
```

**Function expressions** и **arrow functions** — нет:

```js
greet(); // TypeError: greet is not a function
var greet = function () {
  console.log('hi');
};
```

## TDZ — temporal dead zone

`let` и `const` тоже «знают» о переменной до строки объявления, но обращение к ней до инициализации бросает `ReferenceError`. Зона от начала блока до строки объявления — **TDZ**:

```js
{
  // TDZ для x начинается здесь
  console.log(x); // ReferenceError
  let x = 10; // TDZ заканчивается
}
```

Это design decision ES2015: поймать ошибки раньше. На практике — не используйте переменную до объявления, и TDZ вам не помешает.

## Почему это важно

- `var` + hoisting → неожиданные `undefined` вместо ошибки.
- `let` / `const` + TDZ → ранняя ошибка. В продуктовом коде предпочитайте `const`, затем `let`.
- Function declarations можно вызывать «до» объявления, function expressions — нет. Это часто спрашивают.

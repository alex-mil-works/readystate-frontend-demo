---
id: i01
kind: insight
title: Формы функций
minutes: 5
---

# Три формы функций

## Function declaration

```js
function add(a, b) {
  return a + b;
}
```

- Поднимается целиком (hoisting, см. L008).
- Видна во всём scope, где объявлена.

## Function expression

```js
const add = function (a, b) {
  return a + b;
};
```

- Поднимается только binding (`const add` / `var add`), тело — нет.
- Можно делать именованной (`function sum(a,b){...}`) — имя видно только внутри для рекурсии и stack traces.

## Arrow function (ES2015)

```js
const add = (a, b) => a + b;
```

- Короткий синтаксис, implicit return для однострочных.
- **Нет собственного `this`**, `arguments`, `super`, `new.target` — всё берётся из лексического scope.
- Нельзя использовать как конструктор (`new`).

## Функции — объекты

В JavaScript функция — **вызываемый объект**. У неё есть свойства (`name`, `length`, `prototype`) и методы (`call`, `apply`, `bind`). Можно передавать как аргумент (callback), возвращать из другой функции, хранить в массиве.

```js
function greet() {
  return 'hi';
}
greet.lang = 'en';
console.log(greet.name); // 'greet'
console.log(greet.length); // 0 (число параметров)
console.log(greet.lang); // 'en'
```

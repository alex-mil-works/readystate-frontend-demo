---
id: i02
kind: insight
title: Вызов и аргументы
minutes: 4
---

# Вызов функции и аргументы

## Без `return` → `undefined`

Если функция не содержит `return` или содержит пустой `return;`, она возвращает `undefined`:

```js
function doWork(x) {
  x + 1;
}
doWork(5); // undefined — нет return
```

## Лишние / недостающие аргументы

JavaScript **не** бросает ошибку при несовпадении числа аргументов:

```js
function sum(a, b) {
  return a + b;
}
sum(1); // NaN — b === undefined
sum(1, 2, 3); // 3  — третий аргумент проигнорирован
```

## Default parameters (ES2015)

```js
function greet(name = 'World') {
  return `Hello, ${name}!`;
}
greet(); // 'Hello, World!'
greet('Alex'); // 'Hello, Alex!'
```

Default срабатывает при `undefined`, но **не** при `null`:

```js
greet(undefined); // 'Hello, World!'
greet(null); // 'Hello, null!'
```

## `arguments` и rest

`arguments` — pseudo-array, доступен только в обычных функциях (не в arrow). Современная альтернатива — **rest parameters**:

```js
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3); // 6
```

`nums` — настоящий массив, сразу доступны `.map`, `.filter` и т.д.

## Pass by value / pass by reference

- Примитивы передаются **по значению** — изменения внутри функции не влияют на оригинал.
- Объекты передаются **по ссылке** — мутация внутри функции видна снаружи.

```js
function mutate(obj) {
  obj.x = 10;
}
const o = { x: 1 };
mutate(o);
console.log(o.x); // 10
```

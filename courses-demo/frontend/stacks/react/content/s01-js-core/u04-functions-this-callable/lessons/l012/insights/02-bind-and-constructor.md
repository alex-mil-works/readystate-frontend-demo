---
id: i02
kind: insight
title: bind и конструктор
minutes: 4
---

# `bind()` и `new`

## `bind` — фиксация this

`bind` возвращает **новую функцию** с привязанным `this`:

```js
const obj = { x: 42 };
function getX() {
  return this.x;
}
const boundGetX = getX.bind(obj);
boundGetX(); // 42 — this всегда obj
```

`bind` можно использовать для **partial application** — предустановки первых аргументов:

```js
function sum(a, b) {
  return a + b;
}
const add10 = sum.bind(null, 10);
add10(5); // 15
add10(20); // 30
```

## Конструктор и `new`

Вызов `new Foo()`:

1. Создаёт новый объект.
2. Устанавливает `this` = новый объект.
3. Связывает `__proto__` с `Foo.prototype`.
4. Если `Foo` не возвращает объект явно — возвращает `this`.

```js
function Counter(start) {
  this.count = start;
  this.inc = function () {
    this.count++;
  };
}
const c = new Counter(0);
c.inc();
console.log(c.count); // 1
```

## Приоритет

`new` > `bind` > `call`/`apply` > implicit > default.

`new` может «перебить» `bind`:

```js
const BoundCounter = Counter.bind({ count: 999 }, 0);
const c2 = new BoundCounter();
console.log(c2.count); // 0, не 999 — new выиграл
```

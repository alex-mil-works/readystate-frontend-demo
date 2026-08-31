---
id: i02
kind: insight
title: null, undefined и boxed primitives
minutes: 3
---

# `null`, `undefined` и boxed primitives

**`undefined`** — значение «не задано»: необъявленное поле, параметр без аргумента, `let x;` до присваивания.

**`null`** — намеренное «пустое значение» / отсутствие объекта. В API часто означает «нет результата».

Оба — примитивы, но `typeof null` ведёт себя как object (см. предыдущий insight).

## Boxed primitives (awareness)

У примитивов есть **обёртки-конструкторы** `String`, `Number`, `Boolean`. Вызов `new String('a')` создаёт **object**, не string:

```js
typeof 'a'; // 'string'
typeof new String('a'); // 'object'
```

В современном коде `new String/Number/Boolean` почти не используют. Авто-boxing (`'a'.toUpperCase()`) временно оборачивает примитив — не путать с `new String`.

Короткая формула: _примитив — значение; object wrapper — отдельный объект в heap_.

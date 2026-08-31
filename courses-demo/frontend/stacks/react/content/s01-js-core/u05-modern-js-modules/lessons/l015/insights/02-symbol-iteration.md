---
id: i02
kind: insight
title: Symbol и итерация
minutes: 4
---

# Symbol и протокол итерации

## Symbol — уникальный примитив

```js
const s1 = Symbol('desc');
const s2 = Symbol('desc');
s1 === s2; // false — каждый Symbol уникален
```

Символы используются как **неконфликтующие ключи** свойств и для встроенных протоколов языка (`Symbol.iterator`, `Symbol.toPrimitive` и др.).

`typeof Symbol()` → `'symbol'`.

## Протокол итерации

Объект **iterable**, если у него есть метод `[Symbol.iterator]()`, возвращающий **iterator** — объект с методом `next()`, который возвращает `{ value, done }`.

Встроенные iterable: Array, String, Map, Set, arguments, NodeList.

```js
const arr = [10, 20, 30];
const it = arr[Symbol.iterator]();
it.next(); // { value: 10, done: false }
it.next(); // { value: 20, done: false }
it.next(); // { value: 30, done: false }
it.next(); // { value: undefined, done: true }
```

## Что потребляет iterable

- `for...of`
- spread (`...`)
- деструктуризация (`[a, b] = iterable`)
- `Array.from()`
- `new Map()`, `new Set()`
- `Promise.all()`, `Promise.race()`

## Пользовательский iterable

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last ? { value: current++, done: false } : { done: true };
      },
    };
  },
};

[...range]; // [1, 2, 3]
```

Понимание iterable protocol — ключ к тому, как `for...of`, spread и деструктуризация работают «под капотом».

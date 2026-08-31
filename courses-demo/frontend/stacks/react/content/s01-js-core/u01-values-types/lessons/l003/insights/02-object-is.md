---
id: i02
kind: insight
title: Object.is и SameValueZero
minutes: 3
---

# `Object.is` и SameValueZero

**`Object.is(a, b)`** — SameValue equality:

- как `===`, **но** `Object.is(NaN, NaN) === true`
- `Object.is(+0, -0) === false` (у `===` они равны)

```js
NaN === NaN; // false
Object.is(NaN, NaN); // true

Object.is(0, -0); // false
0 === -0; // true
```

В React и Map/Set используется **SameValueZero** (как `Object.is`, но `+0` и `-0` считаются равными). Достаточно различать три уровня:

| Оператор    | Coercion | NaN   | +0 / -0      |
| ----------- | -------- | ----- | ------------ |
| `==`        | да       | false | равны        |
| `===`       | нет      | false | равны        |
| `Object.is` | нет      | true  | **не** равны |

Objects сравниваются по **identity** (ссылка), не по структуре — `{a:1} === {a:1}` всегда `false`.

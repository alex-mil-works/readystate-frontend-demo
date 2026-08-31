---
id: i01
kind: insight
title: Strict vs loose equality
minutes: 4
---

# `===` и `==`

**Strict equality (`===`)** сравнивает без приведения типов. Если типы разные — сразу `false` (кроме одного случая с `NaN`, см. ниже).

**Loose equality (`==`)** применяет **abstract equality comparison**: может приводить string ↔ number, boolean ↔ number, `null` ↔ `undefined`, объекты к примитивам.

```js
0 == false; // true  — boolean → number
'' == false; // true
null == undefined; // true
'5' == 5; // true  — string → number
```

В продуктовом коде **по умолчанию `===`**. `==` допустим для узких idiom (`value == null` ловит и `null`, и `undefined`).

## Частые ловушки

```js
[] == false   // true  (object → primitive)
[] == ![]     // true  (![] → false, далее coercion)
NaN == NaN    // false
```

Перед ответом полезно проговорить **типы операндов**.

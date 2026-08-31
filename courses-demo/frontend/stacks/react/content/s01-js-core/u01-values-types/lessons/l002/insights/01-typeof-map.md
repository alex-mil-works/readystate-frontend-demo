---
id: i01
kind: insight
title: Семь результатов typeof
minutes: 3
---

# Семь результатов `typeof`

Оператор `typeof` возвращает **строку** — грубую метку типа значения:

| Значение           | `typeof`      |
| ------------------ | ------------- |
| `undefined`        | `"undefined"` |
| `null`             | `"object"` ⚠️ |
| `true` / `false`   | `"boolean"`   |
| `42`, `NaN`        | `"number"`    |
| `'hi'`             | `"string"`    |
| `10n`              | `"bigint"`    |
| `Symbol()`         | `"symbol"`    |
| `{}`, `[]`, `null` | `"object"`    |
| `function(){}`     | `"function"`  |

Исторический баг: **`typeof null === 'object'`** — артефакт первой реализации (null имел type tag как object). Это классическая ловушка — её часто проверяют отдельно.

`typeof` **не** различает `Array`, `Date`, plain object — всё `"object"`. Для массивов используй `Array.isArray()`.

## Практический вывод

Проверка «это объект?» через `typeof x === 'object'` **ложно срабатывает** на `null`. Безопаснее:

```js
x !== null && typeof x === 'object';
```

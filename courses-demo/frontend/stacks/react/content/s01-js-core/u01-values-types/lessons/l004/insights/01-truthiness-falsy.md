---
id: i01
kind: insight
title: Truthiness и falsy-значения
minutes: 3
---

# Truthiness

В boolean-контексте (`if`, `&&`, `||`, `!`) значения приводятся к **true/false**.

**Falsy** (всего восемь):

- `false`
- `0`, `-0`, `0n`
- `''` (пустая строка)
- `null`
- `undefined`
- `NaN`

Всё остальное — **truthy**, включая `'0'`, `'false'`, `[]`, `{}`.

```js
if ([]) {
  console.log('runs'); // [] truthy
}
```

## Связь с React

Условный рендер `{count && <Badge />}`: если `count === 0`, React отрисует **`0`**, не «ничего» — потому что `0` falsy, но валидный React child. **Best practice:** `{count > 0 && <Badge />}` или тернарник.

Проверка «есть ли значение» через `if (value)` **отбрасывает** `0` и `''` — частая ошибка в формах и фильтрах (антипаттерн для числовых полей).

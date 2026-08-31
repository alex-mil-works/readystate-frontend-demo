---
id: i01
kind: insight
title: Immutable iterators
minutes: 3
---

# Immutable iterators

| Метод                              | Мутирует? | Возвращает   |
| ---------------------------------- | --------- | ------------ |
| `map`, `filter`, `slice`, `concat` | нет       | новый массив |
| `push`, `pop`, `splice`, `sort`    | да        | varies       |

```js
const ids = users.map((u) => u.id);
const active = users.filter((u) => u.active);
const sum = nums.reduce((acc, n) => acc + n, 0);
```

В React state и props предпочитайте **не мутировать** исходный массив — возвращайте новую ссылку.

## Best practice

Цепочки `filter → map` читаемы для UI-данных; для больших коллекций иногда один `reduce` или один проход — меньше аллокаций.

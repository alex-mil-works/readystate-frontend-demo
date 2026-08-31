---
id: i02
kind: insight
title: Dot vs bracket
minutes: 2
---

# Dot vs bracket

- **Dot** (`obj.name`) — когда ключ известен как идентификатор.
- **Bracket** (`obj[key]`) — динамический ключ, ключ с пробелами, символы, вычисляемое имя.

```js
const row = { 'user id': 42 };
// row.user id — SyntaxError
row['user id']; // 42

const field = 'status';
row[field] = 'active';
```

Computed property names в литерале: `{ [field]: value }`.

## Anti-pattern

Хранить «магические строки» ключей по всему коду без констант — сложно рефакторить и ловить опечатки.

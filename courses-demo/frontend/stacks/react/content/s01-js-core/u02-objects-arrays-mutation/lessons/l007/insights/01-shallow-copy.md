---
id: i01
kind: insight
title: Shallow copy
minutes: 3
---

# Shallow copy

Spread и `Object.assign` копируют **первый уровень**; вложенные объекты остаются **общими ссылками**.

```js
const state = { user: { name: 'Ann' }, tags: ['a'] };
const next = { ...state, user: { ...state.user, name: 'Bob' } };
// или: tags: [...state.tags, 'b']
```

**Deep clone** (`structuredClone`, JSON round-trip с ограничениями) нужен реже — чаще точечный immutable update.

## Anti-pattern

`const next = { ...state }; next.user.name = 'Bob'` — мутирует вложенный объект, shared с `state`.

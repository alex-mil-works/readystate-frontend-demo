---
id: i02
kind: insight
title: Holes vs empty slots
minutes: 2
---

# Holes vs empty slots

**Hole** (пропуск) — отсутствующий элемент: `const a = [1, , 3]` или `delete a[1]`.

- `forEach`, `map`, `filter` **пропускают** holes.
- `for...of` и spread **видят** holes как `undefined` (или пропуск в некоторых случаях — проверяйте версию).

```js
[1, , 3].map((x) => x * 2); // [2, empty, 6] — callback не вызван для hole
Array.from([1, , 3]); // [1, undefined, 3]
```

## Production note

API и JSON не имеют holes — это артефакт sparse arrays. В UI-коде лучше `.filter(Boolean)` или явные `undefined`.

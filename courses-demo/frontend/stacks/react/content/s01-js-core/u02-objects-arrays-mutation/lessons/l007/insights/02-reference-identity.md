---
id: i02
kind: insight
title: Reference identity
minutes: 2
---

# Reference identity

`===` для объектов сравнивает **ссылки**, не структуру.

```js
const a = { n: 1 };
const b = { n: 1 };
console.log(a === b); // false
console.log(a === a); // true
```

React `memo`, `useEffect` deps и `useMemo` часто завязаны на reference equality.

## Best practice

При обновлении state создавайте новые ссылки на изменённые ветки; неизменённые ветки можно переиспользовать (structural sharing).

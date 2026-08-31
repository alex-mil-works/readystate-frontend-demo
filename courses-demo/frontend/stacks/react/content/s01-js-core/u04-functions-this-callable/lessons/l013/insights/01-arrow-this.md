---
id: i01
kind: insight
title: Arrow function и this
minutes: 5
---

# Arrow function не имеет собственного `this`

Arrow function берёт `this` из **лексического scope** — того места, где она определена:

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++; // this = timer (из start)
    }, 1000);
  },
};
```

Если бы вместо arrow была обычная функция, `this` определялся бы по правилам вызова (default binding → `undefined` в strict).

## Сравнение: обычная vs arrow

```js
function Counter() {
  this.count = 0;

  // Обычная — this = globalThis (setInterval вызывает как fn())
  setInterval(function () {
    this.count++;
  }, 1000);

  // Arrow — this = экземпляр Counter (из лексического scope)
  setInterval(() => {
    this.count--;
  }, 1000);
}
const c = new Counter();
// Через 1 сек: c.count === -1 (не 0!)
```

## Что ещё отсутствует у arrow

- `arguments` — используйте rest parameters (`...args`).
- `super` — нет доступа к `super` родительского класса (кроме наследования через лексический scope).
- `new.target` — arrow нельзя вызвать через `new`.

## Когда использовать arrow

- **Callbacks**: `arr.map(x => x * 2)` — лаконично и `this` не теряется.
- **Обработчики в React**: `onClick={() => ...}` — `this` (если нужен) из компонента.
- **Не подходит** для методов объекта, если нужен `this` = объект:

```js
const obj = {
  name: 'X',
  getName: () => this.name, // this из внешнего scope, НЕ obj!
};
```

---
id: i01
kind: insight
title: Own vs inherited
minutes: 3
---

# Own vs inherited

У plain object свойства делятся на **own** (на самом объекте) и **inherited** (из prototype chain).

```js
const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

console.log(child.a); // 1 — inherited
console.log(Object.hasOwn(child, 'a')); // false
console.log(Object.hasOwn(child, 'b')); // true
```

**Own** проверяют через `Object.hasOwn(obj, key)` или `obj.hasOwnProperty(key)` (осторожно, если `hasOwnProperty` переопределён).

На интервью важно: чтение `obj.key` идёт по цепочке прототипов; запись own-свойства не мутирует прототип (обычно создаёт shadowing).

## Production note

Не полагайтесь на inherited keys без явной проверки — особенно при merge конфигов и сериализации API-ответов.

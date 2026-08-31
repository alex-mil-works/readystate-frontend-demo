---
id: i01
kind: insight
title: Деструктуризация
minutes: 5
---

# Деструктуризация массивов и объектов

## Массивы

```js
const [a, b, c] = [1, 2, 3];
// a=1, b=2, c=3
```

Можно пропускать элементы и собирать «хвост»:

```js
const [first, , third] = [10, 20, 30];
// first=10, third=30

const [head, ...tail] = [1, 2, 3, 4];
// head=1, tail=[2,3,4]
```

Swap без временной переменной:

```js
let x = 1,
  y = 2;
[x, y] = [y, x]; // x=2, y=1
```

## Объекты

```js
const { name, age } = { name: 'Alice', age: 30, city: 'NY' };
// name='Alice', age=30
```

Переименование при извлечении:

```js
const { name: userName, age: userAge } = user;
// userName, userAge
```

## Вложенная деструктуризация

```js
const {
  address: { city },
} = { address: { city: 'Moscow' } };
// city = 'Moscow'
```

Осторожно: если промежуточный объект `undefined`, будет TypeError. Безопасный вариант — default или optional chaining до деструктуризации.

## В параметрах функций

```js
function greet({ name, greeting = 'Hi' }) {
  return `${greeting}, ${name}!`;
}
greet({ name: 'Bob' }); // 'Hi, Bob!'
```

Совет: добавляйте default `= {}` для всего параметра, чтобы вызов без аргумента не бросал ошибку:

```js
function safe({ a, b } = {}) { ... }
```

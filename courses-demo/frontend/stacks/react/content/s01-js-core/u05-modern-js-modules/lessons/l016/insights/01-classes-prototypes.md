---
id: i01
kind: insight
title: Classes и prototypes
minutes: 5
---

# `class` — синтаксический сахар поверх прототипов

## Базовый класс

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, I'm ${this.name}`;
  }
}
const p = new Person('Alice');
p.greet(); // "Hi, I'm Alice"
```

Под капотом: `Person.prototype.greet` — обычный метод прототипа. `typeof Person` → `'function'`.

## Наследование: `extends` и `super`

```js
class Engineer extends Person {
  constructor(name, stack) {
    super(name); // вызов конструктора Person
    this.stack = stack;
  }
  greet() {
    return `${super.greet()}, ${this.stack} dev`;
  }
}
```

`super()` обязателен в конструкторе дочернего класса **до** обращения к `this`.

## `static`

```js
class MathUtils {
  static clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }
}
MathUtils.clamp(15, 0, 10); // 10
// new MathUtils().clamp — TypeError
```

Static-метод доступен только через класс, не через экземпляр.

## Прототипная цепочка

```js
p instanceof Person; // true
p instanceof Engineer; // false (p — Person)

const e = new Engineer('Bob', 'React');
e instanceof Person; // true — по цепочке
Object.getPrototypeOf(e) === Engineer.prototype; // true
```

Классы не вводят новую модель — это тот же prototype chain, но с чистым синтаксисом. На интервью полезно показать, что `class` — «сахар».

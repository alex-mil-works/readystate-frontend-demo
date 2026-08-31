---
id: i01
kind: insight
title: Class vs object
minutes: 3
---

# Class vs object

**Class** — описание (поля + поведение). **Object** — экземпляр в heap.

```java
class User {
  String email;
  User(String email) { this.email = email; }
}
User u = new User("a@b.c");
```

`this` — ссылка на текущий экземпляр. Нужен, когда имя параметра совпадает с полем.

## Best practice

В автотестах классы часто = **Page Object**, **ApiClient**, **TestData**. Один класс — одна ответственность.

## Anti-pattern

Огромный `TestHelper` со static-методами на всё — сложно сопровождать.

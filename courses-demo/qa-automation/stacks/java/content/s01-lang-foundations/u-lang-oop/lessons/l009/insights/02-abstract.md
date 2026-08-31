---
id: i02
kind: insight
title: Abstract classes
minutes: 3
---

# Abstract classes

`abstract class` может иметь поля, конструктор и частично реализованные методы + `abstract` методы для наследников.

```java
abstract class BaseTest {
  abstract WebDriver createDriver();
  void setUp() { /* общий */ }
}
```

Выбирайте abstract class, когда есть **общее состояние/код**; interface — когда важен только контракт.

---
id: i01
kind: insight
title: Inheritance and super
minutes: 3
---

# Inheritance and super

`extends` — подкласс получает члены суперкласса. `super(...)` вызывает конструктор родителя; `super.method()` — метод родителя.

```java
class BasePage {
  protected final WebDriver driver;
  BasePage(WebDriver driver) { this.driver = driver; }
}
class CartPage extends BasePage {
  CartPage(WebDriver driver) { super(driver); }
}
```

## Best practice

Один уровень `BasePage` — ок. Глубокие деревья `A extends B extends C extends D` — запах.

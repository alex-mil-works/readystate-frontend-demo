---
id: i02
kind: insight
title: Constructors and this
minutes: 3
---

# Constructors and this

Конструктор инициализирует объект. Перегрузка — разные валидные способы создания.

```java
class LoginPage {
  private final WebDriver driver;
  LoginPage(WebDriver driver) {
    this.driver = driver;
  }
}
```

`this(...)` вызывает другой конструктор того же класса (первой строкой).

## Interview note

`this` — обычная reference на текущий object, не «магия».

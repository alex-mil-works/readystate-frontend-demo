---
id: i01
kind: insight
title: Polymorphism and dispatch
minutes: 3
---

# Polymorphism and dispatch

Ссылка типа родителя/интерфейса может указывать на разные реализации. Вызов виртуального метода идёт в **runtime** (dynamic dispatch).

```java
WebDriver driver = new ChromeDriver(); // WebDriver ref, Chrome impl
driver.get("https://example.com");
```

## Best practice

Зависьте от абстракций (`WebDriver`, `Wait`), а не от конкретного `ChromeDriver`, если код должен быть переносимым.

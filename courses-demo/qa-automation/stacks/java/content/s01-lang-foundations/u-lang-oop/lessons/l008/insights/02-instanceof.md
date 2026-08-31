---
id: i02
kind: insight
title: instanceof and pattern matching
minutes: 3
---

# instanceof

`instanceof` проверяет тип объекта. С Java 16+ — pattern matching:

```java
if (driver instanceof ChromiumDriver chrome) {
  // chrome уже сужен
}
```

## Anti-pattern

Цепочки `if (x instanceof A) … else if (x instanceof B)` вместо полиморфного метода — сигнал пересмотреть дизайн.

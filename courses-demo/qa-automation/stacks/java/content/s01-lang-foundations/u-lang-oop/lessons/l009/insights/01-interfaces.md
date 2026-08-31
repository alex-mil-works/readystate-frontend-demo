---
id: i01
kind: insight
title: Interfaces
minutes: 3
---

# Interfaces

Интерфейс задаёт **контракт**: что умеет тип, без привязки к одной реализации.

```java
interface Storage {
  void save(String key, String value);
}
```

Класс может `implements` несколько интерфейсов. С Java 8 — `default` методы.

## Best practice

В тестовом фреймворке интерфейсы отделяют «порт» (отправка HTTP, клик) от адаптера (RA, Selenium).

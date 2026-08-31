---
id: i02
kind: insight
title: Records as DTOs
minutes: 3
---

# Records as DTOs

`record` (Java 16+) — immutable data carrier с `equals`/`hashCode`/`toString`.

```java
record UserDto(String email, int id) {}
```

Удобно для JSON/API assertions: сравнить ожидаемый DTO с фактическим.

## Anti-pattern

Mutable DTO с публичными полями и ручным `equals` — легко ошибиться в тестах.

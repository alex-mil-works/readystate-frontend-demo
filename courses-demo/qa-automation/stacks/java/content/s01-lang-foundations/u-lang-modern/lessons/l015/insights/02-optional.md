---
id: i02
kind: insight
title: Optional
minutes: 3
---

# Optional

`Optional<T>` — явный «может не быть значения».

```java
Optional<String> email = findEmail(id);
email.ifPresent(System.out::println);
```

## Anti-pattern

`Optional` как поле везде или `optional.get()` без проверки — хуже, чем аккуратный null-policy.

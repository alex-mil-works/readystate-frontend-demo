---
id: i02
kind: insight
title: Properties files
minutes: 3
---

# Properties

`.properties` — простые ключ=значение для env-like конфигов (baseUrl, browser).

```java
Properties props = new Properties();
props.load(Files.newInputStream(path));
```

Не храните секреты в git; для CI — env vars / secrets store.

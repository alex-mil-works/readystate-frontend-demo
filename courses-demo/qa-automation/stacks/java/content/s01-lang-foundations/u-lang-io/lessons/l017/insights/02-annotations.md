---
id: i02
kind: insight
title: '@JsonProperty and strictness'
minutes: 3
---

# @JsonProperty and strictness

```java
record User(@JsonProperty("e_mail") String email, int id) {}
```

Включайте fail-on-unknown по необходимости, чтобы ловить контрактные изменения API рано.

## Best practice

В API-тестах держите DTO рядом с клиентом; не парсите JSON руками через строки, если есть стабильная схема.

---
id: i01
kind: insight
title: Lambda and Stream
minutes: 3
---

# Lambda and Stream

```java
ids.stream()
  .filter(id -> id.startsWith("user-"))
  .map(String::toUpperCase)
  .toList();
```

Stream — pipeline; терминальная операция запускает вычисление. Не мутируйте исходную коллекцию внутри forEach без нужды.

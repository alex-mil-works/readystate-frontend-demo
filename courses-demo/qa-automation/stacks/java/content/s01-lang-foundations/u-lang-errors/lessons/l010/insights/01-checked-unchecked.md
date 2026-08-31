---
id: i01
kind: insight
title: Checked vs unchecked
minutes: 3
---

# Checked vs unchecked

**Unchecked** (`RuntimeException`, `Error`) — можно не объявлять в `throws`.
**Checked** (остальные `Exception`) — компилятор требует `catch` или `throws`.

```java
void read() throws IOException { Files.readString(Path.of("a.txt")); }
```

## Best practice

В тестах для ожидаемых ошибок используйте `assertThrows`. Не глотайте checked пустым `catch`.

---
id: i02
kind: insight
title: ConcurrentModificationException
minutes: 3
---

# ConcurrentModificationException

Структурная модификация коллекции во время for-each часто даёт CME (fail-fast итераторы).

```java
for (String s : list) {
  if (s.isEmpty()) list.remove(s); // опасно
}
```

Используйте `Iterator.remove()` или собирайте кандидатов отдельно.

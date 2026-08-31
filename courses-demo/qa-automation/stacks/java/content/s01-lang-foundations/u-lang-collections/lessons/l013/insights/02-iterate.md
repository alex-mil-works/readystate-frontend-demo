---
id: i02
kind: insight
title: Iterating maps
minutes: 3
---

# Iterating maps

Предпочтительно `entrySet()`:

```java
for (var e : map.entrySet()) {
  System.out.println(e.getKey() + "=" + e.getValue());
}
```

В тестах Map часто = заголовки HTTP, query params, fixture tables.

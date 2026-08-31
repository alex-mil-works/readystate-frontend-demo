---
id: i01
kind: insight
title: HashMap vs TreeMap
minutes: 3
---

# HashMap vs TreeMap

**HashMap** — средний O(1) доступ, порядок не гарантирован.
**TreeMap** — сортировка ключей, O(log n).
**LinkedHashMap** — порядок вставки.

```java
Map<String, Integer> status = new HashMap<>();
status.put("ok", 200);
```

Ключи должны иметь корректные `equals`/`hashCode` (для HashMap).

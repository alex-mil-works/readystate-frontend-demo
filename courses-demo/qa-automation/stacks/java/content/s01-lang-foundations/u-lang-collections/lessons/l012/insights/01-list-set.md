---
id: i01
kind: insight
title: List vs Set
minutes: 3
---

# List vs Set

**List** — упорядоченная последовательность, допускает дубликаты (`ArrayList`, `LinkedList`).
**Set** — уникальные элементы (`HashSet`, `LinkedHashSet`, `TreeSet`).

```java
List<String> ids = new ArrayList<>();
Set<String> unique = new HashSet<>(ids);
```

## Best practice

В тестах List — для порядка шагов/ответов; Set — когда важна уникальность id.

---
id: i01
kind: insight
title: Generic types
minutes: 3
---

# Generic types

```java
List<String> names = new ArrayList<>();
names.add("a");
```

Компилятор ловит `names.add(1)`. На runtime действует **type erasure**: сырой тип List.

## Best practice

Не используйте raw types (`List` без `<>`) в новом коде — теряете проверки.

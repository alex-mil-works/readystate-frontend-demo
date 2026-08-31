---
id: i02
kind: insight
title: Wildcards and bounds
minutes: 3
---

# Wildcards

`List<? extends Number>` — producer (читать Number).
`List<? super Integer>` — consumer (класть Integer).
PECS: Producer Extends, Consumer Super.

```java
void sum(List<? extends Number> nums) { /* read */ }
```

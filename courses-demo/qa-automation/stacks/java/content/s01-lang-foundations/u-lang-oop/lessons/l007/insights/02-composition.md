---
id: i02
kind: insight
title: Composition vs inheritance
minutes: 3
---

# Composition vs inheritance

**Composition**: объект _имеет_ зависимость (`Header header`), а не _является_ всем сразу.

```java
class CheckoutPage {
  private final Header header;
  private final CartPanel cart;
}
```

## Prefer composition when

- поведение «собирается» из частей (header, modal, table)
- нужно избежать хрупкой иерархии Page Object

## Interview note

«Favor composition over inheritance» — не запрет `extends`, а осторожность с глубокими деревьями.

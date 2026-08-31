---
id: i01
kind: insight
title: Методы и overloading
minutes: 3
---

# Методы и overloading

Метод — именованный блок с сигнатурой: модификаторы, тип возврата, имя, параметры.

```java
static String formatUser(String name, int id) {
  return name + "#" + id;
}

void logStep(String msg) { /* void — без return value */ }
```

**Overloading** — несколько методов с одним именем и **разными списками параметров** (типы/количество). Компилятор выбирает по аргументам вызова.

## Best practice в automation

- Один метод — одна ответственность (login helper, wait helper)
- Имена отражают действие: `clickSubmit()`, не `doStuff()`
- Избегайте god-methods на 200 строк — их невозможно покрыть тестами и reuse

## Anti-pattern

Дублировать почти одинаковые методы вместо параметров — лучше overload или optional args.

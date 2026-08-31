---
id: i02
kind: insight
title: Casting, литералы и String
minutes: 3
---

# Casting, литералы и String

## Widening и narrowing

Widening (int → long) происходит автоматически — без потери данных.
Narrowing (long → int) требует явного каста и может обрезать значение:

```java
long big = 100_000L;
int small = (int) big; // explicit narrowing
```

## Литералы и суффиксы

| Литерал | Тип по умолчанию | Суффикс    |
| ------- | ---------------- | ---------- |
| `42`    | `int`            | —          |
| `42L`   | `long`           | `L`        |
| `3.14`  | `double`         | `d` (опц.) |
| `3.14f` | `float`          | `f`        |

## String — не примитив

`String` — immutable reference-тип. Конкатенация через `+` создаёт новый объект:

```java
String a = "hello";
String b = a + " world"; // новый объект
```

Для множественных конкатенаций в цикле используйте `StringBuilder`:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 100; i++) {
  sb.append("item ").append(i).append("\n");
}
String result = sb.toString();
```

## Interview note

«Почему `String` immutable?» — безопасность (ключи HashMap, пароли), кэширование `hashCode()`, thread safety без синхронизации.

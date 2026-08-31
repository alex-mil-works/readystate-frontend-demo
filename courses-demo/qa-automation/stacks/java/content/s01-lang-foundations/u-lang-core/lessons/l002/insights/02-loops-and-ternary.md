---
id: i02
kind: insight
title: Циклы, ternary и switch expression
minutes: 3
---

# Циклы, ternary и switch expression

## for / while / do-while

```java
// classic for
for (int i = 0; i < 10; i++) { ... }

// for-each — предпочтительно для коллекций
for (String item : list) { ... }

// while — когда количество итераций неизвестно
while (driver.findElements(locator).isEmpty()) {
  Thread.sleep(500);
}
```

`for-each` безопаснее классического `for`: нет off-by-one ошибок и лишнего индекса.

## Ternary оператор

Компактная замена простого `if-else`:

```java
String label = count > 0 ? "found" : "empty";
```

Правило: ternary — для одного выражения. Вложенные ternary снижают читаемость.

## Switch expression (Java 14+)

```java
String desc = switch (status) {
  case 200 -> "OK";
  case 404 -> "Not Found";
  case 500 -> "Server Error";
  default  -> "Unknown: " + status;
};
```

Arrow-form (`->`) не требует `break`, исключает fall-through баги. В automation удобен для маппинга HTTP-статусов, ролей, типов элементов.

## Interview note

«Чем switch expression отличается от switch statement?» — expression возвращает значение, arrow-form не допускает fall-through, компилятор проверяет exhaustiveness для enum.

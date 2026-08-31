---
id: i01
kind: insight
title: Массивы в Java
minutes: 3
---

# Массивы в Java

Массив — reference-тип фиксированной длины. Индексация с 0; `length` — поле, не метод.

```java
int[] nums = { 1, 2, 3 };
for (int n : nums) { /* for-each */ }
```

## Массив vs List

|                        | Массив             | `ArrayList`   |
| ---------------------- | ------------------ | ------------- |
| Размер                 | фиксирован         | растёт        |
| Примитивы              | `int[]` напрямую   | только boxed  |
| TestNG `@DataProvider` | `Object[][]` часто | List в ячейке |

## Best practice

В automation чаще `List` для динамических данных; массивы — для `@DataProvider` и varargs. `Arrays.asList()` — view, не копия.

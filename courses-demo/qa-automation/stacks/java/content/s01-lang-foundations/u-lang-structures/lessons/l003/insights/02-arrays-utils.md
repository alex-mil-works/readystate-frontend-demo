---
id: i02
kind: insight
title: 'Arrays utilities и многомерные массивы'
minutes: 3
---

# Arrays utilities и многомерные массивы

## java.util.Arrays

Класс `Arrays` содержит статические методы для работы с массивами:

```java
int[] nums = { 3, 1, 2 };
Arrays.sort(nums);           // [1, 2, 3] — in-place
Arrays.parallelSort(nums);   // параллельная сортировка для больших массивов

int idx = Arrays.binarySearch(nums, 2); // поиск в отсортированном

String repr = Arrays.toString(nums);    // "[1, 2, 3]"

int[] copy = Arrays.copyOf(nums, 5);    // [1, 2, 3, 0, 0]
```

## System.arraycopy

Низкоуровневое копирование — быстрее ручного цикла:

```java
System.arraycopy(src, 0, dest, 0, src.length);
```

## Многомерные массивы

`Object[][]` — массив массивов, часто в TestNG `@DataProvider`:

```java
Object[][] data = {
  { "admin", "pass123" },
  { "user",  "pass456" }
};
```

Каждая «строка» может иметь разную длину (jagged array).

## Ловушка: Arrays.asList

`Arrays.asList(arr)` возвращает fixed-size **view** — нельзя `add()`/`remove()`:

```java
List<String> list = Arrays.asList("a", "b");
list.add("c"); // UnsupportedOperationException!
```

Для mutable списка: `new ArrayList<>(Arrays.asList(...))`.

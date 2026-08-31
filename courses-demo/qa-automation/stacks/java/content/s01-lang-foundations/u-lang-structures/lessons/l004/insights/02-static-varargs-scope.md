---
id: i02
kind: insight
title: static, varargs и scope методов
minutes: 3
---

# static, varargs и scope методов

## static методы

`static` — метод принадлежит классу, а не экземпляру. Вызывается через имя класса:

```java
class MathUtils {
  static int add(int a, int b) { return a + b; }
}
MathUtils.add(2, 3); // 5
```

В test automation: utility-классы с `static` helpers (форматирование, генерация данных).

## varargs

Переменное число аргументов — синтаксический сахар над массивом:

```java
static String join(String sep, String... parts) {
  return String.join(sep, parts);
}
join(", ", "a", "b", "c"); // "a, b, c"
```

Правило: varargs — только **последний** параметр в сигнатуре.

## Scope переменных

- **Локальные** — живут внутри блока `{}`, не видны снаружи
- **Параметры** — локальные для метода
- **Instance fields** — через `this`, живут пока жив объект
- **Class (static) fields** — живут пока загружен класс

```java
void example() {
  int x = 1;       // локальная
  if (true) {
    int y = 2;     // локальная для блока if
  }
  // y здесь не видна
}
```

## Interview note

«Можно ли overload-метод только по varargs?» — `foo(int)` и `foo(int...)` создают неоднозначность; компилятор выберет точное совпадение `foo(int)`.

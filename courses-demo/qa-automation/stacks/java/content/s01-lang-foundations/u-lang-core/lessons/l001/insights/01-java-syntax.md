---
id: i01
kind: insight
title: Values, primitive и reference
minutes: 3
---

# Values, primitive и reference

В Java есть **primitive** типы (`int`, `boolean`, и т.д.) и **reference** типы (классы, массивы).

- primitive значение хранится «само по себе»
- reference хранит адрес объекта в heap

Это важно для тестов:

1. `==` для reference сравнивает **ссылки (identity)**.
2. `equals()` обычно сравнивает **содержимое (value)**.

## Best practice

Для DTO/моделей в тестах:

- используйте корректно переопределённый `equals()`/`hashCode()`
- избегайте сравнения через `==` для объектов

## Interview note

На вопрос «почему `a == b` не сработало?» почти всегда ответ — reference identity.

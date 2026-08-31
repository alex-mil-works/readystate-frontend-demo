---
id: i02
kind: insight
title: Custom exceptions
minutes: 3
---

# Custom exceptions

```java
class ApiFailureException extends RuntimeException {
  ApiFailureException(String msg) { super(msg); }
}
```

Именованные ошибки читаемее, чем голый `RuntimeException("fail")` в тестовом фреймворке.

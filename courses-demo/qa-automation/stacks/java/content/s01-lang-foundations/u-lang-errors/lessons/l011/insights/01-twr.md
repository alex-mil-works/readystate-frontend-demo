---
id: i01
kind: insight
title: try-with-resources
minutes: 3
---

# try-with-resources

Ресурсы, реализующие `AutoCloseable`, закрываются автоматически.

```java
try (var in = Files.newBufferedReader(path)) {
  return in.readLine();
}
```

Порядок закрытия — обратный порядку объявления. Исключения из close могут добавиться как suppressed.

## Best practice

WebDriver тоже закрывайте в `@AfterEach` / try-with-resources обёртке — не оставляйте браузеры.

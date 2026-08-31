---
id: i01
kind: insight
title: Path and Files
minutes: 3
---

# Path and Files

```java
Path p = Path.of("fixtures", "user.json");
String json = Files.readString(p);
```

`Path` — путь; `Files` — операции. Всегда думайте о charset и о том, что файла может не быть.

## Best practice

Тестовые фикстуры кладите в `src/test/resources` и читайте через classpath, а не абсолютные пути разработчика.

---
id: i01
kind: insight
title: POJO mapping
minutes: 3
---

# POJO mapping

Jackson (`ObjectMapper`) превращает JSON в Java-объект и обратно.

```java
record User(String email, int id) {}
User u = mapper.readValue(json, User.class);
```

Совпадение имён полей/accessor’ов с JSON — ключ. Иначе — `@JsonProperty`.

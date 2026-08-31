---
id: i01
kind: insight
title: Encapsulation
minutes: 3
---

# Encapsulation

Инкапсуляция — скрыть внутреннее состояние и открыть контролируемый API.

```java
class Account {
  private int balance;
  public int getBalance() { return balance; }
  public void deposit(int amount) { if (amount > 0) balance += amount; }
}
```

Access modifiers: `private` / package / `protected` / `public`.

## Best practice

В Page Object поля-локаторы — `private`; наружу — действия (`login`, `open`). Не отдавайте сырой `WebElement` наружу без нужды.

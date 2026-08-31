---
id: i01
kind: insight
title: Lexical scope
minutes: 4
---

# Lexical scope

Scope в JavaScript — **лексический**: место, где переменная доступна, определяется тем, _где_ она написана в исходном коде, а не тем, откуда функция вызвана.

## Цепочка scope

Когда движок ищет переменную, он идёт по цепочке:

1. Текущий блок / функция.
2. Внешний блок / функция.
3. … до глобального scope.

```js
const lang = 'JS';

function greet() {
  const name = 'Alex';
  console.log(`${name} writes ${lang}`);
  // name — из greet scope
  // lang — из глобального scope
}
```

Если переменная не найдена ни в одном scope, движок бросает `ReferenceError`.

## Функции создают scope

Каждый вызов функции создаёт **новый** scope. Вложенные функции видят переменные внешних, но не наоборот:

```js
function outer() {
  const x = 1;
  function inner() {
    console.log(x); // 1 — видит x из outer
  }
  inner();
}
outer();
// console.log(x); // ReferenceError
```

На интервью полезно проговаривать: «переменная привязана к тому scope, где объявлена» — это ключ ко всем вопросам о замыканиях и hoisting.

---
id: i01
kind: insight
title: Map и Set
minutes: 5
---

# Map и Set

## Map — ключ-значение с произвольными ключами

В отличие от plain object, ключом `Map` может быть **любой тип** — объект, функция, число:

```js
const m = new Map();
const objKey = { id: 1 };

m.set(objKey, 'value');
m.set(42, 'number key');

m.get(objKey); // 'value'
m.has(42); // true
m.size; // 2
```

Основные методы: `set`, `get`, `has`, `delete`, `clear`, `size`.

Map сохраняет порядок вставки и итерируется через `for...of`, `forEach`, деструктуризацию:

```js
for (const [key, value] of m) {
  console.log(key, value);
}
```

## Set — коллекция уникальных значений

```js
const s = new Set([1, 2, 2, 3]);
s.size; // 3 — дубли удалены
s.add(4);
s.has(2); // true
s.delete(1);
```

Частый паттерн — дедупликация массива:

```js
const unique = [...new Set(arr)];
```

## Сравнение с plain object / array

|          | Object                                                  | Map               |
| -------- | ------------------------------------------------------- | ----------------- |
| Ключи    | только string/symbol                                    | любые             |
| Порядок  | не гарантирован (spec: insertion для string, но нюансы) | insertion order   |
| Размер   | `Object.keys(o).length`                                 | `.size`           |
| Итерация | `Object.entries(o)`                                     | напрямую iterable |

Используйте `Map`, когда ключи динамические или не строки. `Object` — когда структура известна заранее (конфиги, DTO).

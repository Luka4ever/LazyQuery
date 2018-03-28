# lazy-query

Lazy-query allows for lazy query evaluation on data collections that implement a Symbol.iterator method, such as arrays and strings.

#### toArray()
Executes the query and returns a new array containing the elements that pass the query
```sh
L([2, 1, 3]).toArray() -> [2, 1, 3]
```

#### toString()
Executes the query and returns a new string containing the elements that pass the query
```sh
L(["a", "b"]).toString() -> "ab"
```

#### take(n)
Returns a new collection limited to the first n items in the collection
```sh
L([1, 2, 3]).take(2).toArray() -> [1, 2]
```

#### drop(n)
Returns a new collection limited to the items in the collection after the n first items
```sh
L([0, 1, 2, 3, 4]).drop(2).toArray() -> [2, 3, 4]
```

#### takeWhile(predicate)
Returns a new collection limited to all the items in the collection before the first element that when passed as an argument to the predicate function returns false
```sh
L([1, 3, 0, 2]).takeWhile(v => v > 0).toArray() -> [1, 3]
```

#### dropWhile(predicate)
Returns a new collection limited to all the items in the collection from the first element that when passed as an argument to the predicate function returns false
```sh
L([0, 1, 2]).dropWhile(v => v === 0).toArray() -> [1, 2]
```

#### filter(predicate)
Returns a new collection limited to all the items in the collection that when passed to the predicate function returns true
```sh
L([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).filter(v => v % 2 === 0).toArray() -> [0, 2, 4, 6, 8]
```

#### first()
Returns the first element in the collection
```sh
L([0, 1, 2]).first() -> 0
```

#### last()
Returns the last element in the collection
```sh
L([1, 2, 5, 6, 8]).last() -> 8
```

#### map(transform)
Returns a new collection where each element is the result of passing the coresponding element in the old collection to the transform function
```sh
L([1]).map(v => v * 2).toArray() -> [2]
```

#### any(predicate)
Determines whether any element in the collection satisfies a given predicate
```sh
L([0, 1]).any(v => v % 2 !== 0) -> true
```

#### all(predicate)
Determines whether all element in the collection satisfies a given predicate
```sh
L([0, 2, 4]).all(v => v % 2 === 0) -> true
```

#### reverse()
Returns a new collection that is in the reverse order
```sh
L([0, 1]).reverse().toArray() -> [1, 0]
```

#### intersperse(element)
Returns a new collection with an element intersperced between all elements in the collection
```sh
L(["a", "b", "c"]).intersperse(",").toArray(), ["a", ",", "b", ",", "c"]
```

#### reduce(func, initial)
Reduces a collection to one value by calling func on each element and the current result
```sh
L([1, 2]).reduce((a, b) => a + b, 0) -> 3
```

#### unique([func])
Returns a new collection only containing one of each element

If func is a function it is used to determine equality between elements by calling it with the two elements in each compared pair
```sh
L([1, 2, 2, 1, 2]).unique().toArray() -> [1, 2]
L([{ a: 1 }, { a: 2 }, { a: 1 }]).unique((a, b)=>a.a===b.a).toArray() -> [{ a: 1 }, { a: 2 }]
```

#### subsequences()
Returns a new collection containing all the subsequences of the collection
```sh
L("abc").subsequences().map(s=>s.join("")).toArray() -> ["", "a", "b", "ab", "c", "ac", "bc", "abc"]
```

#### permutations()
Returns a new collection containing all the permutations of the collection
```sh
L([0, 1, 2]).permutations().toArray() -> [[0, 1, 2], [1, 0, 2], [2, 0, 1], [0, 2, 1], [1, 2, 0], [2, 1, 0]]
```

#### isEmpty()
Determines whether the collection is empty
```sh
L([0]).isEmpty() -> false
```

#### count()
Determines the number of elements in the collection
```sh
L([0, 0, 1]).count() -> 3
```

#### exec()
Executes a function on each element in the collection
```sh
let a = 0;
L([0, 1, 0]).exec(v => a += v);
a -> 1
```

#### sort(comparator)
Sorts the collection, comparator is a function that takes two arguments and returns, > 0 if the first argument should come after the second, < 0 if the first argument should come before the second argument, 0 if equal.
```sh
L([1, 0]).sort((a, b) => a-b).toArray() -> [0, 1]
```

#### memoize()
Returns a memoized version of the collection, a memoized collection will save the results of previous queryies on the collection to improve performance on repeated iterations
```sh
L([0, 1]).memoize().toArray() -> [0, 1]
```

#### onlyMemoized()
Returns a version of the collection only containing values already memoized
```sh
let a = L([1, 4, 0, 2, 3]).memoize();
a.takeWhile(v => v > 0).toArray();
a.onlyMemoized().toArray() -> [1, 4, 0]
```

#### concat()
Concatenates the collections in the collection
```sh
L([[0], [2, 1]]).concat().toArray() -> [0, 2, 1]
```

#### cycle()
Makes the collection cycle until it encounters an empty collection
```sh
L([0, 1]).cycle().take(5).toArray() -> [0, 1, 0, 1, 0]
```

#### get(i)
Gets the element at a given index
```sh
L([0, 2, 5, 3, 1]).get(2) -> 5
```

#### transpose()
Transposes the rows and columns of the collection
```sh
L([[0, 1], [2, 3]]).transpose().toArray() -> [[0, 2], [1, 3]]
```

#### max()
Returns the largest element in the collection or -Infinity if the collection is empty
```sh
L([2, 4, 0, 6, 9]).max() -> 9
```

#### min()
Returns the smallest element in the collection or Infinity if the collection is empty
```sh
L([3, 1, 9, 4, 7]).min() -> 1
```

#### and()
Returns 'true' if all elements in the collection are truthy, otherwise it returns 'false'
```sh
L([true, true]).and() -> true
```

#### or()
Returns 'false' if all elements in the collection are falsy, otherwise it returns 'true'
```sh
L([false, false]).or() -> false
```

#### sum()
Calculates the sum of the collection
```sh
L([1, 3]).sum() -> 4
```

#### product()
Calculates the product of the collection
```sh
L([3, 4]).product() -> 12
```

#### iterate()
Returns a new infinite collection of repeated applications of the supplied function to the first value in the collection
```sh
L([1]).iterate(v => v + 1).take(4).toArray() -> [1, 2, 3, 4]
```

#### append(collection)
Appends a collection to the end of the collection
```sh
L([1]).append([2, 3]).toArray() -> [1, 2, 3]
```

#### prepend(collection)
Prepends a collection to the start of the collection
```sh
L([1]).prepend([2, 3]).toArray() -> [2, 3, 1]
```

#### find(predicate)
Finds the first element that satisfies given predicate
```sh
L([1, 2, 3]).find(v => v % 2 === 0) -> 2
```

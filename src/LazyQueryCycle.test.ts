import { LazyQuery } from './LazyQuery';
import { LazyQueryAppend } from './LazyQueryAppend';
import { LazyQueryConcat } from './LazyQueryConcat';
import { LazyQueryCycle } from './LazyQueryCycle';
import { LazyQueryDrop } from './LazyQueryDrop';
import { LazyQueryDropWhile } from './LazyQueryDropWhile';
import { LazyQueryFiltered } from './LazyQueryFiltered';
import { LazyQueryIntersperce } from './LazyQueryIntersperce';
import { LazyQueryIterate } from './LazyQueryIterate';
import { LazyQueryMapped } from './LazyQueryMapped';
import { LazyQueryMemoize } from './LazyQueryMemoize';
import { LazyQueryOnlyMemoized } from './LazyQueryOnlyMemoized';
import { LazyQueryPermutations } from './LazyQueryPermutations';
import { LazyQueryPrepend } from './LazyQueryPrepend';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { LazyQueryTake } from './LazyQueryTake';
import { LazyQueryTakeWhile } from './LazyQueryTakeWhile';
import { LazyQueryTranspose } from './LazyQueryTranspose';
import { LazyQueryUnique } from './LazyQueryUnique';

function isEven(value: number): boolean {
	return value % 2 === 0;
}

function isOdd(value: number): boolean {
	return value % 2 === 1;
}

function isNumber(value: any): value is Number {
	return typeof value === 'number';
}

function add(a: number): (b: number) => number {
	return (b: number) => a + b;
}

function take<T>(collection: Iterable<T>, count: number): Array<T> {
	const iterator = collection[Symbol.iterator]();
	const result = [];
	let value = iterator.next();
	for (let i = 0; i < count && !value.done; i++) {
		result.push(value.value);
		value = iterator.next();
	}
	return result;
}

describe('all', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQueryCycle([]).all(isEven)).toEqual(true);
			expect(new LazyQueryCycle([]).all(isOdd)).toEqual(true);
		});
		test('a collection where all its elements pass the given predicate should return true', () => {
			// Testing this would cause an infinite loop since there's always a next value to test
		});
		test("a collection where any of its elements don't pass the given predicate should return false", () => {
			expect(new LazyQueryCycle([0, 1, 2]).all(isEven)).toEqual(false);
			expect(new LazyQueryCycle([1, 1, 2]).all(isOdd)).toEqual(false);
		});
	});
});

describe('and', () => {
	describe('(): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQueryCycle([]).and()).toEqual(true);
		});
		test('a collection where every element is truthy should return true', () => {
			// Testing this would cause an infinite loop since there's always a next value to test
		});
		test('a collection where any element is falsy should return false', () => {
			expect(new LazyQueryCycle([true, 1, 0]).and()).toEqual(false);
		});
	});
});

describe('any', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return false', () => {
			expect(new LazyQueryCycle([]).any(isEven)).toEqual(false);
			expect(new LazyQueryCycle([]).any(isOdd)).toEqual(false);
		});
		test('a collection where any element passes the given predicate should return true', () => {
			expect(new LazyQueryCycle([0, 1]).any(isEven)).toEqual(true);
			expect(new LazyQueryCycle([0, 1]).any(isOdd)).toEqual(true);
		});
		test('a collection where no element passes the given predicate should return false', () => {
			// Testing this would cause an infinite loop since there's always a next value to test
		});
	});
});

describe('append', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('the elements of the appended collection should come last', () => {
			expect([...new LazyQueryCycle([]).append([])]).toEqual([]);
			expect([...new LazyQueryCycle([]).append([1, 2])]).toEqual([1, 2]);
		});
		test('the returned type should be LazyQueryAppend', () => {
			expect(new LazyQueryCycle([]).append([])).toBeInstanceOf(LazyQueryAppend);
		});
	});
});

describe('average', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQueryCycle([]).average()).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			// Testing this would cause an infinite loop since there's always a next value
		});
	});
	describe('(transform: Transform<T, number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQueryCycle([]).average(() => 1)).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			// Testing this would cause an infinite loop since there's always a next value
		});
	});
});

describe('concat', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U>', () => {
		test('an empty collection should result in an empty collection', () => {
			expect([...new LazyQueryCycle([]).concat()]).toEqual([]);
		});
		test('should flatten the collection', () => {
			expect(take(new LazyQueryCycle([[1, 2], [3, 4, 5]]).concat(), 7)).toEqual([
				1,
				2,
				3,
				4,
				5,
				1,
				2
			]);
			expect(take(new LazyQueryCycle([[1, 2], [], [3, 4]]).concat(), 7)).toEqual([
				1,
				2,
				3,
				4,
				1,
				2,
				3
			]);
		});
		test('the returned type should be LazyQueryConcat', () => {
			expect(new LazyQueryCycle([[1]]).concat()).toBeInstanceOf(LazyQueryConcat);
		});
	});
});

describe('contains', () => {
	describe('(element: T): boolean', () => {
		test('should check if the collection contains a given value', () => {
			expect(new LazyQueryCycle([1, 2, 3]).contains(2)).toEqual(true);
			// Testing for a collection not containing the item would result an infinite loop
		});
		test('should check if the collection contains a given object by reference', () => {
			const obj = {};
			// Testing for a collection not containing the item would result an infinite loop
			expect(new LazyQueryCycle([{}, obj]).contains(obj)).toEqual(true);
		});
	});
});

describe('count', () => {
	describe('(): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQueryCycle([]).count()).toEqual(0);
			// Testing a collection with any items would cause an infinite loop
		});
	});
	describe('(predicate: Predicate<T>): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQueryCycle([]).count(isEven)).toEqual(0);
			// Testing a collection with any items would cause an infinite loop
		});
	});
});

describe('cycle', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should terminate when it encounters an empty collection', () => {
			expect([...new LazyQueryCycle([]).cycle()]).toEqual([]);
		});
		test('should cycle the collection so the elements repeat after the end of the collection', () => {
			expect(take(new LazyQueryCycle([1, 2]).cycle(), 5)).toEqual([1, 2, 1, 2, 1]);
		});
		test('the returned type should be LazyQueryCycle', () => {
			expect(new LazyQueryCycle([1]).cycle()).toBeInstanceOf(LazyQueryCycle);
		});
	});
});

describe('drop', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should drop the first n number of elements from the collection', () => {
			expect(take(new LazyQueryCycle([1, 5, 3]).drop(0), 5)).toEqual([1, 5, 3, 1, 5]);
			expect(take(new LazyQueryCycle([1, 5, 3]).drop(1), 5)).toEqual([5, 3, 1, 5, 3]);
			expect(take(new LazyQueryCycle([1, 5, 3]).drop(2), 5)).toEqual([3, 1, 5, 3, 1]);
			expect(take(new LazyQueryCycle([1, 5, 3]).drop(3), 5)).toEqual([1, 5, 3, 1, 5]);
			expect(take(new LazyQueryCycle([1, 5, 3]).drop(4), 5)).toEqual([5, 3, 1, 5, 3]);
		});
		test('the returned type should be LazyQueryDrop', () => {
			expect(new LazyQueryCycle([1]).drop(0)).toBeInstanceOf(LazyQueryDrop);
		});
	});
});

describe('dropWhile', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should return an empty collection if all the elements of the collection pass the given predicate', () => {
			// Testing this would result in an infinite loop
		});
		test('should drop the set of elements at the beginning of the collection that pass the given predicate', () => {
			expect(take(new LazyQueryCycle([1, 2, 3]).dropWhile(isOdd), 5)).toEqual([2, 3, 1, 2, 3]);
			expect(take(new LazyQueryCycle([1, 5, 2]).dropWhile(isOdd), 5)).toEqual([2, 1, 5, 2, 1]);
			expect(take(new LazyQueryCycle([1, 5, 3]).dropWhile(isEven), 5)).toEqual([1, 5, 3, 1, 5]);
		});
		test('the returned type should be LazyQueryDropWhile', () => {
			expect(new LazyQueryCycle([1]).dropWhile(isEven)).toBeInstanceOf(LazyQueryDropWhile);
		});
	});
});

describe('exec', () => {
	describe('(func: Executor<T>): void', () => {
		test('an empty collection should not invoke the callback', () => {
			// Testing this would cause an infinite loop
		});
		test('should invoke the callback for each element in the collection with the current element as an argument', () => {
			// Testing this would cause an infinite loop
		});
	});
});

describe('filter', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should remove any elements from the collection that do not pass the given predicate', () => {
			// Testing this would cause an infinite loop
		});
		test('the returned type should be LazyQueryFiltered', () => {
			expect(new LazyQueryCycle([1]).filter(isEven)).toBeInstanceOf(LazyQueryFiltered);
		});
	});
	describe('<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U>', () => {
		test('should remove any elements from the collection that do not pass the given predicate', () => {
			// Testing this would cause an infinite loop
		});
		test('the returned type should be LazyQueryFiltered', () => {
			expect(new LazyQueryCycle([1]).filter(isNumber)).toBeInstanceOf(LazyQueryFiltered);
		});
	});
});

describe('find', () => {
	describe('find(predicate: Predicate<T>): T | undefined', () => {
		test('should return the first element that passes a given predicate', () => {
			expect(new LazyQueryCycle([1, 2, 3]).find(isEven)).toEqual(2);
			expect(new LazyQueryCycle([1, 2, 3]).find(isOdd)).toEqual(1);
		});
		test('should return undefined if no elements in the collection pass the predicate', () => {
			// Testing this would cause an infinite loop
		});
	});
});

describe('first', () => {
	describe('(): T | undefined', () => {
		test('should return the first element in the collection', () => {
			expect(new LazyQueryCycle([1, 2, 3]).first()).toEqual(1);
			expect(new LazyQueryCycle([3, 1, 2]).first()).toEqual(3);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryCycle([]).first()).toBeUndefined();
		});
	});
});

describe('get', () => {
	describe('(index: number): T | undefined', () => {
		test("should return the element at the n'th position in the collection", () => {
			expect(new LazyQueryCycle([1, 2, 3]).get(0)).toEqual(1);
			expect(new LazyQueryCycle([1, 3, 2]).get(1)).toEqual(3);
			expect(new LazyQueryCycle([1, 2, 3]).get(1)).toEqual(2);
			expect(new LazyQueryCycle([1, 2, 3]).get(4)).toEqual(2);
		});
		test('should return undefined if the index is out of bounds', () => {
			expect(new LazyQueryCycle([1, 2, 3]).get(-1)).toBeUndefined();
		});
	});
});

describe('intersperse', () => {
	describe('<U>(element: U): ILazyQuery<T | U>', () => {
		test('should intersperce the given element between all elements in the collection', () => {
			expect(take(new LazyQueryCycle([1, 2, 3]).intersperse(0), 9)).toEqual([
				1,
				0,
				2,
				0,
				3,
				0,
				1,
				0,
				2
			]);
			expect(take(new LazyQueryCycle([1, 3]).intersperse(2), 7)).toEqual([1, 2, 3, 2, 1, 2, 3]);
		});
		test('if the collection has less than two elements it should not change', () => {
			// Testing this would cause an infinite loop
		});
		test('the returned type should be LazyQueryIntersperce', () => {
			expect(new LazyQueryCycle([1]).intersperse(0)).toBeInstanceOf(LazyQueryIntersperce);
		});
	});
});

describe('isEmpty', () => {
	describe('(): boolean', () => {
		test('should return true if the collection is empty', () => {
			expect(new LazyQueryCycle([]).isEmpty()).toEqual(true);
		});
		test('should return false if the collection is not empty', () => {
			expect(new LazyQueryCycle([0]).isEmpty()).toEqual(false);
			expect(new LazyQueryCycle([1, 2]).isEmpty()).toEqual(false);
		});
	});
});

describe('iterate', () => {
	describe('(func: (value: T) => T): ILazyQuery<T>', () => {
		test('should apply the given function to the current element of the collection and let that value be the next value in the collection', () => {
			expect(take(new LazyQueryCycle([1, 2]).iterate(add(2)), 5)).toEqual([1, 3, 5, 7, 9]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle(<number[]>[]).iterate(add(1))]).toEqual([]);
		});
		test('the returned type should be LazyQueryIterate', () => {
			expect(new LazyQueryCycle([1]).iterate(add(1))).toBeInstanceOf(LazyQueryIterate);
		});
	});
});

describe('last', () => {
	describe('(): T | undefined', () => {
		test('should return the last element of the collection', () => {
			// Testing this would cause an infinite loop
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryCycle([]).last()).toBeUndefined();
		});
	});
});

describe('map', () => {
	describe('<U>(transform: Transform<T, U>): ILazyQuery<U>', () => {
		test('should apply the given function to each element in the collection', () => {
			expect(take(new LazyQueryCycle([1, 2, 3]).map(add(2)), 5)).toEqual([3, 4, 5, 3, 4]);
			expect(take(new LazyQueryCycle([1, 2, 3]).map(add(1)), 5)).toEqual([2, 3, 4, 2, 3]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).map(add(1))]).toEqual([]);
		});
		test('the returned type should be LazyQueryMapped', () => {
			expect(new LazyQueryCycle([1]).map(add(1))).toBeInstanceOf(LazyQueryMapped);
		});
	});
});

describe('max', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the largest element in the collection', () => {
			// Testing this would cause an infinite loop
		});
		test('should return -Infinity if the collection is empty', () => {
			expect(new LazyQueryCycle([]).max()).toEqual(-Infinity);
		});
	});
});

describe('memoize', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should memoize the collection', () => {
			const mockIterationNextCallback = jest
				.fn()
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: undefined, done: true };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: undefined, done: true };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: undefined, done: true };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementation(() => {
					return { value: undefined, done: true };
				});
			const mockCollection = {
				[Symbol.iterator]: () => {
					return {
						next: mockIterationNextCallback
					};
				}
			};
			const collection = new LazyQueryCycle(mockCollection).memoize();
			const collectionResultA = take(collection, 3);
			const collectionResultB = take(collection, 3);
			expect(collectionResultA).toEqual([1, 1, 1]);
			expect(collectionResultB).toEqual([1, 1, 1]);
			expect(mockIterationNextCallback.mock.calls).toEqual([[], [], [], [], [], [], []]);
		});
		test('the returned type should be LazyQueryMemoize', () => {
			expect(new LazyQueryCycle([]).memoize()).toBeInstanceOf(LazyQueryMemoize);
		});
	});
});

describe('min', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the smallest element in the collection', () => {
			// Testing this would cause an infinite loop
		});
		test('should return Infinity if the collection is empty', () => {
			expect(new LazyQueryCycle([]).min()).toEqual(Infinity);
		});
	});
});

describe('onlyMemoized', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should call the source iterator with the parameter true', () => {
			const mockIterationNextCallback = jest
				.fn()
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: undefined, done: true };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: undefined, done: true };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: undefined, done: true };
				})
				.mockImplementation(() => {
					return { value: 0, done: true };
				});
			const mockIterator = jest.fn(() => {
				return { next: mockIterationNextCallback };
			});
			const mockCollection = {
				[Symbol.iterator]: mockIterator
			};
			expect(take(new LazyQueryCycle(mockCollection).onlyMemoized(), 2)).toEqual([1, 1]);
			expect(mockIterator.mock.calls).toEqual([[true], [true], [true]]);
		});
		test('the returned type should be LazyQueryOnlyMemoized', () => {
			expect(new LazyQueryCycle([]).onlyMemoized()).toBeInstanceOf(LazyQueryOnlyMemoized);
		});
	});
});

describe('or', () => {
	describe('(): boolean', () => {
		test('a collection where every element is falsy should return false', () => {
			// Testing this would cause an infinite loop
		});
		test('a collection where any element is truthy should return true', () => {
			expect(new LazyQueryCycle([0, true]).or()).toEqual(true);
			expect(new LazyQueryCycle([1, false]).or()).toEqual(true);
		});
		test('a collection with no elements should return false', () => {
			expect(new LazyQueryCycle([]).or()).toEqual(false);
		});
	});
});

describe('permutations', () => {
	describe('(): ILazyQuery<T[]>', () => {
		test('should return the set of all possible permutations of the collection', () => {
			// Testing this would cause an infinite loop
		});
		test('an empty collection should return a collection containing an empty collection', () => {
			expect([...new LazyQueryCycle([]).permutations()]).toEqual([[]]);
		});
		test('the returned type should be LazyQueryPermutations', () => {
			expect(new LazyQueryCycle([]).permutations()).toBeInstanceOf(LazyQueryPermutations);
		});
	});
});

describe('prepend', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('adds a collection to the start of the collection', () => {
			expect(take(new LazyQueryCycle([1, 2]).prepend([0]), 5)).toEqual([0, 1, 2, 1, 2]);
			expect(take(new LazyQueryCycle([1, 2]).prepend([0, 3]), 7)).toEqual([0, 3, 1, 2, 1, 2, 1]);
			expect(take(new LazyQueryCycle([1, 2]).prepend([]), 3)).toEqual([1, 2, 1]);
			expect(take(new LazyQueryCycle([]).prepend([]), 1)).toEqual([]);
		});
		test('the returned type should be LazyQueryPrepend', () => {
			expect(new LazyQueryCycle([]).prepend([])).toBeInstanceOf(LazyQueryPrepend);
		});
	});
});

describe('product', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the product of the collection', () => {
			// Testing this would cause an infinite loop
		});
	});
});

describe('reduce', () => {
	describe('(func: Accumulator<T, T>): T | undefined', () => {
		test('should return the result of applying a given accumualtor function to the running result and each element', () => {
			// Testing this would cause an infinite loop
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryCycle(<number[]>[]).reduce(add(1))).toBeUndefined();
		});
	});
	describe('<U>(func: Accumulator<T, U>, initial: U): U', () => {
		test('should return the result of applying a given accumualtor function to the running result and each element, with the running result starting off being the value of the initial parameter', () => {
			// Testing this would cause an infinite loop
		});
		test('should return the initial value if the collection is empty', () => {
			expect(new LazyQueryCycle([]).reduce(add(1), 2)).toEqual(2);
		});
	});
});

describe('reverse', () => {
	describe('(): ILazyQuery<T>', () => {
		test('reverses the order of the elements in the collection', () => {
			// Testing this would cause an infinite loop
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).reverse()]).toEqual([]);
		});
		test('the returned type should be LazyQuery', () => {
			expect(new LazyQueryCycle([]).reverse()).toBeInstanceOf(LazyQuery);
		});
	});
});

describe('sort', () => {
	describe('(comparator: Comparator<T>): ILazyQuery<T>', () => {
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).sort((a, b) => a - b)]).toEqual([]);
		});
		test('should sort the collection based on the given comparator function', () => {
			// Testing this would cause an infinite loop
		});
		test('the returned type should be LazyQuery', () => {
			expect(new LazyQueryCycle([]).sort((a, b) => b - a)).toBeInstanceOf(LazyQuery);
		});
	});
});

describe('subsequences', () => {
	describe('(): ILazyQuery<T[]>', () => {
		test('should return a collection containing an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).subsequences()]).toEqual([[]]);
		});
		test('should return a collection containing all the subsequences of the collection', () => {
			// Testing this would cause an infinite loop (it may be possible to fix this by changing the way subsequences iterator works)
		});
		test('the returned type should be LazyQuerySubsequences', () => {
			expect(new LazyQueryCycle([]).subsequences()).toBeInstanceOf(LazyQuerySubsequences);
		});
	});
});

describe('sum', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('returns the sum of adding all the elements in the collection', () => {
			// Testing this would cause an infinite loop
		});
		test('should return 0 if the collection is empty', () => {
			expect(new LazyQueryCycle([]).sum()).toEqual(0);
		});
	});
});

describe('take', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should return a collection containing the first n elements in the collection', () => {
			expect([...new LazyQueryCycle([1, 2, 3]).take(1)]).toEqual([1]);
			expect([...new LazyQueryCycle([2, 1, 3]).take(1)]).toEqual([2]);
			expect([...new LazyQueryCycle([2, 1, 3]).take(2)]).toEqual([2, 1]);
			expect([...new LazyQueryCycle([1, 2, 3]).take(5)]).toEqual([1, 2, 3, 1, 2]);
		});
		test('the returned type should be LazyQueryTake', () => {
			expect(new LazyQueryCycle([]).take(1)).toBeInstanceOf(LazyQueryTake);
		});
	});
});

describe('takeWhile', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should return a collection containing the first elements in the collection that pass a given predicate', () => {
			expect([...new LazyQueryCycle([]).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryCycle([]).takeWhile(isEven)]).toEqual([]);
			expect(take(new LazyQueryCycle([1]).takeWhile(isOdd), 5)).toEqual([1, 1, 1, 1, 1]);
			expect([...new LazyQueryCycle([1]).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryCycle([1, 2, 3]).takeWhile(isOdd)]).toEqual([1]);
			expect([...new LazyQueryCycle([2, 1, 3]).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryCycle([2, 1, 3]).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryCycle([1, 3, 2]).takeWhile(isOdd)]).toEqual([1, 3]);
			expect([...new LazyQueryCycle([1, 2, 3]).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryCycle([2, 1, 3]).takeWhile(isEven)]).toEqual([2]);
			expect([...new LazyQueryCycle([2, 1, 3]).takeWhile(isEven)]).toEqual([2]);
			expect([...new LazyQueryCycle([4, 2, 3]).takeWhile(isEven)]).toEqual([4, 2]);
		});
		test('the returned type should be LazyQueryTakeWhile', () => {
			expect(new LazyQueryCycle([]).takeWhile(isEven)).toBeInstanceOf(LazyQueryTakeWhile);
		});
	});
});

describe('toArray', () => {
	describe('(): T[]', () => {
		test('should return an array containing all the elements in the collection', () => {
			expect(new LazyQueryCycle([]).toArray()).toEqual([]);
			// Testing any other case would cause an infinite loop
		});
	});
});

describe('toString', () => {
	describe('(): string', () => {
		test('should concatnate the elements in the collection to a string', () => {
			// Testing this would cause an infinite loop
		});
	});
});

describe('transpose', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<Iterable<U>>', () => {
		test('should transpose the collection so the first element in each array become elements in the first element and the elements in the first element become the first element in each element', () => {
			// Testing this would cause an infinite loop
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).transpose()]).toEqual([]);
		});
		test('the returned type should be LazyQueryTranspose', () => {
			expect(new LazyQueryCycle([]).transpose()).toBeInstanceOf(LazyQueryTranspose);
		});
	});
});

describe('unique', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should return a collection containing only the first instance of each value', () => {
			expect(take(new LazyQueryCycle([1, 2, 1, 3]).unique(), 2)).toEqual([1, 2]);
			expect(take(new LazyQueryCycle([1, 1, 1, 3]).unique(), 1)).toEqual([1]);
			expect(take(new LazyQueryCycle([1, 2, 4, 3]).unique(), 3)).toEqual([1, 2, 4]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).unique()]).toEqual([]);
		});
		test('the returned type should be LazyQueryUnique', () => {
			expect(new LazyQueryCycle([]).unique()).toBeInstanceOf(LazyQueryUnique);
		});
	});
	describe('(equals: Equals<T>): ILazyQuery<T>', () => {
		test('should return a collection containing only the first instance of each value', () => {
			expect(take(new LazyQueryCycle([1, 2, 1, 3]).unique((a, b) => a === b), 2)).toEqual([1, 2]);
			expect(take(new LazyQueryCycle([1, 1, 1, 3]).unique((a, b) => a === b), 1)).toEqual([1]);
			expect(take(new LazyQueryCycle([1, 2, 4, 3]).unique((a, b) => a === b), 3)).toEqual([
				1,
				2,
				4
			]);
			expect(
				take(
					new LazyQueryCycle([{ value: 1 }, { value: 2 }, { value: 1 }]).unique(
						(a, b) => a.value === b.value
					),
					1
				)
			).toEqual([{ value: 1 }]);
			expect(
				take(
					new LazyQueryCycle([{ value: 1 }, { value: 2 }, { value: 3 }]).unique(
						(a, b) => a.value === b.value
					),
					2
				)
			).toEqual([{ value: 1 }, { value: 2 }]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryCycle([]).unique((a, b) => a === b)]).toEqual([]);
			expect([
				...new LazyQueryCycle<{ value: number }>([]).unique((a, b) => a.value === b.value)
			]).toEqual([]);
		});
		test('the returned type should be LazyQueryUnique', () => {
			expect(new LazyQueryCycle([]).unique((a, b) => a === b)).toBeInstanceOf(LazyQueryUnique);
		});
	});
});

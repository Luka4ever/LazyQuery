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

function isNullOrUndefined<T>(value: T | null | undefined): value is T {
	return value === null || value === undefined;
}

function add(a: number): (b: number) => number {
	return (b: number) => a + b;
}

function isEmpty(array: any[]): boolean {
	return array.length === 0;
}

function isNotEmpty(array: any[]): boolean {
	return array.length !== 0;
}

describe('all', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQueryDropWhile([1, 3], isOdd).all(isEven)).toEqual(true);
			expect(new LazyQueryDropWhile([2, 4], isEven).all(isOdd)).toEqual(true);
		});
		test('a collection where all its elements pass the given predicate should return true', () => {
			expect(new LazyQueryDropWhile([1, 3, 0, 4], isOdd).all(isEven)).toEqual(true);
			expect(new LazyQueryDropWhile([2, 1, 3, 5], isEven).all(isOdd)).toEqual(true);
		});
		test("a collection where any of its elements don't pass the given predicate should return false", () => {
			expect(new LazyQueryDropWhile([0, 1, 2], isEven).all(isEven)).toEqual(false);
			expect(new LazyQueryDropWhile([1, 1, 2, 1], isOdd).all(isOdd)).toEqual(false);
		});
	});
});

describe('and', () => {
	describe('(): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQueryDropWhile([1], isOdd).and()).toEqual(true);
		});
		test('a collection where every element is truthy should return true', () => {
			expect(new LazyQueryDropWhile([1, true, 1], isNumber).and()).toEqual(true);
		});
		test('a collection where any element is falsy should return false', () => {
			expect(new LazyQueryDropWhile([1, true, 1, 0], isNumber).and()).toEqual(false);
		});
	});
});

describe('any', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return false', () => {
			expect(new LazyQueryDropWhile([1], isOdd).any(isEven)).toEqual(false);
			expect(new LazyQueryDropWhile([3], isOdd).any(isOdd)).toEqual(false);
		});
		test('a collection where any element passes the given predicate should return true', () => {
			expect(new LazyQueryDropWhile([1, 0, 1], isOdd).any(isEven)).toEqual(true);
			expect(new LazyQueryDropWhile([3, 0, 1], isOdd).any(isOdd)).toEqual(true);
		});
		test('a collection where no element passes the given predicate should return false', () => {
			expect(new LazyQueryDropWhile([2, 1, 3], isEven).any(isEven)).toEqual(false);
			expect(new LazyQueryDropWhile([1, 0, 2], isOdd).any(isOdd)).toEqual(false);
		});
	});
});

describe('append', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('the elements of the appended collection should come last', () => {
			expect([...new LazyQueryDropWhile([], isEven).append([])]).toEqual([]);
			expect([...new LazyQueryDropWhile([], isOdd).append([1, 2])]).toEqual([1, 2]);
			expect([...new LazyQueryDropWhile([0, 1, 2], isEven).append([])]).toEqual([1, 2]);
			expect([...new LazyQueryDropWhile([0, 1, 2], isEven).append([3, 4])]).toEqual([1, 2, 3, 4]);
		});
		test('the returned type should be LazyQueryAppend', () => {
			expect(new LazyQueryDropWhile([], isEven).append([])).toBeInstanceOf(LazyQueryAppend);
		});
	});
});

describe('average', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQueryDropWhile([1], isOdd).average()).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			expect(new LazyQueryDropWhile([2, 5], isEven).average()).toEqual(5);
			expect(new LazyQueryDropWhile([2, 1, 5], isEven).average()).toEqual(3);
		});
	});
	describe('(transform: Transform<T, number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQueryDropWhile([], isEven).average(() => 1)).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			expect(new LazyQueryDropWhile([{ value: 4 }, { value: 5 }], v => v.value % 2 === 0).average(v => v.value)).toEqual(5);
			expect(new LazyQueryDropWhile([{ value: 4 }, { value: 1 }, { value: 5 }], v => v.value % 2 === 0).average(v => v.value)).toEqual(3);
		});
	});
});

describe('concat', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U>', () => {
		test('an empty collection should result in an empty collection', () => {
			expect([...new LazyQueryDropWhile([], isEmpty).concat()]).toEqual([]);
		});
		test('should flatten the collection', () => {
			expect([...new LazyQueryDropWhile([[2], [], [1, 2], [3, 4, 5]], isNotEmpty).concat()]).toEqual([1, 2, 3, 4, 5]);
			expect([...new LazyQueryDropWhile([[2], [], [1, 2], [], [3, 4]], isNotEmpty).concat()]).toEqual([1, 2, 3, 4]);
		});
		test('the returned type should be LazyQueryConcat', () => {
			expect(new LazyQueryDropWhile([[1]], isEmpty).concat()).toBeInstanceOf(LazyQueryConcat);
		});
	});
});

describe('contains', () => {
	describe('(element: T): boolean', () => {
		test('should check if the collection contains a given value', () => {
			expect(new LazyQueryDropWhile([4, 1, 2, 3], isEven).contains(2)).toEqual(true);
			expect(new LazyQueryDropWhile([4, 1, 2, 3], isEven).contains(4)).toEqual(false);
		});
		test('should check if the collection contains a given object by reference', () => {
			const obj = {};
			expect(new LazyQueryDropWhile([undefined, {}, {}], isNullOrUndefined).contains(obj)).toEqual(false);
			expect(new LazyQueryDropWhile([undefined, {}, obj], isNullOrUndefined).contains(obj)).toEqual(true);
		});
	});
});

describe('count', () => {
	describe('(): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQueryDropWhile([2], isEven).count()).toEqual(0);
			expect(new LazyQueryDropWhile([2, 4, 1, 2, 3, 5], isEven).count()).toEqual(4);
		});
	});
	describe('(predicate: Predicate<T>): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQueryDropWhile([2], isEven).count(isEven)).toEqual(0);
			expect(new LazyQueryDropWhile([2, 1, 2, 3, 5], isEven).count(isEven)).toEqual(1);
			expect(new LazyQueryDropWhile([2, 1, 2, 3, 5], isEven).count(isOdd)).toEqual(3);
		});
	});
});

describe('cycle', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should terminate when it encounters an empty collection', () => {
			expect([...new LazyQueryDropWhile([1], isOdd).cycle()]).toEqual([]);
		});
		test('should cycle the collection so the elements repeat after the end of the collection', () => {
			const collection = new LazyQueryDropWhile([4, 1, 2], isEven).cycle();
			const result = [];
			const iterator = collection[Symbol.iterator]();
			let value = iterator.next();
			for (let i = 0; i < 5 && !value.done; i++) {
				result.push(value.value);
				value = iterator.next();
			}
			expect(result).toEqual([1, 2, 1, 2, 1]);
		});
		test('the returned type should be LazyQueryCycle', () => {
			expect(new LazyQueryDropWhile([1], isEven).cycle()).toBeInstanceOf(LazyQueryCycle);
		});
	});
});

describe('drop', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should return an empty collection if the number of elements to drop exceeds the length of the collection', () => {
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 3], isEven).drop(5)]).toEqual([]);
		});
		test('should drop the first n number of elements from the collection', () => {
			expect([...new LazyQueryDropWhile([2, 4, 1, 5, 3], isEven).drop(0)]).toEqual([1, 5, 3]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 5, 3], isEven).drop(1)]).toEqual([5, 3]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 5, 3], isEven).drop(2)]).toEqual([3]);
		});
		test('the returned type should be LazyQueryDrop', () => {
			expect(new LazyQueryDropWhile([1], isEven).drop(0)).toBeInstanceOf(LazyQueryDrop);
		});
	});
});

describe('dropWhile', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should return an empty collection if all the elements of the collection pass the given predicate', () => {
			expect([...new LazyQueryDropWhile([2, 4, 1, 3, 5], isEven).dropWhile(isOdd)]).toEqual([]);
		});
		test('should drop the set of elements at the beginning of the collection that pass the given predicate', () => {
			expect([...new LazyQueryDropWhile([2, 1, 2, 3], isEven).dropWhile(isOdd)]).toEqual([2, 3]);
			expect([...new LazyQueryDropWhile([2, 1, 5, 2], isEven).dropWhile(isOdd)]).toEqual([2]);
			expect([...new LazyQueryDropWhile([2, 1, 5, 3], isEven).dropWhile(isEven)]).toEqual([1, 5, 3]);
		});
		test('the returned type should be LazyQueryDropWhile', () => {
			expect(new LazyQueryDropWhile([1], isEven).dropWhile(isEven)).toBeInstanceOf(LazyQueryDropWhile);
		});
	});
});

describe('exec', () => {
	describe('(func: Executor<T>): void', () => {
		test('an empty collection should not invoke the callback', () => {
			const mockCallback = jest.fn();
			new LazyQueryDropWhile([1], isOdd).exec(mockCallback);
			expect(mockCallback.mock.calls).toEqual([]);
		});
		test('should invoke the callback for each element in the collection with the current element as an argument', () => {
			const mockCallback = jest.fn();
			new LazyQueryDropWhile([3, 0, 1], isOdd).exec(mockCallback);
			expect(mockCallback.mock.calls).toEqual([[0], [1]]);
		});
	});
});

describe('filter', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should remove any elements from the collection that do not pass the given predicate', () => {
			expect([...new LazyQueryDropWhile([0, 2, 1, 2, 3], isEven).filter(isEven)]).toEqual([2]);
			expect([...new LazyQueryDropWhile([0, 2, 1, 2, 3], isEven).filter(isOdd)]).toEqual([1, 3]);
		});
		test('the returned type should be LazyQueryFiltered', () => {
			expect(new LazyQueryDropWhile([1], isEven).filter(isEven)).toBeInstanceOf(LazyQueryFiltered);
		});
	});
	describe('<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U>', () => {
		test('should remove any elements from the collection that do not pass the given predicate', () => {
			expect([...new LazyQueryDropWhile([undefined, 1, 2, '3'], isNullOrUndefined).filter(isNumber)]).toEqual([1, 2]);
			expect([...new LazyQueryDropWhile([null, '1', 2, 3], isNullOrUndefined).filter(isNumber)]).toEqual([2, 3]);
		});
		test('the returned type should be LazyQueryFiltered', () => {
			expect(new LazyQueryDropWhile([1], isEven).filter(isNumber)).toBeInstanceOf(LazyQueryFiltered);
		});
	});
});

describe('find', () => {
	describe('find(predicate: Predicate<T>): T | undefined', () => {
		test('should return the first element that passes a given predicate', () => {
			expect(new LazyQueryDropWhile([0, 2, 1, 2, 3], isEven).find(isEven)).toEqual(2);
			expect(new LazyQueryDropWhile([0, 2, 1, 2, 3], isEven).find(isOdd)).toEqual(1);
		});
		test('should return undefined if no elements in the collection pass the predicate', () => {
			expect(new LazyQueryDropWhile([2, 1, 3, 5], isEven).find(isEven)).toBeUndefined();
		});
	});
});

describe('first', () => {
	describe('(): T | undefined', () => {
		test('should return the first element in the collection', () => {
			expect(new LazyQueryDropWhile([2, 0, 1, 2, 3], isEven).first()).toEqual(1);
			expect(new LazyQueryDropWhile([2, 0, 3, 1, 2], isEven).first()).toEqual(3);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryDropWhile([1], isOdd).first()).toBeUndefined();
		});
	});
});

describe('get', () => {
	describe('(index: number): T | undefined', () => {
		test("should return the element at the n'th position in the collection", () => {
			expect(new LazyQueryDropWhile([0, 1, 2, 3], isEven).get(0)).toEqual(1);
			expect(new LazyQueryDropWhile([6, 2, 1, 3, 2], isEven).get(1)).toEqual(3);
			expect(new LazyQueryDropWhile([6, 2, 1, 2, 3], isEven).get(1)).toEqual(2);
		});
		test('should return undefined if the index is out of bounds', () => {
			expect(new LazyQueryDropWhile([2, 0, 1, 2, 3], isEven).get(4)).toBeUndefined();
			expect(new LazyQueryDropWhile([2, 1, 2, 3], isEven).get(-1)).toBeUndefined();
		});
	});
});

describe('intersperse', () => {
	describe('<U>(element: U): ILazyQuery<T | U>', () => {
		test('should intersperce the given element between all elements in the collection', () => {
			expect([...new LazyQueryDropWhile([2, 1, 2, 3], isEven).intersperse(0)]).toEqual([1, 0, 2, 0, 3]);
			expect([...new LazyQueryDropWhile([2, 1, 3], isEven).intersperse(2)]).toEqual([1, 2, 3]);
		});
		test('if the collection has less than two elements it should not change', () => {
			expect([...new LazyQueryDropWhile([2, 0], isEven).intersperse(0)]).toEqual([]);
			expect([...new LazyQueryDropWhile([4, 1], isEven).intersperse(0)]).toEqual([1]);
		});
		test('the returned type should be LazyQueryIntersperce', () => {
			expect(new LazyQueryDropWhile([1], isEven).intersperse(0)).toBeInstanceOf(LazyQueryIntersperce);
		});
	});
});

describe('isEmpty', () => {
	describe('(): boolean', () => {
		test('should return true if the collection is empty', () => {
			expect(new LazyQueryDropWhile([1], isOdd).isEmpty()).toEqual(true);
		});
		test('should return false if the collection is not empty', () => {
			expect(new LazyQueryDropWhile([3, 0], isOdd).isEmpty()).toEqual(false);
			expect(new LazyQueryDropWhile([4, 1, 2], isEven).isEmpty()).toEqual(false);
		});
	});
});

describe('iterate', () => {
	describe('(func: (value: T) => T): ILazyQuery<T>', () => {
		test('should apply the given function to the current element of the collection and let that value be the next value in the collection', () => {
			const collection = new LazyQueryDropWhile([4, 1, 2], isEven).iterate(add(2));
			const result = [];
			const iterator = collection[Symbol.iterator]();
			let value = iterator.next();
			for (let i = 0; i < 5 && !value.done; i++) {
				result.push(value.value);
				value = iterator.next();
			}
			expect(result).toEqual([1, 3, 5, 7, 9]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([2], isEven).iterate(add(1))]).toEqual([]);
		});
		test('the returned type should be LazyQueryIterate', () => {
			expect(new LazyQueryDropWhile([1], isEven).iterate(add(1))).toBeInstanceOf(LazyQueryIterate);
		});
	});
});

describe('last', () => {
	describe('(): T | undefined', () => {
		test('should return the last element of the collection', () => {
			expect(new LazyQueryDropWhile([4, 2, 1, 2, 3], isEven).last()).toEqual(3);
			expect(new LazyQueryDropWhile([4, 2, 1, 3, 2], isEven).last()).toEqual(2);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryDropWhile([2], isEven).last()).toBeUndefined();
		});
	});
});

describe('map', () => {
	describe('<U>(transform: Transform<T, U>): ILazyQuery<U>', () => {
		test('should apply the given function to each element in the collection', () => {
			expect([...new LazyQueryDropWhile([4, 1, 2, 3], isEven).map(add(2))]).toEqual([3, 4, 5]);
			expect([...new LazyQueryDropWhile([4, 1, 2, 3], isEven).map(add(1))]).toEqual([2, 3, 4]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([3], isOdd).map(add(1))]).toEqual([]);
		});
		test('the returned type should be LazyQueryMapped', () => {
			expect(new LazyQueryDropWhile([1], isEven).map(add(1))).toBeInstanceOf(LazyQueryMapped);
		});
	});
});

describe('max', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the largest element in the collection', () => {
			expect(new LazyQueryDropWhile([6, 1, 3, 2], isEven).max()).toEqual(3);
			expect(new LazyQueryDropWhile([6, 1, 2, 4], isEven).max()).toEqual(4);
		});
		test('should return -Infinity if the collection is empty', () => {
			expect(new LazyQueryDropWhile([3], isOdd).max()).toEqual(-Infinity);
		});
	});
});

describe('memoize', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should memoize the collection', () => {
			const mockIterationNextCallback = jest
				.fn()
				.mockImplementationOnce(() => {
					return { value: 0, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
				})
				.mockImplementation(() => {
					return { value: 0, done: true };
				});
			const mockCollection = {
				[Symbol.iterator]: () => {
					return {
						next: mockIterationNextCallback
					};
				}
			};
			const collection = new LazyQueryDropWhile(mockCollection, isEven).memoize();
			const collectionResultA = [...collection];
			const collectionResultB = [...collection];
			expect(collectionResultA).toEqual([1]);
			expect(collectionResultB).toEqual([1]);
			expect(mockIterationNextCallback.mock.calls).toEqual([[], [], []]);
		});
		test('the returned type should be LazyQueryMemoize', () => {
			expect(new LazyQueryDropWhile([], isEven).memoize()).toBeInstanceOf(LazyQueryMemoize);
		});
	});
});

describe('min', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the smallest element in the collection', () => {
			expect(new LazyQueryDropWhile([0, 6, 1, 3, 2], isEven).min()).toEqual(1);
			expect(new LazyQueryDropWhile([0, 6, 3, 2, 4], isEven).min()).toEqual(2);
		});
		test('should return Infinity if the collection is empty', () => {
			expect(new LazyQueryDropWhile([2], isEven).min()).toEqual(Infinity);
		});
	});
});

describe('onlyMemoized', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should call the source iterator with the parameter true', () => {
			const mockIterationNextCallback = jest
				.fn()
				.mockImplementationOnce(() => {
					return { value: 0, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: 1, done: false };
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
			expect([...new LazyQueryDropWhile(mockCollection, isEven).onlyMemoized()]).toEqual([1]);
			expect(mockIterator.mock.calls).toEqual([[true]]);
		});
		test('the returned type should be LazyQueryOnlyMemoized', () => {
			expect(new LazyQueryDropWhile([], isOdd).onlyMemoized()).toBeInstanceOf(LazyQueryOnlyMemoized);
		});
	});
});

describe('or', () => {
	describe('(): boolean', () => {
		test('a collection where every element is falsy should return false', () => {
			expect(new LazyQueryDropWhile([undefined, 0, false], isNullOrUndefined).or()).toEqual(false);
		});
		test('a collection where any element is truthy should return true', () => {
			expect(new LazyQueryDropWhile([undefined, 0, true], isNullOrUndefined).or()).toEqual(true);
			expect(new LazyQueryDropWhile([undefined, 1, false], isNullOrUndefined).or()).toEqual(true);
		});
		test('a collection with no elements should return false', () => {
			expect(new LazyQueryDropWhile([], isEven).or()).toEqual(false);
		});
	});
});

describe('permutations', () => {
	describe('(): ILazyQuery<T[]>', () => {
		test('should return the set of all possible permutations of the collection', () => {
			expect([...new LazyQueryDropWhile([0, 1, 2, 3], isEven).permutations()]).toEqual([
				[1, 2, 3],
				[2, 1, 3],
				[3, 1, 2],
				[1, 3, 2],
				[2, 3, 1],
				[3, 2, 1]
			]);
			expect([...new LazyQueryDropWhile([4, 3, 1], isEven).permutations()]).toEqual([[3, 1], [1, 3]]);
		});
		test('an empty collection should return a collection containing an empty collection', () => {
			expect([...new LazyQueryDropWhile([1, 3], isOdd).permutations()]).toEqual([[]]);
		});
		test('the returned type should be LazyQueryPermutations', () => {
			expect(new LazyQueryDropWhile([], isOdd).permutations()).toBeInstanceOf(LazyQueryPermutations);
		});
	});
});

describe('prepend', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('adds a collection to the start of the collection', () => {
			expect([...new LazyQueryDropWhile([4, 1, 2], isEven).prepend([0])]).toEqual([0, 1, 2]);
			expect([...new LazyQueryDropWhile([4, 1, 2], isEven).prepend([0, 3])]).toEqual([0, 3, 1, 2]);
			expect([...new LazyQueryDropWhile([4, 1, 2], isEven).prepend([])]).toEqual([1, 2]);
			expect([...new LazyQueryDropWhile([3, 5], isOdd).prepend([])]).toEqual([]);
		});
		test('the returned type should be LazyQueryPrepend', () => {
			expect(new LazyQueryDropWhile([], isOdd).prepend([])).toBeInstanceOf(LazyQueryPrepend);
		});
	});
});

describe('product', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the product of the collection', () => {
			expect(new LazyQueryDropWhile([5, 2, 3], isOdd).product()).toEqual(6);
			expect(new LazyQueryDropWhile([2, 6, 3, 3], isEven).product()).toEqual(9);
			expect(new LazyQueryDropWhile([2, 6, 3, 4], isEven).product()).toEqual(12);
			expect(new LazyQueryDropWhile([2, 3, 4, 2], isEven).product()).toEqual(24);
			expect(new LazyQueryDropWhile([2, 3, 4, 0], isEven).product()).toEqual(0);
		});
	});
});

describe('reduce', () => {
	describe('(func: Accumulator<T, T>): T | undefined', () => {
		test('should return the result of applying a given accumualtor function to the running result and each element', () => {
			expect(new LazyQueryDropWhile([4, 3], isEven).reduce((a, b) => a + b)).toEqual(3);
			expect(new LazyQueryDropWhile([4, 1, 2, 3], isEven).reduce((a, b) => a + b)).toEqual(6);
			expect(new LazyQueryDropWhile([4, 1, 3, 3], isEven).reduce((a, b) => a + b)).toEqual(7);
			expect(new LazyQueryDropWhile([4, 1, 3, 3], isEven).reduce((a, b) => a * b)).toEqual(9);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryDropWhile([2], isEven).reduce(add(1))).toBeUndefined();
		});
	});
	describe('<U>(func: Accumulator<T, U>, initial: U): U', () => {
		test('should return the result of applying a given accumualtor function to the running result and each element, with the running result starting off being the value of the initial parameter', () => {
			expect(new LazyQueryDropWhile([4, 6, 1, 2, 3], isEven).reduce((a, b) => a + b, 1)).toEqual(7);
			expect(new LazyQueryDropWhile([4, 1, 3, 3], isEven).reduce((a, b) => a + b, 1)).toEqual(8);
			expect(new LazyQueryDropWhile([4, 6, 1, 3, 3], isEven).reduce((a, b) => a * b, 1)).toEqual(9);
		});
		test('should return the initial value if the collection is empty', () => {
			expect(new LazyQueryDropWhile([5], isOdd).reduce(add(1), 2)).toEqual(2);
		});
	});
});

describe('reverse', () => {
	describe('(): ILazyQuery<T>', () => {
		test('reverses the order of the elements in the collection', () => {
			expect([...new LazyQueryDropWhile([2, 6, 1, 2, 3], isEven).reverse()]).toEqual([3, 2, 1]);
			expect([...new LazyQueryDropWhile([3, 4, 2, 3], isOdd).reverse()]).toEqual([3, 2, 4]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([3], isOdd).reverse()]).toEqual([]);
		});
		test('the returned type should be LazyQuery', () => {
			expect(new LazyQueryDropWhile([], isOdd).reverse()).toBeInstanceOf(LazyQuery);
		});
	});
});

describe('sort', () => {
	describe('(comparator: Comparator<T>): ILazyQuery<T>', () => {
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([3], isOdd).sort((a, b) => a - b)]).toEqual([]);
		});
		test('should sort the collection based on the given comparator function', () => {
			expect([...new LazyQueryDropWhile([2, 4, 5, 1, 2, 1, 4], isEven).sort((a, b) => a - b)]).toEqual([1, 1, 2, 4, 5]);
			expect([...new LazyQueryDropWhile([2, 6, 8, 5, 1, 2, 1, 4], isEven).sort((a, b) => b - a)]).toEqual([5, 4, 2, 1, 1]);
			expect([...new LazyQueryDropWhile([2, 6, 8, 5, 3, 2, 1, 4], isEven).sort((a, b) => a - b)]).toEqual([1, 2, 3, 4, 5]);
			expect([...new LazyQueryDropWhile([2, 6, 8, 5, 3, 2, 1, 4], isEven).sort((a, b) => b - a)]).toEqual([5, 4, 3, 2, 1]);
		});
		test('the returned type should be LazyQuery', () => {
			expect(new LazyQueryDropWhile([], isEven).sort((a, b) => b - a)).toBeInstanceOf(LazyQuery);
		});
	});
});

describe('subsequences', () => {
	describe('(): ILazyQuery<T[]>', () => {
		test('should return a collection containing an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([1], isOdd).subsequences()]).toEqual([[]]);
		});
		test('should return a collection containing all the subsequences of the collection', () => {
			expect([...new LazyQueryDropWhile([4, 2, 1, 2, 3], isEven).subsequences()]).toEqual([
				[],
				[1],
				[2],
				[1, 2],
				[3],
				[1, 3],
				[2, 3],
				[1, 2, 3]
			]);
			expect([...new LazyQueryDropWhile([0, 1, 2, 4], isEven).subsequences()]).toEqual([
				[],
				[1],
				[2],
				[1, 2],
				[4],
				[1, 4],
				[2, 4],
				[1, 2, 4]
			]);
			expect([...new LazyQueryDropWhile([3, 5, 2, 2, 3, 4], isOdd).subsequences()]).toEqual([
				[],
				[2],
				[2],
				[2, 2],
				[3],
				[2, 3],
				[2, 3],
				[2, 2, 3],
				[4],
				[2, 4],
				[2, 4],
				[3, 4],
				[2, 2, 4],
				[2, 3, 4],
				[2, 3, 4],
				[2, 2, 3, 4]
			]);
		});
		test('the returned type should be LazyQuerySubsequences', () => {
			expect(new LazyQueryDropWhile([], isOdd).subsequences()).toBeInstanceOf(LazyQuerySubsequences);
		});
	});
});

describe('sum', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('returns the sum of adding all the elements in the collection', () => {
			expect(new LazyQueryDropWhile([3, 2], isOdd).sum()).toEqual(2);
			expect(new LazyQueryDropWhile([2, 4, 1, 2, 3], isEven).sum()).toEqual(6);
			expect(new LazyQueryDropWhile([2, 4, 1, 2, 3], isEven).sum()).toEqual(6);
			expect(new LazyQueryDropWhile([3, 2, 2, 4], isOdd).sum()).toEqual(8);
			expect(new LazyQueryDropWhile([3, 2, 2, 4, 5], isOdd).sum()).toEqual(13);
		});
		test('should return 0 if the collection is empty', () => {
			expect(new LazyQueryDropWhile([3], isOdd).sum()).toEqual(0);
		});
	});
});

describe('take', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should return a collection containing the first n elements in the collection', () => {
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 3], isEven).take(1)]).toEqual([1]);
			expect([...new LazyQueryDropWhile([3, 5, 2, 1, 3], isOdd).take(1)]).toEqual([2]);
			expect([...new LazyQueryDropWhile([3, 5, 2, 1, 3], isOdd).take(2)]).toEqual([2, 1]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 3], isEven).take(2)]).toEqual([1, 2]);
		});
		test('should return a collection containing all the elements in the collection if n exceeds the length of the collection', () => {
			expect([...new LazyQueryDropWhile([2, 6, 1, 2, 3], isEven).take(4)]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDropWhile([2, 6, 1, 2, 3], isEven).take(5)]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDropWhile([3, 5, 4, 2, 3], isOdd).take(4)]).toEqual([4, 2, 3]);
			expect([...new LazyQueryDropWhile([3, 5, 4, 2, 3], isOdd).take(5)]).toEqual([4, 2, 3]);
		});
		test('the returned type should be LazyQueryTake', () => {
			expect(new LazyQueryDropWhile([2, 4], isEven).take(1)).toBeInstanceOf(LazyQueryTake);
		});
	});
});

describe('takeWhile', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should return a collection containing the first elements in the collection that pass a given predicate', () => {
			expect([...new LazyQueryDropWhile([2], isEven).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryDropWhile([1], isOdd).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryDropWhile([1], isEven).takeWhile(isOdd)]).toEqual([1]);
			expect([...new LazyQueryDropWhile([1], isEven).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 3], isEven).takeWhile(isOdd)]).toEqual([1]);
			expect([...new LazyQueryDropWhile([1, 3, 2, 1, 3], isOdd).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryDropWhile([1, 3, 2, 1, 3], isOdd).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryDropWhile([2, 6, 1, 3, 2], isEven).takeWhile(isOdd)]).toEqual([1, 3]);
			expect([...new LazyQueryDropWhile([2, 6, 1, 2, 3], isEven).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryDropWhile([3, 5, 2, 1, 3], isOdd).takeWhile(isEven)]).toEqual([2]);
			expect([...new LazyQueryDropWhile([3, 5, 2, 1, 3], isOdd).takeWhile(isEven)]).toEqual([2]);
			expect([...new LazyQueryDropWhile([3, 5, 4, 2, 3], isOdd).takeWhile(isEven)]).toEqual([4, 2]);
		});
		test('the returned type should be LazyQueryTakeWhile', () => {
			expect(new LazyQueryDropWhile([], isOdd).takeWhile(isEven)).toBeInstanceOf(LazyQueryTakeWhile);
		});
	});
});

describe('toArray', () => {
	describe('(): T[]', () => {
		test('should return an array containing all the elements in the collection', () => {
			expect(new LazyQueryDropWhile([4, 2], isEven).toArray()).toEqual([]);
			expect(new LazyQueryDropWhile([2, 1], isEven).toArray()).toEqual([1]);
			expect(new LazyQueryDropWhile([3, 2], isOdd).toArray()).toEqual([2]);
			expect(new LazyQueryDropWhile([2, 4, 1, 2], isEven).toArray()).toEqual([1, 2]);
			expect(new LazyQueryDropWhile([3, 5, 2, 1], isOdd).toArray()).toEqual([2, 1]);
		});
	});
});

describe('toString', () => {
	describe('(): string', () => {
		test('should concatnate the elements in the collection to a string', () => {
			expect(new LazyQueryDropWhile([null, 'lorem', 'ipsum'], isNullOrUndefined).toString()).toEqual('loremipsum');
			expect(new LazyQueryDropWhile([1, 2], isEven).toString()).toEqual('12');
		});
	});
});

describe('transpose', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<Iterable<U>>', () => {
		test('should transpose the collection so the first element in each array become elements in the first element and the elements in the first element become the first element in each element', () => {
			expect([...new LazyQueryDropWhile([[], [1, 2, 3], [4, 5, 6], [7, 8, 9]], isEmpty).transpose()]).toEqual([
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			]);
			expect([...new LazyQueryDropWhile([null, [1, 4, 7], [2, 5, 8], [3, 6, 9]], isNullOrUndefined).transpose()]).toEqual([
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9]
			]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([], isEmpty).transpose()]).toEqual([]);
		});
		test('the returned type should be LazyQueryTranspose', () => {
			expect(new LazyQueryDropWhile([], isEmpty).transpose()).toBeInstanceOf(LazyQueryTranspose);
		});
	});
});

describe('unique', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should return a collection containing only the first instance of each value', () => {
			expect([...new LazyQueryDropWhile([2, 4, 6, 1, 2, 1, 3], isEven).unique()]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 1, 1, 3], isEven).unique()]).toEqual([1, 3]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 4, 3], isEven).unique()]).toEqual([1, 2, 4, 3]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([3], isOdd).unique()]).toEqual([]);
		});
		test('the returned type should be LazyQueryUnique', () => {
			expect(new LazyQueryDropWhile([], isEven).unique()).toBeInstanceOf(LazyQueryUnique);
		});
	});
	describe('(equals: Equals<T>): ILazyQuery<T>', () => {
		test('should return a collection containing only the first instance of each value', () => {
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 1, 3], isEven).unique((a, b) => a === b)]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDropWhile([2, 1, 1, 1, 3], isEven).unique((a, b) => a === b)]).toEqual([1, 3]);
			expect([...new LazyQueryDropWhile([2, 4, 1, 2, 4, 3], isEven).unique((a, b) => a === b)]).toEqual([1, 2, 4, 3]);
			expect([
				...new LazyQueryDropWhile([{ value: 4 }, { value: 1 }, { value: 2 }, { value: 1 }], v => v.value % 2 === 0).unique(
					(a, b) => a.value === b.value
				)
			]).toEqual([{ value: 1 }, { value: 2 }]);
			expect([
				...new LazyQueryDropWhile([{ value: 4 }, { value: 1 }, { value: 2 }, { value: 3 }], v => v.value % 2 === 0).unique(
					(a, b) => a.value === b.value
				)
			]).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
			expect([
				...new LazyQueryDropWhile([{ value: 2 }, { value: 1 }, { value: 1 }], v => v.value % 2 === 0).unique(
					(a, b) => a.value === b.value
				)
			]).toEqual([{ value: 1 }]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDropWhile([3], isOdd).unique((a, b) => a === b)]).toEqual([]);
			expect([
				...new LazyQueryDropWhile([{ value: 1 }], v => v.value % 2 === 1).unique((a, b) => a.value === b.value)
			]).toEqual([]);
		});
		test('the returned type should be LazyQueryUnique', () => {
			expect(new LazyQueryDropWhile([], v => !!v).unique((a, b) => a === b)).toBeInstanceOf(LazyQueryUnique);
		});
	});
});
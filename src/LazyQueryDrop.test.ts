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

describe('all', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQueryDrop([], 2).all(isEven)).toEqual(true);
			expect(new LazyQueryDrop([], 2).all(isOdd)).toEqual(true);
		});
		test('a collection where all its elements pass the given predicate should return true', () => {
			expect(new LazyQueryDrop([0, 4, 2], 1).all(isEven)).toEqual(true);
			expect(new LazyQueryDrop([1, 3, 5], 1).all(isOdd)).toEqual(true);
		});
		test("a collection where any of its elements don't pass the given predicate should return false", () => {
			expect(new LazyQueryDrop([0, 1, 2], 1).all(isEven)).toEqual(false);
			expect(new LazyQueryDrop([1, 1, 2], 1).all(isOdd)).toEqual(false);
		});
	});
});

describe('and', () => {
	describe('(): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQueryDrop([], 1).and()).toEqual(true);
		});
		test('a collection where every element is truthy should return true', () => {
			expect(new LazyQueryDrop([true, 1, true], 1).and()).toEqual(true);
		});
		test('a collection where any element is falsy should return false', () => {
			expect(new LazyQueryDrop([true, 1, 0], 1).and()).toEqual(false);
		});
	});
});

describe('any', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return false', () => {
			expect(new LazyQueryDrop([], 0).any(isEven)).toEqual(false);
			expect(new LazyQueryDrop([], 0).any(isOdd)).toEqual(false);
		});
		test('a collection where any element passes the given predicate should return true', () => {
			expect(new LazyQueryDrop([0, 1, 2], 1).any(isEven)).toEqual(true);
			expect(new LazyQueryDrop([0, 1, 2], 1).any(isOdd)).toEqual(true);
		});
		test('a collection where no element passes the given predicate should return false', () => {
			expect(new LazyQueryDrop([1, 3], 1).any(isEven)).toEqual(false);
			expect(new LazyQueryDrop([0, 2], 1).any(isOdd)).toEqual(false);
		});
	});
});

describe('append', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('the elements of the appended collection should come last', () => {
			expect([...new LazyQueryDrop([], 2).append([])]).toEqual([]);
			expect([...new LazyQueryDrop([], 2).append([1, 2])]).toEqual([1, 2]);
			expect([...new LazyQueryDrop([1, 2], 1).append([])]).toEqual([2]);
			expect([...new LazyQueryDrop([1, 2], 1).append([3, 4])]).toEqual([2, 3, 4]);
		});
		test('the returned type should be LazyQueryAppend', () => {
			expect(new LazyQueryDrop([], 0).append([])).toBeInstanceOf(LazyQueryAppend);
		});
	});
});

describe('average', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQueryDrop([], 0).average()).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			expect(new LazyQueryDrop([4, 5], 1).average()).toEqual(5);
			expect(new LazyQueryDrop([1, 2, 4], 1).average()).toEqual(3);
		});
	});
	describe('(transform: Transform<T, number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQueryDrop([], 0).average(() => 1)).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			expect(new LazyQueryDrop([{ value: 5 }], 0).average(v => v.value)).toEqual(5);
			expect(new LazyQueryDrop([{ value: 1 }, { value: 1 }, { value: 5 }], 1).average(v => v.value)).toEqual(3);
		});
	});
});

describe('concat', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U>', () => {
		test('an empty collection should result in an empty collection', () => {
			expect([...new LazyQueryDrop([], 1).concat()]).toEqual([]);
		});
		test('should flatten the collection', () => {
			expect([...new LazyQueryDrop([[1, 2], [3, 4, 5]], 1).concat()]).toEqual([3, 4, 5]);
			expect([...new LazyQueryDrop([[1, 2], [2], [3, 4]], 1).concat()]).toEqual([2, 3, 4]);
		});
		test('the returned type should be LazyQueryConcat', () => {
			expect(new LazyQueryDrop([[1]], 0).concat()).toBeInstanceOf(LazyQueryConcat);
		});
	});
});

describe('contains', () => {
	describe('(element: T): boolean', () => {
		test('should check if the collection contains a given value', () => {
			expect(new LazyQueryDrop([1, 2, 3], 1).contains(2)).toEqual(true);
			expect(new LazyQueryDrop([1, 2, 3], 1).contains(4)).toEqual(false);
		});
		test('should check if the collection contains a given object by reference', () => {
			const obj = {};
			expect(new LazyQueryDrop([{}, obj, {}, {}], 2).contains(obj)).toEqual(false);
			expect(new LazyQueryDrop([{}, obj], 0).contains(obj)).toEqual(true);
		});
	});
});

describe('count', () => {
	describe('(): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQueryDrop([], 1).count()).toEqual(0);
			expect(new LazyQueryDrop([1, 2, 3, 5], 1).count()).toEqual(3);
		});
	});
	describe('(predicate: Predicate<T>): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQueryDrop([], 2).count(isEven)).toEqual(0);
			expect(new LazyQueryDrop([1, 2, 3, 5], 1).count(isEven)).toEqual(1);
			expect(new LazyQueryDrop([1, 2, 3, 5], 2).count(isOdd)).toEqual(2);
		});
	});
});

describe('cycle', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should terminate when it encounters an empty collection', () => {
			expect([...new LazyQueryDrop([1], 1).cycle()]).toEqual([]);
		});
		test('should cycle the collection so the elements repeat after the end of the collection', () => {
			const collection = new LazyQueryDrop([1, 2, 1], 1).cycle();
			const result = [];
			const iterator = collection[Symbol.iterator]();
			let value = iterator.next();
			for (let i = 0; i < 5 && !value.done; i++) {
				result.push(value.value);
				value = iterator.next();
			}
			expect(result).toEqual([2, 1, 2, 1, 2]);
		});
		test('the returned type should be LazyQueryCycle', () => {
			expect(new LazyQueryDrop([1], 0).cycle()).toBeInstanceOf(LazyQueryCycle);
		});
	});
});

describe('drop', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should return an empty collection if the number of elements to drop exceeds the length of the collection', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 1).drop(5)]).toEqual([]);
		});
		test('should drop the first n number of elements from the collection', () => {
			expect([...new LazyQueryDrop([1, 5, 3], 1).drop(0)]).toEqual([5, 3]);
			expect([...new LazyQueryDrop([1, 5, 3], 1).drop(1)]).toEqual([3]);
			expect([...new LazyQueryDrop([1, 5, 3], 1).drop(2)]).toEqual([]);
		});
		test('the returned type should be LazyQueryDrop', () => {
			expect(new LazyQueryDrop([1], 1).drop(0)).toBeInstanceOf(LazyQueryDrop);
		});
	});
});

describe('dropWhile', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should return an empty collection if all the elements of the collection pass the given predicate', () => {
			expect([...new LazyQueryDrop([1, 3, 5], 1).dropWhile(isOdd)]).toEqual([]);
		});
		test('should drop the set of elements at the beginning of the collection that pass the given predicate', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 1).dropWhile(isOdd)]).toEqual([2, 3]);
			expect([...new LazyQueryDrop([1, 5, 2], 1).dropWhile(isOdd)]).toEqual([2]);
			expect([...new LazyQueryDrop([1, 5, 3], 1).dropWhile(isEven)]).toEqual([5, 3]);
		});
		test('the returned type should be LazyQueryDropWhile', () => {
			expect(new LazyQueryDrop([1], 1).dropWhile(isEven)).toBeInstanceOf(LazyQueryDropWhile);
		});
	});
});

describe('exec', () => {
	describe('(func: Executor<T>): void', () => {
		test('an empty collection should not invoke the callback', () => {
			const mockCallback = jest.fn();
			new LazyQueryDrop([], 1).exec(mockCallback);
			expect(mockCallback.mock.calls).toEqual([]);
		});
		test('should invoke the callback for each element in the collection with the current element as an argument', () => {
			const mockCallback = jest.fn();
			new LazyQueryDrop([0, 0, 1], 1).exec(mockCallback);
			expect(mockCallback.mock.calls).toEqual([[0], [1]]);
		});
	});
});

describe('filter', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should remove any elements from the collection that do not pass the given predicate', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 1).filter(isEven)]).toEqual([2]);
			expect([...new LazyQueryDrop([1, 2, 3], 1).filter(isOdd)]).toEqual([3]);
		});
		test('the returned type should be LazyQueryFiltered', () => {
			expect(new LazyQueryDrop([1], 1).filter(isEven)).toBeInstanceOf(LazyQueryFiltered);
		});
	});
	describe('<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U>', () => {
		test('should remove any elements from the collection that do not pass the given predicate', () => {
			expect([...new LazyQueryDrop([1, 2, '3'], 1).filter(isNumber)]).toEqual([2]);
			expect([...new LazyQueryDrop([5, '1', 2, 3], 1).filter(isNumber)]).toEqual([2, 3]);
		});
		test('the returned type should be LazyQueryFiltered', () => {
			expect(new LazyQueryDrop([1], 1).filter(isNumber)).toBeInstanceOf(LazyQueryFiltered);
		});
	});
});

describe('find', () => {
	describe('find(predicate: Predicate<T>): T | undefined', () => {
		test('should return the first element that passes a given predicate', () => {
			expect(new LazyQueryDrop([1, 2, 3], 1).find(isEven)).toEqual(2);
			expect(new LazyQueryDrop([1, 2, 3], 1).find(isOdd)).toEqual(3);
		});
		test('should return undefined if no elements in the collection pass the predicate', () => {
			expect(new LazyQueryDrop([2, 1, 3, 5], 1).find(isEven)).toBeUndefined();
		});
	});
});

describe('first', () => {
	describe('(): T | undefined', () => {
		test('should return the first element in the collection', () => {
			expect(new LazyQueryDrop([1, 2, 3], 1).first()).toEqual(2);
			expect(new LazyQueryDrop([3, 1, 2], 2).first()).toEqual(2);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryDrop([], 0).first()).toBeUndefined();
		});
	});
});

describe('get', () => {
	describe('(index: number): T | undefined', () => {
		test("should return the element at the n'th position in the collection", () => {
			expect(new LazyQueryDrop([1, 2, 3], 1).get(0)).toEqual(2);
			expect(new LazyQueryDrop([1, 3, 2], 0).get(1)).toEqual(3);
			expect(new LazyQueryDrop([1, 2, 3], 1).get(1)).toEqual(3);
		});
		test('should return undefined if the index is out of bounds', () => {
			expect(new LazyQueryDrop([1, 2, 3], 1).get(4)).toBeUndefined();
			expect(new LazyQueryDrop([1, 2, 3], 2).get(-1)).toBeUndefined();
		});
	});
});

describe('intersperse', () => {
	describe('<U>(element: U): ILazyQuery<T | U>', () => {
		test('should intersperce the given element between all elements in the collection', () => {
			expect([...new LazyQueryDrop([5, 1, 2, 3], 1).intersperse(0)]).toEqual([1, 0, 2, 0, 3]);
			expect([...new LazyQueryDrop([2, 4, 1, 3], 2).intersperse(2)]).toEqual([1, 2, 3]);
		});
		test('if the collection has less than two elements it should not change', () => {
			expect([...new LazyQueryDrop([1, 2], 2).intersperse(0)]).toEqual([]);
			expect([...new LazyQueryDrop([4, 1], 1).intersperse(0)]).toEqual([1]);
		});
		test('the returned type should be LazyQueryIntersperce', () => {
			expect(new LazyQueryDrop([1], 0).intersperse(0)).toBeInstanceOf(LazyQueryIntersperce);
		});
	});
});

describe('isEmpty', () => {
	describe('(): boolean', () => {
		test('should return true if the collection is empty', () => {
			expect(new LazyQueryDrop([1, 2], 2).isEmpty()).toEqual(true);
		});
		test('should return false if the collection is not empty', () => {
			expect(new LazyQueryDrop([0], 0).isEmpty()).toEqual(false);
			expect(new LazyQueryDrop([1, 2], 1).isEmpty()).toEqual(false);
		});
	});
});

describe('iterate', () => {
	describe('(func: (value: T) => T): ILazyQuery<T>', () => {
		test('should apply the given function to the current element of the collection and let that value be the next value in the collection', () => {
			const collection = new LazyQueryDrop([0, 1, 2], 1).iterate(add(2));
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
			expect([...new LazyQueryDrop(<number[]>[2], 1).iterate(add(1))]).toEqual([]);
		});
		test('the returned type should be LazyQueryIterate', () => {
			expect(new LazyQueryDrop([1], 0).iterate(add(1))).toBeInstanceOf(LazyQueryIterate);
		});
	});
});

describe('last', () => {
	describe('(): T | undefined', () => {
		test('should return the last element of the collection', () => {
			expect(new LazyQueryDrop([1, 2, 3], 1).last()).toEqual(3);
			expect(new LazyQueryDrop([1, 3, 2], 2).last()).toEqual(2);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryDrop([2], 1).last()).toBeUndefined();
		});
	});
});

describe('map', () => {
	describe('<U>(transform: Transform<T, U>): ILazyQuery<U>', () => {
		test('should apply the given function to each element in the collection', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 1).map(add(2))]).toEqual([4, 5]);
			expect([...new LazyQueryDrop([1, 2, 3], 2).map(add(1))]).toEqual([4]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([3], 1).map(add(1))]).toEqual([]);
		});
		test('the returned type should be LazyQueryMapped', () => {
			expect(new LazyQueryDrop([1], 1).map(add(1))).toBeInstanceOf(LazyQueryMapped);
		});
	});
});

describe('max', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the largest element in the collection', () => {
			expect(new LazyQueryDrop([1, 3, 2], 2).max()).toEqual(2);
			expect(new LazyQueryDrop([1, 2, 4], 1).max()).toEqual(4);
		});
		test('should return -Infinity if the collection is empty', () => {
			expect(new LazyQueryDrop([1], 1).max()).toEqual(-Infinity);
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
			const collection = new LazyQueryDrop(mockCollection, 1).memoize();
			const collectionResultA = [...collection];
			const collectionResultB = [...collection];
			expect(collectionResultA).toEqual([1]);
			expect(collectionResultB).toEqual([1]);
			expect(mockIterationNextCallback.mock.calls).toEqual([[], [], []]);
		});
		test('the returned type should be LazyQueryMemoize', () => {
			expect(new LazyQueryDrop([], 0).memoize()).toBeInstanceOf(LazyQueryMemoize);
		});
	});
});

describe('min', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the smallest element in the collection', () => {
			expect(new LazyQueryDrop([1, 3, 2], 1).min()).toEqual(2);
			expect(new LazyQueryDrop([3, 2, 4], 0).min()).toEqual(2);
		});
		test('should return Infinity if the collection is empty', () => {
			expect(new LazyQueryDrop([1], 1).min()).toEqual(Infinity);
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
					return { value: 2, done: false };
				})
				.mockImplementationOnce(() => {
					return { value: 3, done: false };
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
			expect([...new LazyQueryDrop(mockCollection, 2).onlyMemoized()]).toEqual([3]);
			expect(mockIterator.mock.calls).toEqual([[true]]);
		});
		test('the returned type should be LazyQueryOnlyMemoized', () => {
			expect(new LazyQueryDrop([], 0).onlyMemoized()).toBeInstanceOf(LazyQueryOnlyMemoized);
		});
	});
});

describe('or', () => {
	describe('(): boolean', () => {
		test('a collection where every element is falsy should return false', () => {
			expect(new LazyQueryDrop([true, 0, false], 1).or()).toEqual(false);
		});
		test('a collection where any element is truthy should return true', () => {
			expect(new LazyQueryDrop([0, true], 0).or()).toEqual(true);
			expect(new LazyQueryDrop([1, false], 0).or()).toEqual(true);
		});
		test('a collection with no elements should return false', () => {
			expect(new LazyQueryDrop([], 1).or()).toEqual(false);
		});
	});
});

describe('permutations', () => {
	describe('(): ILazyQuery<T[]>', () => {
		test('should return the set of all possible permutations of the collection', () => {
			expect([...new LazyQueryDrop([4, 1, 2, 3], 1).permutations()]).toEqual([
				[1, 2, 3],
				[2, 1, 3],
				[3, 1, 2],
				[1, 3, 2],
				[2, 3, 1],
				[3, 2, 1]
			]);
			expect([...new LazyQueryDrop([2, 4, 3, 1], 2).permutations()]).toEqual([[3, 1], [1, 3]]);
		});
		test('an empty collection should return a collection containing an empty collection', () => {
			expect([...new LazyQueryDrop([], 0).permutations()]).toEqual([[]]);
		});
		test('the returned type should be LazyQueryPermutations', () => {
			expect(new LazyQueryDrop([], 0).permutations()).toBeInstanceOf(LazyQueryPermutations);
		});
	});
});

describe('prepend', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('adds a collection to the start of the collection', () => {
			expect([...new LazyQueryDrop([3, 1, 2], 1).prepend([0])]).toEqual([0, 1, 2]);
			expect([...new LazyQueryDrop([1, 2], 1).prepend([0, 3])]).toEqual([0, 3, 2]);
			expect([...new LazyQueryDrop([1, 2], 0).prepend([])]).toEqual([1, 2]);
			expect([...new LazyQueryDrop([2], 1).prepend([])]).toEqual([]);
		});
		test('the returned type should be LazyQueryPrepend', () => {
			expect(new LazyQueryDrop([], 0).prepend([])).toBeInstanceOf(LazyQueryPrepend);
		});
	});
});

describe('product', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('should return the product of the collection', () => {
			expect(new LazyQueryDrop([2, 3], 0).product()).toEqual(6);
			expect(new LazyQueryDrop([3, 3], 1).product()).toEqual(3);
			expect(new LazyQueryDrop([9, 5, 3, 4], 2).product()).toEqual(12);
			expect(new LazyQueryDrop([6, 3, 4, 2], 1).product()).toEqual(24);
			expect(new LazyQueryDrop([3, 4, 0], 0).product()).toEqual(0);
		});
	});
});

describe('reduce', () => {
	describe('(func: Accumulator<T, T>): T | undefined', () => {
		test('should return the result of applying a given accumualtor function to the running result and each element', () => {
			expect(new LazyQueryDrop([2, 3], 1).reduce((a, b) => a + b)).toEqual(3);
			expect(new LazyQueryDrop([1, 2, 3], 0).reduce((a, b) => a + b)).toEqual(6);
			expect(new LazyQueryDrop([2, 1, 3, 3], 1).reduce((a, b) => a + b)).toEqual(7);
			expect(new LazyQueryDrop([2, 4, 1, 3, 3], 2).reduce((a, b) => a * b)).toEqual(9);
		});
		test('should return undefined if the collection is empty', () => {
			expect(new LazyQueryDrop([], 0).reduce(add(1))).toBeUndefined();
		});
	});
	describe('<U>(func: Accumulator<T, U>, initial: U): U', () => {
		test('should return the result of applying a given accumualtor function to the running result and each element, with the running result starting off being the value of the initial parameter', () => {
			expect(new LazyQueryDrop([1, 2, 3], 0).reduce((a, b) => a + b, 1)).toEqual(7);
			expect(new LazyQueryDrop([4, 1, 3, 3], 1).reduce((a, b) => a + b, 1)).toEqual(8);
			expect(new LazyQueryDrop([6, 5, 1, 3, 3], 2).reduce((a, b) => a * b, 1)).toEqual(9);
		});
		test('should return the initial value if the collection is empty', () => {
			expect(new LazyQueryDrop([], 0).reduce(add(1), 2)).toEqual(2);
		});
	});
});

describe('reverse', () => {
	describe('(): ILazyQuery<T>', () => {
		test('reverses the order of the elements in the collection', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 0).reverse()]).toEqual([3, 2, 1]);
			expect([...new LazyQueryDrop([2, 4, 3], 1).reverse()]).toEqual([3, 4]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([1, 2], 2).reverse()]).toEqual([]);
		});
		test('the returned type should be LazyQuery', () => {
			expect(new LazyQueryDrop([], 0).reverse()).toBeInstanceOf(LazyQuery);
		});
	});
});

describe('sort', () => {
	describe('(comparator: Comparator<T>): ILazyQuery<T>', () => {
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([1], 1).sort((a, b) => a - b)]).toEqual([]);
		});
		test('should sort the collection based on the given comparator function', () => {
			expect([...new LazyQueryDrop([3, 5, 1, 2, 1, 4], 1).sort((a, b) => a - b)]).toEqual([1, 1, 2, 4, 5]);
			expect([...new LazyQueryDrop([3, 4, 5, 1, 2, 1, 4], 2).sort((a, b) => b - a)]).toEqual([5, 4, 2, 1, 1]);
			expect([...new LazyQueryDrop([3, 4, 5, 3, 2, 1, 4], 2).sort((a, b) => a - b)]).toEqual([1, 2, 3, 4, 5]);
			expect([...new LazyQueryDrop([3, 4, 5, 3, 2, 1, 4], 2).sort((a, b) => b - a)]).toEqual([5, 4, 3, 2, 1]);
		});
		test('the returned type should be LazyQuery', () => {
			expect(new LazyQueryDrop([], 0).sort((a, b) => b - a)).toBeInstanceOf(LazyQuery);
		});
	});
});

describe('subsequences', () => {
	describe('(): ILazyQuery<T[]>', () => {
		test('should return a collection containing an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([2], 1).subsequences()]).toEqual([[]]);
		});
		test('should return a collection containing all the subsequences of the collection', () => {
			expect([...new LazyQueryDrop([4, 1, 2, 3], 1).subsequences()]).toEqual([
				[],
				[1],
				[2],
				[1, 2],
				[3],
				[1, 3],
				[2, 3],
				[1, 2, 3]
			]);
			expect([...new LazyQueryDrop([2, 5, 1, 2, 4], 2).subsequences()]).toEqual([
				[],
				[1],
				[2],
				[1, 2],
				[4],
				[1, 4],
				[2, 4],
				[1, 2, 4]
			]);
			expect([...new LazyQueryDrop([4, 2, 2, 3, 4], 1).subsequences()]).toEqual([
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
			expect(new LazyQueryDrop([], 0).subsequences()).toBeInstanceOf(LazyQuerySubsequences);
		});
	});
});

describe('sum', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('returns the sum of adding all the elements in the collection', () => {
			expect(new LazyQueryDrop([3, 2], 1).sum()).toEqual(2);
			expect(new LazyQueryDrop([1, 2, 3], 0).sum()).toEqual(6);
			expect(new LazyQueryDrop([3, 1, 2, 3], 1).sum()).toEqual(6);
			expect(new LazyQueryDrop([4, 6, 2, 2, 4], 2).sum()).toEqual(8);
			expect(new LazyQueryDrop([2, 2, 4, 5], 0).sum()).toEqual(13);
		});
		test('should return 0 if the collection is empty', () => {
			expect(new LazyQueryDrop([], 0).sum()).toEqual(0);
		});
	});
});

describe('take', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should return a collection containing the first n elements in the collection', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 0).take(1)]).toEqual([1]);
			expect([...new LazyQueryDrop([4, 2, 1, 3], 1).take(1)]).toEqual([2]);
			expect([...new LazyQueryDrop([5, 7, 2, 1, 3], 2).take(2)]).toEqual([2, 1]);
			expect([...new LazyQueryDrop([1, 4, 8, 1, 2, 3], 3).take(2)]).toEqual([1, 2]);
		});
		test('should return a collection containing all the elements in the collection if n exceeds the length of the collection', () => {
			expect([...new LazyQueryDrop([1, 2, 3], 0).take(4)]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDrop([5, 1, 2, 3], 1).take(5)]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDrop([3, 6, 4, 2, 3], 2).take(4)]).toEqual([4, 2, 3]);
			expect([...new LazyQueryDrop([5, 4, 8, 4, 2, 3], 3).take(5)]).toEqual([4, 2, 3]);
		});
		test('the returned type should be LazyQueryTake', () => {
			expect(new LazyQueryDrop([], 0).take(1)).toBeInstanceOf(LazyQueryTake);
		});
	});
});

describe('takeWhile', () => {
	describe('(predicate: Predicate<T>): ILazyQuery<T>', () => {
		test('should return a collection containing the first elements in the collection that pass a given predicate', () => {
			expect([...new LazyQueryDrop([2, 1], 2).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryDrop([3, 2], 2).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryDrop([1], 0).takeWhile(isOdd)]).toEqual([1]);
			expect([...new LazyQueryDrop([1], 0).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryDrop([1, 2, 1, 2, 3], 2).takeWhile(isOdd)]).toEqual([1]);
			expect([...new LazyQueryDrop([1, 2, 2, 1, 3], 2).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryDrop([1, 2, 2, 1, 3], 2).takeWhile(isOdd)]).toEqual([]);
			expect([...new LazyQueryDrop([1, 2, 1, 3, 2], 2).takeWhile(isOdd)]).toEqual([1, 3]);
			expect([...new LazyQueryDrop([1, 2, 1, 2, 3], 2).takeWhile(isEven)]).toEqual([]);
			expect([...new LazyQueryDrop([1, 2, 2, 1, 3], 2).takeWhile(isEven)]).toEqual([2]);
			expect([...new LazyQueryDrop([1, 2, 2, 1, 3], 2).takeWhile(isEven)]).toEqual([2]);
			expect([...new LazyQueryDrop([1, 2, 4, 2, 3], 2).takeWhile(isEven)]).toEqual([4, 2]);
		});
		test('the returned type should be LazyQueryTakeWhile', () => {
			expect(new LazyQueryDrop([], 0).takeWhile(isEven)).toBeInstanceOf(LazyQueryTakeWhile);
		});
	});
});

describe('toArray', () => {
	describe('(): T[]', () => {
		test('should return an array containing all the elements in the collection', () => {
			expect(new LazyQueryDrop([2], 1).toArray()).toEqual([]);
			expect(new LazyQueryDrop([2, 1], 1).toArray()).toEqual([1]);
			expect(new LazyQueryDrop([2], 0).toArray()).toEqual([2]);
			expect(new LazyQueryDrop([3, 1, 2], 1).toArray()).toEqual([1, 2]);
			expect(new LazyQueryDrop([5, 7, 2, 1], 2).toArray()).toEqual([2, 1]);
		});
	});
});

describe('toString', () => {
	describe('(): string', () => {
		test('should concatnate the elements in the collection to a string', () => {
			expect(new LazyQueryDrop(['lorem', 'ipsum'], 0).toString()).toEqual('loremipsum');
			expect(new LazyQueryDrop([3, 1, 2], 1).toString()).toEqual('12');
		});
	});
});

describe('transpose', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<Iterable<U>>', () => {
		test('should transpose the collection so the first element in each array become elements in the first element and the elements in the first element become the first element in each element', () => {
			expect([...new LazyQueryDrop([[0], [1, 2, 3], [4, 5, 6], [7, 8, 9]], 1).transpose()]).toEqual([
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			]);
			expect([...new LazyQueryDrop([[1, 4, 7], [2, 5, 8], [3, 6, 9]], 0).transpose()]).toEqual([
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9]
			]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([[1, 2], [3, 4]], 2).transpose()]).toEqual([]);
		});
		test('the returned type should be LazyQueryTranspose', () => {
			expect(new LazyQueryDrop([], 0).transpose()).toBeInstanceOf(LazyQueryTranspose);
		});
	});
});

describe('unique', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should return a collection containing only the first instance of each value', () => {
			expect([...new LazyQueryDrop([2, 1, 2, 1, 3], 1).unique()]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDrop([1, 2, 1, 1, 1, 3], 2).unique()]).toEqual([1, 3]);
			expect([...new LazyQueryDrop([1, 2, 1, 2, 4, 3], 2).unique()]).toEqual([1, 2, 4, 3]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([1], 1).unique()]).toEqual([]);
		});
		test('the returned type should be LazyQueryUnique', () => {
			expect(new LazyQueryDrop([], 0).unique()).toBeInstanceOf(LazyQueryUnique);
		});
	});
	describe('(equals: Equals<T>): ILazyQuery<T>', () => {
		test('should return a collection containing only the first instance of each value', () => {
			expect([...new LazyQueryDrop([1, 2, 3, 1, 2, 1, 3], 3).unique((a, b) => a === b)]).toEqual([1, 2, 3]);
			expect([...new LazyQueryDrop([1, 1, 1, 3], 0).unique((a, b) => a === b)]).toEqual([1, 3]);
			expect([...new LazyQueryDrop([6, 7, 1, 2, 4, 3], 2).unique((a, b) => a === b)]).toEqual([1, 2, 4, 3]);
			expect([
				...new LazyQueryDrop([{ value: 1 }, { value: 2 }, { value: 1 }], 0).unique(
					(a, b) => a.value === b.value
				)
			]).toEqual([{ value: 1 }, { value: 2 }]);
			expect([
				...new LazyQueryDrop([{ value: 4 }, { value: 1 }, { value: 2 }, { value: 3 }], 1).unique(
					(a, b) => a.value === b.value
				)
			]).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
			expect([
				...new LazyQueryDrop([{ value: 1 }, { value: 1 }, { value: 1 }], 1).unique(
					(a, b) => a.value === b.value
				)
			]).toEqual([{ value: 1 }]);
		});
		test('should return an empty collection if the collection is empty', () => {
			expect([...new LazyQueryDrop([], 0).unique((a, b) => a === b)]).toEqual([]);
			expect([
				...new LazyQueryDrop<{ value: number }>([{ value: 1 }], 1).unique((a, b) => a.value === b.value)
			]).toEqual([]);
		});
		test('the returned type should be LazyQueryUnique', () => {
			expect(new LazyQueryDrop([], 0).unique((a, b) => a === b)).toBeInstanceOf(LazyQueryUnique);
		});
	});
});

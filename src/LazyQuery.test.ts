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

describe('all', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQuery([]).all(isEven)).toEqual(true);
			expect(new LazyQuery([]).all(isOdd)).toEqual(true);
		});
		test('a collection where all its elements pass the given predicate should return true', () => {
			expect(new LazyQuery([0, 4]).all(isEven)).toEqual(true);
			expect(new LazyQuery([1, 3, 5]).all(isOdd)).toEqual(true);
		});
		test("a collection where any of its elements don't pass the given predicate should return false", () => {
			expect(new LazyQuery([0, 1, 2]).all(isEven)).toEqual(false);
			expect(new LazyQuery([1, 1, 2]).all(isOdd)).toEqual(false);
		});
	});
});

describe('and', () => {
	describe('(): boolean', () => {
		test('an empty collection should return true', () => {
			expect(new LazyQuery([]).and()).toEqual(true);
		});
		test('a collection where every element is truthy should return true', () => {
			expect(new LazyQuery([true, 1]).and()).toEqual(true);
		});
		test('a collection where any element is falsy should return false', () => {
			expect(new LazyQuery([true, 1, 0]).and()).toEqual(false);
		});
	});
});

describe('any', () => {
	describe('(predicate: Predicate<T>): boolean', () => {
		test('an empty collection should return false', () => {
			expect(new LazyQuery([]).any(isEven)).toEqual(false);
			expect(new LazyQuery([]).any(isOdd)).toEqual(false);
		});
		test('a collection where any element passes the given predicate should return true', () => {
			expect(new LazyQuery([0, 1]).any(isEven)).toEqual(true);
			expect(new LazyQuery([0, 1]).any(isOdd)).toEqual(true);
		});
		test('a collection where no element passes the given predicate should return false', () => {
			expect(new LazyQuery([1, 3]).any(isEven)).toEqual(false);
			expect(new LazyQuery([0, 2]).any(isOdd)).toEqual(false);
		});
	});
});

describe('append', () => {
	describe('<U>(iterable: Iterable<U>): ILazyQuery<T | U>', () => {
		test('the elements of the appended collection should come last', () => {
			expect([...new LazyQuery([]).append([])]).toEqual([]);
			expect([...new LazyQuery([]).append([1, 2])]).toEqual([1, 2]);
			expect([...new LazyQuery([1, 2]).append([])]).toEqual([1, 2]);
			expect([...new LazyQuery([1, 2]).append([3, 4])]).toEqual([1, 2, 3, 4]);
		});
		test('the returned type should be LazyQueryAppend', () => {
			expect(new LazyQuery([]).append([])).toBeInstanceOf(LazyQueryAppend);
		});
	});
});

describe('average', () => {
	describe('(this: ILazyQuery<number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQuery([]).average()).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			expect(new LazyQuery([5]).average()).toEqual(5);
			expect(new LazyQuery([1, 5]).average()).toEqual(3);
		});
	});
	describe('(transform: Transform<T, number>): number', () => {
		test('an empty collection should return 0', () => {
			expect(new LazyQuery([]).average(() => 1)).toEqual(0);
		});
		test('should calculate the average of a collection of numbers', () => {
			expect(new LazyQuery([{ value: 5 }]).average(v => v.value)).toEqual(5);
			expect(new LazyQuery([{ value: 1 }, { value: 5 }]).average(v => v.value)).toEqual(3);
		});
	});
});

describe('concat', () => {
	describe('<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U>', () => {
		test('an empty collection should result in an empty collection', () => {
			expect([...new LazyQuery([]).concat()]).toEqual([]);
		});
		test('should flatten the collection', () => {
			expect([...new LazyQuery([[1, 2], [3, 4, 5]]).concat()]).toEqual([1, 2, 3, 4, 5]);
			expect([...new LazyQuery([[1, 2], [], [3, 4]]).concat()]).toEqual([1, 2, 3, 4]);
		});
		test('the returned type should be LazyQueryConcat', () => {
			expect(new LazyQuery([[1]]).concat()).toBeInstanceOf(LazyQueryConcat);
		});
	});
});

describe('contains', () => {
	describe('(element: T): boolean', () => {
		test('should check if the collection contains a given value', () => {
			expect(new LazyQuery([1, 2, 3]).contains(2)).toEqual(true);
			expect(new LazyQuery([1, 2, 3]).contains(4)).toEqual(false);
		});
		test('should check if the collection contains a given object by reference', () => {
			const obj = {};
			expect(new LazyQuery([{}, {}]).contains(obj)).toEqual(false);
			expect(new LazyQuery([{}, obj]).contains(obj)).toEqual(true);
		});
	});
});

describe('count', () => {
	describe('(): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQuery([]).count()).toEqual(0);
			expect(new LazyQuery([1, 2, 3, 5]).count()).toEqual(4);
		});
	});
	describe('(predicate: Predicate<T>): number', () => {
		test('should return the number of elements in the collection', () => {
			expect(new LazyQuery([]).count(isEven)).toEqual(0);
			expect(new LazyQuery([1, 2, 3, 5]).count(isEven)).toEqual(1);
			expect(new LazyQuery([1, 2, 3, 5]).count(isOdd)).toEqual(3);
		});
	});
});

describe('cycle', () => {
	describe('(): ILazyQuery<T>', () => {
		test('should terminate when it encounters an empty collection', () => {
			expect([...new LazyQuery([]).cycle()]).toEqual([]);
		});
		test('should cycle the collection so the elements repeat after the end of the collection', () => {
			const collection = new LazyQuery([1, 2]).cycle();
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
			expect(new LazyQuery([1]).cycle()).toBeInstanceOf(LazyQueryCycle);
		});
	});
});

describe('drop', () => {
	describe('(count: number): ILazyQuery<T>', () => {
		test('should return an empty collection if the number of elements to drop exceeds the length of the collection', () => {
			expect([...new LazyQuery([1, 2, 3]).drop(5)]).toEqual([]);
		});
		test('should drop the first n number of elements from the collection', () => {
			expect([...new LazyQuery([1, 5, 3]).drop(0)]).toEqual([1, 5, 3]);
			expect([...new LazyQuery([1, 5, 3]).drop(1)]).toEqual([5, 3]);
			expect([...new LazyQuery([1, 5, 3]).drop(2)]).toEqual([3]);
		});
		test('the returned type should be LazyQueryDrop', () => {
			expect(new LazyQuery([1]).drop(0)).toBeInstanceOf(LazyQueryDrop);
		});
	});
});

describe('dropWhile', () => {
	describe('', () => {
		test('should return an empty collection if all the elements of the collection pass the given predicate', () => {
			expect([...new LazyQuery([1, 3, 5]).dropWhile(isOdd)]).toEqual([]);
		});
		test('should drop the set of elements at the beginning of the collection that pass the given predicate', () => {
			expect([...new LazyQuery([1, 2, 3]).dropWhile(isOdd)]).toEqual([2, 3]);
			expect([...new LazyQuery([1, 5, 2]).dropWhile(isOdd)]).toEqual([2]);
			expect([...new LazyQuery([1, 5, 3]).dropWhile(isEven)]).toEqual([1, 5, 3]);
		});
		test('the returned type should be LazyQueryDropWhile', () => {
			expect(new LazyQuery([1]).dropWhile(isEven)).toBeInstanceOf(LazyQueryDropWhile);
		});
	});
});

describe('exec', () => {
	describe('(func: Executor<T>): void', () => {});
});

describe('filter', () => {
	describe('', () => {});
});

describe('find', () => {
	describe('', () => {});
});

describe('first', () => {
	describe('', () => {});
});

describe('get', () => {
	describe('', () => {});
});

describe('intersperse', () => {
	describe('', () => {});
});

describe('isEmpty', () => {
	describe('', () => {});
});

describe('iterate', () => {
	describe('', () => {});
});

describe('last', () => {
	describe('', () => {});
});

describe('map', () => {
	describe('', () => {});
});

describe('max', () => {
	describe('', () => {});
});

describe('memoize', () => {
	describe('', () => {});
});

describe('min', () => {
	describe('', () => {});
});

describe('onlyMemoized', () => {
	describe('', () => {});
});

describe('or', () => {
	describe('', () => {});
});

describe('permutations', () => {
	describe('', () => {});
});

describe('prepend', () => {
	describe('', () => {});
});

describe('product', () => {
	describe('', () => {});
});

describe('reduce', () => {
	describe('', () => {});
});

describe('reverse', () => {
	describe('', () => {});
});

describe('sort', () => {
	describe('', () => {});
});

describe('subsequences', () => {
	describe('', () => {});
});

describe('sum', () => {
	describe('', () => {});
});

describe('take', () => {
	describe('', () => {});
});

describe('takeWhile', () => {
	describe('', () => {});
});

describe('toArray', () => {
	describe('', () => {});
});

describe('toString', () => {
	describe('', () => {});
});

describe('transpose', () => {
	describe('', () => {});
});

describe('unique', () => {
	describe('', () => {});
});

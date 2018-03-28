import { ILazyQuery } from './ILazyQuery';
import { LazyQueryConcat } from './LazyQueryConcat';
import { LazyQueryFiltered } from './LazyQueryFiltered';
import { LazyQueryIntersperce } from './LazyQueryIntersperce';
import { LazyQueryMapped } from './LazyQueryMapped';
import { LazyQueryPermutations } from './LazyQueryPermutations';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { quicksort } from './quicksort';
import {
	IterableMemoizable,
	PredicateTypeGuard,
	Predicate,
	Transform,
	Equals
} from './Types';

export class LazyQuery<T> implements ILazyQuery<T> {
	constructor(protected source: IterableMemoizable<T>) {
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
	}

	toArray(): T[] {
		return [...this];
	}

	toString(): string {
		let s = "";
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			s += value.value.toString();
			value = iterator.next();
		}
		return s;
	}

	filter(predicate: Predicate<T>): ILazyQuery<T>
	filter<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U> {
		return new LazyQueryFiltered(this, predicate);
	}

	map<U>(transform: Transform<T, U>): ILazyQuery<U> {
		return new LazyQueryMapped(this, transform);
	}

	take(count: number): ILazyQuery<T> {
		return new LazyQueryTake(this, count);
	}

	drop(count: number): ILazyQuery<T> {
		return new LazyQueryDrop(this, count);
	}

	takeWhile<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U>
	takeWhile(predicate: (value: T) => boolean): ILazyQuery<T> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	dropWhile<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U>
	dropWhile(predicate: (value: T) => boolean): ILazyQuery<T> {
		return new LazyQueryDropWhile(this, predicate);
	}

	first(): T | undefined {
		return this[Symbol.iterator]().next().value;
	}

	last(): T | undefined {
		const iterator = this[Symbol.iterator]();
		let prev;
		let value = iterator.next();
		while (!value.done) {
			prev = value.value;
			value = iterator.next();
		}
		return prev;
	}

	any(predicate: (value: T) => boolean): boolean {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (predicate(value.value)) {
				return true;
			}
			value = iterator.next();
		}
		return false;
	}

	all(predicate: (value: T) => boolean): boolean {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (!predicate(value.value)) {
				return false;
			}
			value = iterator.next();
		}
		return true;
	}

	reverse(): ILazyQuery<T> {
		const reverse = this.toArray();
		if (reverse.length > 0) {
			for (let i = 0, j = Math.floor(reverse.length / 2); i < j; i++) {
				const k = reverse.length - 1 - i;
				const tmp = reverse[i];
				reverse[i] = reverse[k];
				reverse[k] = tmp;
			}
		}
		return new LazyQuery(reverse);
	}

	intersperse<U>(element: U): ILazyQuery<T | U> {
		return new LazyQueryIntersperce(this, element);
	}

	reduce(func: (result: T, current: T) => T): T | undefined;
	reduce<U>(func: (result: U, current: T) => U, initial: U): U;
	reduce<U>(func: (result: U, current: T) => U, initial?: U): U | undefined {
		const iterator = this[Symbol.iterator]();
		if (arguments.length < 2) {
			let value = iterator.next();
			if (value.done) {
				return undefined;
			}
			let result = value.value as any as U;
			value = iterator.next();
			while (!value.done) {
				result = func(result, value.value);
				value = iterator.next();
			}
			return result;
		}
		let result = initial as U;
		let value = iterator.next();
		if (value.done) {
			return result;
		}
		while (!value.done) {
			result = func(result, value.value);
			value = iterator.next();
		}
		return result;
	}

	unique(equals?: Equals<T>): ILazyQuery<T> {
		return new LazyQueryUnique(this, equals);
	}

	subsequences(): ILazyQuery<T[]> {
		return new LazyQuerySubsequences(this);
	}

	permutations(): ILazyQuery<T[]> {
		return new LazyQueryPermutations(this);
	}

	isEmpty(): boolean {
		return this[Symbol.iterator]().next().done;
	}

	count(): number {
		let result = 0;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			result++;
			value = iterator.next();
		}
		return result;
	}

	exec(func: (element: T) => void) {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	sort(comparator: (a: T, b: T) => number): ILazyQuery<T> {
		if (!comparator) {
			throw "Comparator undefined";
		}
		// dual-pivot-quick-sort
		const array: T[] = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	memoize(): ILazyQuery<T> {
		return new LazyQueryMemoize(this);
	}

	onlyMemoized(): ILazyQuery<T> {
		return new LazyQueryOnlyMemoized(this);
	}

	concat<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U> {
		return new LazyQueryConcat(this);
	}

	cycle(): ILazyQuery<T> {
		return new LazyQueryCycle(this);
	}

	get(index: number): T | undefined {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		let j = 0;
		while (!value.done) {
			if (j++ === index) {
				return value.value;
			}
			value = iterator.next();
		}
		return undefined;
	}

	transpose<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<Iterable<U>> {
		return new LazyQueryTranspose(this);
	}

	max(this: ILazyQuery<number>): number {
		let i = -Infinity;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (value.value > i) {
				i = value.value;
			}
			value = iterator.next();
		}
		return i;
	}

	min(this: ILazyQuery<number>): number {
		let i = Infinity;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (value.value < i) {
				i = value.value;
			}
			value = iterator.next();
		}
		return i;
	}

	and(): boolean {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (!value.value) {
				return false;
			}
			value = iterator.next();
		}
		return true;
	}

	or(): boolean {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (value.value) {
				return true;
			}
			value = iterator.next();
		}
		return false;
	}

	sum(this: ILazyQuery<number>): number {
		let i = 0;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			i += value.value;
			value = iterator.next();
		}
		return i;
	}

	product(this: ILazyQuery<number>): number {
		let i = 1;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			i *= value.value;
			value = iterator.next();
		}
		return i;
	}

	iterate(func: (value: T) => T): ILazyQuery<T> {
		return new LazyQueryIterate(this, func);
	}

	append<U>(iterable: Iterable<U>): ILazyQuery<T | U> {
		return new LazyQueryAppend(this, iterable);
	}
}

export class LazyQueryCycle<T> extends LazyQuery<T> {
	constructor(source: Iterable<T>) {
		super(source);
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		let iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			while (!value.done) {
				yield value.value;
				value = iterator.next();
			}
			iterator = this.source[Symbol.iterator](onlyMemoized);
			value = iterator.next();
		}
	}
}

export class LazyQueryDrop<T> extends LazyQuery<T> {
	private dropCount: number;
	constructor(source: Iterable<T>, drop: number) {
		super(source);
		this.dropCount = drop;
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		let i = 0;
		while (!value.done && i < this.dropCount) {
			i++;
			value = iterator.next();
		}
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
	}
}

export class LazyQueryIterate<T> extends LazyQuery<T> {
	private iterateFunction: (value: T) => T;
	constructor(source: Iterable<T>, iterateFunction: (value: T) => T) {
		super(source);
		this.iterateFunction = iterateFunction;
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator: Iterator<T> = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			let permutation = value.value;
			while (true) {
				yield permutation;
				permutation = this.iterateFunction(permutation);
			}
		}
	}
}

export class LazyQueryDropWhile<T> extends LazyQuery<T> {
	private dropWhilePredicate: (value: T) => boolean;
	constructor(source: Iterable<T>, predicate: (value: T) => boolean) {
		super(source);
		this.dropWhilePredicate = predicate;
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done && this.dropWhilePredicate(value.value)) {
			value = iterator.next();
		}
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
	}
}

export class LazyQueryMemoize<T> extends LazyQuery<T> {
	private data: T[] = [];
	private iterator: Iterator<T>;
	constructor(source: Iterable<T>) {
		super(source);
		this.iterator = source[Symbol.iterator]();
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		let i = 0;
		while (true) {
			if (i < this.data.length) {
				yield this.data[i++];
			} else if (onlyMemoized) {
				break;
			} else {
				let value = this.iterator.next();
				if (value.done) {
					break;
				}
				this.data.push(value.value);
				i++;
				yield value.value;
			}
		}
	}

	get(index: number): T | undefined {
		if (this.data.length > index) {
			return this.data[index];
		}
		let value = this.iterator.next();
		while (!value.done) {
			this.data.push(value.value);
			if (this.data.length > index) {
				return this.data[index];
			}
			value = this.iterator.next();
		}
		return undefined;
	}
}

export class LazyQueryOnlyMemoized<T> extends LazyQuery<T> {
	constructor(source: Iterable<T>) {
		super(source);
	}

	* [Symbol.iterator](): Iterator<T> {
		const iterator = this.source[Symbol.iterator](true);
		let value = iterator.next();
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
	}
}

export class LazyQueryTake<T> extends LazyQuery<T> {
	private takeCount: number;
	constructor(source: Iterable<T>, take: number) {
		super(source);
		this.takeCount = take;
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		let i = 0;
		while (!value.done && i < this.takeCount) {
			yield value.value;
			i++;
			value = iterator.next();
		}
	}
}

export class LazyQueryTakeWhile<T> extends LazyQuery<T> {
	private takeWhilePredicate: (value: T) => boolean;
	constructor(source: Iterable<T>, predicate: (value: T) => boolean) {
		super(source);
		this.takeWhilePredicate = predicate;
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done && this.takeWhilePredicate(value.value)) {
			yield value.value;
			value = iterator.next();
		}
	}
}

export class LazyQueryTranspose<T> extends LazyQuery<Iterable<T>> {
	constructor(source: Iterable<Iterable<T>>) {
		super(source);
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<Iterable<T>> {
		const collectionIterators = [];
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			collectionIterators.push(value.value[Symbol.iterator]());
			value = iterator.next();
		}
		while (true) {
			const result = [];
			for (let i = 0; i < collectionIterators.length; i++) {
				const value = collectionIterators[i].next();
				if (value.done) {
					collectionIterators.splice(i--, 1);
				} else {
					result.push(value.value);
				}
			}
			if (result.length === 0) {
				break;
			}
			yield result;
		}
	}
}

export class LazyQueryUnique<T> extends LazyQuery<T> {
	constructor(source: Iterable<T>, protected equals?: Equals<T>) {
		super(source);
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		let values = [];
		if (typeof this.equals === 'function') {
			while (!value.done) {
				let unique = true;
				for (let i = 0; i < values.length; i++) {
					if (this.equals(values[i], value.value)) {
						unique = false;
						break;
					}
				}
				if (unique) {
					yield value.value;
					values.push(value.value);
				}
				value = iterator.next();
			}
		} else {
			while (!value.done) {
				let unique = true;
				for (let i = 0; i < values.length; i++) {
					if (values[i] === value.value) {
						unique = false;
						break;
					}
				}
				if (unique) {
					yield value.value;
					values.push(value.value);
				}
				value = iterator.next();
			}
		}
	}
}

export class LazyQueryAppend<T, U> extends LazyQuery<T | U> {
	constructor(source: IterableMemoizable<T>, protected appendix: IterableMemoizable<U>) {
		super(source);
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T | U> {
		let iterator: Iterator<T | U> = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
		iterator = this.appendix[Symbol.iterator](onlyMemoized);
		value = iterator.next();
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
	}
}

import { ILazyQuery } from './ILazyQuery';
import {
	LazyQuery,
	LazyQueryAppend,
	LazyQueryCycle,
	LazyQueryDrop,
	LazyQueryDropWhile,
	LazyQueryIterate,
	LazyQueryMemoize,
	LazyQueryOnlyMemoized,
	LazyQueryTake,
	LazyQueryTakeWhile,
	LazyQueryTranspose,
	LazyQueryUnique
} from './LazyQuery';
import { LazyQueryConcat } from './LazyQueryConcat';
import { LazyQueryFiltered } from './LazyQueryFiltered';
import { LazyQueryIntersperce } from './LazyQueryIntersperce';
import { LazyQueryMapped } from './LazyQueryMapped';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { quicksort } from './quicksort';
import {
	IterableMemoizable,
	PredicateTypeGuard,
	Predicate,
	Equals
} from './Types';

export class LazyQueryPermutations<T> implements ILazyQuery<T[]> {
	constructor(protected source: IterableMemoizable<T>) {
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<T[]> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		const values = [];
		const c = [];
		while (!value.done) {
			values.push(value.value);
			c.push(0);
			value = iterator.next();
		}
		yield values.slice();
		let i = 0;
		while (i < values.length) {
			if (c[i] < i) {
				if (i % 2 === 0) {
					const temp: T = values[0];
					values[0] = values[i];
					values[i] = temp;
				} else {
					const temp: T = values[c[i]];
					values[c[i]] = values[i];
					values[i] = temp;
				}
				yield values.slice();
				c[i] = c[i] + 1;
				i = 0;
			} else {
				c[i] = 0;
				i++;
			}
		}
	}

	toArray(): T[][] {
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

	filter(predicate: Predicate<T[]>): ILazyQuery<T[]>
	filter<U extends T[]>(predicate: PredicateTypeGuard<T[], U>): ILazyQuery<U> {
		return new LazyQueryFiltered(this, predicate);
	}

	map<U>(transform: (value: T[]) => U): ILazyQuery<U> {
		return new LazyQueryMapped(this, transform);
	}

	take(count: number): ILazyQuery<T[]> {
		return new LazyQueryTake(this, count);
	}

	drop(count: number): ILazyQuery<T[]> {
		return new LazyQueryDrop(this, count);
	}

	takeWhile<U extends T[]>(predicate: PredicateTypeGuard<T[], U>): ILazyQuery<U>
	takeWhile(predicate: (value: T[]) => boolean): ILazyQuery<T[]> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	dropWhile<U extends T[]>(predicate: PredicateTypeGuard<T[], U>): ILazyQuery<U>
	dropWhile(predicate: (value: T[]) => boolean): ILazyQuery<T[]> {
		return new LazyQueryDropWhile(this, predicate);
	}

	first(): T[] | undefined {
		return this[Symbol.iterator]().next().value;
	}

	last(): T[] | undefined {
		const iterator = this[Symbol.iterator]();
		let prev;
		let value = iterator.next();
		while (!value.done) {
			prev = value.value;
			value = iterator.next();
		}
		return prev;
	}

	any(predicate: (value: T[]) => boolean): boolean {
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

	all(predicate: (value: T[]) => boolean): boolean {
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

	reverse(): ILazyQuery<T[]> {
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

	intersperse<U>(element: U): ILazyQuery<T[] | U> {
		return new LazyQueryIntersperce(this, element);
	}

	reduce(func: (result: T[], current: T[]) => T[]): T[] | undefined;
	reduce<U>(func: (result: U, current: T[]) => U, initial: U): U;
	reduce<U>(func: (result: U, current: T[]) => U, initial?: U): U | undefined {
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

	unique(equals?: Equals<T[]>): ILazyQuery<T[]> {
		return new LazyQueryUnique(this, equals);
	}

	subsequences(): ILazyQuery<T[][]> {
		return new LazyQuerySubsequences(this);
	}

	permutations(): ILazyQuery<T[][]> {
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

	exec(func: (element: T[]) => void): void {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	sort(comparator: (a: T[], b: T[]) => number): ILazyQuery<T[]> {
		if (!comparator) {
			throw "Comparator undefined";
		}
		// dual-pivot-quick-sort
		const array = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	memoize(): ILazyQuery<T[]> {
		return new LazyQueryMemoize(this);
	}

	onlyMemoized(): ILazyQuery<T[]> {
		return new LazyQueryOnlyMemoized(this);
	}

	concat<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U> {
		return new LazyQueryConcat(this);
	}

	cycle(): ILazyQuery<T[]> {
		return new LazyQueryCycle(this);
	}

	get(index: number): T[] | undefined {
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

	iterate(func: (value: T[]) => T[]): ILazyQuery<T[]> {
		return new LazyQueryIterate(this, func);
	}

	append<U>(iterable: Iterable<U>): ILazyQuery<T[] | U> {
		return new LazyQueryAppend(this, iterable);
	}
}

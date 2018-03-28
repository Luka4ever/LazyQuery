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
	LazyQueryPrepend,
	LazyQueryTake,
	LazyQueryTakeWhile,
	LazyQueryTranspose,
	LazyQueryUnique
} from './LazyQuery';
import { LazyQueryConcat } from './LazyQueryConcat';
import { LazyQueryIntersperce } from './LazyQueryIntersperce';
import { LazyQueryMapped } from './LazyQueryMapped';
import { LazyQueryPermutations } from './LazyQueryPermutations';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { quicksort } from './quicksort';
import {
	IterableMemoizable,
	PredicateTypeGuard,
	Predicate,
	Equals
} from './Types';

export class LazyQueryFiltered<T, U extends T> implements ILazyQuery<U> {
	private queryFilter: (value: T) => value is U;
	constructor(protected source: IterableMemoizable<T>, filter: (value: T) => value is U) {
		this.queryFilter = filter;
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<U> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			if (this.queryFilter(value.value)) {
				yield value.value;
			}
			value = iterator.next();
		}
	}

	toArray(): U[] {
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

	filter(predicate: Predicate<U>): ILazyQuery<U>
	filter<V extends U>(predicate: PredicateTypeGuard<U, V>): ILazyQuery<V> {
		return new LazyQueryFiltered(this, predicate);
	}

	map<V>(transform: (value: U) => V): ILazyQuery<V> {
		return new LazyQueryMapped(this, transform);
	}

	take(count: number): ILazyQuery<U> {
		return new LazyQueryTake(this, count);
	}

	drop(count: number): ILazyQuery<U> {
		return new LazyQueryDrop(this, count);
	}

	takeWhile<V extends U>(predicate: PredicateTypeGuard<U, V>): ILazyQuery<V>
	takeWhile(predicate: (value: U) => boolean): ILazyQuery<U> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	dropWhile<V extends U>(predicate: PredicateTypeGuard<U, V>): ILazyQuery<V>
	dropWhile(predicate: (value: U) => boolean): ILazyQuery<U> {
		return new LazyQueryDropWhile(this, predicate);
	}

	first(): U | undefined {
		return this[Symbol.iterator]().next().value;
	}

	last(): U | undefined {
		const iterator = this[Symbol.iterator]();
		let prev;
		let value = iterator.next();
		while (!value.done) {
			prev = value.value;
			value = iterator.next();
		}
		return prev;
	}

	any(predicate: (value: U) => boolean): boolean {
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

	all(predicate: (value: U) => boolean): boolean {
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

	reverse(): ILazyQuery<U> {
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

	intersperse<V>(element: V): ILazyQuery<U | V> {
		return new LazyQueryIntersperce(this, element);
	}

	reduce(func: (result: U, current: U) => U): U | undefined;
	reduce<V>(func: (result: V, current: U) => V, initial: V): V;
	reduce<V>(func: (result: V, current: U) => V, initial?: V): V | undefined {
		const iterator = this[Symbol.iterator]();
		if (arguments.length < 2) {
			let value = iterator.next();
			if (value.done) {
				return undefined;
			}
			let result = value.value as any as V;
			value = iterator.next();
			while (!value.done) {
				result = func(result, value.value);
				value = iterator.next();
			}
			return result;
		}
		let result = initial as V;
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

	unique(equals?: Equals<U>): ILazyQuery<U> {
		return new LazyQueryUnique(this, equals);
	}

	subsequences(): ILazyQuery<U[]> {
		return new LazyQuerySubsequences(this);
	}

	permutations(): ILazyQuery<U[]> {
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

	exec(func: (element: U) => void): void {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	sort(comparator: (a: U, b: U) => number): ILazyQuery<U> {
		if (!comparator) {
			throw "Comparator undefined";
		}
		// dual-pivot-quick-sort
		const array = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	memoize(): ILazyQuery<U> {
		return new LazyQueryMemoize(this);
	}

	onlyMemoized(): ILazyQuery<U> {
		return new LazyQueryOnlyMemoized(this);
	}

	concat<V>(this: ILazyQuery<Iterable<V>>): ILazyQuery<V> {
		return new LazyQueryConcat(this);
	}

	cycle(): ILazyQuery<U> {
		return new LazyQueryCycle(this);
	}

	get(index: number): U | undefined {
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

	transpose<V>(this: ILazyQuery<Iterable<V>>): ILazyQuery<Iterable<V>> {
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

	iterate(func: (value: U) => U): ILazyQuery<U> {
		return new LazyQueryIterate(this, func);
	}

	append<V>(iterable: Iterable<V>): ILazyQuery<U | V> {
		return new LazyQueryAppend(this, iterable);
	}

	prepend<V>(iterable: Iterable<V>): ILazyQuery<U | V> {
		return new LazyQueryPrepend(this, iterable);
	}
}

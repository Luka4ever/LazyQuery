import { ILazyQuery } from './ILazyQuery';
import { LazyQuery } from './LazyQuery';
import { LazyQueryAppend } from './LazyQueryAppend';
import { LazyQueryConcat } from './LazyQueryConcat';
import { LazyQueryCycle } from './LazyQueryCycle';
import { LazyQueryDrop } from './LazyQueryDrop';
import { LazyQueryDropWhile } from './LazyQueryDropWhile';
import { LazyQueryFiltered } from './LazyQueryFiltered';
import { LazyQueryIntersperce } from './LazyQueryIntersperce';
import { LazyQueryIterate } from './LazyQueryIterate';
import { LazyQueryMemoize } from './LazyQueryMemoize';
import { LazyQueryOnlyMemoized } from './LazyQueryOnlyMemoized';
import { LazyQueryPermutations } from './LazyQueryPermutations';
import { LazyQueryPrepend } from './LazyQueryPrepend';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { LazyQueryTake } from './LazyQueryTake';
import { LazyQueryTakeWhile } from './LazyQueryTakeWhile';
import { LazyQueryTranspose } from './LazyQueryTranspose';
import { LazyQueryUnique } from './LazyQueryUnique';
import { quicksort } from './quicksort';
import {
	IterableMemoizable,
	PredicateTypeGuard,
	Predicate,
	Transform,
	Equals,
	Accumulator,
	Executor,
	Comparator
} from './Types';

export class LazyQueryMapped<T, U> implements ILazyQuery<U> {
	private mapFunction: Transform<T, U>;
	constructor(protected source: IterableMemoizable<T>, map: Transform<T, U>) {
		this.mapFunction = map;
	}

	*[Symbol.iterator](onlyMemoized?: boolean): Iterator<U> {
		const iterator = this.source[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			yield this.mapFunction(value.value);
			value = iterator.next();
		}
	}

	all(predicate: Predicate<U>): boolean {
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

	any(predicate: Predicate<U>): boolean {
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

	append<V>(iterable: Iterable<V>): ILazyQuery<U | V> {
		return new LazyQueryAppend(this, iterable);
	}

	average(transform?: Transform<U, number>): number {
		let total = 0;
		let count = 0;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		if (transform) {
			while (!value.done) {
				count++;
				total += transform(value.value);
				value = iterator.next();
			}
		} else {
			while (!value.done) {
				count++;
				total += (value.value as any) as number;
				value = iterator.next();
			}
		}
		return count > 0 ? total / count : 0;
	}

	concat<V>(this: ILazyQuery<Iterable<V>>): ILazyQuery<V> {
		return new LazyQueryConcat(this);
	}

	contains(element: U): boolean {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (value.value === element) {
				return true;
			}
			value = iterator.next();
		}
		return false;
	}

	count(): number;
	count(predicate: Predicate<U>): number;
	count(predicate?: Predicate<U>): number {
		let result = 0;
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		if (predicate) {
			while (!value.done) {
				if (predicate(value.value)) {
					result++;
				}
				value = iterator.next();
			}
		} else {
			while (!value.done) {
				result++;
				value = iterator.next();
			}
		}
		return result;
	}

	cycle(): ILazyQuery<U> {
		return new LazyQueryCycle(this);
	}

	drop(count: number): ILazyQuery<U> {
		return new LazyQueryDrop(this, count);
	}

	dropWhile(predicate: Predicate<U>): ILazyQuery<U> {
		return new LazyQueryDropWhile(this, predicate);
	}

	exec(func: Executor<U>): void {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	filter(predicate: Predicate<U>): ILazyQuery<U>;
	filter<V extends U>(predicate: PredicateTypeGuard<U, V>): ILazyQuery<V> {
		return new LazyQueryFiltered(this, predicate);
	}

	find(predicate: Predicate<U>): U | undefined {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			if (predicate(value.value)) {
				return value.value;
			}
			value = iterator.next();
		}
		return undefined;
	}

	first(): U | undefined {
		return this[Symbol.iterator]().next().value;
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

	intersperse<V>(element: V): ILazyQuery<U | V> {
		return new LazyQueryIntersperce(this, element);
	}

	isEmpty(): boolean {
		return this[Symbol.iterator]().next().done;
	}

	iterate(func: (value: U) => U): ILazyQuery<U> {
		return new LazyQueryIterate(this, func);
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

	map<V>(transform: Transform<U, V>): ILazyQuery<V> {
		return new LazyQueryMapped(this, transform);
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

	memoize(): ILazyQuery<U> {
		return new LazyQueryMemoize(this);
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

	onlyMemoized(): ILazyQuery<U> {
		return new LazyQueryOnlyMemoized(this);
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

	permutations(): ILazyQuery<U[]> {
		return new LazyQueryPermutations(this);
	}

	prepend<V>(iterable: Iterable<V>): ILazyQuery<U | V> {
		return new LazyQueryPrepend(this, iterable);
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

	reduce(func: Accumulator<U, U>): U | undefined;
	reduce<V>(func: Accumulator<U, V>, initial: V): V;
	reduce<V>(func: Accumulator<U, V>, initial?: V): V | undefined {
		const iterator = this[Symbol.iterator]();
		if (arguments.length < 2) {
			let value = iterator.next();
			if (value.done) {
				return undefined;
			}
			let result = (value.value as any) as V;
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

	sort(comparator: Comparator<U>): ILazyQuery<U> {
		if (!comparator) {
			throw 'Comparator undefined';
		}
		// dual-pivot-quick-sort
		const array = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	subsequences(): ILazyQuery<U[]> {
		return new LazyQuerySubsequences(this);
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

	take(count: number): ILazyQuery<U> {
		return new LazyQueryTake(this, count);
	}

	takeWhile(predicate: Predicate<U>): ILazyQuery<U> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	toArray(): U[] {
		return [...this];
	}

	toString(): string {
		let s = '';
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			s += value.value.toString();
			value = iterator.next();
		}
		return s;
	}

	transpose<V>(this: ILazyQuery<Iterable<V>>): ILazyQuery<Iterable<V>> {
		return new LazyQueryTranspose(this);
	}

	unique(equals?: Equals<U>): ILazyQuery<U> {
		return new LazyQueryUnique(this, equals);
	}
}

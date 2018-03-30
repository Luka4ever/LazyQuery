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
import { LazyQueryMapped } from './LazyQueryMapped';
import { LazyQueryMemoize } from './LazyQueryMemoize';
import { LazyQueryOnlyMemoized } from './LazyQueryOnlyMemoized';
import { LazyQueryPermutations } from './LazyQueryPermutations';
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

export class LazyQueryPrepend<T, U> implements ILazyQuery<T | U> {
	constructor(protected source: IterableMemoizable<T>, protected appendix: IterableMemoizable<U>) {}

	*[Symbol.iterator](onlyMemoized?: boolean): Iterator<T | U> {
		let iterator: Iterator<T | U> = this.appendix[Symbol.iterator](onlyMemoized);
		let value = iterator.next();
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
		iterator = this.source[Symbol.iterator](onlyMemoized);
		value = iterator.next();
		while (!value.done) {
			yield value.value;
			value = iterator.next();
		}
	}

	toArray(): (T | U)[] {
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

	filter(predicate: Predicate<T | U>): ILazyQuery<T | U>;
	filter<V extends T | U>(predicate: PredicateTypeGuard<T | U, V>): ILazyQuery<V> {
		return new LazyQueryFiltered(this, predicate);
	}

	map<V>(transform: Transform<T | U, V>): ILazyQuery<V> {
		return new LazyQueryMapped(this, transform);
	}

	take(count: number): ILazyQuery<T | U> {
		return new LazyQueryTake(this, count);
	}

	drop(count: number): ILazyQuery<T | U> {
		return new LazyQueryDrop(this, count);
	}

	takeWhile(predicate: Predicate<T | U>): ILazyQuery<T | U> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	dropWhile(predicate: Predicate<T | U>): ILazyQuery<T | U> {
		return new LazyQueryDropWhile(this, predicate);
	}

	first(): T | U | undefined {
		return this[Symbol.iterator]().next().value;
	}

	last(): T | U | undefined {
		const iterator = this[Symbol.iterator]();
		let prev;
		let value = iterator.next();
		while (!value.done) {
			prev = value.value;
			value = iterator.next();
		}
		return prev;
	}

	any(predicate: Predicate<T | U>): boolean {
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

	all(predicate: Predicate<T | U>): boolean {
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

	reverse(): ILazyQuery<T | U> {
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

	intersperse<V>(element: V): ILazyQuery<T | U | V> {
		return new LazyQueryIntersperce(this, element);
	}

	reduce(func: Accumulator<T | U, T | U>): T | U | undefined;
	reduce<V>(func: Accumulator<T | U, V>, initial: V): V;
	reduce<V>(func: Accumulator<T | U, V>, initial?: V): V | undefined {
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

	unique(equals?: Equals<T | U>): ILazyQuery<T | U> {
		return new LazyQueryUnique(this, equals);
	}

	subsequences(): ILazyQuery<(T | U)[]> {
		return new LazyQuerySubsequences(this);
	}

	permutations(): ILazyQuery<(T | U)[]> {
		return new LazyQueryPermutations(this);
	}

	isEmpty(): boolean {
		return this[Symbol.iterator]().next().done;
	}

	count(): number;
	count(predicate: Predicate<T | U>): number;
	count(predicate?: Predicate<T | U>): number {
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

	exec(func: Executor<T | U>) {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	sort(comparator: Comparator<T | U>): ILazyQuery<T | U> {
		if (!comparator) {
			throw 'Comparator undefined';
		}
		// dual-pivot-quick-sort
		const array: (T | U)[] = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	memoize(): ILazyQuery<T | U> {
		return new LazyQueryMemoize(this);
	}

	onlyMemoized(): ILazyQuery<T | U> {
		return new LazyQueryOnlyMemoized(this);
	}

	concat<V>(this: ILazyQuery<Iterable<V>>): ILazyQuery<V> {
		return new LazyQueryConcat(this);
	}

	cycle(): ILazyQuery<T | U> {
		return new LazyQueryCycle(this);
	}

	get(index: number): T | U | undefined {
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

	iterate(func: (value: T | U) => T | U): ILazyQuery<T | U> {
		return new LazyQueryIterate(this, func);
	}

	append<V>(iterable: Iterable<V>): ILazyQuery<T | U | V> {
		return new LazyQueryAppend(this, iterable);
	}

	prepend<V>(iterable: Iterable<V>): ILazyQuery<T | U | V> {
		return new LazyQueryPrepend(this, iterable);
	}

	find(predicate: Predicate<T | U>): T | U | undefined {
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

	average(transform?: Transform<T | U, number>): number {
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

	contains(element: T | U): boolean {
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
}

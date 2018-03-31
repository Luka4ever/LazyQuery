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

export class LazyQueryMemoize<T> implements ILazyQuery<T> {
	private data: T[] = [];
	private iterator: Iterator<T>;
	constructor(protected source: IterableMemoizable<T>) {
		this.iterator = source[Symbol.iterator]();
	}

	*[Symbol.iterator](onlyMemoized?: boolean): Iterator<T> {
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

	all(predicate: Predicate<T>): boolean {
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

	any(predicate: Predicate<T>): boolean {
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

	append<U>(iterable: Iterable<U>): ILazyQuery<T | U> {
		return new LazyQueryAppend(this, iterable);
	}

	average(transform?: Transform<T, number>): number {
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

	concat<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U> {
		return new LazyQueryConcat(this);
	}

	contains(element: T): boolean {
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
	count(predicate: Predicate<T>): number;
	count(predicate?: Predicate<T>): number {
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

	cycle(): ILazyQuery<T> {
		return new LazyQueryCycle(this);
	}

	drop(count: number): ILazyQuery<T> {
		return new LazyQueryDrop(this, count);
	}

	dropWhile(predicate: Predicate<T>): ILazyQuery<T> {
		return new LazyQueryDropWhile(this, predicate);
	}

	exec(func: Executor<T>) {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	filter(predicate: Predicate<T>): ILazyQuery<T>;
	filter<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U> {
		return new LazyQueryFiltered(this, predicate);
	}

	find(predicate: Predicate<T>): T | undefined {
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

	first(): T | undefined {
		return this[Symbol.iterator]().next().value;
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

	intersperse<U>(element: U): ILazyQuery<T | U> {
		return new LazyQueryIntersperce(this, element);
	}

	isEmpty(): boolean {
		return this[Symbol.iterator]().next().done;
	}

	iterate(func: (value: T) => T): ILazyQuery<T> {
		return new LazyQueryIterate(this, func);
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

	map<U>(transform: Transform<T, U>): ILazyQuery<U> {
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

	memoize(): ILazyQuery<T> {
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

	onlyMemoized(): ILazyQuery<T> {
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

	permutations(): ILazyQuery<T[]> {
		return new LazyQueryPermutations(this);
	}

	prepend<U>(iterable: Iterable<U>): ILazyQuery<T | U> {
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

	reduce(func: Accumulator<T, T>): T | undefined;
	reduce<U>(func: Accumulator<T, U>, initial: U): U;
	reduce<U>(func: Accumulator<T, U>, initial?: U): U | undefined {
		const iterator = this[Symbol.iterator]();
		if (arguments.length < 2) {
			let value = iterator.next();
			if (value.done) {
				return undefined;
			}
			let result = (value.value as any) as U;
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

	sort(comparator: Comparator<T>): ILazyQuery<T> {
		if (!comparator) {
			throw 'Comparator undefined';
		}
		// dual-pivot-quick-sort
		const array: T[] = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	subsequences(): ILazyQuery<T[]> {
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

	take(count: number): ILazyQuery<T> {
		return new LazyQueryTake(this, count);
	}

	takeWhile(predicate: Predicate<T>): ILazyQuery<T> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	toArray(): T[] {
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

	transpose<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<Iterable<U>> {
		return new LazyQueryTranspose(this);
	}

	unique(equals?: Equals<T>): ILazyQuery<T> {
		return new LazyQueryUnique(this, equals);
	}
}

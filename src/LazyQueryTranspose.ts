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
import { LazyQueryPrepend } from './LazyQueryPrepend';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { LazyQueryTake } from './LazyQueryTake';
import { LazyQueryTakeWhile } from './LazyQueryTakeWhile';
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

export class LazyQueryTranspose<T> implements ILazyQuery<Iterable<T>> {
	constructor(protected source: IterableMemoizable<Iterable<T>>) {}

	*[Symbol.iterator](onlyMemoized?: boolean): Iterator<Iterable<T>> {
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

	toArray(): Iterable<T>[] {
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

	filter(predicate: Predicate<Iterable<T>>): ILazyQuery<Iterable<T>>;
	filter<U extends Iterable<T>>(predicate: PredicateTypeGuard<Iterable<T>, U>): ILazyQuery<U> {
		return new LazyQueryFiltered(this, predicate);
	}

	map<U>(transform: Transform<Iterable<T>, U>): ILazyQuery<U> {
		return new LazyQueryMapped(this, transform);
	}

	take(count: number): ILazyQuery<Iterable<T>> {
		return new LazyQueryTake(this, count);
	}

	drop(count: number): ILazyQuery<Iterable<T>> {
		return new LazyQueryDrop(this, count);
	}

	takeWhile(predicate: Predicate<Iterable<T>>): ILazyQuery<Iterable<T>> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	dropWhile(predicate: Predicate<Iterable<T>>): ILazyQuery<Iterable<T>> {
		return new LazyQueryDropWhile(this, predicate);
	}

	first(): Iterable<T> | undefined {
		return this[Symbol.iterator]().next().value;
	}

	last(): Iterable<T> | undefined {
		const iterator = this[Symbol.iterator]();
		let prev;
		let value = iterator.next();
		while (!value.done) {
			prev = value.value;
			value = iterator.next();
		}
		return prev;
	}

	any(predicate: Predicate<Iterable<T>>): boolean {
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

	all(predicate: Predicate<Iterable<T>>): boolean {
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

	reverse(): ILazyQuery<Iterable<T>> {
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

	intersperse<U>(element: U): ILazyQuery<Iterable<T> | U> {
		return new LazyQueryIntersperce(this, element);
	}

	reduce(func: Accumulator<Iterable<T>, Iterable<T>>): Iterable<T> | undefined;
	reduce<U>(func: Accumulator<Iterable<T>, U>, initial: U): U;
	reduce<U>(func: Accumulator<Iterable<T>, U>, initial?: U): U | undefined {
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

	unique(equals?: Equals<Iterable<T>>): ILazyQuery<Iterable<T>> {
		return new LazyQueryUnique(this, equals);
	}

	subsequences(): ILazyQuery<Iterable<T>[]> {
		return new LazyQuerySubsequences(this);
	}

	permutations(): ILazyQuery<Iterable<T>[]> {
		return new LazyQueryPermutations(this);
	}

	isEmpty(): boolean {
		return this[Symbol.iterator]().next().done;
	}

	count(): number;
	count(predicate: Predicate<Iterable<T>>): number;
	count(predicate?: Predicate<Iterable<T>>): number {
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

	exec(func: Executor<Iterable<T>>) {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	sort(comparator: Comparator<Iterable<T>>): ILazyQuery<Iterable<T>> {
		if (!comparator) {
			throw 'Comparator undefined';
		}
		// dual-pivot-quick-sort
		const array: Iterable<T>[] = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	memoize(): ILazyQuery<Iterable<T>> {
		return new LazyQueryMemoize(this);
	}

	onlyMemoized(): ILazyQuery<Iterable<T>> {
		return new LazyQueryOnlyMemoized(this);
	}

	concat<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U> {
		return new LazyQueryConcat(this);
	}

	cycle(): ILazyQuery<Iterable<T>> {
		return new LazyQueryCycle(this);
	}

	get(index: number): Iterable<T> | undefined {
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

	iterate(func: (value: Iterable<T>) => Iterable<T>): ILazyQuery<Iterable<T>> {
		return new LazyQueryIterate(this, func);
	}

	append<U>(iterable: Iterable<U>): ILazyQuery<Iterable<T> | U> {
		return new LazyQueryAppend(this, iterable);
	}

	prepend<U>(iterable: Iterable<U>): ILazyQuery<Iterable<T> | U> {
		return new LazyQueryPrepend(this, iterable);
	}

	find(predicate: Predicate<Iterable<T>>): Iterable<T> | undefined {
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

	average(transform?: Transform<Iterable<T>, number>): number {
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

	contains(element: Iterable<T>): boolean {
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

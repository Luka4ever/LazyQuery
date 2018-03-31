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
import { Tuple } from './Tuple';

export class LazyQueryZip<T, U> implements ILazyQuery<Tuple<T, U>> {
	constructor(protected sourceA: IterableMemoizable<T>, protected sourceB: IterableMemoizable<U>) {}

	*[Symbol.iterator](onlyMemoized?: boolean): Iterator<Tuple<T, U>> {
		const iteratorA = this.sourceA[Symbol.iterator](onlyMemoized);
		const iteratorB = this.sourceB[Symbol.iterator](onlyMemoized);
		let valueA = iteratorA.next();
		let valueB = iteratorB.next();
		while (!valueA.done && !valueB.done) {
			yield new Tuple(valueA.value, valueB.value);
			valueA = iteratorA.next();
			valueB = iteratorB.next();
		}
	}

	all(predicate: Predicate<Tuple<T, U>>): boolean {
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

	any(predicate: Predicate<Tuple<T, U>>): boolean {
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

	append<V>(iterable: Iterable<V>): ILazyQuery<Tuple<T, U> | V> {
		return new LazyQueryAppend(this, iterable);
	}

	average(transform?: Transform<Tuple<T, U>, number>): number {
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

	contains(element: Tuple<T, U>): boolean {
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
	count(predicate: Predicate<Tuple<T, U>>): number;
	count(predicate?: Predicate<Tuple<T, U>>): number {
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

	cycle(): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryCycle(this);
	}

	drop(count: number): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryDrop(this, count);
	}

	dropWhile(predicate: Predicate<Tuple<T, U>>): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryDropWhile(this, predicate);
	}

	exec(func: Executor<Tuple<T, U>>): void {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	filter(predicate: Predicate<Tuple<T, U>>): ILazyQuery<Tuple<T, U>>;
	filter<V extends Tuple<T, U>>(predicate: PredicateTypeGuard<Tuple<T, U>, V>): ILazyQuery<V> {
		return new LazyQueryFiltered(this, predicate);
	}

	find(predicate: Predicate<Tuple<T, U>>): Tuple<T, U> | undefined {
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

	first(): Tuple<T, U> | undefined {
		return this[Symbol.iterator]().next().value;
	}

	get(index: number): Tuple<T, U> | undefined {
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

	intersperse<V>(element: V): ILazyQuery<Tuple<T, U> | V> {
		return new LazyQueryIntersperce(this, element);
	}

	isEmpty(): boolean {
		return this[Symbol.iterator]().next().done;
	}

	iterate(func: (value: Tuple<T, U>) => Tuple<T, U>): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryIterate(this, func);
	}

	last(): Tuple<T, U> | undefined {
		const iterator = this[Symbol.iterator]();
		let prev;
		let value = iterator.next();
		while (!value.done) {
			prev = value.value;
			value = iterator.next();
		}
		return prev;
	}

	map<V>(transform: Transform<Tuple<T, U>, V>): ILazyQuery<V> {
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

	memoize(): ILazyQuery<Tuple<T, U>> {
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

	onlyMemoized(): ILazyQuery<Tuple<T, U>> {
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

	permutations(): ILazyQuery<Tuple<T, U>[]> {
		return new LazyQueryPermutations(this);
	}

	prepend<V>(iterable: Iterable<V>): ILazyQuery<Tuple<T, U> | V> {
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

	reduce(func: Accumulator<Tuple<T, U>, Tuple<T, U>>): Tuple<T, U> | undefined;
	reduce<V>(func: Accumulator<Tuple<T, U>, V>, initial: V): V;
	reduce<V>(func: Accumulator<Tuple<T, U>, V>, initial?: V): V | undefined {
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

	reverse(): ILazyQuery<Tuple<T, U>> {
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

	sort(comparator: Comparator<Tuple<T, U>>): ILazyQuery<Tuple<T, U>> {
		if (!comparator) {
			throw 'Comparator undefined';
		}
		// dual-pivot-quick-sort
		const array = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	subsequences(): ILazyQuery<Tuple<T, U>[]> {
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

	take(count: number): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryTake(this, count);
	}

	takeWhile(predicate: Predicate<Tuple<T, U>>): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	toArray(): Tuple<T, U>[] {
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

	unique(equals?: Equals<Tuple<T, U>>): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryUnique(this, equals);
	}
}

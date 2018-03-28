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
import { LazyQueryPermutations } from './LazyQueryPermutations';
import { LazyQuerySubsequences } from './LazyQuerySubsequences';
import { quicksort } from './quicksort';
import {
	IterableMemoizable,
	PredicateTypeGuard,
	Predicate,
	Equals
} from './Types';
import { Tuple } from './Tuple';

export class LazyQueryZip<T, U> implements ILazyQuery<Tuple<T, U>> {
	constructor(protected sourceA: IterableMemoizable<T>, protected sourceB: IterableMemoizable<U>) {
	}

	* [Symbol.iterator](onlyMemoized?: boolean): Iterator<Tuple<T, U>> {
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

	toArray(): Tuple<T, U>[] {
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

	filter(predicate: Predicate<Tuple<T, U>>): ILazyQuery<Tuple<T, U>>
	filter<V extends Tuple<T, U>>(predicate: PredicateTypeGuard<Tuple<T, U>, V>): ILazyQuery<V> {
		return new LazyQueryFiltered(this, predicate);
	}

	map<V>(transform: (value: Tuple<T, U>) => V): ILazyQuery<V> {
		return new LazyQueryMapped(this, transform);
	}

	take(count: number): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryTake(this, count);
	}

	drop(count: number): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryDrop(this, count);
	}

	takeWhile<V extends Tuple<T, U>>(predicate: PredicateTypeGuard<Tuple<T, U>, V>): ILazyQuery<V>
	takeWhile(predicate: (value: Tuple<T, U>) => boolean): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryTakeWhile(this, predicate);
	}

	dropWhile<V extends Tuple<T, U>>(predicate: PredicateTypeGuard<Tuple<T, U>, V>): ILazyQuery<V>
	dropWhile(predicate: (value:Tuple<T,U>) => boolean): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryDropWhile(this, predicate);
	}

	first(): Tuple<T, U> | undefined {
		return this[Symbol.iterator]().next().value;
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

	any(predicate: (value: Tuple<T, U>) => boolean): boolean {
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

	all(predicate: (value: Tuple<T, U>) => boolean): boolean {
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

	intersperse<V>(element: V): ILazyQuery<Tuple<T, U> | V> {
		return new LazyQueryIntersperce(this, element);
	}

	reduce(func: (result: Tuple<T, U>, current: Tuple<T, U>) => Tuple<T, U>): Tuple<T, U> | undefined;
	reduce<V>(func: (result: V, current: Tuple<T, U>) => V, initial: V): V;
	reduce<V>(func: (result: V, current: Tuple<T, U>) => V, initial?: V): V | undefined {
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

	unique(equals?: Equals<Tuple<T, U>>): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryUnique(this, equals);
	}

	subsequences(): ILazyQuery<Tuple<T, U>[]> {
		return new LazyQuerySubsequences(this);
	}

	permutations(): ILazyQuery<Tuple<T, U>[]> {
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

	exec(func: (element: Tuple<T, U>) => void): void {
		const iterator = this[Symbol.iterator]();
		let value = iterator.next();
		while (!value.done) {
			func(value.value);
			value = iterator.next();
		}
	}

	sort(comparator: (a: Tuple<T, U>, b: Tuple<T, U>) => number): ILazyQuery<Tuple<T, U>> {
		if (!comparator) {
			throw "Comparator undefined";
		}
		// dual-pivot-quick-sort
		const array = this.toArray();
		return new LazyQuery(quicksort(array, 0, array.length - 1, 3, comparator));
	}

	memoize(): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryMemoize(this);
	}

	onlyMemoized(): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryOnlyMemoized(this);
	}

	concat<V>(this: ILazyQuery<Iterable<V>>): ILazyQuery<V> {
		return new LazyQueryConcat(this);
	}

	cycle(): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryCycle(this);
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

	iterate(func: (value: Tuple<T, U>) => Tuple<T, U>): ILazyQuery<Tuple<T, U>> {
		return new LazyQueryIterate(this, func);
	}

	append<V>(iterable: Iterable<V>): ILazyQuery<Tuple<T, U> | V> {
		return new LazyQueryAppend(this, iterable);
	}
}

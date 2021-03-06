import {
	IterableMemoizable,
	PredicateTypeGuard,
	Predicate,
	Transform,
	Accumulator,
	Equals,
	Executor,
	Comparator
} from './Types';

export interface ILazyQuery<T> extends IterableMemoizable<T> {
	[Symbol.iterator](onlyMemoized?: boolean): Iterator<T>;

	/**
	 * Determines whether all element in the collection satisfies a given predicate
	 * @param {Predicate} predicate The function to test the elements against
	 * @return {boolean} True if all applications of the predicate returns true
	 */
	all(predicate: Predicate<T>): boolean;

	/**
	 * Returns 'true' if all elements in the collection are truthy, otherwise it returns 'false'
	 * @return {boolean} true if all are truthy, otherwise false
	 */
	and(): boolean;

	/**
	 * Determines whether any element in the collection satisfies a given predicate
	 * @param {Predicate} predicate The function to test the elements against
	 * @return {boolean} True if any application of the predicate returns true
	 */
	any(predicate: Predicate<T>): boolean;

	/**
	 * Appends a collection to the end of the collection
	 *
	 * @template U The type of the elements in the collection to append
	 * @param {Iterable<U>} iterable The collection to append
	 * @returns {(ILazyQuery<T | U>)} A new collection
	 * @memberof ILazyQuery
	 */
	append<U>(iterable: Iterable<U>): ILazyQuery<T | U>;

	/**
	 * Calculates the average of a sequence of numbers
	 *
	 * @param {Transform<T, number>} [transform] A function to transform the elements of the collection to numerical representations
	 * @returns {number} The average of the collection
	 * @memberof ILazyQuery
	 */
	average(transform: Transform<T, number>): number;

	/**
	 * Calculates the average of a sequence of numbers
	 *
	 * @param {ILazyQuery<number>} this
	 * @returns {number} The average of the collection
	 * @memberof ILazyQuery
	 */
	average(this: ILazyQuery<number>): number;

	/**
	 * Concatenates the collections in the collection
	 * @type {U}
	 * @return {ILazyQuery<U>}
	 */
	concat<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<U>;

	/**
	 * Determines if the collection contains a given element
	 *
	 * @param {T} element The element to check for
	 * @returns {boolean} True if the collection contains the element, otherwise false
	 * @memberof ILazyQuery
	 */
	contains(element: T): boolean;

	/**
	 * Determines the number of elements in the collection
	 * @return {number} The number of elements in the collection
	 */
	count(): number;

	/**
	 * Determines the number of elements in the collection that pass a given predicate function
	 *
	 * @param {Predicate<T>} predicate The predicate to test against
	 * @returns {number} The number of elements in the collection that pass the predicate
	 * @memberof ILazyQuery
	 */
	count(predicate: Predicate<T>): number;

	/**
	 * Makes the collection cycle until it encounters an empty collection
	 * @return {ILazyQuery<T>} A new collection
	 */
	cycle(): ILazyQuery<T>;

	/**
	 * Drops the first n elemenets in the collection
	 * @param {number} count The number of elements to drop
	 * @return {ILazyQuery<T>} A new collection
	 */
	drop(count: number): ILazyQuery<T>;

	/**
	 * Drops elements from the collection as long as the supplied predicate when called on the current element returns true
	 * @param {Predicate<T>} predicate The function to test the elements against
	 * @return {ILazyQuery<T>} A new collection
	 */
	dropWhile(predicate: Predicate<T>): ILazyQuery<T>;

	/**
	 * Executes a function on each element in the collection
	 * @param {executor<T>} func The function to execute with each element in the collection
	 */
	exec(func: Executor<T>): void;

	/**
	 * Filters the query based on a predicate
	 * @param {PredicateTypeGuard<T, U>} predicate The predicate to test the values against
	 * @return {ILazyQuery<U>} A new filtered query
	 */
	filter<U extends T>(predicate: PredicateTypeGuard<T, U>): ILazyQuery<U>;

	/**
	 * Filters the query based on a predicate
	 * @param {Predicate<T>} predicate The predicate to test the values against
	 * @return {ILazyQuery<T>} A new filtered query
	 */
	filter(predicate: Predicate<T>): ILazyQuery<T>;

	/**
	 * Finds the first element that satisfies given predicate
	 *
	 * @param {Predicate<T>} predicate The predicate to test against
	 * @returns {(T | undefined)} The first element that satisfies the predicate or undefined if no elements satisfy it
	 * @memberof ILazyQuery
	 */
	find(predicate: Predicate<T>): T | undefined;

	/**
	 * Returns the first value matching the query
	 * @return {T} The first element in the collection
	 */
	first(): T | undefined;

	/**
	 * Gets the element at a given index
	 * @param {number} index The index to get an element at
	 * @return {T} The element at the index
	 */
	get(index: number): T | undefined;

	/**
	 * Intersperces an element between all elements in the collection
	 * @type {U} The type to intersperce
	 * @param {U} element The element to intersperse
	 * @return {ILazyQuery<T | U>} A new collection
	 */
	intersperse<U>(element: U): ILazyQuery<T | U>;

	/**
	 * Determines whether the collection is empty
	 * @return {boolean} True if empty, otherwise false
	 */
	isEmpty(): boolean;

	/**
	 * Returns a new infinite collection of repeated applications of the supplied function to the first value in the collection
	 * @param {Iterator<T>} func A function that returns the next element in the sequence, when given the previous element
	 * @return {ILazyQuery<T>} A new collection
	 */
	iterate(func: (value: T) => T): ILazyQuery<T>;

	/**
	 * Returns the last value in the collection
	 * @return {T} The last element in the collection
	 */
	last(): T | undefined;

	/**
	 * Maps the source onto new values as described by the transform function supplied
	 * @type {U} The new value type
	 * @param {transform<T, U>} transform The transform method to apply to the values
	 * @return {ILazyQuery<U>} A transformed version of the query
	 */
	map<U>(transform: Transform<T, U>): ILazyQuery<U>;

	/**
	 * Returns the largest element in the collection or -Infinity if the collection is empty
	 * @return {number} The largest element in the collection
	 */
	max(this: ILazyQuery<number>): number;

	/**
	 * Returns a memoized version of the collection
	 * @return {ILazyQuery<T>} A new collection
	 */
	memoize(): ILazyQuery<T>;

	/**
	 * Returns the smallest element in the collection or Infinity if the collection is empty
	 * @return {number} The smallest element in the collection
	 */
	min(this: ILazyQuery<number>): number;

	/**
	 * Returns a version of the collection only containing values already memoized
	 *
	 * This can be used to create infinite series of data where the next element is described by what came before it
	 * @return {ILazyQuery<T>} A new collection
	 */
	onlyMemoized(): ILazyQuery<T>;

	/**
	 * Returns 'false' if all elements in the collection are falsy, otherwise it returns 'true'
	 * @return {boolean} true if any are truthy, otherwise false
	 */
	or(): boolean;

	/**
	 * Returns a new collection containing all the permutations of the collection
	 *
	 * E.g. [0, 1, 2] becomes [[0, 1, 2], [1, 0, 2], [2, 0, 1], [0, 2, 1], [1, 2, 0], [2, 1, 0]]
	 * @return {ILazyQuery<T[]>} A new collection
	 */
	permutations(): ILazyQuery<T[]>;

	/**
	 * Prepends a collection to the start of the collection
	 *
	 * @template U The type of the elements in the collection to prepend
	 * @param {Iterable<U>} iterable The collection to prepend
	 * @returns {(ILazyQuery<T | U>)} A new collection
	 * @memberof ILazyQuery
	 */
	prepend<U>(iterable: Iterable<U>): ILazyQuery<T | U>;

	/**
	 * Calculates the product of the collection
	 * @return {number} The product of the collection
	 */
	product(this: ILazyQuery<number>): number;

	/**
	 * Reduces the collection to one value by applying an accumulator function on each value in the collection
	 *
	 * @param {Accumulator<T, T>} func The accumulator function
	 * @returns {(T | undefined)} The result of the given function or undefined if the collection is empty
	 * @memberof ILazyQuery
	 */
	reduce(func: Accumulator<T, T>): T | undefined;

	/**
	 * Reduces the collection to one value by applying an accumulator function on each value in the collection
	 * @param {Accumulator<T, U>} func The accumulator function
	 * @param {U} initial The value to give the supplied accumulator function as the current value for the first element
	 * @return {U} The result of the given function or undefined if the collection is empty
	 */
	reduce<U>(func: Accumulator<T, U>, initial: U): U | undefined;

	/**
	 * Reduces the collection to one value by applying an accumulator function on each value in the collection
	 *
	 * @param {Accumulator<T, T>} func The accumulator function
	 * @returns {(T | undefined)} The result of the given function or undefined if the collection is empty
	 * @memberof ILazyQuery
	 */
	reduce(func: Accumulator<T, T>): T | undefined;

	/**
	 * Reverses the collection
	 * @return {ILazyQuery<T>} A new collection
	 */
	reverse(): ILazyQuery<T>;

	/**
	 * Sorts the collection
	 * @param {comparator<T>} comparator The function used to determine the order of the sort, if the value returned is less than 0, the first argument will come before the second, if greater than 0, the reverse is true
	 * @return {ILazyQuery<T>} A new collection
	 */
	sort(comparator: Comparator<T>): ILazyQuery<T>;

	/**
	 * Returns a new collection containing all the subsequences of the collection
	 *
	 * E.g. "abc" becomes [[""], ["a"], ["b"], ["a", "b"], ["c"], ["a", "c"], ["b", "c"], ["a", "b", "c"]]
	 * @return {ILazyQuery<T[]>} A new collection
	 */
	subsequences(): ILazyQuery<T[]>;

	/**
	 * Calculates the sum of the collection
	 * @return {number} The sum of the collection
	 */
	sum(this: ILazyQuery<number>): number;

	/**
	 * Takes the first n number of elements matching the query
	 * @param {number} count The number of elements to take
	 * @return {ILazyQuery<T>} A new collection
	 */
	take(count: number): ILazyQuery<T>;

	/**
	 * Takes elements from the collection as long as the supplied predicate when called on the current element returns true
	 * @param {Predicate<T>} predicate The function to test the elements against
	 * @return {ILazyQuery<T>} A new collection
	 */
	takeWhile(predicate: Predicate<T>): ILazyQuery<T>;

	/**
	 * Evaluates the query and returns a new array containg the result of the query
	 * @return {T[]} A new array
	 */
	toArray(): T[];

	/**
	 * Performs a string concatnation on the elements in the collection
	 * @return {string} A new string
	 */
	toString(): string;

	/**
	 * Transposes the rows and columns of the collection
	 * @type {U}
	 * @return {ILazyQuery<Iterable<U>>} A new collection
	 */
	transpose<U>(this: ILazyQuery<Iterable<U>>): ILazyQuery<Iterable<U>>;

	/**
	 * Reduces the collection to not contain any duplicate elements
	 *
	 * If equals is specified it is called with the pairs of elements to determine equality
	 *
	 * @param {Equals<T>} [equals]
	 * @returns {ILazyQuery<T>} A new collection
	 * @memberof ILazyQuery
	 */
	unique(equals?: Equals<T>): ILazyQuery<T>;
}

/**
 * Comparator callback
 *
 * @callback comparator
 * @param {T} a The left value
 * @param {T} b The right value
 * @return {number} If less than 0, a will come before b, if greater than 0, a will come after b, in the resulting collection
 */
export interface Comparator<T> {
	(a: T, b: T): number;
}

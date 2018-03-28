/**
 * Accumulator callback
 *
 * @export
 * @interface Accumulator
 * @template T The input type
 * @template U The result type
 */
export interface Accumulator<T, U> {
	(result: U, current: T): U;
}

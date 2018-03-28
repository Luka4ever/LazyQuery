/**
 * Equality callback
 *
 * @export
 * @interface Equals
 * @template T Type of the values to test
 */
export interface Equals<T> {
	(a: T, b: T): boolean;
}

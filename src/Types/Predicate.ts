/**
 * Predicate callback
 *
 * @export
 * @interface Predicate
 * @template T The type of the value to test
 */
export interface Predicate<T> {
	(value: T): boolean;
}

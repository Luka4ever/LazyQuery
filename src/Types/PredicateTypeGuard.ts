/**
 * Predicate type guard callback
 *
 * @export
 * @interface PredicateTypeGuard
 * @template T Type of the value to test
 * @template U The new restricted type
 */
export interface PredicateTypeGuard<T, U extends T> {
	(value: T): value is U;
}

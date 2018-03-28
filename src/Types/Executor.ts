/**
 * Executor callback
 *
 * @export
 * @interface Executor
 * @template T The type of the element to perform an action with
 */
export interface Executor<T> {
	(element: T): void;
}

/**
 * Transform callback
 *
 * @export
 * @interface Transform
 * @template T The type of the value to test
 * @template U The resulting type of the transformation
 */
export interface Transform<T, U> {
	(value: T): U;
}

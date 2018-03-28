import { ILazyQuery } from './ILazyQuery';
import { LazyQuery } from './LazyQuery';

export { ILazyQuery };

export { zip } from './zip';

export { Tuple } from './Tuple';

export function L<T>(source: Iterable<T>): ILazyQuery<T> {
	return new LazyQuery(source);
}

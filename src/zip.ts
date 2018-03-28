import { ILazyQuery } from './ILazyQuery';
import { LazyQueryZip } from './LazyQueryZip';
import { Tuple } from './Tuple';

export function zip<T, U>(a: Iterable<T>, b: Iterable<U>): ILazyQuery<Tuple<T, U>> {
	return new LazyQueryZip(a, b);
}

export interface IterableMemoizable<T> {
	[Symbol.iterator](onlyMemoized?: boolean): Iterator<T>;
}

/* jshint esversion: 6, node: true */
'use strict';
import * as test from 'tape';
import { L } from '..';

const range = (start?: number, step?: number, end?: number) => {
	start = start || 0;
	let stepValue = step === 0 ? 0 : step || 1;
	const query = L([start]).iterate(v => v + stepValue);
	return end === undefined ? query : query.takeWhile(v => v < end);
};
const even = (v: number) => v % 2 === 0;
const odd = (v: number) => v % 2 !== 0;
const mul2 = (v: number) => v * 2;
const add = (a: number, b: number) => a + b;

test('toArray', t => {
	t.deepEqual(L([]).toArray(), []);
	t.deepEqual(L([1]).toArray(), [1]);
	t.deepEqual(L([2, 1, 3]).toArray(), [2, 1, 3]);
	t.end();
});

test('toString', t => {
	t.deepEqual(L([]).toString(), "");
	t.deepEqual(L(["a", "b"]).toString(), "ab");
	t.deepEqual(L(["c"]).toString(), "c");
	t.end();
});

test('take', t => {
	t.deepEqual(L([]).take(1).toArray(), []);
	t.deepEqual(L([1, 2, 3]).take(2).toArray(), [1, 2]);
	t.deepEqual(L([1]).take(0).toArray(), []);
	t.deepEqual(L(range(0, 1)).take(10).toArray(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	t.end();
});

test('drop', t => {
	t.deepEqual(L([]).drop(1).toArray(), []);
	t.deepEqual(L([1]).drop(0).toArray(), [1]);
	t.deepEqual(L([0, 1, 2, 3, 4]).drop(2).toArray(), [2, 3, 4]);
	t.end();
});

test('takeWhile', t => {
	t.deepEqual(L([]).takeWhile(()=>true).toArray(), []);
	t.deepEqual(L([1, 3, 0, 2]).takeWhile(v=>v>0).toArray(), [1, 3]);
	t.end();
});

test('dropWhile', t => {
	t.deepEqual(L([]).dropWhile(()=>true).toArray(), []);
	t.deepEqual(L([1, 3]).dropWhile(()=>true).toArray(), []);
	t.deepEqual(L([0, 1, 2]).dropWhile(even).toArray(), [1, 2]);
	t.end();
});

test('filter', t => {
	t.deepEqual(L([0, 1, 2]).filter(even).toArray(), [0, 2]);
	t.deepEqual(L(range(0, 1)).take(20).filter(even).filter(odd).toArray(), []);
	t.deepEqual(L(range(0, 1)).take(10).filter(even).take(10).toArray(), [0, 2, 4, 6, 8]);
	t.end();
});

test('first', t => {
	t.deepEqual(L([]).first(), undefined);
	t.deepEqual(L(range(0, 1, 10)).filter(odd).filter(even).first(), undefined);
	t.deepEqual(L([0, 1, 2]).first(), 0);
	t.deepEqual(L([0, 1, 2]).filter(odd).first(), 1);
	t.end();
});

test('last', t => {
	t.deepEqual(L([]).last(), undefined);
	t.deepEqual(L([1]).last(), 1);
	t.deepEqual(L([1, 2, 5, 6, 8]).last(), 8);
	t.end();
});

test('map', t => {
	t.deepEqual(L([1]).map(mul2).toArray(), [2]);
	t.deepEqual(L(range(0, 1, 10)).map(mul2).toArray(), L(range(0, 2, 20)).toArray());
	t.end();
});

test('any', t => {
	t.deepEqual(L([]).any(even), false);
	t.deepEqual(L(range(0, 1)).any(odd), true);
	t.deepEqual(L(range(0, 2, 10)).any(odd), false);
	t.end();
});

test('all', t => {
	t.deepEqual(L([]).all(even), true);
	t.deepEqual(L(range(0, 2, 10)).all(even), true);
	t.deepEqual(L(range(0, 1, 10)).all(odd), false);
	t.end();
});

test('reverse', t => {
	t.deepEqual(L([]).reverse(), L([]));
	t.deepEqual(L([0, 1]).reverse(), L([1, 0]));
	t.deepEqual(L([0, 1, 2, 3, 4]).reverse(), L([4, 3, 2, 1, 0]));
	t.end();
});

test('intersperse', t => {
	t.deepEqual(L([]).intersperse(",").toArray(), []);
	t.deepEqual(L(["a"]).intersperse(",").toArray(), ["a"]);
	t.deepEqual(L(["a", "b", "c"]).intersperse(",").toArray(), ["a", ",", "b", ",", "c"]);
	t.deepEqual(L("test").intersperse(",").toString(), "t,e,s,t");
	t.end();
});

test('reduce', t => {
	t.deepEqual(L(<number[]>[]).reduce(add), undefined);
	t.deepEqual(L([]).reduce(add, 0), 0);
	t.deepEqual(L([1]).reduce(add, 0), 1);
	t.deepEqual(L(range(0, 1, 10)).reduce(add, 0), 45);
	t.end();
});

test('unique', t => {
	t.deepEqual(L([]).unique().toArray(), []);
	t.deepEqual(L([1]).unique().toArray(), [1]);
	t.deepEqual(L([1, 2, 2, 1, 2]).unique().toArray(), [1, 2]);
	t.deepEqual(L([]).unique((a, b) => a === b).toArray(), []);
	t.deepEqual(L([1]).unique((a, b) => a === b).toArray(), [1]);
	t.deepEqual(L([1, 2, 2, 1, 2, 3]).unique((a, b) => a === b).toArray(), [1, 2, 3]);
	t.deepEqual(L([{ a: 1 }, { a: 2 }, { a: 1 }]).unique((a, b) => a.a === b.a).toArray(), [{ a: 1 }, { a: 2 }]);
	t.end();
});

test('subsequences', t => {
	t.deepEqual(L([]).subsequences().toArray(), [[]]);
	t.deepEqual(L("abc").subsequences().map(s=>s.join("")).toArray(), ["", "a", "b", "ab", "c", "ac", "bc", "abc"]);
	t.deepEqual(L("abcd").subsequences().map(s=>s.join("")).toArray(), ["", "a", "b", "ab", "c", "ac", "bc", "abc", "d", "ad", "bd", "cd", "abd", "acd", "bcd", "abcd"]);
	t.end();
});

test('permutations', t => {
	t.deepEqual(L([]).permutations().toArray(), [[]]);
	t.deepEqual(L([1]).permutations().toArray(), [[1]]);
	t.deepEqual(L([0, 1, 2]).permutations().toArray(), [[0, 1, 2], [1, 0, 2], [2, 0, 1], [0, 2, 1], [1, 2, 0], [2, 1, 0]]);
	t.end();
});

test('isEmpty', t => {
	t.deepEqual(L([]).isEmpty(), true);
	t.deepEqual(L([0]).isEmpty(), false);
	t.deepEqual(L(range(0, 1, 20)).filter(even).filter(odd).isEmpty(), true);
	t.end();
});

test('count', t => {
	t.deepEqual(L([]).count(), 0);
	t.deepEqual(L([0, 0, 1]).count(), 3);
	t.end();
});

test('exec', t => {
	let c = 0;
	L([0, 1, 0, 2]).exec(v => c += v);
	t.deepEqual(c, 3);
	let a = 0;
	L([0, 1, 0]).exec(v => a += v);
	t.deepEqual(a, 1);
	t.end();
});

test('sort', t => {
	t.deepEqual(L([]).sort((a,b)=>a-b).toArray(), []);
	t.deepEqual(L([0]).sort((a,b)=>a-b).toArray(), [0]);
	t.deepEqual(L([1, 0]).sort((a,b)=>a-b).toArray(), [0, 1]);
	t.deepEqual(L([43, 44, 17, 18, 19, 20, 21, 10, 11, 12, 0, 1, 45, 46, 47, 48, 49, 50, 33, 34, 35, 39, 51, 52, 53, 54, 58, 9, 2, 3, 4, 5, 6, 7, 8, 13, 14, 15, 32, 40, 36, 37, 38, 41, 42, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 16, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 95, 96, 97, 98, 99, 88, 85, 86, 87, 92, 93, 94, 89, 90, 91]).sort((a,b)=>a-b).toArray(), L(range(0, 1)).take(100).toArray());
	t.end();
});

test('memoize', t => {
	const a = L([]).memoize();
	t.deepEqual(a.toArray(), []);
	t.deepEqual(a.toArray(), []);
	const b = L([0, 1]).memoize();
	t.deepEqual(b.toArray(), [0, 1]);
	t.deepEqual(b.toArray(), [0, 1]);
	// @ts-ignore This is testing a private variable, there is no way to test if this is actually working without doing this or changing the interface which would be extremely ugly
	t.deepEqual(b.data, [0, 1]);
	t.deepEqual(L([0, 1, 2, 3, 4]).filter(even).memoize().toArray(), [0, 2, 4]);
	t.end();
});

test('onlyMemoized', t => {
	const a = L([1, 4, 0, 2, 3]).memoize();
	a.takeWhile(v => v > 0).toArray();
	t.deepEqual(a.onlyMemoized().toArray(), [1, 4, 0]);
	t.end();
});

test('concat', t => {
	t.deepEqual(L([]).concat().toArray(), []);
	t.deepEqual(L([[0], [2, 1]]).concat().toArray(), [0, 2, 1]);
	t.end();
});

test('cycle', t => {
	t.deepEqual(L([]).cycle().toArray(), []);
	t.deepEqual(L([0, 1]).cycle().take(5).toArray(), [0, 1, 0, 1, 0]);
	t.end();
});

test('get', t => {
	t.deepEqual(L([]).get(0), undefined);
	t.deepEqual(L([0, 2, 5, 3, 1]).get(2), 5);
	t.deepEqual(L([]).memoize().get(0), undefined);
	const a = L([0, 2, 5, 3, 1]).memoize();
	t.deepEqual(a.get(2), 5);
	t.deepEqual(a.get(1), 2);
	t.deepEqual(a.get(3), 3);
	t.end();
});

test('transpose', t => {
	t.deepEqual(L([[0, 1], [2, 3]]).transpose().toArray(), [[0, 2], [1, 3]]);
	t.deepEqual(L([[0, 1, 3], [5, 8], [6, 4, 2]]).transpose().toArray(), [[0, 5, 6], [1, 8, 4], [3, 2]]);
	t.end();
});

test('max', t => {
	t.deepEqual(L([]).max(), -Infinity);
	t.deepEqual(L([2, 4, 0, 6, 9]).max(), 9);
	t.end();
});

test('min', t => {
	t.deepEqual(L([]).min(), Infinity);
	t.deepEqual(L([3, 1, 9, 4, 7]).min(), 1);
	t.end();
});

test('and', t => {
	t.deepEqual(L([]).and(), true);
	t.deepEqual(L([true, true]).and(), true);
	t.deepEqual(L([true, false]).and(), false);
	t.end();
});

test('or', t => {
	t.deepEqual(L([]).or(), false);
	t.deepEqual(L([false, false]).or(), false);
	t.deepEqual(L([false, true]).or(), true);
	t.end();
});

test('sum', t => {
	t.deepEqual(L([]).sum(), 0);
	t.deepEqual(L([1, 3]).sum(), 4);
	t.end();
});

test('product', t => {
	t.deepEqual(L([]).product(), 1);
	t.deepEqual(L([3, 4]).product(), 12);
	t.deepEqual(L([3, 2, 0, 6, 8]).product(), 0);
	t.end();
});

test('iterate', t => {
	t.deepEqual(L([1]).iterate(v => v + 1).take(4).toArray(), [1, 2, 3, 4]);
	t.end();
});

test('append', t => {
	t.deepEqual(L([]).append([]).toArray(), []);
	t.deepEqual(L([1]).append([]).toArray(), [1]);
	t.deepEqual(L([]).append([2]).toArray(), [2]);
	t.deepEqual(L([1]).append([2, 3]).toArray(), [1, 2, 3]);
	t.deepEqual(L([1, 2]).append([3]).toArray(), [1, 2, 3]);
	t.deepEqual(L([1, 2]).append([3, 4]).toArray(), [1, 2, 3, 4]);
	t.end();
});

test('prepend', t => {
	t.deepEqual(L([]).prepend([]).toArray(), []);
	t.deepEqual(L([1]).prepend([]).toArray(), [1]);
	t.deepEqual(L([]).prepend([2]).toArray(), [2]);
	t.deepEqual(L([1]).prepend([2, 3]).toArray(), [2, 3, 1]);
	t.deepEqual(L([1, 2]).prepend([3]).toArray(), [3, 1, 2]);
	t.deepEqual(L([1, 2]).prepend([3, 4]).toArray(), [3, 4, 1, 2]);
	t.end();
});

test('find', t => {
	t.deepEqual(L([]).find(even), undefined);
	t.deepEqual(L([1, 2]).find(even), 2);
	t.deepEqual(L([1, 3]).find(even), undefined);
	t.end();
});

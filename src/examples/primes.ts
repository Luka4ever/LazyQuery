import { L } from '..';

const primes = L([2]).iterate(v => v + 1).filter(value => !primes.onlyMemoized().takeWhile(prime => prime * prime <= value).any(prime => (value / prime) % 1 === 0)).memoize();
primes.exec(console.log);

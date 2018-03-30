export function quicksort<T>(
	arr: T[],
	left: number,
	right: number,
	div: number,
	comparator: (a: T, b: T) => number
): T[] {
	const length: number = right - left;
	let temp: T;
	let tempIndex: number;
	// Insertion sort on tiny arrays
	if (length < 27) {
		for (let i: number = left + 1; i <= right; i++) {
			for (let j: number = i; j > left && comparator(arr[j], arr[j - 1]) < 0; j--) {
				temp = arr[j];
				tempIndex = j - 1;
				arr[j] = arr[tempIndex];
				arr[tempIndex] = temp;
			}
		}
		return arr;
	}
	const third: number = length / 3;
	let median1: number = Math.floor(left + third);
	let median2: number = Math.floor(right - third);
	if (median1 <= left) {
		median1 = left + 1;
	}
	if (median2 >= right) {
		median2 = right - 1;
	}
	if (comparator(arr[median1], arr[median2]) < 0) {
		temp = arr[median1];
		arr[median1] = arr[left];
		arr[left] = temp;
		temp = arr[median2];
		arr[median2] = arr[right];
		arr[right] = temp;
	} else {
		temp = arr[median1];
		arr[median1] = arr[right];
		arr[right] = temp;
		temp = arr[median2];
		arr[median2] = arr[left];
		arr[left] = temp;
	}
	const pivot1: T = arr[left];
	const pivot2: T = arr[right];
	let less: number = left + 1;
	let great: number = right - 1;
	for (let k: number = less; k <= great; k++) {
		if (comparator(arr[k], pivot1) < 0) {
			temp = arr[k];
			arr[k] = arr[less];
			arr[less++] = temp;
		} else if (comparator(arr[k], pivot2) > 0) {
			while (k < great && comparator(arr[great], pivot2) > 0) {
				great--;
			}
			temp = arr[k];
			arr[k] = arr[great];
			arr[great--] = temp;
			if (comparator(arr[k], pivot1) < 0) {
				temp = arr[k];
				arr[k] = arr[less];
				arr[less++] = temp;
			}
		}
	}
	const dist: number = great - less;
	if (dist < 13) {
		div++;
	}
	tempIndex = less - 1;
	temp = arr[tempIndex];
	arr[tempIndex] = arr[left];
	arr[left] = temp;
	tempIndex = great + 1;
	temp = arr[tempIndex];
	arr[tempIndex] = arr[right];
	arr[right] = temp;
	quicksort(arr, left, less - 1, div, comparator);
	quicksort(arr, great + 1, right, div, comparator);
	const pivotComparison: number = comparator(pivot1, pivot2);
	if (dist > length - 13 && pivotComparison !== 0) {
		for (let k: number = less; k <= great; k++) {
			if (comparator(arr[k], pivot1) === 0) {
				temp = arr[k];
				arr[k] = arr[less];
				arr[less++] = temp;
			} else if (comparator(arr[k], pivot2) === 0) {
				temp = arr[k];
				arr[k] = arr[great];
				arr[great--] = temp;
				if (comparator(arr[k], pivot1) === 0) {
					temp = arr[k];
					arr[k] = arr[less];
					arr[less++] = temp;
				}
			}
		}
	}
	if (pivotComparison < 0) {
		quicksort(arr, less, great, div, comparator);
	}
	return arr;
}

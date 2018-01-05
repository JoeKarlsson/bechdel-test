const merge = require('./merge');

const { mergeArr, mergeObj } = merge;

describe('merge', () => {
	describe('mergeArr', () => {
		it('should merge two arrays', () => {
			const arr1 = [
				{ character: 'John Doe' },
				{ character: 'Jane Doe' },
				{ character: 'Steve' },
			];
			const arr2 = [
				{ character: 'Jake Doe' },
				{ character: 'BMO Doe' },
				{ character: 'Cake' },
			];
			const result = mergeArr(arr1, arr2);
			const expectedResult = [
				{ character: 'Jake Doe' },
				{ character: 'BMO Doe' },
				{ character: 'Cake' },
				{ character: 'John Doe' },
				{ character: 'Jane Doe' },
				{ character: 'Steve' },
			];
			expect(result).toMatchObject(expectedResult);
		});

		it('should remove duplicates', () => {
			const arr1 = [
				{ character: 'John Doe' },
				{ character: 'Jane Doe' },
				{ character: 'Steve' },
			];
			const arr2 = [
				{ character: 'John Doe' },
				{ character: 'Jane Doe' },
				{ character: 'Jake Doe' },
				{ character: 'BMO Doe' },
				{ character: 'Cake' },
			];
			const result = mergeArr(arr1, arr2);
			const expectedResult = [
				{ character: 'John Doe' },
				{ character: 'Jane Doe' },
				{ character: 'Jake Doe' },
				{ character: 'BMO Doe' },
				{ character: 'Cake' },
				{ character: 'Steve' },
			];
			expect(result).toMatchObject(expectedResult);
		});
	});

	describe('mergeObj', () => {
		it('should merge two objects', () => {
			const obj1 = {
				type: 'thin crust',
				size: 'large',
				peperoni: true,
			};
			const obj2 = {
				extraCheese: true,
				onions: true,
				olives: false,
			};
			const result = mergeObj(obj1, obj2);
			const expectedResult = {
				extraCheese: true,
				olives: false,
				onions: true,
				peperoni: true,
				size: 'large',
				type: 'thin crust',
			};
			expect(result).toMatchObject(expectedResult);
		});

		it('should remove duplicates', () => {
			const obj1 = {
				type: 'thin crust',
				size: 'large',
				peperoni: true,
			};
			const obj2 = {
				type: 'thin crust',
				size: 'large',
				extraCheese: true,
				onions: true,
				olives: false,
			};
			const result = mergeObj(obj1, obj2);
			const expectedResult = {
				extraCheese: true,
				olives: false,
				onions: true,
				peperoni: true,
				size: 'large',
				type: 'thin crust',
			};
			expect(result).toMatchObject(expectedResult);
		});
	});
});

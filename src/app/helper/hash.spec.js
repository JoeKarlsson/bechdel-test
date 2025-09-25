import hash from './hash';

describe('#fnv32 Hash Function', () => {
	it('should generate a number hash', () => {
		const data = JSON.stringify([{ foo: 'bar' }, { baz: 'spaz' }]);

		expect(typeof (hash(data))).toBe('number');
	});

	it('should generate a 32 signed bit hash', () => {
		const data = JSON.stringify([{ foo: 'bar' }, { baz: 'spaz' }]);
		const bitCheck = hash(data) >> 31;

		expect(bitCheck).toEqual(0);
	});

	it('should return the same hash for the same object', () => {
		const data = JSON.stringify([{ foo: 'bar' }, { baz: 'spaz' }]);
		const hash1 = hash(data);
		const hash2 = hash(data);

		expect(hash1).toBe(hash2);
	});

	it('should return the different hashes for the different objects', () => {
		const data1 = JSON.stringify([{ foo: 'bar' }, { baz: 'spaz' }]);
		const data2 = JSON.stringify([{ foo: 'bars' }, { baz: 'spazz' }]);
		const hash1 = hash(data1);
		const hash2 = hash(data2);

		expect(hash1).not.toBe(hash2);
	});
});

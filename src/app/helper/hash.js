const hashAlgorithm = (data) => {
	const FNV_PRIME_32 = 0x1000193;
	const FNV_OFFSET_32 = 0x811C9DC5;
	let hash = FNV_OFFSET_32;

	const str = JSON.stringify(data);

	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash *= FNV_PRIME_32;
	}
	return hash;
};

export default hashAlgorithm;

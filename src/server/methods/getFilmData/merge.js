const mergeObj = (obj, src) => {
	return Object.assign(src, obj);
};

const mergeArr = (arr, src) => {
	const newArr = [...src];
	let isUnique = true;

	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < src.length; j++) {
			if (arr[i].character === src[j].character) {
				isUnique = false;
				break;
			}
		}
		if (isUnique) {
			newArr.push(arr[i]);
		}
		isUnique = true;
	}
	return newArr;
};

module.exports = {
	mergeObj,
	mergeArr,
};

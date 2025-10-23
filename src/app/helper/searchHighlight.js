/**
 * Highlights search terms in text
 * @param {string} text - The text to highlight
 * @param {string} searchTerm - The term to highlight
 * @returns {JSX.Element} - React element with highlighted text
 */
export const highlightSearchTerm = (text, searchTerm) => {
	if (!searchTerm || !text) {
		return text;
	}

	const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
	const parts = text.split(regex);

	return parts.map((part, index) => {
		if (regex.test(part)) {
			return (
				<mark key={index} className="search-highlight">
					{part}
				</mark>
			);
		}
		return part;
	});
};

/**
 * Checks if a field contains the search term
 * @param {string} field - The field to search in
 * @param {string} searchTerm - The search term
 * @returns {boolean} - Whether the field contains the search term
 */
export const fieldContainsSearchTerm = (field, searchTerm) => {
	if (!field || !searchTerm) return false;
	return field.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Checks if an array of objects contains the search term in a specific property
 * @param {Array} array - Array of objects to search
 * @param {string} property - Property name to search in
 * @param {string} searchTerm - The search term
 * @returns {boolean} - Whether any object contains the search term
 */
export const arrayContainsSearchTerm = (array, property, searchTerm) => {
	if (!array || !Array.isArray(array) || !searchTerm) return false;
	return array.some(item =>
		item && item[property] &&
        item[property].toLowerCase().includes(searchTerm.toLowerCase()));
};

/**
 * Converts a string to title case
 * @param {string} str - The string to convert
 * @returns {string} - The string in title case
 */
export const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') {
        return str;
    }

    // Handle kebab-case, snake_case, and camelCase
    const words = str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
        .replace(/[-_]/g, ' ') // kebab-case and snake_case -> kebab case
        .split(' ')
        .filter(word => word.length > 0);

    // Convert each word to title case
    return words
        .map(word => {
            // Handle special cases like "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"
            const lowercaseWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

            // Always capitalize first and last words
            if (words.indexOf(word) === 0 || words.indexOf(word) === words.length - 1) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            // For middle words, capitalize unless it's a lowercase word
            if (lowercaseWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};

export default toTitleCase;

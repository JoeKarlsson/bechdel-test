// Which script errors the JS Error event skips: ones thrown by browser
// extensions, not by this site, and Trusted Types refusals of policies the
// site never creates (extensions injecting into the page trip the CSP).

const EXTENSION = /(?:chrome|moz|safari-web)-extension:\/\//;

/**
 * True when an error came from a browser extension rather than the site.
 * @param {unknown} message the error message
 * @param {string} where the error's file and stack, as far as the browser gives them
 * @param {string[]} ownPolicies the Trusted Types policy names this site creates
 */
export function isExtensionNoise(message, where, ownPolicies) {
	if (EXTENSION.test(where) || EXTENSION.test(String(message))) return true;
	const policy = /Policy "([^"]+)" disallowed|policy named '([^']+)'/i.exec(String(message));
	return policy !== null && !ownPolicies.includes(policy[1] ?? policy[2]);
}

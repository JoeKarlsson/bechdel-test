const { fetchBytes, retryDelayMs } = require('./downloadScripts');

describe('fetchBytes', () => {
	const realFetch = global.fetch;
	afterEach(() => { global.fetch = realFetch; });
	const reply = (status, headers = {}) => new Response(status === 200 ? 'script' : '', { status, headers });

	it('waits and tries again when the site is busy', async () => {
		global.fetch = jest.fn().mockResolvedValueOnce(reply(503, { 'Retry-After': '1' })).mockResolvedValueOnce(reply(200));
		expect((await fetchBytes('https://x/a.pdf')).toString()).toBe('script');
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	it('fails at once on a missing file', async () => {
		global.fetch = jest.fn().mockResolvedValue(reply(404));
		await expect(fetchBytes('https://x/a.pdf')).rejects.toThrow('404');
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it('waits as long as the site asks, else longer each try', () => {
		expect(retryDelayMs('5', 1)).toBe(5000);
		expect(retryDelayMs(null, 1)).toBe(30000);
		expect(retryDelayMs('Wed, 21 Oct 2026 07:28:00 GMT', 2)).toBe(60000);
	});
});

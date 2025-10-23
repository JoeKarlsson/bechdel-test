const { chromium } = require('playwright');

(async () => {
    console.log('Opening browser for manual testing...');
    console.log('The browser will stay open for 10 minutes for manual interaction');
    console.log('\nInstructions:');
    console.log('1. Click on "Upload" or navigate to the upload page');
    console.log('2. Upload the file: scripts/easy-a.txt');
    console.log('3. Wait for the analysis to complete');
    console.log('4. Navigate to the film results page');
    console.log('5. Check if the "Advanced AI Analysis" section shows structured data');
    console.log('\nStarting...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500  // Slow down operations for better visibility
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navigate to the app
        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        console.log('✅ Page loaded!');
        console.log('\n👉 You can now interact with the page manually');
        console.log('   The browser will close automatically in 10 minutes\n');

        // Wait 10 minutes
        await page.waitForTimeout(600000);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        console.log('\nClosing browser...');
        await browser.close();
    }
})();

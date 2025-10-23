const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('Starting Playwright test...');

    // Launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navigate to the app
        console.log('Navigating to localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);

        // Take screenshot of homepage
        await page.screenshot({ path: 'screenshots/1-homepage.png', fullPage: true });
        console.log('Homepage loaded');

        // Look for upload button or input
        console.log('Looking for upload interface...');

        // Try to find and click the upload/analyze button
        const uploadButton = await page.locator('text=/upload|analyze|add|new/i').first();
        if (await uploadButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('Found upload button');
            await uploadButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'screenshots/2-upload-page.png', fullPage: true });
        }

        // Look for file input
        const fileInput = await page.locator('input[type="file"]').first();
        if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('Found file input, uploading script...');

            // Upload a script file
            const scriptPath = path.join(__dirname, 'scripts', 'easy-a.txt');
            await fileInput.setInputFiles(scriptPath);
            await page.waitForTimeout(1000);

            console.log('File uploaded, looking for submit button...');
            await page.screenshot({ path: 'screenshots/3-file-selected.png', fullPage: true });

            // Try to find and click submit/analyze button
            const submitButton = await page.locator('button:has-text("Analyze"), button:has-text("Upload"), button:has-text("Submit")').first();
            if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                console.log('Clicking submit button...');
                await submitButton.click();

                // Wait for processing
                console.log('Waiting for analysis to complete...');
                await page.waitForTimeout(5000);
                await page.screenshot({ path: 'screenshots/4-processing.png', fullPage: true });

                // Look for results page or film link
                console.log('Checking for results...');
                await page.waitForTimeout(60000); // Wait up to 60 seconds for analysis
                await page.screenshot({ path: 'screenshots/5-results.png', fullPage: true });

                // Try to navigate to the film page
                const filmLink = await page.locator('a[href*="/film/"]').first();
                if (await filmLink.isVisible({ timeout: 10000 }).catch(() => false)) {
                    console.log('Found film link, navigating...');
                    await filmLink.click();
                    await page.waitForTimeout(3000);
                    await page.screenshot({ path: 'screenshots/6-film-page.png', fullPage: true });

                    // Scroll down to see AI analysis section
                    console.log('Scrolling to find AI analysis...');
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: 'screenshots/7-ai-analysis.png', fullPage: true });

                    // Check for Advanced Analytics section
                    const analyticsSection = await page.locator('text=/Advanced.*Analytics|AI.*Analysis/i').first();
                    if (await analyticsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
                        console.log('✅ Found Advanced Analytics section!');
                    } else {
                        console.log('⚠️ Advanced Analytics section not visible');
                    }
                }
            }
        }

        console.log('\nTest complete! Check the screenshots folder for results.');
        console.log('Keeping browser open for inspection...');

        // Keep browser open for inspection
        await page.waitForTimeout(300000); // Wait 5 minutes

    } catch (error) {
        console.error('Error during test:', error);
        await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();

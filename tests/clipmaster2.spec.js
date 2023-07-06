const path = require('path');
const { _electron: electron } = require('playwright-core')
const { test, expect } = require('@playwright/test');
const { type } = require('os');
const exp = require('constants');
const { app } = require('electron');


test.describe("clipmaster2", async () => {
    // ref: https://playwright.dev/docs/test-fixtures#without-fixtures
    let eApp = null;
    let page = null;
    test.beforeAll(async () => {
        eApp = await electron.launch({ args: [path.join(__dirname, '../clipmaster2/main.js')] })
        page = await eApp.firstWindow();
    });
    test.afterAll(async () => {
        await eApp.close()
    });
    test("Check title", async () => {
        const title = await page.title();
        expect(title).toMatch(/clip/i);
    });
    test('shows an initial window', () => {
        const numWindow = eApp.windows().length
        expect(numWindow).toBe(1)
    })

    test('checks if electron opens dev tools', async () => {
        // playwright page == electron window
        const bwHandle = await eApp.browserWindow(page)
        // can't open devtools with playwright, seems a bug of playwright
        // const isDevToolOpened = await bwHandle.evaluate(async (win) => {
        //     win.on('ready', () => {
        //         win.webContents.openDevTools()
        //     })
        //     return await win.webContents.isDevToolsOpened();
        // });
        // expect(isDevToolOpened).toBeTruthy();
        const isDevToolOpened = await bwHandle.evaluate(async (win) => {
            return await win.webContents.isDevToolsOpened();
        });
        expect(isDevToolOpened).toBeFalsy();
    });

    test('has a button with the text "Copy from Clipboard"', async () => {
        expect(await page.locator('#copy-from-clipboard').innerText()).toBe('Copy from Clipboard')
    })

    test('should not have clippings when it starts up', async () => {
        const clippings = await page.locator('.clippings-list-item').all()
        expect(clippings.length).toBe(0)
    })

    test('should have one clipping when the "Copy from Clipboard" button has been pressed', async () => {
        await page.locator('#copy-from-clipboard').click()
        const clippings = await page.locator('.clippings-list-item').all()
        expect(clippings.length).toBe(1)
    })

    test('should successfully remove a clipping', async () => { 
        await page.locator('#copy-from-clipboard').click()
        let clippings = await page.locator('.clippings-list-item').all()
        expect(clippings.length).toBe(1)
        await page.locator('.clippings-list-item').hover()
        await page.locator('.remove-clipping').click()
        clippings = await page.locator('.clippings-list-item').all()
        expect(clippings.length).toBe(0)
     })

     test('should have the correct text in a new clipping', async () => {
        const testStr = 'Vegan Ham'
        await eApp.evaluate(async (eApp, testStr) => {
            await eApp.clipboard.writeText(testStr)
        }, testStr)
        
        await page.locator('#copy-from-clipboard').click()
        const clippingText = await page.locator('.clipping-text').innerText()
        expect(clippingText).toBe(testStr)
      })

      test('should write the clipping text to the clipboard', async () => {
        const testStr = 'Vegan Ham'
        const testStrOther = 'Something different'
        await eApp.evaluate(async (eApp, testStr) => {
            await eApp.clipboard.writeText(testStr)
        }, testStr)
        await page.locator('#copy-from-clipboard').click()
        await eApp.evaluate(async (eApp, testStr) => {
            await eApp.clipboard.writeText(testStr)
        }, testStrOther)
        await page.locator('.copy-clipping').click()
        const clipboardText = await eApp.evaluate(async (eApp) => {
            return await eApp.clipboard.readText()
        })
        expect(clipboardText).toBe(testStr)
      })

})



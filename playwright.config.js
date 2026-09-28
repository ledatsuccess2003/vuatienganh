import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';
const localShell='C:/Users/ADMIN/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
export default defineConfig({testDir:'./tests/browser',timeout:45000,workers:1,retries:0,reporter:'list',use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:5194',headless:true,launchOptions:{executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(localShell)?localShell:undefined)},trace:'retain-on-failure'}});

import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
await mkdir('dist', { recursive: true });
await rm('dist/extension', { recursive: true, force: true });
await cp('.output/chrome-mv3', 'dist/extension', { recursive: true });
await copyFile('INSTALL.txt', 'dist/extension/INSTALL.txt');
await mkdir('dist/site/downloads', { recursive: true });
await exec('zip', ['-qr', '../site/downloads/focus-lens-chrome.zip', '.'], { cwd: 'dist/extension' });

import { installFocusLens } from '../lib/page-agent';
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id || !tab.url?.startsWith('http')) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'FOCUS_LENS_COMMAND', command });
    } catch {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: installFocusLens });
      await chrome.tabs.sendMessage(tab.id, { type: 'FOCUS_LENS_COMMAND', command });
    }
  });
});

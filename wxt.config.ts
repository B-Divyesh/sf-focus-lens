import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Focus Lens',
    description: 'Keep focus visible and save keyboard waypoints in dense web apps.',
    version: '1.0.0',
    permissions: ['activeTab', 'scripting', 'storage'],
    commands: {
      'toggle-focus': {
        suggested_key: { default: 'Alt+Shift+F', mac: 'Alt+Shift+F' },
        description: 'Toggle the focus rail'
      },
      'toggle-lane': {
        suggested_key: { default: 'Alt+Shift+L', mac: 'Alt+Shift+L' },
        description: 'Toggle the reading lane'
      },
      'zoom-in': {
        suggested_key: { default: 'Alt+Shift+Period', mac: 'Alt+Shift+Period' },
        description: 'Increase page zoom'
      },
      'zoom-out': {
        suggested_key: { default: 'Alt+Shift+Comma', mac: 'Alt+Shift+Comma' },
        description: 'Decrease page zoom'
      }
    },
    action: { default_title: 'Open Focus Lens' }
  }
});

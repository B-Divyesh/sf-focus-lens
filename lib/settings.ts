export type ContrastMode = 'standard' | 'strong' | 'dim';

export interface Waypoint {
  id: string;
  name: string;
  selector: string;
}

export interface SiteSettings {
  zoom: number;
  contrast: ContrastMode;
  focusVisible: boolean;
  focusWidth: number;
  focusColor: string;
  laneVisible: boolean;
  waypoints: Waypoint[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  zoom: 100,
  contrast: 'standard',
  focusVisible: true,
  focusWidth: 5,
  focusColor: '#c63d2f',
  laneVisible: false,
  waypoints: []
};

export const clampZoom = (value: number): number => Math.min(200, Math.max(80, Math.round(value / 10) * 10));

export const storageKey = (origin: string): string => `site:${origin}`;

export const validateWaypointName = (value: string): string | null =>
  value.trim() ? null : 'Enter a waypoint name, then save it.';

export const mergeSettings = (value?: Partial<SiteSettings>): SiteSettings => ({
  ...DEFAULT_SETTINGS,
  ...value,
  waypoints: Array.isArray(value?.waypoints) ? value.waypoints : []
});

export const shortcutsText = `Focus Lens keyboard shortcuts

Alt+Shift+F  Toggle the focus rail
Alt+Shift+L  Toggle the reading lane
Alt+Shift+.  Increase page zoom
Alt+Shift+,  Decrease page zoom

Open the Focus Lens panel to save or open a named waypoint.
Settings stay in this browser.`;

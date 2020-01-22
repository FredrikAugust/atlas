// tslint:disable-next-line: no-reference
/// <reference path="./../../node_modules/@types/googlemaps/index.d.ts" />

/**
 * Override the global window variable to have the google object as well.
 */

declare global {
  // tslint:disable-next-line: interface-name
  interface Window {
    google: typeof google;
  }
}

export {};

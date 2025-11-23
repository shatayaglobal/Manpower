/// <reference types="@types/google.maps" />

import "google-one-tap";

declare global {
  interface Window {
    google: {
      maps?: typeof google.maps;
      accounts: typeof google.accounts;
    };
  }
}

export {};

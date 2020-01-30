import Circle, { CircleType } from "./components/Circle";
import { GoogleAPIProvider, useGoogle } from "./components/GoogleAPIProvider";
import InfoWindow, { InfoWindowType } from "./components/InfoWindow";
import { Map } from "./components/Map";
import Marker, { MarkerType } from "./components/Marker";

// polyfill for `unknown` in newer versions of ts
import "unknown-ts";

export {
  GoogleAPIProvider,
  useGoogle,
  Map,
  Marker,
  Circle,
  InfoWindow,
  CircleType,
  InfoWindowType,
  MarkerType
};

# Atlas

> A Google Maps React library. Written because I was dissatisfied with fullstackreact/google-maps-react. Will have focus on minimal rerenders, and trying to rely as much as possible on the Google Maps Javascritpt API (v3).

[![NPM](https://img.shields.io/npm/v/reactive-atlas.svg)](https://www.npmjs.com/package/reactive-atlas) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**[Live demo](https://fredrikaugust.github.io/atlas/)**

## Install

```bash
yarn add reactive-atlas
```

## Usage

### API Provider

First of all, you have to setup the global API provider. This is required by
the library to work. I recommend you wrap the highest common component of all
components that require access to the map with this.

```tsx
import { GoogleAPIProvider } from "reactive-atlas";

const App: React.FC = props => (
  <GoogleAPIProvider apiKey="API_KEY">{props.children}</GoogleAPIProvider>
);
```

### `useGoogle`

This is a hook that returns a `google` object containing all the methods
exposed to us. Has to be used in a component that is a child of
`GoogleAPIProvider`;

```tsx
import { useGoogle } from "reactive-atlas";

const C: React.FC = props => {
  const google = useGoogle();

  // ...
};
```

### Map

The map is the most important object. It has to be a child (though not
direct) of `GoogleAPIProvider`.

The required options are `zoom` and `center`. A `number` (0-18 inclusive),
and `google.maps.LatLng`, respectively.

```tsx
import { Map, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return <Map options={{ zoom: 8, center: new google.maps.LatLng(1, 2) }} />;
};
```

### Marker

The marker is a common object in maps. It has to be a child of the provider.

```tsx
import { Map, Marker, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return (
    <Map options={{ zoom: 8, center: new google.maps.LatLng(1, 2) }}>
      <Marker
        options={{
          position: new google.maps.LatLng(63, 10),
          title: "Hello, World!",
          label: "B"
        }}
      />
    </Map>
  );
};
```

### Events

TODO

## License

MIT © [fredrikaugust](https://github.com/fredrikaugust)

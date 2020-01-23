# Atlas

> A Google Maps React library. Written because I was dissatisfied with fullstackreact/google-maps-react. Will have focus on minimal rerenders, and trying to rely as much as possible on the Google Maps Javascritpt API (v3).

[![NPM](https://img.shields.io/npm/v/reactive-atlas.svg)](https://www.npmjs.com/package/reactive-atlas) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**[Live demo](https://fredrikaugust.github.io/atlas/)**

#### Notes

- `google.maps.LatLngLiteral` is just an object of type `{ lat: number, lng: number }`

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

const Root: React.FC = props => (
  <GoogleAPIProvider apiKey="API_KEY">{props.children}</GoogleAPIProvider>
);
```

### `useGoogle`

This is a hook that returns a `google` object containing all the methods
exposed to us. Has to be used in a component that is a child of
`GoogleAPIProvider`;

```tsx
import { useGoogle } from "reactive-atlas";

const ComponentThatUsesGoogleAPI: React.FC = props => {
  const google = useGoogle();

  // ...
};
```

### Map

The map is the most important object. It has to be a child (though not
direct) of `GoogleAPIProvider`.

The **required** options are `zoom` and `center`. A `number` (0-18 inclusive),
and `google.maps.LatLng` or `google.maps.LatLngLiteral`, respectively.

```tsx
import { Map, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return <Map options={{ zoom: 8, center: new google.maps.LatLng(1, 2) }} />;
};
```

All `Marker`s and other elements should be children of a map, and you should not nest `Map`s.

### Marker

The marker is a common object in maps. It has to be a child of a `Map`.

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

### Circle

Exactly the same usage as `Marker`.

Required `option` keys are `radius: number`, and `center: google.maps.LatLng | google.maps.LatLngLiteral`.

```tsx
import { Map, Circle, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return (
    <Map options={{ zoom: 8, center: new google.maps.LatLng(1, 2) }}>
      <Circle
        options={{
          position: new google.maps.LatLng(63, 10),
          radius: 128000
        }}
      />
    </Map>
  );
};
```

#### Example of resizable and movable circle

First you have to wrap it in a Provider and Map of course.

Create an event handler which simply prints the new location and radius.

```ts
const circleChangePosRadius = circle =>
  console.log(
    `Circle is at ${circle
      .getCenter()
      .toString()} with radius ${circle.getRadius()}.`
  );
```

Wire it up to print pos/radius every time the radius or center changes.

```tsx
<Circle
  options={{
    editable: true,
    radius: 100000,
    center: new google.maps.LatLng(63, 10)
  }}
  eventHandlers={[
    ["radius_changed", circleChangePosRadius],
    ["center_changed", circleChangePosRadius]
  ]}
/>
```

The same principles would be used when making a `Marker` draggable; just
replace `radius_changed`/`center_changed` with `dragend`.

### Events

To retain as much of the original code as possible from the google API, I've
decided to opt for a bit strange event handling. Instead of doing like
`google-maps-react` (the reason I'm making this library) and using "standard"
HTML-like handlers (i.e. `onCenter_changed` (the weird combination of
camelCase and snake_case is because google uses snake-case, and HTML uses
camelCase)), I've opted to use a list of event handlers you'd like to attach
to the element. This property can be used on `Map`, `Marker`, and `Circle`
(as of now).

To remove an event handler, simply remove the entry from the array of
handlers, and the library will remove the listener. It will also clean up all
listeners when unmounting.

The first parameter in the callback function is the object you're operating
on, so in the next example, it's a marker, but if you were to add a listener
to a circle, it would be the circle. This allows you to operate directly on
the google API, which might be desirable.

The second parameter is a list with one of the following;

1. Nothing, i.e. `[]`
2. `undefined`, i.e. `[undefined]`
3. The event (e.g. `MouseEvent`), i.e. `[MouseEvent]`

This is a bit strange, but it works quite well. I believe it was intended for
possible expansion, so that you could pass more than one event.

```tsx
import { Map, Marker, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return (
    <Map options={{ zoom: 8, center: new google.maps.LatLng(1, 2) }}>
      <Marker
        options={{
          position: new google.maps.LatLng(pos, pos)
        }}
        eventHandlers={[
          [
            "click",
            (marker, evt) => {
              // Make it jump!
              marker.setAnimation(google.maps.Animation.BOUNCE);
              setTimeout(() => marker.setAnimation(null), 500);
            }
          ]
        ]}
      />
    </Map>
  );
};
```

### Styling

For now, there isn't really much styling on the map. It's container is set to
`flex-grow: 1`, which means that you should try to use flex to control the
positioning.

## License

MIT © [fredrikaugust](https://github.com/fredrikaugust)

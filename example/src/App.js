import React from "react";

import "./style.css";

import { Map, useGoogle, Marker, Circle, InfoWindow } from "reactive-atlas";

export const App = () => {
  const google = useGoogle();

  const ref = React.useRef();
  const [open, setOpen] = React.useState(false);

  const [pos, setPos] = React.useState({
    center: { lat: 63, lng: 10 },
    radius: 10000
  });

  const circleChangePosRadius = circle =>
    setPos({
      center: {
        lat: circle.getCenter().lat(),
        lng: circle.getCenter().lng()
      },
      radius: circle.getRadius()
    });

  return (
    <div className="container">
      <h1>Atlas</h1>
      <em>
        A Google Maps React library. Written because I was dissatisfied with
        fullstackreact/google-maps-react. Will have focus on minimal rerenders,
        and trying to rely as much as possible on the Google Maps Javascript API
        (v3).
      </em>
      <div className="badges">
        <img
          alt="reactive atlas npm package version"
          src="https://img.shields.io/npm/v/reactive-atlas.svg"
        />
        <img
          alt="code standard badge"
          src="https://img.shields.io/badge/code_style-standard-brightgreen.svg"
        />
      </div>
      <p>
        You can find more information about the objects{" "}
        <a href="https://developers.google.com/maps/documentation/javascript/reference">
          here
        </a>
        . All the options and event handlers are supported.
      </p>
      <h2>API Provider</h2>
      <p>
        First of all, you have to setup the global API provider. This is
        required by the library to work. I recommend you wrap the highest common
        component of all components that require access to the map with this.
      </p>
      <pre>
        {`import { GoogleAPIProvider } from "reactive-atlas";

const App: React.FC = props => (
  <GoogleAPIProvider apiKey="API_KEY">{props.children}</GoogleAPIProvider>
);`}
      </pre>
      <h3>
        <code>useGoogle</code> hook
      </h3>
      <p>
        This is a hook that returns a <code>google</code> object containing all
        the methods exposed to us. Has to be used in a component that is a child
        of <code>GoogleAPIProvider</code>;
      </p>
      <pre>
        {`import { useGoogle } from "reactive-atlas";

const ComponentThatUsesGoogleAPI: React.FC = props => {
  const google = useGoogle();

  // ...
};`}
      </pre>
      <div className="map-split">
        <div>
          <h2>Map</h2>
          <p>
            The map is the most important object. It has to be a child (though
            not direct) of <code>GoogleAPIProvider</code>. The{" "}
            <strong>required</strong> options are <code>zoom</code> and{" "}
            <code>center</code>. A <code>number</code> (0-18 inclusive), and{" "}
            <code>google.maps.LatLng</code> or{" "}
            <code>google.maps.LatLngLiteral</code>, respectively.
          </p>
          <pre>
            {`import { Map, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return <Map options={{ zoom: 5, center: new google.maps.LatLng(1, 2) }} />;
};`}
          </pre>
        </div>
        <Map options={{ zoom: 5, center: { lat: 63, lng: 10 } }} />
      </div>
      <div className="map-split">
        <div>
          <h2>Marker</h2>
          <p>
            The marker is a common object in maps. Must be a child of{" "}
            <code>Map</code>, though not necessarily a direct child. This is
            because I don't use prop copying like <code>google-maps-react</code>
            , but rather a combination of injectors (or enhancers, don't really
            know what they're called) and Contexts. This is very useful when
            creating groups of markers and infowindows e.g.
          </p>
          <pre>
            {`import { Map, Marker, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return (
    {/* Here you can see the use of LatLng instead of a literal. */}
    <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
      <Marker
        options={{
          position: new google.maps.LatLng(63, 10),
          title: "Hello, World!",
          draggable: true,
          label: "B"
        }}
      />
    </Map>
  );
};`}
          </pre>
        </div>
        <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
          <Marker
            options={{
              position: new google.maps.LatLng(63, 10),
              title: "Hello, World!",
              draggable: true,
              label: "B"
            }}
          />
        </Map>
      </div>
      <div className="map-split">
        <div>
          <h2>
            <code>InfoWindow</code> and <code>ref</code> forwarding
          </h2>
          <p>
            The InfoWindow can be handy if you want to display extra information
            about e.g. a `Marker`. As you can see, you can pass a ref to the{" "}
            <code>Marker</code>, and later get out the underlying{" "}
            <code>marker</code> property. I spent a lot of time on this, so
            please use it. As you can see, when passing an anchor to the
            <code>InfoWindow</code>, you need that anchor to resolve to a
            <em>Google Maps API MVCObject</em>, and not a React component.
          </p>
          <pre>
            {`import { InfoWindow, Marker, MarkerType, Map, useGoogle } from "reactive-atlas";

const IWExample = () => {
  const ref = React.useRef<MarkerType>(null);
  const getMarkerObj = () => ref?.current?.marker;

  const [open, setOpen] = React.useState(false);

  return (
    <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
      <Marker
        ref={ref}
        options={{
          position: new google.maps.LatLng(63, 10),
          title: "Hello, World!",
          label: "B"
        }}
        eventHandlers={[["click", () => setOpen(o => !o)]]}
      />

      <InfoWindow
        open={open}
        setOpen={setOpen}
        anchor={getMarkerObj}
      >
        <p>Hello, World!</p>
      </InfoWindow>
    </Map>
  );
};`}
          </pre>
        </div>
        <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
          <Marker
            ref={ref}
            options={{
              position: new google.maps.LatLng(63, 10),
              title: "Hello, World!",
              label: "B"
            }}
            eventHandlers={[["click", () => setOpen(o => !o)]]}
          />

          <InfoWindow
            open={open}
            setOpen={setOpen}
            anchor={() => ref.current.marker}
          >
            <p>Hello, World!</p>
          </InfoWindow>
        </Map>
      </div>
      <div className="map-split">
        <div>
          <h2>Circle</h2>
          <p>
            Exactly the same usage as <code>Marker</code>. Required{" "}
            <code>option</code> keys are <code>radius: number</code>, and{" "}
            <code>center: google.maps.LatLng | google.maps.LatLngLiteral</code>.
          </p>
          <pre>
            {`import { Map, Circle, useGoogle } from "reactive-atlas";

const Globus = () => {
  const google = useGoogle();

  return (
    <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
      <Circle
        options={{
          center: new google.maps.LatLng(63, 10),
          editable: true,
          radius: 12000
        }}
      />
    </Map>
  );
};`}
          </pre>
        </div>
        <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
          <Circle
            options={{
              center: new google.maps.LatLng(63, 10),
              editable: true,
              radius: 12000
            }}
          />
        </Map>
      </div>
      <div className="map-split">
        <div>
          <h2>Example of moving and resizing a circle with event handlers</h2>
          <p>
            Create an event handler which simply prints the new location and
            radius.
          </p>
          <pre>
            {`const circleChangePosRadius = circle =>
    setPos({
      center: {
        lat: circle.getCenter().lat(),
        lng: circle.getCenter().lng()
      },
      radius: circle.getRadius()
    });`}
          </pre>
          <p>
            Wire it up to set pos every time the radius or center changes using
            event handlers.
          </p>
          <pre>
            {`<Circle
  options={{
    editable: true,
    radius: pos.radius,
    center: pos.center
  }}
  eventHandlers={[
    ["radius_changed", circleChangePosRadius],
    ["center_changed", circleChangePosRadius]
  ]}
/>`}
          </pre>
          <pre>
            ======= Results =======
            <br />
            Center: Lat: {pos.center.lat}
            <br />
            Lng: {pos.center.lng}
            <br />
            Radius: {pos.radius}
          </pre>

          <p>
            The same principles would be used when making a <code>Marker</code>{" "}
            draggable; just replace <code>radius_changed</code>/
            <code>center_changed</code> with <code>dragend</code>.
          </p>
        </div>

        <Map options={{ zoom: 8, center: pos.center }}>
          <Circle
            options={{
              editable: true,
              radius: pos.radius,
              center: pos.center
            }}
            eventHandlers={[
              ["radius_changed", circleChangePosRadius],
              ["center_changed", circleChangePosRadius]
            ]}
          />
        </Map>
      </div>
      <h2>Events</h2>
      <p>
        To retain as much of the original code as possible from the google API,
        I've decided to opt for a bit strange event handling. Instead of doing
        like
        <code>google-maps-react</code> (the reason I'm making this library) and
        using "standard" HTML-like handlers (i.e. <code>onCenter_changed</code>{" "}
        (the weird combination of camelCase and snake_case is because google
        uses snake-case, and HTML uses camelCase)), I've opted to use a list of
        event handlers you'd like to attach to the element. This property can be
        used on <code>Map</code>, <code>Marker</code>, and <code>Circle</code>
        (as of now). To remove an event handler, simply remove the entry from
        the array of handlers, and the library will remove the listener. It will
        also clean up all listeners when unmounting. The first parameter in the
        callback function is the object you're operating on, so in the next
        example, it's a marker, but if you were to add a listener to a circle,
        it would be the circle. This allows you to operate directly on the
        google API, which might be desirable. The second parameter is a list
        with one of the following;
      </p>
      <ol>
        <li>
          Nothing, i.e. <code>[]</code>
        </li>
        <li>
          <code>undefined</code>, i.e. <code>[undefined]</code>
        </li>
        <li>
          The event (e.g. <code>MouseEvent</code>), i.e.{" "}
          <code>[MouseEvent]</code>
        </li>
      </ol>
      <p>
        This is a bit strange, but it works quite well. I believe it was
        intended for possible expansion, so that you could pass more than one
        event.
      </p>
      <pre>
        {`import { Map, Marker, useGoogle } from "reactive-atlas";

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
};`}
      </pre>
      <h2>Bounds</h2>
      <p>
        Often times, you want to specify the bounds of the place you want to
        see. You can do this using the <code>bounds</code> prop on{" "}
        <code>Map</code>. Simply send in a{" "}
        <code>google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral</code>{" "}
        object, and it will scale to that area. If you change the{" "}
        <code>bounds</code>, the map will fit to the new area and pan there.
      </p>
      <h3>License</h3>
      MIT &copy;{" "}
      <a href="https://github.com/fredrikaugust">fredrikaugust @ github</a>
    </div>
  );
};

import React from "react";

import { Map, useGoogle, Marker, Circle } from "reactive-atlas";

export const App = () => {
  const google = useGoogle();
  const [pos, setPos] = React.useState(12);

  const [mapHandler, setMapHandler] = React.useState([]);

  const [markers, setMarkers] = React.useState([]);

  const [bounds, setBounds] = React.useState();

  React.useEffect(() => {
    const b = new google.maps.LatLngBounds();

    b.extend(
      new google.maps.Circle({
        center: { lat: 63, lng: 10 },
        radius: 10000
      }).getCenter()
    );
    b.extend(
      new google.maps.Marker({ position: { lat: pos, lng: pos } }).getPosition()
    );

    setBounds(b);
  }, [pos]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h1>Loaded!</h1>
      <Map
        options={{ zoom: 8, center: new google.maps.LatLng(12, 12) }}
        eventHandlers={mapHandler}
        bounds={bounds}
      >
        {markers.map(e => (
          <Marker
            key={e}
            options={{
              position: { lat: Math.random() * 10, lng: Math.random() * 10 }
            }}
          />
        ))}
        <Marker
          options={{
            position: new google.maps.LatLng(pos, pos),
            title: "Hello, World!"
          }}
          eventHandlers={[
            [
              "click",
              (marker, evt) => {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => marker.setAnimation(null), 500);
                setMapHandler([["click", (map, args) => setPos(p => p + 1)]]);

                setMarkers(m => [...m, Math.random()]);

                console.log(evt);
              }
            ]
          ]}
        />
        <Circle
          options={{
            editable: true,
            radius: 100000,
            center: new google.maps.LatLng(63, 10)
          }}
          eventHandlers={[
            [
              "click",
              (circle, evt) => {
                console.log(circle.getRadius());
                console.log(evt);
              }
            ]
          ]}
        />
      </Map>
    </div>
  );
};

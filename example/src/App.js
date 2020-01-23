import React from "react";

import { Map, useGoogle, Marker, Circle } from "reactive-atlas";

export const App = () => {
  const google = useGoogle();
  const [pos, setPos] = React.useState(12);

  const [mapHandler, setMapHandler] = React.useState([
    ["click", (map, args) => setPos(p => p + 1)]
  ]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h1>Loaded!</h1>
      <Map
        options={{ zoom: 8, center: new google.maps.LatLng(12, 12) }}
        eventHandlers={mapHandler}
      >
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
                setMapHandler([]);

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
              "radius_changed",
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

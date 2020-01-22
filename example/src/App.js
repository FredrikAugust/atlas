import React from "react";

import { Map, useGoogle, Marker } from "reactive-atlas";

export const App = () => {
  const google = useGoogle();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h1>Loaded!</h1>
      <Map options={{ zoom: 8, center: new google.maps.LatLng(63, 10) }}>
        <Marker
          options={{
            position: new google.maps.LatLng(63, 10),
            title: "Hello, World!",
            label: "B"
          }}
        />
      </Map>
    </div>
  );
};

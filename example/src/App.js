import React from "react";

import { GoogleAPIProvider } from "reactive-atlas";

export const App = () => {
  return (
    <GoogleAPIProvider
      apiKey="AIzaSyBOpaLOe4y2QMtso6UQBUa3StPkMnJxGJs"
      loadingComponent={<h1>Loading...</h1>}
    >
      <h1>Loaded!</h1>
    </GoogleAPIProvider>
  );
};

import React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

import { GoogleAPIProvider } from "reactive-atlas";

ReactDOM.render(
  <GoogleAPIProvider
    apiKey="AIzaSyBOpaLOe4y2QMtso6UQBUa3StPkMnJxGJs"
    loadingComponent={<h1>Loading...</h1>}
  >
    <App />
  </GoogleAPIProvider>,
  document.getElementById("root")
);

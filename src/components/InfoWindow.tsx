import React from "react";

import ReactDOM from "react-dom";
import { renderToString } from "react-dom/server";

import { compareLatLng } from "../helpers/latlng";
import { IInjectedWithMapProps, withMap } from "./Map";

interface IInfoWindowProps extends IInjectedWithMapProps {
  options?: google.maps.InfoWindowOptions;
  open: boolean;
  /**
   * This is useful for when you want to sync the state between the infowindow
   * and the rendering parent.
   */
  setOpen?: (o: boolean) => void;
  /**
   * I decided to make this a function which evaluates to an object instead, as
   * that made it easier to create code that relied on another component.
   */
  anchor?: () => google.maps.Circle | google.maps.Marker | undefined;
}

class InfoWindow extends React.Component<IInfoWindowProps> {
  public infoWindow: google.maps.InfoWindow;

  public contentRef = React.createRef<HTMLDivElement>();
  private token: number;

  constructor(args: IInfoWindowProps) {
    super(args);

    this.token = Math.floor(Math.random() * 10e16);

    this.infoWindow = new google.maps.InfoWindow({
      ...args.options,
      content: renderToString(
        <div id={`infowindow-reactive-atlas-${this.token}`}>
          {this.props.children}
        </div>
      )
    });

    this.infoWindow.addListener("closeclick", () => {
      if (this.props.setOpen) {
        this.props.setOpen(false);
      }
    });

    google.maps.event.addListenerOnce(this.infoWindow, "domready", () => {
      ReactDOM.hydrate(
        <>{this.props.children}</>,
        document.querySelector(`#infowindow-reactive-atlas-${this.token}`)
      );
    });
  }

  public render() {
    if (
      this.props.options &&
      this.props.options.position &&
      !compareLatLng(this.props.options.position, this.infoWindow.getPosition())
    ) {
      this.infoWindow.setPosition(this.props.options.position);
    }

    if (this.props.open) {
      this.infoWindow.open(
        this.props.map,
        this.props.anchor && this.props.anchor()
      );
    } else {
      this.infoWindow.close();
    }

    return null;
  }
}

(InfoWindow as React.ComponentClass).displayName = "InfoWindow";

export default withMap<typeof InfoWindow, IInfoWindowProps>(InfoWindow);
export type InfoWindowType = InfoWindow;

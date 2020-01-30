import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { compareLatLng } from "../helpers/latlng";
import { IInjectedWithMapProps, withMap } from "./Map";

/**
 * For some reason, Omit is not present in the TS version this library creator
 * uses.
 */
type Omit<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P];
};

interface IInfoWindowProps extends IInjectedWithMapProps {
  options?: Omit<google.maps.InfoWindowOptions, "content">;
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
  anchor?: () => google.maps.Circle | google.maps.Marker;
}

class InfoWindow extends React.Component<IInfoWindowProps> {
  public infoWindow: google.maps.InfoWindow;

  constructor(args: IInfoWindowProps) {
    super(args);

    this.infoWindow = new google.maps.InfoWindow({
      ...args.options,
      content: renderToStaticMarkup(<>{this.props.children}</>)
    });

    this.infoWindow.addListener("closeclick", () => {
      if (this.props.setOpen) {
        this.props.setOpen(false);
      }
    });
  }

  public shouldComponentUpdate(nextProps: IInfoWindowProps) {
    let dirty = false;

    if (
      this.props.options &&
      this.props.options.position &&
      nextProps.options &&
      nextProps.options.position &&
      !compareLatLng(this.props.options.position, nextProps.options.position)
    ) {
      this.infoWindow.setPosition(nextProps.options.position);
      dirty = true;
    }

    if (this.props.open !== nextProps.open) {
      if (nextProps.open) {
        this.infoWindow.open(
          this.props.map,
          this.props.anchor && this.props.anchor()
        );
      } else {
        this.infoWindow.close();
      }
    }

    return dirty;
  }

  public render() {
    this.infoWindow.setContent(
      renderToStaticMarkup(<>{this.props.children}</>)
    );

    return null;
  }
}

(InfoWindow as React.ComponentClass).displayName = "InfoWindow";

export default withMap<typeof InfoWindow, IInfoWindowProps>(InfoWindow);
export type InfoWindowType = typeof InfoWindow;

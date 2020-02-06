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
        /**
         * We use this div as the container into which we hydrate later.
         */
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

    /**
     * I had a lot of problems with this, so my end solution was to render and
     * hydrate every time we try to rerender this component (detected when the
     * google library reports that the content I told it to render is done
     * rendering), which should essentially be every time new content is passed
     * in (props.children). This is probably not the optimal solution, but it
     * appears to work. When removing this, it won't pick up changes to the
     * content.
     *
     * One sad thing about this though, is that as we're only hydrating when
     * the dom is ready, we won't be able to updae this before it is rendered
     * for the first time.
     */
    google.maps.event.addListener(this.infoWindow, "domready", () => {
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

    /**
     * Update the content rendered. This will also trigger the `domready`
     * handler after a while, which will hydrate the content, and allow react
     * to work with it.
     */
    this.infoWindow.setContent(
      renderToString(
        <div id={`infowindow-reactive-atlas-${this.token}`}>
          {this.props.children}
        </div>
      )
    );

    return null;
  }

  /**
   * Remove the React rendered content from the Google InfoWindow.
   */
  public componentWillUnmount() {
    const node: HTMLDivElement | null = document.querySelector(
      `#infowindow-reactive-atlas-${this.token}`
    );
    if (node !== null) {
      ReactDOM.unmountComponentAtNode(node);
    }
  }
}

(InfoWindow as React.ComponentClass).displayName = "InfoWindow";

export default withMap<typeof InfoWindow, IInfoWindowProps>(InfoWindow);
export type InfoWindowType = InfoWindow;

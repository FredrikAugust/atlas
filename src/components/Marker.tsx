import React from "react";
import {
  EventHandlerPair,
  EventName,
  IInjectedWithMapProps,
  withMap
} from "./Map";

interface IMarkerProps {
  options: google.maps.MarkerOptions;
  children: never;
  eventHandlers?: Array<EventHandlerPair<EventName, google.maps.Marker>>;
}

class Marker extends React.Component<IMarkerProps & IInjectedWithMapProps> {
  public marker: google.maps.Marker;

  constructor(args: IMarkerProps & IInjectedWithMapProps) {
    super(args);

    this.marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      ...this.props.options
    });
  }

  public componentDidMount() {
    // TODO: remove listeners
    if (this.props.eventHandlers) {
      this.props.eventHandlers.forEach(([name, handler]) =>
        this.marker.addListener(name, args => {
          console.log(`handling ${name} on marker`);
          handler(this.marker, [args!]);
        })
      );
    }
  }

  public componentWillUnmount() {
    /**
     * Clean up stray event listeners.
     */
    google.maps.event.clearInstanceListeners(this.marker);
    this.marker.setMap(null);
  }

  public componentDidUpdate() {
    console.log("updating marker");
    if (this.marker.getMap() !== this.props.map) {
      this.marker.setMap(this.props.map);
    }

    this.marker.setPosition(this.props.options.position!);
  }

  public shouldComponentUpdate(
    nextProps: IMarkerProps & IInjectedWithMapProps
  ) {
    if (this.props.map === undefined && nextProps.map) {
      // I will take the liberty to perform this in shouldComponentUpdate, as I believe the solution is cleaner.
      return true;
    }

    // Received a new position
    if (
      this.props.options.position!.toString() !==
      nextProps.options.position!.toString()
    ) {
      return true;
    }

    return false;
  }

  public render() {
    return null;
  }
}

(Marker as React.ComponentClass).displayName = "Marker";
export default withMap(Marker);

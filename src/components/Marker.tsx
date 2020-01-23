import React from "react";
import {
  EventHandlerPair,
  EventName,
  IInjectedWithMapProps,
  withMap
} from "./Map";

interface IMarkerProps extends IInjectedWithMapProps {
  options: google.maps.MarkerOptions & {
    position: google.maps.LatLng | google.maps.LatLngLiteral;
  };
  children?: never;
  eventHandlers?: Array<EventHandlerPair<EventName, google.maps.Marker>>;
}

class Marker extends React.Component<IMarkerProps> {
  public marker: google.maps.Marker;

  constructor(args: IMarkerProps) {
    super(args);

    this.marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      ...this.props.options
    });
  }

  public componentDidMount() {
    this.setEventListenersFromProps();
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
      this.marker.setMap(this.props.map!);
    }

    this.marker.setPosition(this.props.options.position);
  }

  public shouldComponentUpdate(nextProps: IMarkerProps) {
    if (this.props.eventHandlers !== nextProps.eventHandlers) {
      this.updateEventListeners(nextProps.eventHandlers);
    }

    if (this.props.map === undefined && nextProps.map) {
      // I will take the liberty to perform this in shouldComponentUpdate, as I believe the solution is cleaner.
      return true;
    }

    if (this.props.options.label !== nextProps.options.label) {
      this.marker.setLabel(nextProps.options.label || null);
      return true;
    }

    if (this.props.options.title !== nextProps.options.title) {
      this.marker.setTitle(nextProps.options.title || null);
      return true;
    }

    if (
      this.marker.getPosition()!.toString() !==
      nextProps.options.position.toString()
    ) {
      this.marker.setPosition(nextProps.options.position);
      return true;
    }

    return false;
  }

  public render() {
    return null;
  }

  private setEventListenersFromProps() {
    if (this.props.eventHandlers) {
      this.setEventListeners(this.props.eventHandlers);
    }
  }

  /**
   * Do not call this if setEventListeners can be undefined. Sets all event
   * listeners passed.
   *
   * @param eventHandlers Event handlers, but we are sure that they are not undefined.
   */
  private setEventListeners(eventHandlers: IMarkerProps["eventHandlers"]) {
    eventHandlers!.forEach(([name, handler]) =>
      this.marker.addListener(name, args => {
        console.log(`handling ${name} on marker`);
        handler(this.marker, [args!]);
      })
    );
  }

  private updateEventListeners(
    newEventHandlers: IMarkerProps["eventHandlers"]
  ) {
    if (this.props.eventHandlers && newEventHandlers) {
      // what handlers were on map but now aren't
      const toRemove = this.props.eventHandlers.filter(
        eh =>
          // Compare name
          newEventHandlers.findIndex(neh => neh[0] === eh[0]) === -1
      );

      // Remove the listeners that aren't being received in props anymore.
      toRemove.forEach(tr => {
        console.log(`removing marker handler of type ${tr[0]}`);
        google.maps.event.clearListeners(this.marker, tr[0]);
      });

      const toAdd = newEventHandlers.filter(
        neh =>
          // Compare name
          // We have to have a "!" here for some reason even though we checked
          // it going into the if statement. TS??
          this.props.eventHandlers!.findIndex(eh => neh[0] === eh[0]) === -1
      );

      // Add the listeners we now have, but didn't have before.
      toAdd.forEach(tr => {
        console.log(`adding marker handler of type ${tr[0]}`);
        this.marker.addListener(tr[0], tr[1]);
      });
    }

    if (!newEventHandlers) {
      google.maps.event.clearInstanceListeners(this.marker);
    }

    if (!this.props.eventHandlers) {
      this.setEventListeners(newEventHandlers);
    }
  }
}

(Marker as React.ComponentClass).displayName = "Marker";
export default withMap<IMarkerProps>(Marker);

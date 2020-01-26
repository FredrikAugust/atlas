import React from "react";
import { compareLatLng } from "../helpers/latlng";
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
    /**
     * We need this, as we might unmount and remount as a result of redux store
     * changes.
     */
    if (this.props.map) {
      this.marker.setMap(this.props.map);
    }

    this.setEventListenersFromProps();
  }

  public componentWillUnmount() {
    /**
     * Clean up stray event listeners.
     */
    google.maps.event.clearInstanceListeners(this.marker);
    /**
     * This removes it from the map.
     */
    this.marker.setMap(null);
  }

  public componentDidUpdate() {
    console.log("updating marker");
  }

  public shouldComponentUpdate(nextProps: IMarkerProps) {
    let dirty = false;

    if (this.props.eventHandlers !== nextProps.eventHandlers) {
      this.updateEventListeners(nextProps.eventHandlers);
    }

    /**
     * We need this as the map is lazy loaded by the withMap injector.
     */
    if (this.props.map !== nextProps.map) {
      this.marker.setMap(nextProps.map!);
      dirty = true;
    }

    if (this.props.options.label !== nextProps.options.label) {
      this.marker.setLabel(nextProps.options.label || null);
      dirty = true;
    }

    if (this.props.options.title !== nextProps.options.title) {
      this.marker.setTitle(nextProps.options.title || null);
      dirty = true;
    }

    if (
      !compareLatLng(this.props.options.position, nextProps.options.position)
    ) {
      this.marker.setPosition(nextProps.options.position);
      dirty = true;
    }

    return dirty;
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

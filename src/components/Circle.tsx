import React from "react";
import { compareLatLng } from "../helpers/latlng";
import {
  EventHandlerPair,
  EventName,
  IInjectedWithMapProps,
  withMap
} from "./Map";

interface ICircleProps extends IInjectedWithMapProps {
  options: google.maps.CircleOptions & {
    radius: number;
    center: google.maps.LatLng | google.maps.LatLngLiteral;
  };
  children?: never;
  eventHandlers?: Array<EventHandlerPair<EventName, google.maps.Circle>>;
}

class Circle extends React.Component<ICircleProps> {
  public circle: google.maps.Circle;

  constructor(args: ICircleProps) {
    super(args);
    this.circle = new google.maps.Circle(this.props.options);
  }

  public componentDidMount() {
    this.setEventListenersFromProps();
  }

  public componentWillUnmount() {
    /**
     * Clean up stray event listeners.
     */
    google.maps.event.clearInstanceListeners(this.circle);
    this.circle.setMap(null);
  }

  public componentDidUpdate() {
    console.log("updating circle");
  }

  public shouldComponentUpdate(nextProps: ICircleProps) {
    let dirty = false;

    if (this.props.eventHandlers !== nextProps.eventHandlers) {
      this.updateEventListeners(nextProps.eventHandlers);
    }

    if (this.circle.getEditable() !== nextProps.options.editable) {
      this.circle.setEditable(this.props.options.editable || false);
      dirty = true;
    }

    if (this.props.map === undefined && nextProps.map) {
      this.circle.setMap(nextProps.map!);
      dirty = true;
    }

    if (!compareLatLng(this.circle.getCenter(), nextProps.options.center)) {
      this.circle.setCenter(nextProps.options.center);
      dirty = true;
    }

    if (this.circle.getRadius() !== nextProps.options.radius) {
      this.circle.setRadius(nextProps.options.radius);
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
  private setEventListeners(eventHandlers: ICircleProps["eventHandlers"]) {
    eventHandlers!.forEach(([name, handler]) =>
      this.circle.addListener(name, args => {
        console.log(`handling ${name} on circle`);
        handler(this.circle, [args!]);
      })
    );
  }

  private updateEventListeners(
    newEventHandlers: ICircleProps["eventHandlers"]
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
        console.log(`removing circle handler of type ${tr[0]}`);
        google.maps.event.clearListeners(this.circle, tr[0]);
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
        console.log(`adding circle handler of type ${tr[0]}`);
        this.circle.addListener(tr[0], tr[1]);
      });
    }

    if (!newEventHandlers) {
      google.maps.event.clearInstanceListeners(this.circle);
    }

    if (!this.props.eventHandlers) {
      this.setEventListeners(newEventHandlers);
    }
  }
}

(Circle as React.ComponentClass).displayName = "Circle";

export default withMap<ICircleProps>(Circle);

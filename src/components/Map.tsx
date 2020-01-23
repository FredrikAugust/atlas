import React from "react";

import styled from "styled-components";

const MapCtx = React.createContext<google.maps.Map<HTMLElement> | null>(null);

export const useMap = () => React.useContext(MapCtx)!;
export interface IInjectedWithMapProps {
  map?: google.maps.Map;
}

/**
 * This is a helper I use to provide components not able to use hooks the ability to receive the map object.
 *
 * @param Component The component which will receive the map prop.
 */
export const withMap = <P extends IInjectedWithMapProps>(
  Component: React.ComponentType<P>
) => {
  const C: React.FC<P> = props => {
    const map = useMap();
    return <Component map={map} {...props} />;
  };
  // This makes it a bit prettier while debugging.
  C.displayName = `withMap(${Component.displayName || "unnamed"})`;
  return C as React.FC<Exclude<P, "map">>;
};

interface IMapProps {
  // Override, as center and zoom are actually required
  options: google.maps.MapOptions & {
    center: google.maps.LatLng | google.maps.LatLngLiteral;
    zoom: number;
  };
  eventHandlers?: Array<EventHandlerPair<EventName, google.maps.Map>>;
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
}

/**
 * This is a dirty hack to add the missing event name to the list of events.
 */
interface IRadiusChangedHandlerMap {
  radius_changed: [undefined];
}
/**
 * We need to add in 'radius_changed' ourselves.
 */
type PatchedHandlerMap = google.maps.MapHandlerMap & IRadiusChangedHandlerMap;
export type EventName = keyof PatchedHandlerMap;
type EventHandlerFunc<N extends EventName> = PatchedHandlerMap[N];
/**
 * This is a type which essentially looks like this
 * [
 *  [
 *   "name of event, e.g. 'dragend'",
 *   (map, [MouseEvent]) => void
 *  ]
 * ]
 *
 * The reason for the complicated-ness is that I want to use google's own
 * variable names instead of hard-coding them.
 */
export type EventHandlerPair<N extends EventName, T> = [
  N,
  (obj: T, args: EventHandlerFunc<N>) => void
];

/**
 * We rely on flex to control the size of the map.
 */
const MapElem = styled.div`
  flex-grow: 1;
`;

export class Map extends React.Component<IMapProps> {
  public map: google.maps.Map<HTMLElement>;

  // Want to minimize calls to window.google
  // private google = window.google;
  private mapRef: React.RefObject<HTMLDivElement> = React.createRef();

  public componentDidMount() {
    this.map = new google.maps.Map(this.mapRef.current!, this.props.options);

    // Set the context
    google.maps.event.addListenerOnce(this.map, "tilesloaded", () =>
      this.forceUpdate()
    );

    this.setEventListenersFromProps();

    google.maps.event.addListenerOnce(this.map, "tilesloaded", () => {
      this.setBounds(this.props.bounds);
    });
  }

  /**
   * Clean up stray event listeners.
   */
  public componentWillUnmount() {
    google.maps.event.clearInstanceListeners(this.map);
  }

  public shouldComponentUpdate(nextProps: React.PropsWithChildren<IMapProps>) {
    if (!this.props.bounds && nextProps.bounds) {
      this.setBounds(nextProps.bounds);
    }

    /**
     * This means we have to set or unset some event handlers.
     * We don't need to rerender, we just need to update the handlers.
     *
     * #minimalrendergang
     */
    if (this.props.eventHandlers !== nextProps.eventHandlers) {
      this.updateEventListeners(nextProps.eventHandlers);
    }

    if (this.props.children !== nextProps.children) {
      return true;
    }

    // Prop check
    if (
      this.props.options.zoom !== nextProps.options.zoom ||
      this.props.options.center.toString() !==
        nextProps.options.center.toString()
    ) {
      return true;
    }

    return false;
  }

  public componentDidUpdate() {
    console.log("updated map");
  }

  public render() {
    return (
      <MapCtx.Provider value={this.map}>
        <>
          <MapElem ref={this.mapRef} />
          {this.props.children}
        </>
      </MapCtx.Provider>
    );
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
  private setEventListeners(eventHandlers: IMapProps["eventHandlers"]) {
    eventHandlers!.forEach(([name, handler]) =>
      this.map.addListener(name, args => {
        console.log(`handling ${name} on map`);
        handler(this.map, [args!]);
      })
    );
  }

  private updateEventListeners(newEventHandlers: IMapProps["eventHandlers"]) {
    if (this.props.eventHandlers && newEventHandlers) {
      // what handlers were on map but now aren't
      const toRemove = this.props.eventHandlers.filter(
        eh =>
          // Compare name
          newEventHandlers.findIndex(neh => neh[0] === eh[0]) === -1
      );

      // Remove the listeners that aren't being received in props anymore.
      toRemove.forEach(tr => {
        console.log(`removing map handler of type ${tr[0]}`);
        google.maps.event.clearListeners(this.map, tr[0]);
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
        console.log(`adding map handler of type ${tr[0]}`);
        this.map.addListener(tr[0], tr[1]);
      });
    }

    if (!newEventHandlers) {
      google.maps.event.clearInstanceListeners(this.map);
    }

    if (!this.props.eventHandlers) {
      this.setEventListeners(newEventHandlers);
    }
  }

  private setBounds(
    bounds:
      | google.maps.LatLngBounds
      | google.maps.LatLngBoundsLiteral
      | undefined
  ) {
    if (bounds) {
      this.map.fitBounds(bounds, { bottom: 10, left: 10, right: 10, top: 10 });
      this.map.panToBounds(bounds);
    }
  }
}

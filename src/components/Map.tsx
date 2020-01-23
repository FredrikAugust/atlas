import React from "react";

import styled from "styled-components";

const MapCtx = React.createContext<google.maps.Map<HTMLElement> | null>(null);

export const useMap = () => React.useContext(MapCtx)!;
export interface IInjectedWithMapProps {
  map: google.maps.Map;
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
  return C;
};

// tslint:disable-next-line: no-empty-interface
interface IMapProps {
  // Override, as center and zoom are actually required
  options: google.maps.MapOptions & {
    center: google.maps.LatLng | google.maps.LatLngLiteral;
    zoom: number;
  };
  eventHandlers?: Array<EventHandlerPair<EventName, google.maps.Map>>;
}

/**
 * This is a dirty hack to add the missing event name to the list of events.
 */
interface IRadiusChangedHandlerMap {
  radius_changed: [undefined];
}
type PatchedHandlerMap = google.maps.MapHandlerMap & IRadiusChangedHandlerMap;
export type EventName = keyof PatchedHandlerMap;
type EventHandlerFunc<N extends EventName> = PatchedHandlerMap[N];
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
    // With this, we can load the map, and when it's done, load in the rest.
    // This also prevents the children from rendering with a map that is not
    // instantiated yet. 2 fluer i en smekk as we say in norge.
    this.map.addListener("tilesloaded", () => this.forceUpdate());

    this.setEventListenersFromProps();
  }

  /**
   * Clean up stray event listeners.
   */
  public componentWillUnmount() {
    google.maps.event.clearInstanceListeners(this.map);
  }

  public shouldComponentUpdate(nextProps: React.PropsWithChildren<IMapProps>) {
    /**
     * This means we have to set or unset some event handlers.
     * We don't need to rerender, we just need to update the handlers.
     *
     * #minimalrendergang
     */
    if (this.props.eventHandlers !== nextProps.eventHandlers) {
      this.updateEventListeners(nextProps.eventHandlers);
    }

    // Prop check
    if (
      this.props.options.zoom !== nextProps.options.zoom ||
      this.props.options.center.toString() !==
        nextProps.options.center.toString()
    ) {
      return true;
    }

    if (this.props.children !== nextProps.children) {
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
}

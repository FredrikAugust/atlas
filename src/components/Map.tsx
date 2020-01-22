import React from "react";

import styled from "styled-components";

const MapCtx = React.createContext<google.maps.Map<HTMLElement> | null>(null);

// tslint:disable-next-line: no-empty-interface
interface IMapProps {
  // Override, as center and zoom are actually required
  options: google.maps.MapOptions & {
    center: google.maps.LatLng | google.maps.LatLngLiteral;
    zoom: number;
  };
}

interface IMapState {
  map: google.maps.Map<HTMLElement> | null;
}

const MapElem = styled.div`
  flex-grow: 1;
`;

export class Map extends React.Component<IMapProps, IMapState> {
  public state: IMapState = { map: null };

  // Want to minimize calls to window.google
  // private google = window.google;
  private mapRef: React.RefObject<HTMLDivElement> = React.createRef();

  public componentDidMount() {
    this.setState(() => ({
      map: new google.maps.Map(this.mapRef.current!, this.props.options)
    }));
  }

  public render() {
    return (
      <MapCtx.Provider value={this.state.map}>
        <>
          <MapElem ref={this.mapRef} />
        </>
      </MapCtx.Provider>
    );
  }
}

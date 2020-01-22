import React from "react";

// tslint:disable-next-line: no-empty-interface
interface IMapProps {
  // Override, as center and zoom are actually required
  options: google.maps.MapOptions & {
    center: google.maps.LatLng | google.maps.LatLngLiteral;
    zoom: number;
  };
}

export class Map extends React.Component<IMapProps> {
  // Want to minimize calls to window.google
  // private google = window.google;
  private mapRef: React.RefObject<HTMLDivElement> = React.createRef();
  private map: google.maps.Map<HTMLDivElement>;

  public componentDidMount() {
    this.map = new google.maps.Map(this.mapRef.current!, this.props.options);
    console.log(this.map);
  }

  public render() {
    return <div ref={this.mapRef} />;
  }
}

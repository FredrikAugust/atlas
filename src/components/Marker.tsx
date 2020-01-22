import React from "react";
import { IInjectedWithMapProps, withMap } from "./Map";

interface IMarkerProps {
  options: google.maps.MarkerOptions;
  children: never;
}

class Marker extends React.Component<IMarkerProps & IInjectedWithMapProps> {
  public marker: google.maps.Marker;

  public componentDidMount() {
    this.marker = new google.maps.Marker(this.props.options);
  }

  public componentWillUnmount() {
    this.marker.setMap(null);
  }

  public componentDidUpdate() {
    this.marker.setMap(this.props.map);
  }

  public shouldComponentUpdate(
    nextProps: IMarkerProps & IInjectedWithMapProps
  ) {
    if (this.props.map === undefined && nextProps.map) {
      return true;
    }

    return false;
  }

  public render() {
    return null;
  }
}

export default withMap(Marker);

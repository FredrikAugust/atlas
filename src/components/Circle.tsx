import React from "react";
import { IInjectedWithMapProps, withMap } from "./Map";

interface ICircleProps {
  options: google.maps.CircleOptions;
  children: never;
}

class Circle extends React.Component<ICircleProps & IInjectedWithMapProps> {
  public circle: google.maps.Circle;

  constructor(args: ICircleProps & IInjectedWithMapProps) {
    super(args);
    this.circle = new google.maps.Circle(this.props.options);
  }

  public componentWillUnmount() {
    this.circle.setMap(null);
  }

  public componentDidUpdate() {
    console.log("updating circle");
    this.circle.setMap(this.props.map);
  }

  public shouldComponentUpdate(
    nextProps: ICircleProps & IInjectedWithMapProps
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

export default withMap(Circle);

import React from "react";
import {
  EventHandlerPair,
  EventName,
  IInjectedWithMapProps,
  withMap
} from "./Map";

interface ICircleProps {
  options: google.maps.CircleOptions;
  children: never;
  eventHandlers?: Array<EventHandlerPair<EventName, google.maps.Circle>>;
}

class Circle extends React.Component<ICircleProps & IInjectedWithMapProps> {
  public circle: google.maps.Circle;

  constructor(args: ICircleProps & IInjectedWithMapProps) {
    super(args);
    this.circle = new google.maps.Circle(this.props.options);
  }

  public componentDidMount() {
    // TODO: remove listeners
    if (this.props.eventHandlers) {
      this.props.eventHandlers.forEach(([name, handler]) =>
        this.circle.addListener(name, args => {
          console.log(`handling ${name} on marker`);
          handler(this.circle, [args!]);
        })
      );
    }
  }

  public componentWillUnmount() {
    this.circle.setMap(null);
  }

  public componentDidUpdate() {
    console.log("updating circle");
    if (this.circle.getMap() !== this.props.map) {
      this.circle.setMap(this.props.map);
    }
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

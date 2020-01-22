import * as React from "react";

export interface IProps {
  text: string;
}

export const ExampleComponent: React.FC<IProps> = ({ text }) => <h1>{text}</h1>;

import { Entity } from "./Entity";

export abstract class Component {
  entity?: Entity;

  abstract get type(): string;

  constructor() {}

  onAttach?(): void;

  onDetach?(): void;
}

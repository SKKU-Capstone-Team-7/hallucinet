class WsContainerEvent {
  readonly kind: number;
  readonly container_name: string;
  readonly container_ip: string;
  readonly container_image: string;

  constructor(partial: Partial<WsContainerEvent>) {
    Object.assign(this, partial);
  }
}

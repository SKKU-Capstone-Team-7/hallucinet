export class CreateContainerDto {
  readonly name: string;
  readonly ip: string;
  readonly image: string;

  constructor(partial: Partial<CreateContainerDto>) {
    Object.assign(this, partial);
  }
}

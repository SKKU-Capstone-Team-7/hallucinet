export class CreateContainerDto {
  readonly name: string;
  readonly ip: string;
  readonly image: string;
  readonly user: string;
  readonly team: string;
  readonly device: string;
  readonly lastAccessed: string;

  constructor(partial: Partial<CreateContainerDto>) {
    Object.assign(this, partial);
  }
}

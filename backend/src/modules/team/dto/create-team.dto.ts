export class CreateTeamDto {
    readonly name: string;

    constructor(partial: Partial<CreateTeamDto>) {
        Object.assign(this, partial);
    }
}
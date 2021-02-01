export interface Requester {}
export interface Logger {}
export interface IUseCase {}
export interface SomeAnotherUseCase {}

export class UseCase implements IUseCase {
    constructor(
        requester: Requester,
        logger: Logger,
    ) {}
}

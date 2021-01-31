export interface Requester {}
export interface Logger {}
export interface IUseCase {}
export interface SomeAnotherUseCase {}

export class UseCase {
    constructor(
        requester: Requester,
        logger: Logger,
        // anotherUseCase: SomeAnotherUseCase,
    ) {}
}

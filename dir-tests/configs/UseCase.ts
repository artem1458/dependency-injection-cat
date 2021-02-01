export interface Requester {}
export interface Logger {}
export interface IUseCase {}
export interface SomeAnotherUseCase {}

export class UseCase implements IUseCase {
    constructor(
        private requester: Requester,
        private logger: Logger,
    ) {}
}

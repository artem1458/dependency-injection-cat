export interface IRequestHandler<Req, Res = void> {
    invoke(request: Req): Res
}

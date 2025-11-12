export interface IAction<TReq, TRes> {
    actAsync(request: TReq, ct: AbortSignal): Promise<TRes>;
}
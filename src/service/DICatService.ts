import { STDIOHelper } from './STDIOHelper';
import { CommandType, IServiceRequest, ServiceRequest } from './types/ServiceRequest';
import { IServiceResponse, ResponseStatus, ResponseType, } from './types/ServiceResponse';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { FileSystemRequest } from './types/file_system/FileSystemRequest';
import { FileSystem } from '../file-system/FileSystem';
import { IProcessFilesRequest } from './types/process_files/IProcessFilesRequest';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';
import { IServiceErrorResponse } from './types/unknown_error/IServiceErrorResponse';
import { IServiceExit } from './types/exit/IServiceExit';

export class DICatService {
    constructor(
        private fileSystemHandler: FileSystemHandler,
        private processFilesHandler: ProcessFilesHandler,
    ) {}

    async run(): Promise<void> {
        try {
            const onStdIn: typeof this.onStdIn = (buffer): Promise<void> => this.onStdIn(buffer);
            const onExit = (...args: any[]): void => this.onExit(...args);

            process.stdin.on('data', onStdIn);
            process.on('exit', onExit);
            process.on('SIGINT', onExit);
            process.on('SIGUSR1', onExit);
            process.on('SIGUSR2', onExit);
            process.on('uncaughtException', onExit);

            await FileSystem.initVirtualFS();
            this.sendResponse(undefined, ResponseType.INIT, ResponseStatus.OK);
        } catch (error) {
            this.onExit(error);
        }
    }

    private async onStdIn(buffer: Buffer): Promise<void> {
        try {
            const request: ServiceRequest = STDIOHelper.read(buffer);

            if (this.isFSRequest(request)) {
                this.fileSystemHandler.invoke(request.payload);

                return this.sendResponse(undefined, CommandType.FS, ResponseStatus.OK);
            }

            if (this.isProcessFilesRequest(request)) {
                const processResult = await this.processFilesHandler.invoke(request.payload);

                return this.sendResponse(processResult, CommandType.PROCESS_FILES, ResponseStatus.OK);
            }
        } catch (err) {
            this.sendResponse<IServiceErrorResponse>(
                {
                    details: err.message ?? null,
                    requestDetails: buffer.toString(),
                },
                ResponseType.ERROR,
                ResponseStatus.NOT_OK
            );
        }
    }

    private onExit(...args: any[]): void {
        this.sendResponse<IServiceExit>(
            {},
            ResponseType.EXIT,
            ResponseStatus.NOT_OK
        );

        process.exit();
    }

    private isFSRequest(request: ServiceRequest): request is IServiceRequest<CommandType.FS, FileSystemRequest> {
        return request.type === CommandType.FS;
    }

    private isProcessFilesRequest(request: ServiceRequest): request is IServiceRequest<CommandType.PROCESS_FILES, IProcessFilesRequest> {
        return request.type === CommandType.PROCESS_FILES;
    }

    private sendResponse<T>(payload: T, type: CommandType | ResponseType, status: ResponseStatus): void {
        const response: IServiceResponse<typeof type, typeof payload> = {
            type: type,
            status: status,
            payload: payload
        };

        STDIOHelper.write(response);
    }
}

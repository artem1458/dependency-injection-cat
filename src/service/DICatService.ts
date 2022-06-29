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
import { RestartRequest } from './types/restart/RestartRequest';
import { IRequestHandler } from './handlers/IRequestHandler';
import { RestartResponse } from './types/restart/RestartResponse';
import { BeanRepository } from '../core/bean/BeanRepository';
import { BeanDependenciesRepository } from '../core/bean-dependencies/BeanDependenciesRepository';
import { DependencyGraph } from '../core/connect-dependencies/DependencyGraph';
import { ContextNamesRepository } from '../core/context/ContextNamesRepository';
import { ContextRepository } from '../core/context/ContextRepository';
import { LifecycleMethodsRepository } from '../core/context-lifecycle/LifecycleMethodsRepository';
import { PathResolver } from '../core/ts-helpers/path-resolver/PathResolver';
import { PathResolverCache } from '../core/ts-helpers/path-resolver/PathResolverCache';
import { ConfigLoader } from '../config/ConfigLoader';
import { IDisposable } from './types/IDisposable';

export class DICatService implements IRequestHandler<RestartRequest, Promise<RestartResponse>>, IDisposable {
    constructor(
        private fileSystemHandler: FileSystemHandler,
        private processFilesHandler: ProcessFilesHandler,
    ) {}

    async run(isRestarted?: boolean): Promise<void> {
        try {
            process.stdin.on('data', this.onStdIn);
            process.on('exit', this.onExit);
            process.on('SIGINT', this.onExit);
            process.on('SIGUSR1', this.onExit);
            process.on('SIGUSR2', this.onExit);
            process.on('uncaughtException', this.onExit);

            await FileSystem.initVirtualFS();

            if (!isRestarted) {
                this.sendResponse(undefined, ResponseType.INIT, ResponseStatus.OK);
            }
        } catch (error) {
            this.onExit(error);
        }
    }

    async invoke(request: RestartRequest): Promise<RestartResponse> {
        BeanRepository.clear();
        BeanDependenciesRepository.clear();
        DependencyGraph.clear();
        ContextNamesRepository.clear();
        ContextRepository.clear();
        LifecycleMethodsRepository.clear();
        PathResolver.clear();
        PathResolverCache.clear();
        ConfigLoader.clear();
        FileSystem.clearVirtualFS();

        this.dispose();

        await this.run(true);
    }

    dispose(): void {
        process.stdin.removeListener('data', this.onStdIn);
        process.removeListener('exit', this.onExit);
        process.removeListener('SIGINT', this.onExit);
        process.removeListener('SIGUSR1', this.onExit);
        process.removeListener('SIGUSR2', this.onExit);
        process.removeListener('uncaughtException', this.onExit);
    }

    private onStdIn = async(buffer: Buffer): Promise<void> => {
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

            if (this.isRestartRequest(request)) {
                const processResult = await this.invoke(request.payload);

                return this.sendResponse(processResult, CommandType.RESTART, ResponseStatus.OK);
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
    };

    private onExit = (...args: any[]): void => {
        this.sendResponse<IServiceExit>(
            {},
            ResponseType.EXIT,
            ResponseStatus.NOT_OK
        );

        process.exit();
    };

    private isFSRequest(request: ServiceRequest): request is IServiceRequest<CommandType.FS, FileSystemRequest> {
        return request.type === CommandType.FS;
    }

    private isProcessFilesRequest(request: ServiceRequest): request is IServiceRequest<CommandType.PROCESS_FILES, IProcessFilesRequest> {
        return request.type === CommandType.PROCESS_FILES;
    }

    private isRestartRequest(request: ServiceRequest): request is IServiceRequest<CommandType.RESTART, RestartRequest> {
        return request.type === CommandType.RESTART;
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

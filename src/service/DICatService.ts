import { STDIOHelper } from './STDIOHelper';
import { CommandType, IServiceCommand, ServiceCommand } from './types/ServiceCommand';
import { IServiceResponse, ResponseStatus, ResponseType, } from './types/ServiceResponse';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { FileSystemCommand } from './types/file_system/FileSystemCommand';
import { FileSystem } from '../file-system/FileSystem';
import { IProcessFilesCommand } from './types/process_files/IProcessFilesCommand';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';
import { IServiceErrorResponse } from './types/unknown_error/IServiceErrorResponse';
import { IServiceExitResponse } from './types/exit/IServiceExitResponse';
import { RestartCommand } from './types/restart/RestartCommand';
import { ICommandHandler } from './handlers/ICommandHandler';
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

export class DICatService implements ICommandHandler<RestartCommand, Promise<RestartResponse>>, IDisposable {
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

    async invoke(command: RestartCommand): Promise<RestartResponse> {
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
            const command: ServiceCommand = STDIOHelper.read(buffer);

            if (this.isFSCommand(command)) {
                this.fileSystemHandler.invoke(command.payload);

                return this.sendResponse(undefined, CommandType.FS, ResponseStatus.OK);
            }

            if (this.isProcessFilesCommand(command)) {
                const processResult = await this.processFilesHandler.invoke(command.payload);

                return this.sendResponse(processResult, CommandType.PROCESS_FILES, ResponseStatus.OK);
            }

            if (this.isRestartCommand(command)) {
                const processResult = await this.invoke(command.payload);

                return this.sendResponse(processResult, CommandType.RESTART, ResponseStatus.OK);
            }
        } catch (err) {
            this.sendResponse<IServiceErrorResponse>(
                {
                    details: err.message ?? null,
                    commandDetails: buffer.toString(),
                },
                ResponseType.ERROR,
                ResponseStatus.NOT_OK
            );
        }
    };

    private onExit = (...args: any[]): void => {
        this.sendResponse<IServiceExitResponse>(
            {},
            ResponseType.EXIT,
            ResponseStatus.NOT_OK
        );

        process.exit();
    };

    private isFSCommand(command: ServiceCommand): command is IServiceCommand<CommandType.FS, FileSystemCommand> {
        return command.type === CommandType.FS;
    }

    private isProcessFilesCommand(command: ServiceCommand): command is IServiceCommand<CommandType.PROCESS_FILES, IProcessFilesCommand> {
        return command.type === CommandType.PROCESS_FILES;
    }

    private isRestartCommand(command: ServiceCommand): command is IServiceCommand<CommandType.RESTART, RestartCommand> {
        return command.type === CommandType.RESTART;
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

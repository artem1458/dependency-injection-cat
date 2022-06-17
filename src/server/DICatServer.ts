import express, { Express } from 'express';
import http from 'http';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { FileSystemRequest } from './types/file_system/IFSRequest';
import { FSRequestType } from './types/file_system/FSRequestType';
import { FileSystem } from '../file-system/FileSystem';
import { IProcessFilesRequest } from './types/process_files/IProcessFilesRequest';
import mime from 'mime';

export class DICatServer {
    constructor(
        private serverPort: number,
    ) {}

    private server: http.Server | null = null;

    async start(): Promise<void> {
        const expressServer = express();
        expressServer.use(express.json());
        this.initEndpoints(expressServer);

        this.server = expressServer.listen(this.serverPort);
    }

    private initEndpoints(expressServer: Express): void {
        expressServer.post('/file_system', (request, response) => {
            const requestBody: FileSystemRequest = request.body;

            if (requestBody.type === FSRequestType.ADD) {
                requestBody.files.forEach(([path, content]) => {
                    FileSystem.writeFile(path, content);
                });
            } else if (requestBody.type === FSRequestType.DELETE) {
                requestBody.paths.forEach(path => FileSystem.deleteFile(path));
            } else {
                FileSystem.clearFS();
            }

            response
                .status(StatusCodes.OK)
                .send(ReasonPhrases.OK);
        });

        expressServer.post('/process_files', (request, response) => {
            const requestBody: IProcessFilesRequest = request.body;

            //TODO Process files and return messages

            response
                .status(StatusCodes.OK)
                .contentType('application/json')
                .send(requestBody);
        });
    }
}

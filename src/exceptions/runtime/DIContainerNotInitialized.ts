import { GITHUB_REPO_LINK } from '../constants';

export class DIContainerNotInitialized extends Error {
    name = 'InitializationException'
    message = `DI container was not initialized properly, please check configuration guide ${GITHUB_REPO_LINK}`;
}

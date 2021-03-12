import { GITHUB_REPO_LINK } from '../constants';

export class UsingCatContextWithoutConfiguredDI extends Error {
    name = 'InitializationException'
    message = `Trying to use CatContext without configured DI container, please check configuration guide ${GITHUB_REPO_LINK}`;
}

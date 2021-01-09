import { GITHUB_REPO_LINK } from '../constants';

export class EmptyDIConfigPattern extends Error {
    name = 'EmptyGlobPatternException';
    message = `Seems like you forgot to define diConfig pattern please check configuration guide ${GITHUB_REPO_LINK}`;
}

import { transformerConfig } from './transformerConfig';

export function getDiConfigPattern(): string {
    if (transformerConfig.diConfigPattern === undefined) {
        throw new Error('DI Config pattern is empty, please check plugin configuration');
    }

    return transformerConfig.diConfigPattern;
}

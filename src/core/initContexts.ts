import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';
import { registerGlobalCatContext } from './context/registerGlobalCatContext';
import { getContextPaths } from './context/getContextPaths';
import { ContextRepository } from './context/ContextRepository';
import ts, { ScriptTarget } from 'typescript';
import fs from 'fs';
import { registerBeans } from './bean/registerBeans';
import { CompilationContext } from '../compilation-context/CompilationContext';

let wasInitiated = false;

export const initContexts = (
    compilationContext: CompilationContext,
) => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    TsConfigProvider.init();
    PathResolver.init();

    getContextPaths()
        .map(it => ts.createSourceFile(
            it,
            fs.readFileSync(it, 'utf-8'),
            ScriptTarget.ESNext,
            true,
        ))
        .forEach(it => registerGlobalCatContext(compilationContext, it));
    ContextRepository.globalContexts.forEach(it => registerBeans(compilationContext, it));
};

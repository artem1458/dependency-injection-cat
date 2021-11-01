import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';
import { ProgramRepository } from './program/ProgramRepository';
import { registerGlobalCatContext } from './context/registerGlobalCatContext';
import { getContextPaths } from './context/getContextPaths';
import { ContextRepository } from './context/ContextRepository';
import ts, { ScriptTarget } from 'typescript';
import fs from 'fs';
import { registerBeans } from './bean/registerBeans';

let wasInitiated = false;

export const initContexts = () => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    TsConfigProvider.init();
    PathResolver.init();
    ProgramRepository.initProgram([]);

    getContextPaths()
        .map(it => ts.createSourceFile(
            it,
            fs.readFileSync(it, 'utf-8'),
            ScriptTarget.ESNext,
            true,
        ))
        .forEach(registerGlobalCatContext);
    ContextRepository.globalContexts.forEach(registerBeans);
};

import { CompilationContext } from '../../compilation-context/CompilationContext';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';
import { Compilation, Compiler, WebpackError, NormalModule } from 'webpack';
import { BeanRepository } from '../../core/bean/BeanRepository';

export default class {
    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tap('Report DI Errors', (compilation: Compilation) => {
            const message = CompilationContext.getErrorMessage();

            if (message === null) {
                SourceFilesCache.clearCache();
                PathResolverCache.clearCache();
                return;
            }

            PathResolverCache.clearCache();
            SourceFilesCache.clearCache();
            compilation.errors.push(new WebpackError(message));
        });

        compiler.hooks.compilation.tap('DI-Cat recompile context on dependencies change', (compilation) => {
            compilation.hooks.buildModule.tap('DI-Cat recompile context on dependencies change build listener', (module) => {
                const beanDescriptors = Array.from(BeanRepository.beanIdToBeanDescriptorMap.values());
                const currentPropertyBeansPaths = beanDescriptors.filter(descriptor =>
                    descriptor.beanSourceLocation !== null && descriptor.beanSourceLocation === (module as NormalModule).resource
                ).map(it => it.contextDescriptor.absolutePath);

                const contextWebpackModules = Array.from(compilation.modules).filter(it =>
                    currentPropertyBeansPaths.includes((it as NormalModule).resource),
                );

                contextWebpackModules.forEach(module => {
                    compilation.rebuildModule(module, (error, result) => {
                        if (error) {
                            compilation.errors.push(error);
                        }
                    });
                });
            });
        });
    }
}

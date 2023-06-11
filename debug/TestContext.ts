import { Bean, CatContext as CatContext2 } from 'dependency-injection-cat';
import DefaultClass, { IType } from './Types';
//
// export interface ITestContext {
//     data: string;
// }
//
// export interface IRequester {}
//
// export class TestContext extends CatContext<ITestContext> {
//     @EmbeddedBean test: IRequester = {};
//
//     @Bean data: string = '';
//     a = Bean(A);
//
//     @Bean
//     methodBean(d: string): number {
//         return Number(d);
//     }
// }
//
// export class A {
//     constructor(
//         data: string,
//         data1: string,
//         data2: string,
//         data3: string,
//         data4: string,
//     ) {}
// }

interface ITestContext {
    data: string;
}

enum TestEnum {
    A = 'a',
    B = 'b',
}

interface IPrivateType {
    a: string;
}
type TPrivateType = { a: string };
class CPrivateType {
    a: string = '';
}

namespace Namespace {
    export namespace SubNamespace {
        export namespace SubSubNamespace {
            export class SubSubNamespaceClass {}
        }
    }
}

class ABC {}

class MyContext extends CatContext2<ITestContext> {
    // @Bean ANY1: any = undefined as any;
    // @Bean ANY2: any = undefined as any;
    // @Bean UNKNOWN1: unknown = undefined as any;
    // @Bean UNKNOWN2: unknown = undefined as any;
    // @Bean NEVER1: never = undefined as never;
    // @Bean NEVER2: never = undefined as never;
    // @Bean VOID1: void = undefined as any;
    // @Bean VOID2: void = undefined as any;
    // @Bean UNDEFINED1: undefined = undefined as any;
    // @Bean UNDEFINED2: undefined = undefined as any;
    // @Bean NULL1: null = undefined as any;
    // @Bean NULL2: object = undefined as any;
    // @Bean STRING1: string = undefined as any;
    // @Bean STRING2: string = undefined as any;
    // @Bean NUMBER1: number = undefined as any;
    // @Bean NUMBER2: number = undefined as any;
    // @Bean BOOLEAN1: boolean = undefined as any;
    // @Bean BOOLEAN2: boolean = undefined as any;
    // @Bean ENUM1: TestEnum = undefined as any;
    // @Bean ENUM2: TestEnum = undefined as any;
    // @Bean BIGINT1: bigint = undefined as any;
    // @Bean BIGINT2: bigint = undefined as any;

    // @Bean STRING_LITERAL1: 'STRING_LITERAL' = undefined as any;
    // @Bean STRING_LITERAL2: 'STRING_LITERAL' = undefined as any;
    // @Bean NUMBER_LITERAL1: 1 = undefined as any;
    // @Bean NUMBER_LITERAL2: 1 = undefined as any;
    // @Bean BOOLEAN_LITERAL1: true = undefined as any;
    // @Bean BOOLEAN_LITERAL2: true = undefined as any;
    // @Bean ENUM_LITERAL1: TestEnum.A = undefined as any;
    // @Bean ENUM_LITERAL2: TestEnum = undefined as any;
    // @Bean BIGINT_LITERAL1: 12n = undefined as any;
    // @Bean BIGINT_LITERAL2: 12n = undefined as any;

    @Bean string1: Namespace.SubNamespace.SubSubNamespace.SubSubNamespaceClass = undefined as any;
    @Bean string2: Namespace.SubNamespace.SubSubNamespace.SubSubNamespaceClass = undefined as any;
    // @Bean data2: 12n= undefined as any;
}

import { ClassDeclaration, InterfaceDeclaration, TypeAliasDeclaration, NamespaceExportDeclaration, Identifier } from 'typescript';

export type TAvailableTypes =
    ClassDeclaration
    | InterfaceDeclaration
    | TypeAliasDeclaration
    | NamespaceExportDeclaration

export type TNamedAvailableTypes =
    NamedClassDeclaration
    | NamedInterfaceDeclaration
    | NamedTypeAliasDeclaration
    | NamedNamespaceExportDeclaration

interface NamedClassDeclaration extends ClassDeclaration { name: Identifier }
interface NamedInterfaceDeclaration extends InterfaceDeclaration { name: Identifier }
interface NamedTypeAliasDeclaration extends TypeAliasDeclaration { name: Identifier }
interface NamedNamespaceExportDeclaration extends NamespaceExportDeclaration { name: Identifier }

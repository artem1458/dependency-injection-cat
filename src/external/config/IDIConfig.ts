export interface IDIConfig {
    /*
    * Glob-pattern for files where placed Contexts
    * @default "**\/*.di.ts"
    */
    pattern: string;

    /*
    * Glob-pattern array for files excluded from searching of context files
    * @default ["**\/node_modules/**"]
    */
    ignorePatterns: string[];

    /*
    * Determines if the logo should be displayed when compiling
    * @default true
    */
    printLogo: boolean;
}

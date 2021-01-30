export interface XZ {}
export interface Dep1 {}
export interface Dep2 {}
export interface Dep3 {}

export class SomeClass {
    constructor(
        xz: XZ,
        xz1: Dep1,
        xz2: Dep2,
        xz3: Dep3,
    ) {}
}

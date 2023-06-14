import ts from 'typescript';
import { ContextBean } from '../bean/ContextBean';

export class Context {
    private beanCounter = 0;

    declare id: string;
    declare fileName: string;
    declare node: ts.ClassDeclaration;

    name: string | null = null;
    beans = new Set<ContextBean>();
    typePaths: string[] = [];
    private beanIdToContextBean = new Map<string, ContextBean>();
    private beanNodeToContextBean = new Map<ts.Node, ContextBean>();

    registerBean(bean: ContextBean): void {
        bean.id = `${this.id}_${this.beanCounter}`;
        this.beanCounter++;

        this.beans.add(bean);
        this.beanIdToContextBean.set(bean.id, bean);
        this.beanNodeToContextBean.set(bean.node, bean);
    }

    deregisterBean(bean: ContextBean): void {
        this.beans.delete(bean);
        this.beanIdToContextBean.delete(bean.id);
        this.beanNodeToContextBean.delete(bean.node);
    }

    getBeanByNode(node: ts.Node): ContextBean | null {
        return this.beanNodeToContextBean.get(node) ?? null;
    }

    getBeanById(id: string): ContextBean | null {
        return this.beanIdToContextBean.get(id) ?? null;
    }
}

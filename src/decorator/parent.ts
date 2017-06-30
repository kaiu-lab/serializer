import 'reflect-metadata';
import { ParentOptions } from './parent-options';
/**
 * Created by Supamiu on 29/06/17.
 */
export function Parent(options: ParentOptions): (...args: any[]) => void {
    return (target: any) => {
        return Reflect.defineMetadata('serialize:parent', options, target);
    };
}
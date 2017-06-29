import 'reflect-metadata';
/**
 * Removes a field from serialization, useful for secret fields like password.
 * @returns {(target:any)=>void}
 */
export function Transient() {
    return (target: any): void => {
        Reflect.defineMetadata('transient', true, target);
    }
}
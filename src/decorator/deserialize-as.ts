import 'reflect-metadata';
/**
 * Tags a property to be deserialized as a given class.
 *
 * ## Example:
 * ```typescript
 * export class Foo{
 *      @DeserializeAs(Bar)
 *      bar:Bar;
 * }
 * ```
 *
 * @decorator Property
 */
export function DeserializeAs(clazz: { new(...args: any[]): any }): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata('serialize:class', clazz, target, propertyKey);
    };
}

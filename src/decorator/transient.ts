import 'reflect-metadata';

/**
 * @hidden
 */
export const METADATA_TRANSIENT_PROPERTY = 'serializer:serialize:transient';

/**
 * Tags a property as transient, meaning that it won't be used in serialization.
 *
 * ## Example:
 *
 * ```typescript
 * export class Example {
 *      foo: string;
 *
 *      @Transient()
 *      password: string;
 * }
 *
 * const example = new Example();
 * example.foo = 'bar';
 * example.password = 'Super secret';
 * console.log(serializer.serialize(example));
 * ```
 *
 * This will print a JSON string of `example` object, without `password` property in it.
 *
 * @decorator Property
 */
export function Transient(): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        Reflect.defineMetadata(METADATA_TRANSIENT_PROPERTY, true, target, propertyKey);
    };
}

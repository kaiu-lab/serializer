/**
 * Tags a property to map from a different field name.
 *
 * ## Example:
 *
 * ```typescript
 * export class Example{
 *      @Deserialize('bar')
 *      foo: string;
 * }
 *
 * const result = serializer.deserialize<Example>({ bar: 'hey' }, Example);
 * console.log(result.foo);
 * ```
 *
 * This will print `hey` because the attribute with name `bar` has been mapped into the `foo` property.
 *
 * @decorator Property
 */
export function Deserialize(fieldName: string): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        const customFieldNames = Reflect.getMetadata('serializer:field:properties', target) || [];
        Reflect.defineMetadata('serializer:field:properties', customFieldNames.concat([propertyKey]), target);
        return Reflect.defineMetadata('serializer:field', fieldName, target, propertyKey);
    };
}

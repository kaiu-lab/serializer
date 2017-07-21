import 'reflect-metadata';
/**
 * Flags the given property as the discriminator.
 *
 * ## Example:
 * ```typescript
 * @DiscriminatorField('type')
 * export class Vehicle{
 *      type: string;
 *      color: Color;
 * }
 * ```
 *
 * When the serializer will deserialize using this class, he will use `Vehicle.type` value to find the right child.
 * @decorator Class
 */
export function DiscriminatorProperty(name: string): (...args: any[]) => void {
    return (target: any) => {
        return Reflect.defineMetadata('serialize:discriminator', name, target);
    };
}

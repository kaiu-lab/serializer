import 'reflect-metadata';
import { ParentOptions } from './parent-options';
/**
 * Flags the given property as the discriminator.
 *
 * ## Example:
 * ```typescript
 * \@Parent({
 *              discriminatorField: 'type',
 *              allowSelf: true // This one is optional.
 *          })
 * export class Vehicle{
 *      type: string;
 *      color: Color;
 * }
 * ```
 *
 * When the serializer will deserialize using this class, he will use `Vehicle.type` value to find the right child.
 *
 * You can se the `allowSelf` flag to true if you want to get an instance of this class if no subclass is found with the
 * current discriminator value instead of an error.
 *
 * @decorator Class
 */
export function Parent(options: ParentOptions): (...args: any[]) => void {
    return (target: any) => {
        return Reflect.defineMetadata('serializer:parent', options, target);
    };
}

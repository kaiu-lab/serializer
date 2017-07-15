import 'reflect-metadata';
/**
 * Created by Supamiu on 29/06/17.
 *
 * Flags the given property as the discriminator,
 * meaning that the value of this property will be used to handle inheritance.
 */
export default function DiscriminatorProperty(name: string): (...args: any[]) => void {
    return (target: any) => {
        return Reflect.defineMetadata('serialize:discriminator', name, target);
    };
}

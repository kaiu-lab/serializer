import { Class } from './class';
import { ParentOptions } from './decorator/parent-options';

/**
 * Registrations allow the serializer to handle inheritance,
 * they have to be defined if you want to be able to handle inheritance.
 *
 * ## Example:
 * ```typescript
 * let registrations =
 * [
 *      {
 *          parent: Foo,
 *          children:
 *          {
 *              'bar':Bar,
 *              'baz':Baz
 *          }
 *      }
 * ]
 * ```
 */
export interface Registration<T = any> {
    /**
     * The class that all children have to extend no matter what.
     *
     * It can contain the discrimination logic, but if you want to handle inheritance constraint and discriminator separately,
     * you have to specify the handler class in `discriminatorHandler`
     */
    parent: Class<T>;
    /**
     * Used to define which class handles the discrimination logic, defaults to `parent`'s value.
     */
    discriminatorHandler?: Class;
    /**
     * Possible children, by key.
     */
    children: { [index: string]: Class<T> };
}

/**
 * @hidden
 */
export interface ProcessedRegistration extends Registration {
    parentOptions: ParentOptions;
    parentHasExplicitDiscriminator: boolean;
}

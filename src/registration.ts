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
export interface Registration {
    parent: Class;
    children: { [index: string]: Class };
}

export interface ProcessedRegistration extends Registration {
    parentOptions: ParentOptions;
    parentHasExplicitDiscriminator: boolean;
}

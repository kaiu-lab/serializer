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
    /**
     * The class holding the discrimination logic that should be used for this entry.
     */
    parent: Class;
    /**
     * If you want to introduce discrimination logic on a class provided by an external library,
     * You have to use inheritFrom in order to give the parent class that should be used for
     * inheritence checks inside the serializer
     */
    inheritFrom?: Class;
    /**
     * Possible children, by key.
     */
    children: { [index: string]: Class };
}

/**
 * @hidden
 */
export interface ProcessedRegistration extends Registration {
    parentOptions: ParentOptions;
    parentHasExplicitDiscriminator: boolean;
}

/**
 * The options used for the Parent decorator.
 */
export interface ParentOptions {
    discriminatorField: string;
    allowSelf?: boolean;
    trackBy?: (value: any, obj: any) => string;
}

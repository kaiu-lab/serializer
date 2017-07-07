import { DiscriminatorProperty } from '../src/decorator/discriminator-property';
/**
 * Created by Supamiu on 29/06/17.
 */
@DiscriminatorProperty('type')
export abstract class ParentExample {
    abstract test(): string;
}
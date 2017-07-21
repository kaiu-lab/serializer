import { ParentExample } from './parent-example';
import { DiscriminatorProperty } from '../src/decorator/discriminator-property';
/**
 * Created by Supamiu on 29/06/17.
 */
@DiscriminatorProperty('child')
export class Child extends ParentExample {
    test(): string {
        return 'CHILD 1';
    }
}

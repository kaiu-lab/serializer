import { Parent } from '../src/decorator/parent';
import { Child } from './child';
/**
 * Created by Supamiu on 29/06/17.
 */
@Parent({
    children: {
        'child1': Child,
    },
    discriminantField: 'type'
})
export class ParentExample {

    type: string;

    test(): string {
        return 'PARENT';
    }
}
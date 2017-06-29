/**
 * @license
 * Copyright Supamiu All Rights Reserved.
 *
 * Use of this source code is governed by an GPL license that can be
 * found in the LICENSE file at https://github.com/supamiu/ng-serializer/blob/master/LICENSE
 */
import { TestBed, inject } from '@angular/core/testing';
import { Serializer } from '../src/serializer';
import { expect } from 'chai';


describe('Logger service', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({providers: [Serializer]});
    });

    describe('smoke test', () => {

        it('should success', (inject([Serializer], (serializer: Serializer) => {
            expect(serializer.serialize({foo: 'bar'})).to.eql('{"foo":"bar"}');
        })));
    });
});
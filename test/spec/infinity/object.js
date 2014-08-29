/*global describe, it */
'use strict';
(function () {
    describe('IFObject', function () {
        this.bail(false);

        it('Inherits correctly', function () {
            function TestObject() {

            }
            IFObject.inherit(TestObject, IFObject);

            expect(new TestObject()).to.be.instanceOf(IFObject);
        });

        it('Mixes correctly', function () {
            function TestObject() {

            }

            function TestMixin() {

            }
            IFObject.inheritAndMix(TestObject, IFObject, [TestMixin]);

            expect(new TestObject()).to.be.instanceOf(IFObject);
            expect(new TestObject().hasMixin(TestMixin)).to.be.true;
        });
    });
})();

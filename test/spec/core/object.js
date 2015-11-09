/*global describe, it */
'use strict';
(function () {
    describe('GObject', function () {
        this.bail(false);

        it('Inherits correctly', function () {
            function TestObject() {

            }
            GObject.inherit(TestObject, GObject);

            expect(new TestObject()).to.be.instanceOf(GObject);
        });

        it('Mixes correctly', function () {
            function TestObject() {

            }

            function TestMixin() {

            }
            GObject.inheritAndMix(TestObject, GObject, [TestMixin]);

            expect(new TestObject()).to.be.instanceOf(GObject);
            expect(new TestObject().hasMixin(TestMixin)).to.be.true;
        });
    });
})();

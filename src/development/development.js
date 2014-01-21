(function (_) {
    /**
     * Gravit Development Module
     * @class GDevelopmentModule
     * @constructor
     * @extends EXModule
     */
    function GDevelopmentModule() {
    }
    GObject.inherit(GDevelopmentModule, EXModule);

    /** @override */
    GDevelopmentModule.prototype.init = function () {
        var testActions = [];
        for (var i = 0; i < _.gDevelopment.tests.length; ++i) {
            testActions.push(new TestAction(_.gDevelopment.tests[i]));
        }

        // Register test actions
        gExpress.actions = gExpress.actions.concat(testActions);
    };

    /** @override */
    GDevelopmentModule.prototype.toString = function () {
        return '[Module Gravit Development]';
    };

    gExpress.modules.push(new GDevelopmentModule());
})(this);

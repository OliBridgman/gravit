(function (_) {
    /**
     * Gravit Core Module
     * @class GModule
     * @constructor
     * @extends EXModule
     */
    function GModule() {
    }
    GObject.inherit(GModule, EXModule);

    /** @override */
    GModule.prototype.init = function () {
        // TODO
    };

    _.gExpress.modules.push(new GModule());
})(this);

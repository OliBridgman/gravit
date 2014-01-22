(function (_) {
    /**
     * The native shell
     * @class GNativeShell
     * @extends GShell
     * @constructor
     */
    function GNativeShell() {
    };
    GObject.inherit(GNativeShell, GShell);

    /** @override */
    GNativeShell.prototype.prepareLoad = function () {
        // NO-OP
    };

    /** @override */
    GNativeShell.prototype.finishLoad = function () {
        gshell.openShell();
    };

    /** @override */
    GNativeShell.prototype.createMenuBar = function (menu) {
        throw new Error("Not Supported.");
    };

    _.gShell = new GNativeShell;
})(this);

(function (_) {
    /**
     * The global shell class
     * @class GShell
     * @extends GEventTarget
     * @constructor
     */
    function GShell() {
    };
    GObject.inherit(GShell, GEventTarget);

    /**
     * Called to prepare loading of the shell
     */
    GShell.prototype.prepareLoad = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to finish loading of the shell
     */
    GShell.prototype.finishLoad = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to create the global menubar using a given menu
     * @param {GUIMenu} menu
     */
    GShell.prototype.createMenuBar = function (menu) {
        throw new Error("Not Supported.");
    };

    _.GShell = GShell;
    _.gShell = null; // initialized by client
})(this);

(function (_) {
    /**
     * The global navigation class
     * @class EXNavigation
     * @constructor
     * @version 1.0
     */
    function EXNavigation(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {JQuery}
     * @private
     */
    EXNavigation.prototype._htmlElement = null;

    /**
     * Only available for desktop, otherwise null
     * @type {GUIMenuBar}
     * @private
     */
    EXNavigation.prototype._menuBar = null;

    /**
     * Called from the workspace to initialize
     */
    EXNavigation.prototype.init = function () {
        this._menuBar = new GUIMenuBar(gApp.getMenu());
        this._htmlElement.append(this._menuBar._htmlElement);
    };

    /**
     * Called from the workspace to relayout
     */
    EXNavigation.prototype.relayout = function () {
        // NO-OP
    };

    _.EXNavigation = EXNavigation;
})(this);

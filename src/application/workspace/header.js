(function (_) {
    /**
     * The global idebar class
     * @class GHeader
     * @constructor
     * @version 1.0
     */
    function GHeader(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GHeader.prototype._htmlElement = null;

    /**
     * Called from the workspace to initialize
     */
    GHeader.prototype.init = function () {
        // NO-OP
    };

    /**
     * Called from the workspace to relayout
     */
    GHeader.prototype.relayout = function () {
        // NO-OP
    };

    _.GHeader = GHeader;
})(this);

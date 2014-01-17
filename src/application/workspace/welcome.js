(function (_) {
    /**
     * The global welcome class
     * @class EXWelcome
     * @constructor
     */
    function EXWelcome(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {JQuery}
     * @private
     */
    EXWelcome.prototype._htmlElement = null;

    /**
     * Called from the workspace to initialize
     */
    EXWelcome.prototype.init = function () {
        $('<div></div>')
            .text('Click File to Create New File or Open Existing one.')
            .appendTo(this._htmlElement);
    };

    /**
     * Called from the workspace to relayout
     */
    EXWelcome.prototype.relayout = function () {
        // NO-OP
    };

    _.EXWelcome = EXWelcome;
})(this);

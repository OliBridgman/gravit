(function (_) {

    /**
     * Base class for an palette
     * @class GPalette
     * @extends GView
     * @constructor
     */
    function GPalette() {
        GView.call(this);
    };
    IFObject.inherit(GPalette, GView);

    /**
     * Get the default group of the palette, null for none
     * @return {String}
     */
    GPalette.prototype.getGroup = function () {
        return null;
    };

    /**
     * Called to let the palette initialize on a given panel
     * and within a given menu if any
     * @param {JQuery} htmlElement the panel to put the palette into
     * @param {JQuery} controls the controls to add controls into
     */
    GPalette.prototype.init = function (htmlElement, controls) {
        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
    };

    /** @override */
    GPalette.prototype.toString = function () {
        return "[Object GPalette]";
    };

    _.GPalette = GPalette;
})(this);
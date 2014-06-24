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
     * Whether the palette is enabled or. Note that this
     * will only disable the palette's panel so if the
     * palette provides a custom menu, the enabled status
     * of those needs to be manually managed by the palette.
     * @return {Boolean}
     */
    GPalette.prototype.isEnabled = function () {
        return true;
    };

    /**
     * Called to let the palette initialize on a given panel
     * and within a given menu if any
     * @param {JQuery} htmlElement the panel to put the palette into
     * @param {GUIMenu} menu the menu to create actions into
     * @param {JQuery} controls the controls to add controls into
     */
    GPalette.prototype.init = function (htmlElement, menu, controls) {
        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
    };

    /** @override */
    GPalette.prototype.toString = function () {
        return "[Object GPalette]";
    };

    _.GPalette = GPalette;
})(this);
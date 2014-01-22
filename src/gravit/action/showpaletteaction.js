(function (_) {

    /**
     * Action for showing / hiding a palette
     * @param {GPalette} palette the palette this action is bound to
     * @class EXShowPaletteAction
     * @extends GUIAction
     * @constructor
     */
    function EXShowPaletteAction(palette) {
        this._palette = palette;
    };
    GObject.inherit(EXShowPaletteAction, GUIAction);

    EXShowPaletteAction.ID = 'view.show.palette';

    /**
     * @type {GPalette}
     * @private
     */
    EXShowPaletteAction.prototype._palette = null;

    /**
     * @override
     */
    EXShowPaletteAction.prototype.getId = function () {
        return EXShowPaletteAction.ID + '-' + this._palette.getId();
    };

    /**
     * @override
     */
    EXShowPaletteAction.prototype.getTitle = function () {
        return this._palette.getTitle();
    };

    /**
     * @override
     */
    EXShowPaletteAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_WINDOW;
    };

    /**
     * @override
     */
    EXShowPaletteAction.prototype.getGroup = function () {
        return "palette-" + (this._palette.getGroup() ? this._palette.getGroup() : "");
    };

    /**
     * @override
     */
    EXShowPaletteAction.prototype.getShortcut = function () {
        return this._palette.getShortcut();
    };

    /**
     * @override
     */
    EXShowPaletteAction.prototype.isEnabled = function () {
        return true;
    };

    /**
     * @override
     */
    EXShowPaletteAction.prototype.execute = function () {
        gApp.getSidebar().setPaletteActive(this._palette.getId(), !gApp.getSidebar().isPaletteActive(this._palette.getId()));
    };

    /** @override */
    EXShowPaletteAction.prototype.toString = function () {
        return "[Object EXShowPaletteAction]";
    };

    _.EXShowPaletteAction = EXShowPaletteAction;
})(this);
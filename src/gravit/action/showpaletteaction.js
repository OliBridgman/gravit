(function (_) {

    /**
     * Action for showing / hiding a palette
     * @param {GPalette} palette the palette this action is bound to
     * @class GShowPaletteAction
     * @extends GUIAction
     * @constructor
     */
    function GShowPaletteAction(palette) {
        this._palette = palette;
    };
    IFObject.inherit(GShowPaletteAction, GUIAction);

    GShowPaletteAction.ID = 'view.show.palette';

    /**
     * @type {GPalette}
     * @private
     */
    GShowPaletteAction.prototype._palette = null;

    /**
     * @override
     */
    GShowPaletteAction.prototype.getId = function () {
        return GShowPaletteAction.ID + '-' + this._palette.getId();
    };

    /**
     * @override
     */
    GShowPaletteAction.prototype.getTitle = function () {
        return this._palette.getTitle();
    };

    /**
     * @override
     */
    GShowPaletteAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_WINDOW;
    };

    /**
     * @override
     */
    GShowPaletteAction.prototype.getGroup = function () {
        return "palette-" + (this._palette.getGroup() ? this._palette.getGroup() : "");
    };

    /**
     * @override
     */
    GShowPaletteAction.prototype.getShortcut = function () {
        return this._palette.getShortcut();
    };

    /**
     * @override
     */
    GShowPaletteAction.prototype.isEnabled = function () {
        return true;
    };

    /**
     * @override
     */
    GShowPaletteAction.prototype.execute = function () {
        gApp.getPalettes().setPaletteActive(this._palette.getId(), !gApp.getPalettes().isPaletteActive(this._palette.getId()));
    };

    /** @override */
    GShowPaletteAction.prototype.toString = function () {
        return "[Object GShowPaletteAction]";
    };

    _.GShowPaletteAction = GShowPaletteAction;
})(this);
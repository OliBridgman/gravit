(function (_) {

    /**
     * Action for changing paint mode in the current view
     * @class EXPaintModeAction
     * @extends GUIAction
     * @constructor
     */
    function EXPaintModeAction(paintMode) {
        this._paintMode = paintMode;
    };
    GObject.inherit(EXPaintModeAction, GUIAction);

    EXPaintModeAction.ID = 'view.page.decoration';
    EXPaintModeAction.TITLE = new GLocale.Key(EXPaintModeAction, 'title');

    /**
     * @type {GXScenePaintConfiguration.PaintMode}
     * @private
     */
    EXPaintModeAction.prototype._paintMode = null;

    /**
     * @override
     */
    EXPaintModeAction.prototype.getId = function () {
        return EXPaintModeAction.ID + '.' + this._paintMode;
    };

    /**
     * @override
     */
    EXPaintModeAction.prototype.getTitle = function () {
        return gLocale.get(EXPaintModeAction.TITLE).replace('%name%',
            gLocale.get(GXScenePaintConfiguration.PaintModeName[this._paintMode]));
    };

    /**
     * @override
     */
    EXPaintModeAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXPaintModeAction.prototype.getGroup = function () {
        return "paint-mode";
    };

    /** @override */
    EXPaintModeAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    EXPaintModeAction.prototype.isChecked = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (window) {
            return window.getView().getViewConfiguration().paintMode === this._paintMode;
        }
        return false;
    };

    /**
     * @override
     */
    EXPaintModeAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXPaintModeAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        view.getViewConfiguration().paintMode = this._paintMode;
        view.invalidate();
    };

    /** @override */
    EXPaintModeAction.prototype.toString = function () {
        return "[Object EXPaintModeAction]";
    };

    _.EXPaintModeAction = EXPaintModeAction;
})(this);
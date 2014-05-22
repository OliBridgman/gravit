(function (_) {

    /**
     * Action for switching between pixel-mode and vector mode
     * @class EXPixelPreviewAction
     * @extends GUIAction
     * @constructor
     */
    function EXPixelPreviewAction() {
    };
    IFObject.inherit(EXPixelPreviewAction, GUIAction);

    EXPixelPreviewAction.ID = 'view.pixel-preview';
    EXPixelPreviewAction.TITLE = new IFLocale.Key(EXPixelPreviewAction, 'title');

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.getId = function () {
        return EXPixelPreviewAction.ID;
    };

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.getTitle = function () {
        return EXPixelPreviewAction.TITLE;
    };

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.getGroup = function () {
        return "view-render";
    };

    /** @override */
    EXPixelPreviewAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.isChecked = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (window) {
            return window.getView().getViewConfiguration().pixelMode;
        }
        return false;
    };

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXPixelPreviewAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        view.getViewConfiguration().pixelMode = !view.getViewConfiguration().pixelMode;
        view.invalidate();
    };

    /** @override */
    EXPixelPreviewAction.prototype.toString = function () {
        return "[Object EXPixelPreviewAction]";
    };

    _.EXPixelPreviewAction = EXPixelPreviewAction;
})(this);
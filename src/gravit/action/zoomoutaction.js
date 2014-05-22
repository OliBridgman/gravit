(function (_) {

    /**
     * Action for zooming out of the current view
     * @class EXZoomOutAction
     * @extends GUIAction
     * @constructor
     */
    function EXZoomOutAction() {
    };
    IFObject.inherit(EXZoomOutAction, GUIAction);

    EXZoomOutAction.ID = 'zoom.out';
    EXZoomOutAction.TITLE = new IFLocale.Key(EXZoomOutAction, "title");
    EXZoomOutAction.ZOOM_STEP = 2.0;

    /**
     * @override
     */
    EXZoomOutAction.prototype.getId = function () {
        return EXZoomOutAction.ID;
    };

    /**
     * @override
     */
    EXZoomOutAction.prototype.getTitle = function () {
        return EXZoomOutAction.TITLE;
    };

    /**
     * @override
     */
    EXZoomOutAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    EXZoomOutAction.prototype.getGroup = function () {
        return "zoom/magnification";
    };

    /**
     * @override
     */
    EXZoomOutAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, '-'];
    };


    /**
     * @override
     */
    EXZoomOutAction.prototype.isEnabled = function () {
        var window = gApp.getWindows().getActiveWindow();
        var view = window ? window.getView() : null;
        return view && view.getZoom() > IFView.options.minZoomFactor;
    };

    /**
     * @override
     */
    EXZoomOutAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        var newZoom = view.getZoom() / EXZoomOutAction.ZOOM_STEP;
        var zoomPoint = view.getViewTransform().mapPoint(new GPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    EXZoomOutAction.prototype.toString = function () {
        return "[Object EXZoomOutAction]";
    };

    _.EXZoomOutAction = EXZoomOutAction;
})(this);
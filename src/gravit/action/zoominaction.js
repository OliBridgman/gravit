(function (_) {

    /**
     * Action for zooming into the current view
     * @class EXZoomInAction
     * @extends GUIAction
     * @constructor
     */
    function EXZoomInAction() {
    };
    IFObject.inherit(EXZoomInAction, GUIAction);

    EXZoomInAction.ID = 'view.zoom.in';
    EXZoomInAction.TITLE = new IFLocale.Key(EXZoomInAction, "title");
    EXZoomInAction.ZOOM_STEP = 2.0;

    /**
     * @override
     */
    EXZoomInAction.prototype.getId = function () {
        return EXZoomInAction.ID;
    };

    /**
     * @override
     */
    EXZoomInAction.prototype.getTitle = function () {
        return EXZoomInAction.TITLE;
    };

    /**
     * @override
     */
    EXZoomInAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    EXZoomInAction.prototype.getGroup = function () {
        return "zoom/magnification";
    };

    /**
     * @override
     */
    EXZoomInAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, '+'];
    };

    /**
     * @override
     */
    EXZoomInAction.prototype.isEnabled = function () {
        var window = gApp.getWindows().getActiveWindow();
        var view = window ? window.getView() : null;
        return view && view.getZoom() < IFView.options.maxZoomFactor;
    };

    /**
     * @override
     */
    EXZoomInAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        var newZoom = view.getZoom() * EXZoomInAction.ZOOM_STEP;
        var zoomPoint = view.getViewTransform().mapPoint(new GPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    EXZoomInAction.prototype.toString = function () {
        return "[Object EXZoomInAction]";
    };

    _.EXZoomInAction = EXZoomInAction;
})(this);
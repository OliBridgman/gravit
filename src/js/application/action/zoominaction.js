(function (_) {

    /**
     * Action for zooming into the current view
     * @class GZoomInAction
     * @extends GAction
     * @constructor
     */
    function GZoomInAction() {
    };
    GObject.inherit(GZoomInAction, GAction);

    GZoomInAction.ID = 'view.zoom.in';
    GZoomInAction.TITLE = new GLocale.Key(GZoomInAction, "title");
    GZoomInAction.ZOOM_STEP = 2.0;

    /**
     * @override
     */
    GZoomInAction.prototype.getId = function () {
        return GZoomInAction.ID;
    };

    /**
     * @override
     */
    GZoomInAction.prototype.getTitle = function () {
        return GZoomInAction.TITLE;
    };

    /**
     * @override
     */
    GZoomInAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    GZoomInAction.prototype.getGroup = function () {
        return "zoom/magnification";
    };

    /**
     * @override
     */
    GZoomInAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, '+'];
    };

    /**
     * @override
     */
    GZoomInAction.prototype.isEnabled = function () {
        var window = gApp.getWindows().getActiveWindow();
        var view = window ? window.getView() : null;
        return view && view.getZoom() < GSceneWidget.options.maxZoomFactor;
    };

    /**
     * @override
     */
    GZoomInAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        var newZoom = view.getZoom() * GZoomInAction.ZOOM_STEP;
        var scene = view.getScene();
        var zoomPoint = view.getViewTransform().mapPoint(new GPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    GZoomInAction.prototype.toString = function () {
        return "[Object GZoomInAction]";
    };

    _.GZoomInAction = GZoomInAction;
})(this);
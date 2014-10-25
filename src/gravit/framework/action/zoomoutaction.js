(function (_) {

    /**
     * Action for zooming out of the current view
     * @class GZoomOutAction
     * @extends GAction
     * @constructor
     */
    function GZoomOutAction() {
    };
    GObject.inherit(GZoomOutAction, GAction);

    GZoomOutAction.ID = 'zoom.out';
    GZoomOutAction.TITLE = new GLocale.Key(GZoomOutAction, "title");
    GZoomOutAction.ZOOM_STEP = 2.0;

    /**
     * @override
     */
    GZoomOutAction.prototype.getId = function () {
        return GZoomOutAction.ID;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getTitle = function () {
        return GZoomOutAction.TITLE;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getGroup = function () {
        return "zoom/magnification";
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, '-'];
    };


    /**
     * @override
     */
    GZoomOutAction.prototype.isEnabled = function () {
        var window = gApp.getWindows().getActiveWindow();
        var view = window ? window.getView() : null;
        return view && view.getZoom() > GUIView.options.minZoomFactor;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        var newZoom = view.getZoom() / GZoomOutAction.ZOOM_STEP;
        var scene = view.getScene();
        var zoomPoint = null;
        if (scene.getProperty('singlePage')) {
            var pageBBox = scene.getActivePage().getGeometryBBox();
            if (pageBBox && !pageBBox.isEmpty()) {
                zoomPoint = pageBBox.getSide(GRect.Side.CENTER);
            }
        }
        if (!zoomPoint) {
            zoomPoint = view.getViewTransform().mapPoint(new GPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        }
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    GZoomOutAction.prototype.toString = function () {
        return "[Object GZoomOutAction]";
    };

    _.GZoomOutAction = GZoomOutAction;
})(this);
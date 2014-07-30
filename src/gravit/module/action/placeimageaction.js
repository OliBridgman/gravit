(function (_) {

    /**
     * Action for placing an image
     * @class GPlaceImageAction
     * @extends GAction
     * @constructor
     */
    function GPlaceImageAction() {
    };
    IFObject.inherit(GPlaceImageAction, GAction);

    GPlaceImageAction.ID = 'file.place-image';
    GPlaceImageAction.TITLE = new IFLocale.Key(GPlaceImageAction, "title");

    /**
     * @override
     */
    GPlaceImageAction.prototype.getId = function () {
        return GPlaceImageAction.ID;
    };

    /**
     * @override
     */
    GPlaceImageAction.prototype.getTitle = function () {
        return GPlaceImageAction.TITLE;
    };

    /**
     * @override
     */
    GPlaceImageAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GPlaceImageAction.prototype.getGroup = function () {
        return "insert";
    };

    /**
     * @override
     */
    GPlaceImageAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document && document.isSaveable()) {
            return true;
        }
        return false;
    };

    /**
     * @override
     */
    GPlaceImageAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        document.getStorage().openPrompt(document.getUrl(), ['jpg', 'jpeg', 'png', 'gif'], function (url) {
            var imagePos = document.getScene().getActivePage().getGeometryBBox().getSide(IFRect.Side.TOP_LEFT);
            var image = new IFImage();

            // TODO : Make url relative to document if it has any url

            image.setProperties(['url', 'transform'], [url, new IFTransform(1, 0, 0, 1, imagePos.getX(), imagePos.getY())]);
            image.transform();
            document.getEditor().insertElements([image]);
        });
    };

    /** @override */
    GPlaceImageAction.prototype.toString = function () {
        return "[Object GPlaceImageAction]";
    };

    _.GPlaceImageAction = GPlaceImageAction;
})(this);
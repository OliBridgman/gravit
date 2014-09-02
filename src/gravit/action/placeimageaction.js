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
        document.getStorage().openResourcePrompt(document.getUrl(), ['jpg', 'jpeg', 'png', 'gif', 'svg'], function (url) {
            var uri = new URI(url);

            // make url relative to document
            url = uri.relativeTo(document.getUrl()).toString();

            // extract a name for the picture
            var filename = uri.filename();
            var suffix = uri.suffix();
            var name = suffix.length > 0 ? filename.substr(0, filename.length - suffix.length - 1) : filename;

            var imagePos = document.getScene().getActivePage().getGeometryBBox().getSide(IFRect.Side.TOP_LEFT);
            var image = new IFImage();
            image.setProperties(['name', 'url', 'transform'], [name, url, new IFTransform(1, 0, 0, 1, imagePos.getX(), imagePos.getY())]);
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
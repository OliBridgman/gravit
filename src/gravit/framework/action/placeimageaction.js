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
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GPlaceImageAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var imageInput = $('<input>')
            .attr('type', 'file')
            .attr('accept', '.jpg,.jpeg,.png,.gif,.svg')
            .css({
                'position': 'absolute',
                'left': '-10000px'
            })
            .on('change', function (evt) {
                var files = $(evt.target)[0].files;
                if (files && files.length) {
                    var imagePos = document.getScene().getActivePage().getGeometryBBox().getSide(IFRect.Side.TOP_LEFT);
                    for (var i = 0; i < files.length; ++i) {
                        document.importFile(files[i], function (element) {
                            element.transform(new IFTransform(1, 0, 0, 1, imagePos.getX(), imagePos.getY()));
                        })
                    }
                    imageInput.remove();
                }
            })
            .appendTo($('body'))
            .focus()
            .trigger('click');
    };

    /** @override */
    GPlaceImageAction.prototype.toString = function () {
        return "[Object GPlaceImageAction]";
    };

    _.GPlaceImageAction = GPlaceImageAction;
})(this);
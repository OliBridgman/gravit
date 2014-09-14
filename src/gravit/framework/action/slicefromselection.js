(function (_) {

    /**
     * Action for creating a slice on selection
     * @class GSliceFromSelectionAction
     * @extends GAction
     * @constructor
     */
    function GSliceFromSelectionAction() {
    };
    IFObject.inherit(GSliceFromSelectionAction, GAction);

    GSliceFromSelectionAction.ID = 'modify.slice-from-selection';
    GSliceFromSelectionAction.TITLE = new IFLocale.Key(GSliceFromSelectionAction, "title");

    /**
     * @override
     */
    GSliceFromSelectionAction.prototype.getId = function () {
        return GSliceFromSelectionAction.ID;
    };

    /**
     * @override
     */
    GSliceFromSelectionAction.prototype.getTitle = function () {
        return GSliceFromSelectionAction.TITLE;
    };

    /**
     * @override
     */
    GSliceFromSelectionAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GSliceFromSelectionAction.prototype.getGroup = function () {
        return "structure-convert";
    };

    /**
     * @override
     */
    GSliceFromSelectionAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            return document.getEditor().hasSelection();
        }
        return false;
    };

    /**
     * @override
     */
    GSliceFromSelectionAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var editor = document.getEditor();
        var selBBox = document.getEditor().getSelectionBBox(false);
        if (selBBox && !selBBox.isEmpty()) {
            IFEditor.tryRunTransaction(scene, function () {
                var slice = new IFSlice();
                slice.setProperty('trf',
                    new IFTransform(selBBox.getWidth() / 2, 0, 0, selBBox.getHeight() / 2,
                        selBBox.getX() + selBBox.getWidth() / 2, selBBox.getY() + selBBox.getHeight() / 2));
                scene.getActiveLayer().appendChild(slice);
                editor.updateSelection(false, [slice]);
            }, ifLocale.get(this.getTitle()));
        }
    };

    /** @override */
    GSliceFromSelectionAction.prototype.toString = function () {
        return "[Object GSliceFromSelectionAction]";
    };

    _.GSliceFromSelectionAction = GSliceFromSelectionAction;
})(this);
(function (_) {

    /**
     * Action for fitting the selection into the current view
     * @class GFitSelectionAction
     * @extends GAction
     * @constructor
     */
    function GFitSelectionAction() {
    };
    GObject.inherit(GFitSelectionAction, GAction);

    GFitSelectionAction.ID = 'view.zoom.fit-selection';
    GFitSelectionAction.TITLE = new GLocale.Key(GFitSelectionAction, "title");

    /**
     * @override
     */
    GFitSelectionAction.prototype.getId = function () {
        return GFitSelectionAction.ID;
    };

    /**
     * @override
     */
    GFitSelectionAction.prototype.getTitle = function () {
        return GFitSelectionAction.TITLE;
    };

    /**
     * @override
     */
    GFitSelectionAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GFitSelectionAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GFitSelectionAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, GKey.Constant.OPTION, 'O'];
    };

    /**
     * @override
     */
    GFitSelectionAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        return editor && editor.hasSelection();
    };

    /**
     * @override
     */
    GFitSelectionAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        var selection = editor.getSelection();
        var selBBox = null;

        for (var i = 0; i < selection.length; ++i) {
            var bbox = selection[i].getPaintBBox();
            if (bbox && !bbox.isEmpty()) {
                selBBox = selBBox ? selBBox.united(bbox) : bbox;
            }
        }

        if (selBBox && !selBBox.isEmpty()) {
            document.getActiveWindow().getView().zoomAll(selBBox, false);
        }
    };

    /** @override */
    GFitSelectionAction.prototype.toString = function () {
        return "[Object GFitSelectionAction]";
    };

    _.GFitSelectionAction = GFitSelectionAction;
})(this);
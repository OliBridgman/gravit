(function (_) {

    /**
     * Action for fitting the selection into the current view
     * @class EXFitSelectionAction
     * @extends GUIAction
     * @constructor
     */
    function EXFitSelectionAction() {
    };
    GObject.inherit(EXFitSelectionAction, GUIAction);

    EXFitSelectionAction.ID = 'view.zoom.fit-selection';
    EXFitSelectionAction.TITLE = new GLocale.Key(EXFitSelectionAction, "title");

    /**
     * @override
     */
    EXFitSelectionAction.prototype.getId = function () {
        return EXFitSelectionAction.ID;
    };

    /**
     * @override
     */
    EXFitSelectionAction.prototype.getTitle = function () {
        return EXFitSelectionAction.TITLE;
    };

    /**
     * @override
     */
    EXFitSelectionAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXFitSelectionAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    EXFitSelectionAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, GUIKey.Constant.OPTION, 'O'];
    };

    /**
     * @override
     */
    EXFitSelectionAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        return editor && editor.hasSelection();
    };

    /**
     * @override
     */
    EXFitSelectionAction.prototype.execute = function () {
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
    EXFitSelectionAction.prototype.toString = function () {
        return "[Object EXFitSelectionAction]";
    };

    _.EXFitSelectionAction = EXFitSelectionAction;
})(this);
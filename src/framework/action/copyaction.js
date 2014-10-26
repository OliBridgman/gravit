(function (_) {

    /**
     * Action for copying the current selection to the clipboard
     * @class GCopyAction
     * @extends GAction
     * @constructor
     */
    function GCopyAction() {
    };
    GObject.inherit(GCopyAction, GAction);

    GCopyAction.ID = 'edit.copy';
    GCopyAction.TITLE = new GLocale.Key(GCopyAction, "title");

    /**
     * @override
     */
    GCopyAction.prototype.getId = function () {
        return GCopyAction.ID;
    };

    /**
     * @override
     */
    GCopyAction.prototype.getTitle = function () {
        return GCopyAction.TITLE;
    };

    /**
     * @override
     */
    GCopyAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GCopyAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GCopyAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, 'C'];
    };

    /**
     * @override
     */
    GCopyAction.prototype.isEnabled = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            return true;
        }

        if (gApp.getActiveDocument() && !!gApp.getActiveDocument().getEditor().getSelection()) {
            return true;
        }

        return false;
    };

    /**
     * @override
     */
    GCopyAction.prototype.execute = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            document.execCommand('copy');
        } else {
            // TODO : Support multiple clipboards internally
            // TODO : Support copy into system clipboard with
            // intern format, rasterized and as svg format

            // Make sure to serialize ordered
            var selection = GNode.order(gApp.getActiveDocument().getEditor().getSelectionCopy());
            var serializedSelection = GNode.serialize(selection);
            gShell.setClipboardContent(GNode.MIME_TYPE, serializedSelection);
        }
    };

    /** @override */
    GCopyAction.prototype.toString = function () {
        return "[Object GCopyAction]";
    };

    _.GCopyAction = GCopyAction;
})(this);
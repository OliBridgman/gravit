(function (_) {

    /**
     * Action for cutting the current selection to the clipboard
     * @class GCutAction
     * @extends GAction
     * @constructor
     */
    function GCutAction() {
    };
    IFObject.inherit(GCutAction, GAction);

    GCutAction.ID = 'edit.cut';
    GCutAction.TITLE = new IFLocale.Key(GCutAction, "title");

    /**
     * @override
     */
    GCutAction.prototype.getId = function () {
        return GCutAction.ID;
    };

    /**
     * @override
     */
    GCutAction.prototype.getTitle = function () {
        return GCutAction.TITLE;
    };

    /**
     * @override
     */
    GCutAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GCutAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GCutAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'X'];
    };

    /**
     * @override
     */
    GCutAction.prototype.isEnabled = function () {
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
    GCutAction.prototype.execute = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            document.execCommand('cut');
        } else {
            var editor = gApp.getActiveDocument().getEditor();

            // Run copy action, first
            gApp.executeAction(GCopyAction.ID);

            // Delete selection now
            editor.beginTransaction();
            try {
                editor.deleteSelection(true);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Cut Selection');
            }
        }
    };

    /** @override */
    GCutAction.prototype.toString = function () {
        return "[Object GCutAction]";
    };

    _.GCutAction = GCutAction;
})(this);
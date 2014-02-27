(function (_) {

    /**
     * Action for copying the current selection's style to the clipboard
     * @class GCopyStyleAction
     * @extends GUIAction
     * @constructor
     */
    function GCopyStyleAction() {
    };
    GObject.inherit(GCopyStyleAction, GUIAction);

    GCopyStyleAction.ID = 'edit.copy-style';
    GCopyStyleAction.TITLE = new GLocale.Key(GCopyStyleAction, "title");

    /**
     * @override
     */
    GCopyStyleAction.prototype.getId = function () {
        return GCopyStyleAction.ID;
    };

    /**
     * @override
     */
    GCopyStyleAction.prototype.getTitle = function () {
        return GCopyStyleAction.TITLE;
    };

    /**
     * @override
     */
    GCopyStyleAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GCopyStyleAction.prototype.getGroup = function () {
        return "ccp_special";
    };

    /**
     * @override
     */
    GCopyStyleAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, GUIKey.Constant.F4];
    };

    /**
     * @override
     */
    GCopyStyleAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            if (selection) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i].hasMixin(GXElement.Style)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    /**
     * @override
     */
    GCopyStyleAction.prototype.execute = function () {
        var selection = gApp.getActiveDocument().getEditor().getSelection();
        for (var i = 0; i < selection.length; ++i) {
            if (selection[i].hasMixin(GXElement.Style)) {
                var style = selection[i].getStyle();
                if (style && style.getFirstChild()) {
                    var serializedStyle = GXNode.serialize(style);
                    gShell.setClipboardContent(GXStyle.MIME_TYPE, serializedStyle);
                    break;
                }
            }
        }
    };

    /** @override */
    GCopyStyleAction.prototype.toString = function () {
        return "[Object GCopyStyleAction]";
    };

    _.GCopyStyleAction = GCopyStyleAction;
})(this);
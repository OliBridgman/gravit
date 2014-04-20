(function (_) {

    /**
     * Action for copying the current selection's attributes to the clipboard
     * @class GCopyAttributesAction
     * @extends GUIAction
     * @constructor
     */
    function GCopyAttributesAction() {
    };
    GObject.inherit(GCopyAttributesAction, GUIAction);

    GCopyAttributesAction.ID = 'edit.copy-attributes';
    GCopyAttributesAction.TITLE = new GLocale.Key(GCopyAttributesAction, "title");

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getId = function () {
        return GCopyAttributesAction.ID;
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getTitle = function () {
        return GCopyAttributesAction.TITLE;
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getGroup = function () {
        return "ccp_special";
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, GUIKey.Constant.F4];
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            if (selection) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i].hasMixin(GXElement.Attributes)) {
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
    GCopyAttributesAction.prototype.execute = function () {
        var selection = gApp.getActiveDocument().getEditor().getSelection();
        for (var i = 0; i < selection.length; ++i) {
            if (selection[i].hasMixin(GXElement.Attributes)) {
                var attributes = selection[i].getAttributes();
                if (attributes && attributes.hasMixin(GXNode.Container) && attributes.getFirstChild()) {
                    var serializedAttributes = GXNode.serialize(attributes);
                    gShell.setClipboardContent(GXAttributes.MIME_TYPE, serializedAttributes);
                    break;
                }
            }
        }
    };

    /** @override */
    GCopyAttributesAction.prototype.toString = function () {
        return "[Object GCopyAttributesAction]";
    };

    _.GCopyAttributesAction = GCopyAttributesAction;
})(this);
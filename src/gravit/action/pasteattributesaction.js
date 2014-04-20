(function (_) {

    /**
     * Action for pasting clipboard contents as attributes
     * @class GPasteAttributesAction
     * @extends GUIAction
     * @constructor
     */
    function GPasteAttributesAction() {
    };
    GObject.inherit(GPasteAttributesAction, GUIAction);

    GPasteAttributesAction.ID = 'edit.paste-attributes';
    GPasteAttributesAction.TITLE = new GLocale.Key(GPasteAttributesAction, "title");

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getId = function () {
        return GPasteAttributesAction.ID;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getTitle = function () {
        return GPasteAttributesAction.TITLE;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getGroup = function () {
        return "ccp_special";
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.F4];
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.isEnabled = function () {
        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(IFAttribute.MIME_TYPE) >= 0) {
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
        }
        return false;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.execute = function () {
        var attributes = GXNode.deserialize(gShell.getClipboarContent(IFAttribute.MIME_TYPE));
        if (attributes) {
            var editor = gApp.getActiveDocument().getEditor();
            var selection = editor.getSelection();

            editor.beginTransaction();
            try {
                for (var i = 0; i < selection.length; ++i) {
                    var target = selection[i];
                    if (target.hasMixin(GXElement.Attributes)) {
                        target.getAttributes().assignAttributesFrom(attributes);
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Paste Attributes');
            }
        }
    };

    /** @override */
    GPasteAttributesAction.prototype.toString = function () {
        return "[Object GPasteAttributesAction]";
    };

    _.GPasteAttributesAction = GPasteAttributesAction;
})(this);
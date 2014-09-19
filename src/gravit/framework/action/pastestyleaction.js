(function (_) {

    /**
     * Action for pasting clipboard contents as style
     * @class GPasteStyleAction
     * @extends GAction
     * @constructor
     */
    function GPasteStyleAction() {
    };
    IFObject.inherit(GPasteStyleAction, GAction);

    GPasteStyleAction.ID = 'edit.paste.style';
    GPasteStyleAction.TITLE = new IFLocale.Key(GPasteStyleAction, "title");

    /**
     * @override
     */
    GPasteStyleAction.prototype.getId = function () {
        return GPasteStyleAction.ID;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getTitle = function () {
        return GPasteStyleAction.TITLE;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getGroup = function () {
        return "paste";
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getShortcut = function () {
        return [IFKey.Constant.F4];
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.isEnabled = function () {
        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(IFNode.MIME_TYPE) >= 0) {
            var document = gApp.getActiveDocument();
            if (document) {
                var selection = document.getEditor().getSelection();
                if (selection) {
                    for (var i = 0; i < selection.length; ++i) {
                        if (selection[i].hasMixin(IFStylable)) {
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
    GPasteStyleAction.prototype.execute = function () {
        var nodes = IFNode.deserialize(gShell.getClipboardContent(IFNode.MIME_TYPE));
        if (nodes && nodes.length > 0) {
            var stylableSource = null;
            for (var i = 0; i < nodes.length; ++i) {
                if (nodes[i].hasMixin(IFStylable)) {
                    stylableSource = nodes[i];
                    break;
                }
            }

            var editor = gApp.getActiveDocument().getEditor();
            var selection = editor.getSelection();

            editor.beginTransaction();
            try {
                for (var i = 0; i < selection.length; ++i) {
                    var target = selection[i];
                    if (target.hasMixin(IFStylable)) {
                        IFStylable.prototype.assignStyleFrom.call(target, stylableSource);
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Paste Style');
            }
        }
    };

    /** @override */
    GPasteStyleAction.prototype.toString = function () {
        return "[Object GPasteStyleAction]";
    };

    _.GPasteStyleAction = GPasteStyleAction;
})(this);
(function (_) {

    /**
     * Action for reversing anchor points order in paths
     * @class GReverseOrderAction
     * @extends GAction
     * @constructor
     */
    function GReverseOrderAction() {
    };
    GObject.inherit(GReverseOrderAction, GAction);

    GReverseOrderAction.ID = 'modify.reverse-order';
    GReverseOrderAction.TITLE = new GLocale.Key(GReverseOrderAction, "title");

    /**
     * @override
     */
    GReverseOrderAction.prototype.getId = function () {
        return GReverseOrderAction.ID;
    };

    /**
     * @override
     */
    GReverseOrderAction.prototype.getTitle = function () {
        return GReverseOrderAction.TITLE;
    };

    /**
     * @override
     */
    GReverseOrderAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_PATHS;
    };

    /**
     * @override
     */
    GReverseOrderAction.prototype.getGroup = function () {
        return "structure/modify";
    };

    /** @override */
    GReverseOrderAction.prototype.isEnabled = function () {
        var selection = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null;
        var enabled = false;
        if (selection) {
            for (var i = 0; !enabled && i < selection.length; ++i) {
                if (selection[i] instanceof GPath) {
                    enabled = true;
                }
            }
        }

        return enabled;
    };

    /** @override */
    GReverseOrderAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        var selection = editor ? editor.getSelection() : null;
        var scene = document.getScene();
        var elements = [];
        var parent = null;
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                if (element instanceof GPath) {
                    elements.push(element);
                }
            }
        }

        if (elements.length) {
            editor.beginTransaction();
            try {
                for (var i = 0; i < elements.length; ++i) {
                    elements[i].reverseOrder();
                }
            } finally {
                editor.commitTransaction(ifLocale.get(this.getTitle()));
            }
        }
    };

    /** @override */
    GReverseOrderAction.prototype.toString = function () {
        return "[Object GReverseOrderAction]";
    };

    _.GReverseOrderAction = GReverseOrderAction;
})(this);

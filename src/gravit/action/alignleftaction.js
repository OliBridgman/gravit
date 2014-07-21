(function (_) {

    /**
     * Action for aligning selection left side
     * @class GAlignLeftAction
     * @extends GAction
     * @constructor
     */
    function GAlignLeftAction() {
    };
    IFObject.inherit(GAlignLeftAction, GAction);

    GAlignLeftAction.ID = 'modify.align.left';
    GAlignLeftAction.TITLE = new IFLocale.Key(GAlignLeftAction, "title");

    /**
     * @override
     */
    GAlignLeftAction.prototype.getId = function () {
        return GAlignLeftAction.ID;
    };

    /**
     * @override
     */
    GAlignLeftAction.prototype.getTitle = function () {
        return GAlignLeftAction.TITLE;
    };

    /**
     * @override
     */
    GAlignLeftAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_ARRANGE;
    };

    /**
     * @override
     */
    GAlignLeftAction.prototype.getGroup = function () {
        return "align";
    };

    /**
     * @override
     */
    GAlignLeftAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            return selection && selection.length > 1;
        }
        return false;
    };

    /**
     * @override
     */
    GAlignLeftAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var selection = document.getEditor().getSelection();

        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            // TODO : Align Selection Left
        }, 'Align Left');
    };

    /** @override */
    GAlignLeftAction.prototype.toString = function () {
        return "[Object GAlignLeftAction]";
    };

    _.GAlignLeftAction = GAlignLeftAction;
})(this);
(function (_) {

    /**
     * Action for bringing selection forward
     * @class GBringForwardAction
     * @extends GAction
     * @constructor
     */
    function GBringForwardAction() {
    };
    IFObject.inherit(GBringForwardAction, GAction);

    GBringForwardAction.ID = 'modify.arrange.bring-forward';
    GBringForwardAction.TITLE = new IFLocale.Key(GBringForwardAction, "title");

    /**
     * @override
     */
    GBringForwardAction.prototype.getId = function () {
        return GBringForwardAction.ID;
    };

    /**
     * @override
     */
    GBringForwardAction.prototype.getTitle = function () {
        return GBringForwardAction.TITLE;
    };

    /**
     * @override
     */
    GBringForwardAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_ARRANGE;
    };

    /**
     * @override
     */
    GBringForwardAction.prototype.getGroup = function () {
        return "order";
    };

    /**
     * @override
     */
    GBringForwardAction.prototype.getShortcut = function () {
        return [IFKey.Constant.OPTION, IFKey.Constant.META, IFKey.Constant.UP];
    };

    /**
     * @override
     */
    GBringForwardAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            return selection && selection.length > 0;
        }
        return false;
    };

    /**
     * @override
     */
    GBringForwardAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var selection = document.getEditor().getSelection();

        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            // TODO : Bring <selection> forward
        }, 'Bring Forward');
    };

    /** @override */
    GBringForwardAction.prototype.toString = function () {
        return "[Object GBringForwardAction]";
    };

    _.GBringForwardAction = GBringForwardAction;
})(this);
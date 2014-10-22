(function (_) {

    /**
     * Action for open paths joining
     * @class GJoinPathsAction
     * @extends GAction
     * @constructor
     */
    function GJoinPathsAction() {
    };
    IFObject.inherit(GJoinPathsAction, GAction);

    GJoinPathsAction.ID = 'modify.join-paths';
    GJoinPathsAction.TITLE = new IFLocale.Key(GJoinPathsAction, "title");

    /**
     * @override
     */
    GJoinPathsAction.prototype.getId = function () {
        return GJoinPathsAction.ID;
    };

    /**
     * @override
     */
    GJoinPathsAction.prototype.getTitle = function () {
        return GJoinPathsAction.TITLE;
    };

    /**
     * @override
     */
    GJoinPathsAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_PATHS;
    };

    /**
     * @override
     */
    GJoinPathsAction.prototype.getGroup = function () {
        return "structure/modify";
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GJoinPathsAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GJoinPathsAction.prototype.execute = function (elements) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var selection = null;

        if (!elements) {
            selection = document.getEditor().getSelection().slice();
            elements = selection;
        }

        elements = IFNode.order(elements, true/*reverse*/);

        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                var parent = element.getParent();
                if (element.getNext() !== null) {
                    parent.removeChild(element);
                    parent.appendChild(element);
                }
            }
        }.bind(this), ifLocale.get(this.getTitle()));

        if (selection) {
            document.getEditor().updateSelection(false, selection);
        }
    };

    /** @override */
    GJoinPathsAction.prototype.toString = function () {
        return "[Object GJoinPathsAction]";
    };

    _.GJoinPathsAction = GJoinPathsAction;
})(this);

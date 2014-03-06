(function (_) {

    /**
     * Action creating a new document
     * @class EXNewAction
     * @extends GUIAction
     * @constructor
     */
    function EXNewAction() {
    };
    GObject.inherit(EXNewAction, GUIAction);

    EXNewAction.ID = 'file.new';
    EXNewAction.TITLE = new GLocale.Key(EXNewAction, "title");

    /**
     * @override
     */
    EXNewAction.prototype.getId = function () {
        return EXNewAction.ID;
    };

    /**
     * @override
     */
    EXNewAction.prototype.getTitle = function () {
        return EXNewAction.TITLE;
    };

    /**
     * @override
     */
    EXNewAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXNewAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    EXNewAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'M'];
    };

    /**
     * @override
     */
    EXNewAction.prototype.execute = function () {
        // Create Scene
        var scene = new GXScene();

        // Execute insert pages action
        gApp.executeAction(GInsertPagesAction.ID, [scene, function () {
            // Add scene as document
            gApp.addDocument(scene);
            var document = gApp.getActiveDocument();

            // TODO
            // Center page
            gApp.executeAction(EXOriginalViewAction.ID);
            //var view = document.getActiveWindow();
            //view.zoomAtCenter(page.getPaintBBox().getSide(GRect.Side.CENTER));
        }]);
    };

    /** @override */
    EXNewAction.prototype.toString = function () {
        return "[Object EXNewAction]";
    };

    _.EXNewAction = EXNewAction;
})(this);
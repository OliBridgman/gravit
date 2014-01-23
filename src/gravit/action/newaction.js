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
        var scene = new GXScene();
        var settings = new EXSceneSettingsDialog(scene);
        settings.open();

         // TODO : Show dialog for creation

         var scene = new GXScene();
         scene.setProperty('unit', GXLength.Unit.MM);

         var pageHeight = GXLength.parseLength("297mm").toPoint();
         var pageWidth = GXLength.parseLength("210mm").toPoint();
         var marginY = GXLength.parseLength("0.5in").toPoint();
         var marginX = GXLength.parseLength("0.5in").toPoint();
         var page = new GXPage();
         page.setProperties(['x', 'y', 'w', 'h', 'ml', 'mt', 'mr', 'mb', 'title'],
         [0, 0, pageWidth, pageHeight, marginX, marginY, marginX, marginY, 'Page-1']);
         scene.getPageSet().appendChild(page);

         gApp.addDocument(scene);
    };

    /** @override */
    EXNewAction.prototype.toString = function () {
        return "[Object EXNewAction]";
    };

    _.EXNewAction = EXNewAction;
})(this);
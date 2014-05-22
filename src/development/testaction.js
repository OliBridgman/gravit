(function (_) {
    function TestAction(test) {
        this._test = test;
    };
    GObject.inherit(TestAction, GUIAction);

    /**
     * @override
     */
    TestAction.prototype.getId = function() {
        return this._test.category + '.' + this._test.title;
    };

    /**
     * @override
     */
    TestAction.prototype.getTitle = function () {
        return this._test.title;
    };

    /**
     * @override
     */
    TestAction.prototype.getCategory = function () {
        return gLocale.get(EXApplication.CATEGORY_FILE) + '/Development/Test/' + this._test.category;
    };

    /**
     * @override
     */
    TestAction.prototype.execute = function () {
        var scene = new IFScene();
        scene.setProperty('unit', IFLength.Unit.PX);

        var pageHeight = IFLength.parseLength("297mm").toPoint();
        var pageWidth = IFLength.parseLength("210mm").toPoint();
        var marginY = IFLength.parseLength("0.5in").toPoint();
        var marginX = IFLength.parseLength("0.5in").toPoint();
        var page = new IFPage();
        page.setProperties(['x', 'y', 'w', 'h', 'ml', 'mt', 'mr', 'mb', 'title'],
            [0, 0, pageWidth, pageHeight, marginX, marginY, marginX, marginY, 'Page-1']);
        scene.appendChild(page);

        gApp.addDocument(scene);
        var view = gApp.getWindows().getActiveWindow().getView();

        return this._test.test(scene, page, view);
    };

    /** @override */
    TestAction.prototype.toString = function () {
        return "[Object TestAction]";
    };

    _.TestAction = TestAction;
})(this);
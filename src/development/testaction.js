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
        var scene = new GXScene();
        scene.setProperty('unit', GXLength.Unit.PX);

        var pageHeight = GXLength.parseLength("297mm").toPoint();
        var pageWidth = GXLength.parseLength("210mm").toPoint();
        var marginY = GXLength.parseLength("0.5in").toPoint();
        var marginX = GXLength.parseLength("0.5in").toPoint();
        var page = new GXPage();
        page.setProperties(['x', 'y', 'w', 'h', 'ml', 'mt', 'mr', 'mb', 'title'],
            [0, 0, pageWidth, pageHeight, marginX, marginY, marginX, marginY, 'Page-1']);
        scene.getPageSet().appendChild(page);

        gApp.addDocument(scene);

        var layer = scene.getLayerSet().getLastChild();
        var contour = new GXPaintContourStyle();
        contour.setProperty('fill', GXColor.parseCSSColor('black'));
        layer.getStyle(true).appendChild(contour);

        return this._test.test(scene, page, layer,
            gApp.getWindows().getActiveWindow().getView());
    };

    /** @override */
    TestAction.prototype.toString = function () {
        return "[Object TestAction]";
    };

    _.TestAction = TestAction;
})(this);
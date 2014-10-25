(function (_) {
    function TestAction(test) {
        this._test = test;
    };
    GObject.inherit(TestAction, GAction);

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
        return ifLocale.get(GApplication.CATEGORY_FILE) + '/Development/Test';
    };

    /**
     * @override
     */
    TestAction.prototype.execute = function () {
        return this._test.test();
    };

    /** @override */
    TestAction.prototype.toString = function () {
        return "[Object TestAction]";
    };

    _.TestAction = TestAction;
})(this);
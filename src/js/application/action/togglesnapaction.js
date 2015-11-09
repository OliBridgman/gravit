(function (_) {

    /**
     * Action for enabling/disabling snapping
     * @class GToggleSnapAction
     * @extends GAction
     * @constructor
     */
    function GToggleSnapAction() {
    };
    GObject.inherit(GToggleSnapAction, GAction);

    GToggleSnapAction.ID = 'view.toggle-snap';
    GToggleSnapAction.TITLE = new GLocale.Key(GToggleSnapAction, "title");

    GToggleSnapAction.prototype._savedGuides = null;

    /**
     * @override
     */
    GToggleSnapAction.prototype.getId = function () {
        return GToggleSnapAction.ID;
    };

    /**
     * @override
     */
    GToggleSnapAction.prototype.getTitle = function () {
        return GToggleSnapAction.TITLE;
    };

    /**
     * @override
     */
    GToggleSnapAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GToggleSnapAction.prototype.getGroup = function () {
        return "show";
    };

    /**
     * @override
     */
    GToggleSnapAction.prototype.getShortcut = function () {
        return [GKey.Constant.SHIFT, GKey.Constant.F10];
    };

    /** @override */
    GToggleSnapAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    GToggleSnapAction.prototype.isChecked = function () {
        return GGuides.options.guides !== null;
    };

    /**
     * @override
     */
    GToggleSnapAction.prototype.execute = function () {
        if (this.isChecked()) {
            this._savedGuides = GGuides.options.guides;
            GGuides.options.guides = null;
        } else {
            if (this._savedGuides) {
                GGuides.options.guides = this._savedGuides;
            } else {
                GGuides.options.guides = [];
            }
        }
    };

    /** @override */
    GToggleSnapAction.prototype.toString = function () {
        return "[Object GToggleSnapAction]";
    };

    _.GToggleSnapAction = GToggleSnapAction;
})(this);
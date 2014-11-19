(function (_) {

    /**
     * Action for creating path offset by some value
     * @class GOffsetAction
     * @extends GOutlineAction
     * @constructor
     */
    function GOffsetAction() {
    };
    GObject.inherit(GOffsetAction, GOutlineAction);

    GOffsetAction.ID = 'modify.offset';
    GOffsetAction.TITLE = new GLocale.Key(GOffsetAction, "title");

    /**
     * @override
     */
    GOffsetAction.prototype.getId = function () {
        return GOffsetAction.ID;
    };

    /**
     * @override
     */
    GOffsetAction.prototype.getTitle = function () {
        return GOffsetAction.TITLE;
    };

    /** @override */
    GOffsetAction.prototype._dialogPromptMessage = function () {
        return "Enter a positive value for offset or negative for inset:";
    };

    /** @override */
    GOffsetAction.prototype._makeOffsetter = function (valNum, elem) {
        var offsetter = valNum > 0 ?
            new GVertexOffsetter(elem, valNum, false, true) :
            new GVertexOffsetter(elem, -valNum, true, false);
        return offsetter;
    };

    /** @override */
    GOffsetAction.prototype._dialogAlertMessage = function () {
        return "Entered invalid number for offset value.";
    };

    /** @override */
    GOffsetAction.prototype.toString = function () {
        return "[Object GOffsetAction]";
    };

    _.GOffsetAction = GOffsetAction;
})(this);
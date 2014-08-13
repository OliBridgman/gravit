(function (_) {

    /**
     * Transform Panel
     * @class GTransformPanel
     * @extends GPanel
     * @constructor
     */
    function GTransformPanel() {
        GPanel.call(this);
    }

    IFObject.inherit(GTransformPanel, GPanel);

    GTransformPanel.ID = "transform";
    GTransformPanel.TITLE = new IFLocale.Key(GTransformPanel, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GTransformPanel.prototype._htmlElement = null;

    /** @override */
    GTransformPanel.prototype.getId = function () {
        return GTransformPanel.ID;
    };

    /** @override */
    GTransformPanel.prototype.getTitle = function () {
        return GTransformPanel.TITLE;
    };

    /** @override */
    GTransformPanel.prototype.init = function (htmlElement, controls) {
        GPanel.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        this._htmlElement.text('TRANSFORM STUFF');
    };

    /** @override */
    GTransformPanel.prototype.toString = function () {
        return "[Object GTransformPanel]";
    };

    _.GTransformPanel = GTransformPanel;
})(this);
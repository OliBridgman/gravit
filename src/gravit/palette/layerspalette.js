(function (_) {

    /**
     * Layers Palette
     * @class GLayersPalette
     * @extends GPalette
     * @constructor
     */
    function GLayersPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GLayersPalette, GPalette);

    GLayersPalette.ID = "layers";
    GLayersPalette.TITLE = new IFLocale.Key(GLayersPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GLayersPalette.prototype._htmlElement = null;

    /**
     * @type {JQuery}
     * @private
     */
    GLayersPalette.prototype._controls = null;

    /** @override */
    GLayersPalette.prototype.getId = function () {
        return GLayersPalette.ID;
    };

    /** @override */
    GLayersPalette.prototype.getTitle = function () {
        return GLayersPalette.TITLE;
    };

    /** @override */
    GLayersPalette.prototype.getGroup = function () {
        return "structure";
    };

    /** @override */
    GLayersPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GLayersPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;
        this._controls = controls;
    };

    /** @override */
    GLayersPalette.prototype._documentEvent = function (event) {
        // ...
    };

    /** @override */
    GLayersPalette.prototype.toString = function () {
        return "[Object GLayersPalette]";
    };

    _.GLayersPalette = GLayersPalette;
})(this);
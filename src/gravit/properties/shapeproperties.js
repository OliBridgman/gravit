(function (_) {

    /**
     * Styles properties panel
     * @class GShapeProperties
     * @extends EXProperties
     * @constructor
     */
    function GShapeProperties() {
        this._shapes = [];
    };
    GObject.inherit(GShapeProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GShapeProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GShapeProperties.prototype._document = null;

    /**
     * @type {Array<GXElement>}
     * @private
     */
    GShapeProperties.prototype._shapes = null;

    /** @override */
    GShapeProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Styles';
    };

    /** @override */
    GShapeProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        this._panel.append('STYLES');
    };

    /** @override */
    GShapeProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            //this._document.getScene().removeEventListener(GXElement.GeometryChangeEvent, this._geometryChange);
            this._document = null;
        }

        // Collect all shapes
        this._shapes = [];
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXShape) {
                this._shapes.push(nodes[i]);
            }
        }

        if (this._shapes.length > 0) {
            this._document = document;
            //this._document.getScene().addEventListener(GXElement.GeometryChangeEvent, this._geometryChange, this);
            this._updateStyles();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @private
     */
    GShapeProperties.prototype._updateStyles = function () {
        // TODO
    };

    /** @override */
    GShapeProperties.prototype.toString = function () {
        return "[Object GShapeProperties]";
    };

    _.GShapeProperties = GShapeProperties;
})(this);
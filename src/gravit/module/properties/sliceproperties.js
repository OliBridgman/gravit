(function (_) {

    /**
     * Slice properties panel
     * @class GSliceProperties
     * @extends GProperties
     * @constructor
     */
    function GSliceProperties() {
        this._slices = [];
    };
    IFObject.inherit(GSliceProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GSliceProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GSliceProperties.prototype._document = null;

    /**
     * @type {Array<IFSlice>}
     * @private
     */
    GSliceProperties.prototype._slices = null;

    /** @override */
    GSliceProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Slice';
    };

    /** @override */
    GSliceProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'cls') {
                return $('<button></button>')
                    .attr('data-property', property)
                    .gColorButton({
                        allowClear: true
                    })
                    .on('colorchange', function (evt, color) {
                        self._assignProperty(property, color);
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Color:'))
                .append($('<td></td>')
                    .append(_createInput('cls'))))
            .appendTo(this._panel);
    };

    /** @override */
    GSliceProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document = null;
        }

        this._slices = [];

            for (var i = 0; i < elements.length; ++i) {
                if (elements[i] instanceof IFSlice) {
                    this._slices.push(elements[i]);
                }
            }

        if (this._slices.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GSliceProperties.prototype._afterPropertiesChange = function (event) {
        // Update ourself if our first element is changed
        if (this._slices.length > 0 && this._slices[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GSliceProperties.prototype._updateProperties = function () {
        // We'll always read properties of first element
        var scene = this._document.getScene();
        var slice = this._slices[0];

        this._panel.find('[data-property="cls"]')
            .gColorButton('value', slice.getProperty('cls'))
            .gColorButton('scene', scene);
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GSliceProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GSliceProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._slices.length; ++i) {
                this._slices[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Slice Properties');
        }
    };

    /** @override */
    GSliceProperties.prototype.toString = function () {
        return "[Object GSliceProperties]";
    };

    _.GSliceProperties = GSliceProperties;
})(this);
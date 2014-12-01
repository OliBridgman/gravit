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
    GObject.inherit(GSliceProperties, GProperties);

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
     * @type {Array<GSlice>}
     * @private
     */
    GSliceProperties.prototype._slices = null;

    /** @override */
    GSliceProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'cls') {
                return $('<div></div>')
                    .attr('data-property', property)
                    .gPatternPicker()
                    .gPatternPicker('types', [GColor])
                    .on('patternchange', function (evt, color) {
                        self._assignProperty(property, color);
                    });
            } else if (property === 'trm') {
                return $('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-property', property)
                    .on('change', function () {
                        self._assignProperty(property, $(this).is(':checked'));
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '120px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Color:')
                .append(_createInput('cls')
                    .css({
                        'margin-left': '3px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Trim Transparent:')
                .append(_createInput('trm')));
    };

    /** @override */
    GSliceProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document = null;
        }

        this._slices = [];

        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof GSlice) {
                this._slices.push(elements[i]);
            }
        }

        if (this._slices.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} event
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
            .gPatternPicker('value', slice.getProperty('cls'))
            .gPatternPicker('swatches', slice.getWorkspace().getSwatches());

        this._panel.find('input[data-property="trm"]').prop('checked', slice.getProperty('trm'));
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
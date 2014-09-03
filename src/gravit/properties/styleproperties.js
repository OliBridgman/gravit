(function (_) {

    /**
     * Style properties panel
     * @class GStyleProperties
     * @extends GProperties
     * @constructor
     */
    function GStyleProperties() {
        this._styleElements = [];
    };
    IFObject.inherit(GStyleProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GStyleProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GStyleProperties.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GStyleProperties.prototype._styleElements = null;

    /** @override */
    GStyleProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'blm') {
                return $('<select></select>')
                    .append($('<option></option>')
                        .text('Mask'))
                    .append($('<option></option>')
                        .text('Background'))
                    .append($('<optgroup></optgroup>')
                        .attr('label', 'Regular'))
                    .gBlendMode();
            } else if (property === 'opc') {
                return $('<input>');
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '210px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append(_createInput('blm')
                    .css({
                        'width': '117px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Opacity:')
                .append(_createInput('opc')
                    .css({
                        'margin-left': '3px',
                        'width': '30px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .append($('<select></select>')
                    .append($('<option>No Style</option>'))
                    .css({
                        'width': '95px'
                    })))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '103px'
                })
                .append($('<button></button>')
                    .append($('<span></span>')
                        .addClass('fa fa-plus')))
                .append($('<button></button>')
                    .append($('<span></span>')
                        .addClass('fa fa-trash-o'))))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Fill:')
                .append(_createInput('opc')
                    .css({
                        'margin-left': '3px',
                        'width': '30px'
                    })))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }));
    };

    /** @override */
    GStyleProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all shape elements
        this._styleElements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFElement && elements[i].hasMixin(IFElement.Style)) {
                this._styleElements.push(elements[i]);
            }
        }

        if (this._styleElements.length === elements.length) {
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
    GStyleProperties.prototype._afterPropertiesChange = function (event) {
        // TODO
    };

    /**
     * @private
     */
    GStyleProperties.prototype._updateProperties = function () {
        // TODO
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GStyleProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GStyleProperties.prototype._assignProperties = function (properties, values) {
        /* TODO
         var editor = this._document.getEditor();
         editor.beginTransaction();
         try {
         for (var i = 0; i < this._styleElements.length; ++i) {
         this._styleElements[i].setProperties(properties, values);
         }
         } finally {
         // TODO : I18N
         editor.commitTransaction('Modify Ellipse Properties');
         }*/
    };

    /** @override */
    GStyleProperties.prototype.toString = function () {
        return "[Object GStyleProperties]";
    };

    _.GStyleProperties = GStyleProperties;
})(this);
(function (_) {

    /**
     * Path properties panel
     * @class GPathProperties
     * @extends EXProperties
     * @constructor
     */
    function GPathProperties() {
        this._pathes = [];
    };
    GObject.inherit(GPathProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GPathProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GPathProperties.prototype._document = null;

    /**
     * @type {Array<GXPath>}
     * @private
     */
    GPathProperties.prototype._pathes = null;

    /** @override */
    GPathProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Path';
    };

    /** @override */
    GPathProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'evenodd' || property === 'closed') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-property', property)
                        .on('change', function () {
                            self._assignProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;' + (property === 'evenodd' ? 'Even/odd' : 'Closed')))
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
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createInput('evenodd')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createInput('closed'))))
            .appendTo(panel);
    };

    /** @override */
    GPathProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all path elements
        this._pathes = [];
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXPath) {
                this._pathes.push(nodes[i]);
            }
        }

        if (this._pathes.length === nodes.length) {
            this._document = document;
            this._document.getScene().addEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXElement.GeometryChangeEvent} event
     * @private
     */
    GPathProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first path has changed then update ourself
        if (this._pathes.length > 0 && this._pathes[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @param {Boolean} [noBBoxCalculation] if set, do not recalculate all element's bbox.
     * Defaults to false.
     * @private
     */
    GPathProperties.prototype._updateProperties = function () {
        // We'll always read properties of first path
        var path = this._pathes[0];
        this._panel.find('input[data-property="evenodd"]').val(path.getProperty('evenodd'));
        this._panel.find('input[data-property="closed"]').val(path.getProperty('closed'));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPathProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPathProperties.prototype._assignProperties = function (properties, values) {
        // TODO : I18N
        var pathes = this._pathes.slice();
        this._document.getEditor().executeTransaction(function () {
            for (var i = 0; i < pathes.length; ++i) {
                pathes[i].setProperties(properties, values);
            }
        }, pathes, 'Path Properties');
    };

    /** @override */
    GPathProperties.prototype.toString = function () {
        return "[Object GPathProperties]";
    };

    _.GPathProperties = GPathProperties;
})(this);
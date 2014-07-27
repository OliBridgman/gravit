(function (_) {

    /**
     * Transform transform panel
     * @class GAdjustTransformer
     * @extends GTransformer
     * @constructor
     */
    function GAdjustTransformer() {
        this._elements = [];
    };
    IFObject.inherit(GAdjustTransformer, GTransformer);

    GAdjustTransformer._TransformMode = {
        Move: 'move',
        Rotate: 'rotate',
        Scale: 'scale',
        Skew: 'skew',
        Reflect: 'reflect'
    };

    /**
     * @type {JQuery}
     * @private
     */
    GAdjustTransformer.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GAdjustTransformer.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GAdjustTransformer.prototype._elements = null;

    /** @override */
    GAdjustTransformer.prototype.getCategory = function () {
        // TODO : I18N
        return 'Adjust';
    };

    /** @override */
    GAdjustTransformer.prototype.init = function (panel, controls) {
        this._panel = panel;

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Adjust:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<select></select>')
                        .attr('data-option', 'align-to')
                        .append($('<option></option>')
                            .attr('value', GAdjustTransformer._TransformMode.Move)
                            // TODO : I18N
                            .text('Move'))
                        .append($('<option></option>')
                            .attr('value', GAdjustTransformer._TransformMode.Rotate)
                            // TODO : I18N
                            .text('Rotate'))
                        .append($('<option></option>')
                            .attr('value', GAdjustTransformer._TransformMode.Scale)
                            // TODO : I18N
                            .text('Scale'))
                        .append($('<option></option>')
                            .attr('value', GAdjustTransformer._TransformMode.Skew)
                            // TODO : I18N
                            .text('Skew'))
                        .append($('<option></option>')
                            .attr('value', GAdjustTransformer._TransformMode)
                            // TODO : I18N
                            .text('Reflect')))))
            .appendTo(panel);
    };

    /** @override */
    GAdjustTransformer.prototype.update = function (document, elements) {
        this._document = document;
        this._elements = elements;
        return true;
    };

    /**
     * @private
     */
    GAdjustTransformer.prototype._transform = function () {
        // TODO
    };

    /** @override */
    GAdjustTransformer.prototype.toString = function () {
        return "[Object GAdjustTransformer]";
    };

    _.GAdjustTransformer = GAdjustTransformer;
})(this);
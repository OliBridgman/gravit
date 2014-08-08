(function (_) {

    /**
     * Align transform panel
     * @class GAlignTransformer
     * @extends GTransformer
     * @constructor
     */
    function GAlignTransformer() {
        this._elements = [];
    };
    IFObject.inherit(GAlignTransformer, GTransformer);

    /** @enum */
    GAlignTransformer._AlignTo = {
        Selection: 'selection',
        Layer: 'layer',
        Page: 'page',
        PageMargins: 'page-margins',
        FirstElement: 'first-element',
        LastElement: 'last-element'
    };

    /** @enum */
    GAlignTransformer._AlignOn = {
        Geometry: 'geometry',
        Painted: 'painted'
    };

    /**
     * @type {JQuery}
     * @private
     */
    GAlignTransformer.prototype._panel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GAlignTransformer.prototype._controls = null;

    /**
     * @type {GDocument}
     * @private
     */
    GAlignTransformer.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GAlignTransformer.prototype._elements = null;

    /**
     * @type {GAlignTransformer._AlignTo}
     * @private
     */
    GAlignTransformer.prototype._savedAlignTo = GAlignTransformer._AlignTo.Selection;

    /** @override */
    GAlignTransformer.prototype.getCategory = function () {
        // TODO : I18N
        return 'Align';
    };

    /** @override */
    GAlignTransformer.prototype.init = function (panel, controls) {
        this._panel = panel;
        this._controls = controls;

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Align To:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<select></select>')
                        .attr('data-option', 'align-to')
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.Selection)
                            // TODO : I18N
                            .text('Selection'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.Layer)
                            // TODO : I18N
                            .text('Active Layer'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.Page)
                            // TODO : I18N
                            .text('Active Page'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.PageMargins)
                            // TODO : I18N
                            .text('Active Page Margins'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.FirstElement)
                            // TODO : I18N
                            .text('First Selected Element'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.LastElement)
                            // TODO : I18N
                            .text('Last Selected Element'))
                        .on('change', function (evt) {
                            this._savedAlignTo = $(evt.target).val();
                            this._updateStates();
                        }.bind(this)))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Align On:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<select></select>')
                        .attr('data-option', 'align-on')
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignOn.Geometry)
                            // TODO : I18N
                            .text('Geometry'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignOn.Painted)
                            // TODO : I18N
                            .text('Painted')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Horizontal:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Left')
                        .attr('data-align', GAlignAction.Type.AlignLeft)
                        .append($('<span></span>')
                            .addClass('fa fa-align-left')))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Center')
                        .attr('data-align', GAlignAction.Type.AlignCenter)
                        .append($('<span></span>')
                            .addClass('fa fa-align-center')))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Right')
                        .attr('data-align', GAlignAction.Type.AlignRight)
                        .append($('<span></span>')
                            .addClass('fa fa-align-right')))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Justify Horizontal')
                        .attr('data-align', GAlignAction.Type.AlignJustifyHorizontal)
                        .append($('<span></span>')
                            .addClass('fa fa-align-justify fa-rotate-270')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Vertical:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Top')
                        .attr('data-align', GAlignAction.Type.AlignTop)
                        .append($('<span></span>')
                            .addClass('fa fa-align-right fa-rotate-270')))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Middle')
                        .attr('data-align', GAlignAction.Type.AlignMiddle)
                        .append($('<span></span>')
                            .addClass('fa fa-align-center fa-rotate-270')))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Bottom')
                        .attr('data-align', GAlignAction.Type.AlignBottom)
                        .append($('<span></span>')
                            .addClass('fa fa-align-left fa-rotate-270')))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Justify Vertical')
                        .attr('data-align', GAlignAction.Type.AlignJustifyVertical)
                        .append($('<span></span>')
                            .addClass('fa fa-align-justify')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Distribute:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<input>')
                        // TODO : I18N
                        .attr('title', 'Horizontal Spacing, zero will auto-space')
                        .attr('data-dist', GDistributeAction.Type.Horizontal)
                        .css('width', '3em')
                        .val('0'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Distribute Horizontal')
                        .attr('data-dist', GDistributeAction.Type.Horizontal)
                        .append($('<span></span>')
                            .addClass('fa fa-reorder fa-rotate-270')))
                    .append($('<input>')
                        // TODO : I18N
                        .attr('title', 'Vertical Spacing, zero will auto-space')
                        .attr('data-dist', GDistributeAction.Type.Vertical)
                        .css('width', '3em')
                        .css('margin-left', '10px')
                        .val('0'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Distribute Vertical')
                        .attr('data-dist', GDistributeAction.Type.Vertical)
                        .append($('<span></span>')
                            .addClass('fa fa-reorder')))))
            .appendTo(panel);

        var _createApplyButton = function (apply) {
            var self = this;
            // TODO : I18N
            var hint = apply === 'selection' ? 'Align Selection' : 'Align Individual Elements';
            var text = apply === 'selection' ? 'Selection' : 'Individual';
            return $('<button></button>')
                .addClass('g-button ' + (apply === 'selection' ? 'g-active' : ''))
                .attr('title', hint)
                .attr('data-apply', apply)
                .text(text)
                .on('click', function () {
                    if (!$(this).hasClass('g-active')) {
                        if (apply === 'selection') {
                            self._controls.find('button[data-apply="objects"]').removeClass('g-active');
                            self._controls.find('button[data-apply="selection"]').addClass('g-active');
                        } else {
                            self._controls.find('button[data-apply="selection"]').removeClass('g-active');
                            self._controls.find('button[data-apply="objects"]').addClass('g-active');
                        }
                    }
                });
        }.bind(this);

        // Init controls
        controls
            .append(_createApplyButton('selection'))
            .append(_createApplyButton('objects'));

        var alignHandler = function (evt) {
            this._executeAction($(evt.target).attr('data-align'), 'align');
        }.bind(this);

        var distHandler = function (evt) {
            this._executeAction($(evt.target).attr('data-dist'), 'dist')
        }.bind(this);

        this._panel.find('button[data-align]').each(function (index, element) {
            $(element).on('click', alignHandler);
        });

        this._panel.find('button[data-dist]').each(function (index, element) {
            $(element).on('click', distHandler);
        });

        this._panel.find('input[data-dist]').each(function (index, element) {
            $(element).on('keyup', function (evt) {
                if (evt.keyCode === 13) {
                    distHandler.call(this, evt);
                }
            });
        });
    };

    /** @override */
    GAlignTransformer.prototype.update = function (document, elements) {
        this._document = document;
        this._elements = elements;

        // If selection alignment-to is selected and we have only one
        // element available then we (temporarily) switch to align-to page,
        // otherwise we'll reset to our saved align-to selection
        if (this._elements && this._elements.length === 1) {
            this._panel.find('select[data-option="align-to"]').val(GAlignTransformer._AlignTo.Page);
        } else {
            this._panel.find('select[data-option="align-to"]').val(this._savedAlignTo)
        }

        this._updateStates();

        return true;
    };

    /**
     * Returns the action args
     * @param {GAlignAction.Type|GDistributeAction.Type} type
     * @param {String} mode - 'align', 'dist'
     * @return {{actionId: String, actionParams: Array<*>}}
     * @private
     */
    GAlignTransformer.prototype._getActionArgs = function (type, mode) {
        // Gather our reference box depending on the selection, first
        var referenceBox = null;
        var elements = this._elements.slice();
        var scene = this._document.getScene();
        var activePage = scene.getActivePage();
        var activeLayer = scene.getActiveLayer();
        var alignTo = this._panel.find('select[data-option="align-to"]').val();

        switch (alignTo) {
            case GAlignTransformer._AlignTo.Layer:
                referenceBox = activeLayer.getPaintBBox();
                break;
            case GAlignTransformer._AlignTo.Page:
                referenceBox = activePage.getGeometryBBox();
                break;
            case GAlignTransformer._AlignTo.PageMargins:
                referenceBox = activePage.getGeometryBBox().expanded(
                    -activePage.getProperty('ml'),
                    -activePage.getProperty('mt'),
                    -activePage.getProperty('mr'),
                    -activePage.getProperty('mb'));
                break;
            case GAlignTransformer._AlignTo.FirstElement:
                referenceBox = elements[0];
                elements.splice(0);
                break;
            case GAlignTransformer._AlignTo.LastElement:
                referenceBox = elements[elements.length - 1];
                elements.splice(elements.length - 1);
                break;
        }

        if (elements.length > 0) {
            var geometry = this._panel.find('select[data-option="align-on"]').val() === GAlignTransformer._AlignOn.Geometry;

            if (mode === 'align') {
                var compound = alignTo !== GAlignTransformer._AlignTo.Selection ? this._controls.find('button[data-apply="selection"]').hasClass('g-active') : false;
                return {
                    actionId: GAlignAction.ID + '.' + type,
                    actionParams: [elements, compound, geometry, referenceBox]
                };
            } else if (mode === 'dist') {
                var spacing = scene.stringToPoint(this._panel.find('input[data-dist="' + type + '"]').val()) || 0;
                return {
                    actionId: GDistributeAction.ID + '.' + type,
                    actionParams: [elements, geometry, referenceBox, spacing]
                };
            } else {
                throw new Error('Unknown align mode: ' + mode);
            }
        }
    };

    /**
     * see _getActionArgs
     * @private
     */
    GAlignTransformer.prototype._executeAction = function (type, mode) {
        var actionArgs = this._getActionArgs(type, mode);
        if (actionArgs) {
            gApp.executeAction(actionArgs.actionId, actionArgs.actionParams);
        }
    };

    /**
     * see _getActionArgs
     * @private
     */
    GAlignTransformer.prototype._isActionEnabled = function (type, mode) {
        var actionArgs = this._getActionArgs(type, mode);
        if (actionArgs) {
            return gApp.canExecuteAction(actionArgs.actionId, actionArgs.actionParams);
        }
        return false;
    };

    /** @private */
    GAlignTransformer.prototype._updateStates = function () {
        var alignTo = this._panel.find('select[data-option="align-to"]').val();
        var compoundCtrlsVisible = alignTo !== GAlignTransformer._AlignTo.Selection && this._elements.length > 1;

        this._controls.find('button[data-apply="selection"]').css('display', compoundCtrlsVisible ? '' : 'none');
        this._controls.find('button[data-apply="objects"]').css('display', compoundCtrlsVisible ? '' : 'none');

        this._panel.find('[data-align]').each(function (index, element) {
            var $element = $(element);
            $element.prop('disabled', !this._isActionEnabled($element.attr('data-align'), 'align'));
        }.bind(this));

        this._panel.find('[data-dist]').each(function (index, element) {
            var $element = $(element);
            $element.prop('disabled', !this._isActionEnabled($element.attr('data-dist'), 'dist'));
        }.bind(this));
    };

    /** @override */
    GAlignTransformer.prototype.toString = function () {
        return "[Object GAlignTransformer]";
    };

    _.GAlignTransformer = GAlignTransformer;
})(this);
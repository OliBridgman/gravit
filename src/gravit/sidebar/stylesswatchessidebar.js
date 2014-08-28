(function (_) {

    /**
     * The styles sidebar
     * @class GStylesSwatchesSidebar
     * @extends GSidebar
     * @constructor
     */
    function GStylesSwatchesSidebar() {
        GSidebar.call(this);
    }

    IFObject.inherit(GStylesSwatchesSidebar, GSidebar);

    GStylesSwatchesSidebar.ID = "swatches-layers";
    GStylesSwatchesSidebar.TITLE = new IFLocale.Key(GStylesSwatchesSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GStylesSwatchesSidebar.prototype._stylePanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesSwatchesSidebar.prototype._swatchPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesSwatchesSidebar.prototype._swatchDeleteControl = null;

    /** @override */
    GStylesSwatchesSidebar.prototype.getId = function () {
        return GStylesSwatchesSidebar.ID;
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.getTitle = function () {
        return GStylesSwatchesSidebar.TITLE;
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-leaf"></span>';
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        this._stylePanel = $('<div></div>')
            .addClass('g-style-list')
            .gStylePanel({
                allowNameEdit: true,
                // TODO : I18N
                placeholder: 'No Shared Styles'
            })
            .on('stylechange', function (evt, style) {
                this._document.getScene().getStyleCollection().acceptChildren(function (node) {
                    node.removeFlag(IFNode.Flag.Selected);
                });

                if (style) {
                    style.setFlag(IFNode.Flag.Selected);
                }

                this._updateStyleControls();
            }.bind(this));


        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Shared Styles',
                content: this._stylePanel
            })
            .appendTo(htmlElement);

        this._swatchPanel = $('<div></div>')
            .addClass('g-swatch-list')
            .gSwatchPanel({
                allowNameEdit: true,
                // TODO : I18N
                placeholder: 'Drop Swatches here'
            })
            .on('swatchchange', function (evt, swatch) {
                this._document.getScene().getSwatchCollection().acceptChildren(function (node) {
                    node.removeFlag(IFNode.Flag.Selected);
                });

                if (swatch) {
                    swatch.setFlag(IFNode.Flag.Selected);
                }

                this._updateSwatchControls();
            }.bind(this));

        this._swatchDeleteControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Delete Selected Swatch')
            .on('click', function () {
                var swatch = this._swatchPanel.gSwatchPanel('value');
                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    swatch.getParent().removeChild(swatch);
                } finally {
                    editor.commitTransaction('Delete Swatch');
                }
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-trash-o'));

        this._updateStyleControls();
        this._updateSwatchControls();

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Swatches',
                content: this._swatchPanel,
                controls: [
                    this._swatchDeleteControl
                ]
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GStylesSwatchesSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            this._stylePanel.gStylePanel('attach', scene.getStyleCollection());
            this._stylePanel.gStylePanel('value', scene.getStyleCollection().querySingle('sharedStyle:selected'));
            this._swatchPanel.gSwatchPanel('attach', scene.getSwatchCollection());
            this._swatchPanel.gSwatchPanel('value', scene.getSwatchCollection().querySingle('swatch:selected'));
            this._updateStyleControls();
            this._updateSwatchControls();
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            this._stylePanel.gStylePanel('detach');
            this._swatchPanel.gSwatchPanel('detach');
            this._updateStyleControls();
            this._updateSwatchControls();
        }
    };

    /** @private */
    GStylesSwatchesSidebar.prototype._updateStyleControls = function () {
        var style = this._stylePanel.gStylePanel('value');
        //TODO...
    };

    /** @private */
    GStylesSwatchesSidebar.prototype._updateSwatchControls = function () {
        var swatch = this._swatchPanel.gSwatchPanel('value');
        this._swatchDeleteControl.prop('disabled', !swatch);
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.toString = function () {
        return "[Object GStylesSwatchesSidebar]";
    };

    _.GStylesSwatchesSidebar = GStylesSwatchesSidebar;
})(this);
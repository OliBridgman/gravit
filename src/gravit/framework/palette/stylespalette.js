(function (_) {

    /**
     * Styles Palette
     * @class GStylesPalette
     * @extends GPalette
     * @constructor
     */
    function GStylesPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GStylesPalette, GPalette);

    GStylesPalette.ID = "styles";
    GStylesPalette.TITLE = new IFLocale.Key(GStylesPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GStylesPalette.prototype._htmlElement = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesPalette.prototype._controls = null;

    /**
     * @type {GDocument}
     * @private
     */
    GStylesPalette.prototype._document = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesPalette.prototype._stylePanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesPalette.prototype._styleDeleteControl = null;

    /** @override */
    GStylesPalette.prototype.getId = function () {
        return GStylesPalette.ID;
    };

    /** @override */
    GStylesPalette.prototype.getTitle = function () {
        return GStylesPalette.TITLE;
    };

    /** @override */
    GStylesPalette.prototype.getGroup = function () {
        return "assets";
    };

    /** @override */
    GStylesPalette.prototype.isEnabled = function () {
        return this._document !== null;
    };

    /** @override */
    GStylesPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;
        this._controls = controls;

        this._stylePanel = $('<div></div>')
            .addClass('g-list styles')
            .gStylePanel({
                allowNameEdit: true
            })
            .on('stylechange', function (evt, style) {
                this._document.getScene().getStyleCollection().acceptChildren(function (node) {
                    node.removeFlag(IFNode.Flag.Selected);
                });

                if (style) {
                    style.setFlag(IFNode.Flag.Selected);
                }

                this._updateControls();
            }.bind(this))
            .appendTo(htmlElement);


        this._styleDeleteControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Delete Selected Style')
            .attr('data-action', 'delete')
            .on('click', function () {
                var style = this._stylePanel.gStylePanel('value');
                vex.dialog.confirm({
                    // TODO : I18N
                    message: 'Are you sure you want to delete the selected style?',
                    callback: function (value) {
                        if (value) {
                            // TODO : I18N
                            IFEditor.tryRunTransaction(style, function () {
                                style.disconnectStyle();
                                style.getParent().removeChild(style);
                            }, 'Delete Style');
                        }
                    }.bind(this)
                });
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-trash-o'))
            .appendTo(controls);

        this._updateControls();
    };

    /** @override */
    GStylesPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            this._stylePanel.gStylePanel('attach', scene.getStyleCollection());
            this._stylePanel.gStylePanel('value', scene.getStyleCollection().querySingle('style:selected'));
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            this._stylePanel.gStylePanel('detach');
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /** @private */
    GStylesPalette.prototype._updateControls = function () {
        var style = this._stylePanel.gStylePanel('value');
        this._styleDeleteControl.prop('disabled', !style || style.getProperty('_sdf') !== null);
    };

    /** @override */
    GStylesPalette.prototype.toString = function () {
        return "[Object GStylesPalette]";
    };

    _.GStylesPalette = GStylesPalette;
})(this);
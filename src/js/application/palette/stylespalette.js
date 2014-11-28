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

    GObject.inherit(GStylesPalette, GPalette);

    GStylesPalette.ID = "styles";
    GStylesPalette.TITLE = new GLocale.Key(GStylesPalette, "title");

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
     * @type {GProject}
     * @private
     */
    GStylesPalette.prototype._project = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesPalette.prototype._stylePanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesPalette.prototype._styleSettingsControl = null;

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

        gApp.addEventListener(GApplication.ProjectEvent, this._projectEvent, this);

        this._htmlElement = htmlElement;
        this._controls = controls;

        this._stylePanel = $('<div></div>')
            .addClass('g-list styles g-style-list')
            .gStylePanel({
                allowNameEdit: true
            })
            .on('stylechange', function (evt, style) {
                this._project.getStyles().acceptChildren(function (node) {
                    node.removeFlag(GNode.Flag.Selected);
                });

                if (style) {
                    style.setFlag(GNode.Flag.Selected);
                }

                this._updateControls();
            }.bind(this))
            .appendTo(htmlElement);

        this._styleSettingsControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Edit Style Settings')
            .on('click', function () {
                var style = this._stylePanel.gStylePanel('value');
                new GStyleDialog(style).open(function (result, assign) {
                    if (result) {
                        // TODO : I18N
                        GEditor.tryRunTransaction(style, function () {
                            assign();
                        }.bind(this), 'Change Style Settings');
                    }
                }.bind(this));
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-cog'))
            .appendTo(controls);



        this._styleDeleteControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Delete Selected Style')
            .on('click', function () {
                var style = this._stylePanel.gStylePanel('value');
                vex.dialog.confirm({
                    // TODO : I18N
                    message: 'Are you sure you want to delete the selected style?',
                    callback: function (value) {
                        if (value) {
                            // TODO : I18N
                            GEditor.tryRunTransaction(style, function () {
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

    GStylesPalette.prototype._projectEvent = function (event) {
        if (event.type === GApplication.ProjectEvent.Type.Activated) {
            this._project = event.project;
            var styles = this._project.getStyles();
            this._stylePanel.gStylePanel('styles', styles);
            this._stylePanel.gStylePanel('value', styles.querySingle('style:selected'));
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.ProjectEvent.Type.Deactivated) {
            this._project = null;
            this._stylePanel.gStylePanel('styles', null);
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /** @private */
    GStylesPalette.prototype._updateControls = function () {
        var style = this._stylePanel.gStylePanel('value');
        this._styleSettingsControl.prop('disabled', !style || style.getProperty('_sdf') !== null);
        this._styleDeleteControl.prop('disabled', !style || style.getProperty('_sdf') !== null);
    };

    /** @override */
    GStylesPalette.prototype.toString = function () {
        return "[Object GStylesPalette]";
    };

    _.GStylesPalette = GStylesPalette;
})(this);
(function (_) {
    /**
     * A dialog for editing the scene settings
     * @class EXSceneSettingsDialog
     * @extends GUIModal
     * @constructor
     */
    function EXSceneSettingsDialog(scene) {
        GUIModal.call(this);
        this._scene = scene;
    };

    GObject.inherit(EXSceneSettingsDialog, GUIModal);

    /**
     * @type {boolean}
     * @private
     */
    EXSceneSettingsDialog.prototype._initialized = false;

    /**
     * @type {GXScene}
     * @private
     */
    EXSceneSettingsDialog.prototype._scene = null;

    /** @override */
    EXSceneSettingsDialog.prototype.open = function () {
        if (!this._initialized) {
            this._initialize();
            this._initialized = true;
        }
        GUIModal.prototype.open.call(this);
    };

    EXSceneSettingsDialog.prototype._initialize = function () {
        this.setWidth(400);

        this.setContent($('<table></table>')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .text('Design for'))
                .append($('<td></td>')
                    .append($('<select></select>')
                        .attr('data-control', 'design-target')
                        .append($('<option></option>')
                            .attr('value', 'S')
                            .text('Screen'))
                        .append($('<option></option>')
                            .attr('value', 'P')
                            .text('Print')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .text('Page Size'))
                .append($('<td></td>')
                    .append($('<input>')
                        .attr('type', 'text'))
                    .append($('<input>')
                        .attr('type', 'text'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .text('Page Margin'))));

        this.setButtons([
            {
                title : GLocale.Constant.Ok,
                click : function () {
                    if (!this._scene) {
                        this._scene = new GXScene();
                    } else {
                        // TODO : Begin and End Undo Group!!!
                    }
                    this._assignSceneSettings();

                    // TODO : Undo group end

                    this.close(this._scene);
                }.bind(this)
            },
            {
                title : GLocale.Constant.Cancel,
                click : function () {
                    this.close();
                }
            }
        ])
    };

    EXSceneSettingsDialog.prototype._assignSceneSettings = function () {
        this._scene.setProperties(
            [
                'screen'
            ],
            [
                this.getContent().find('[data-control="design-target"]').val() === "S" ? true : false
            ]
        );
    };

    _.EXSceneSettingsDialog = EXSceneSettingsDialog;
})(this);

(function (_) {
    /**
     * The global sidebars class
     * @class GSidebars
     * @constructor
     */
    function GSidebars(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {JQuery}
     * @private
     */
    GSidebars.prototype._htmlElement = null;

    /**
     * @type {Array<{{panel: JQuery, sidebar: GSidebar}}>}
     * @private
     */
    GSidebars.prototype._sidebars = null;

    /**
     * @type {String}
     * @private
     */
    GSidebars.prototype._activeSidebar = null;

    /**
     * @returns {String} the id of the active sidebar or null for none
     */
    GSidebars.prototype.getActiveSidebar = function () {
        return this._activeSidebar;
    };

    /**
     * Set an active sidebar
     * @param {String} sidebarId
     */
    GSidebars.prototype.setActiveSidebar = function (sidebarId) {
        if (sidebarId !== this._activeSidebar) {
            for (var i = 0; i < this._sidebars.length; ++i) {
                var sidebar = this._sidebars[i];
                var id = sidebar.sidebar.getId();

                if (id === sidebarId) {
                    sidebar.panel.css('display', '');
                    sidebar.sidebar.activate();
                } else {
                    sidebar.panel.css('display', 'none');
                    if (id === this._activeSidebar) {
                        sidebar.sidebar.deactivate();
                    }
                }
            }
        }
    };

    /**
     * Called from the workspace to initialize
     */
    GSidebars.prototype.init = function () {
        this._sidebars = [];

        if (gravit.sidebars) {
            for (var i = 0; i < gravit.sidebars.length; ++i) {
                var sidebar = gravit.sidebars[i];

                var panel = $('<div></div>')
                    .addClass('sidebar-panel')
                    .css('display', 'none')
                    .appendTo(this._htmlElement);

                sidebar.init(panel);

                this._sidebars.push({
                    panel: panel,
                    sidebar: sidebar
                });
            }
        }
    };

    /**
     * Called from the workspace to relayout
     */
    GSidebars.prototype.relayout = function () {
        // NO-OP
    };

    _.GSidebars = GSidebars;
})(this);
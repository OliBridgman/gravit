(function (_) {
    /**
     * The global idebar class
     * @class GHeader
     * @constructor
     * @version 1.0
     */
    function GHeader(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GHeader.prototype._htmlElement = null;

    /**
     * Called from the workspace to initialize
     */
    GHeader.prototype.init = function () {
        // Window tabs
        $('<div></div>')
            .addClass('windows')
            .appendTo(this._htmlElement);

        // View toolbar
        $('<div></div>')
            .addClass('view')
            .append(this._createZoom())
            .appendTo(this._htmlElement);

        this._updateZoomFromWindow();

        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
        gApp.getWindows().addEventListener(GWindows.WindowEvent, this._windowEvent, this);
        this._updateView();
    };

    /**
     * Called from the workspace to relayout
     */
    GHeader.prototype.relayout = function () {
        this._htmlElement.find('.view')
            .css('padding-right', gApp.isPartVisible(GApplication.Part.Palettes) ? gApp.getPart(GApplication.Part.Palettes).outerWidth().toString() + 'px' : '');
    };

    /**
     * @param {GApplication.DocumentEvent} evt
     * @private
     */
    GHeader.prototype._documentEvent = function (evt) {
        if (evt.type === GApplication.DocumentEvent.Type.UrlUpdated) {
            var windows = evt.document.getWindows();
            for (var i = 0; i < windows.length; ++i) {
                this._htmlElement.find('.windows > .tab').each(function (index, element) {
                    var $element = $(element);
                    if ($element.data('window') === windows[i]) {
                        $element.find('.title').text(windows[i].getTitle());
                        return false;
                    }
                });
            }
        }
    };

    /**
     * @param {GWindows.WindowEvent} evt
     * @private
     */
    GHeader.prototype._windowEvent = function (evt) {
        switch (evt.type) {
            case GWindows.WindowEvent.Type.Added:
                this._addWindowTab(evt.window);
                break;
            case GWindows.WindowEvent.Type.Removed:
                this._removeWindowTab(evt.window);
                break;
            case GWindows.WindowEvent.Type.Activated:
                evt.window.getView().addEventListener(GSceneWidget.TransformEvent, this._updateZoomFromWindow, this);
                this._updateView();
                this._updateZoomFromWindow();
                this._updateActiveWindowTab();
                break;
            case GWindows.WindowEvent.Type.Deactivated:
                evt.window.getView().removeEventListener(GSceneWidget.TransformEvent, this._updateZoomFromWindow, this);
                this._updateView();
                this._updateZoomFromWindow();
                this._updateActiveWindowTab();
                break;
            default:
                break;
        }
    };

    /**
     * @param {GWindow} window
     * @private
     */
    GHeader.prototype._addWindowTab = function (window) {
        $('<div></div>')
            .data('window', window)
            .addClass('tab')
            .append($('<span></span>')
                .addClass('title')
                .text(window.getTitle()))
            .append($('<span></span>')
                .addClass('close fa fa-times')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    gApp.getWindows().closeWindow($(this).parents('.tab').data('window'));
                }))
            .on('click', function () {
                gApp.getWindows().activateWindow($(this).data('window'));
            })
            .appendTo(this._htmlElement.find('.windows'));
    };

    /**
     * @param {GWindow} window
     * @private
     */
    GHeader.prototype._removeWindowTab = function (window) {
        this._htmlElement.find('.windows > .tab').each(function (index, element) {
            var $element = $(element);
            if ($element.data('window') === window) {
                $element.remove();
                return false;
            }
        });
    };

    /** @private */
    GHeader.prototype._updateActiveWindowTab = function () {
        this._htmlElement.find('.windows > .tab').each(function (index, element) {
            var $element = $(element);
            $element.toggleClass('g-active', $element.data('window') === gApp.getWindows().getActiveWindow());
        });
    };

    GHeader.prototype._createZoom = function () {
        var zoomLevels = [6, 12, 25, 50, 66, 100, 150, 200, 300, 400, 800, 1600, 3200, 6400];

        var select = $('<select></select>')
            .addClass('zoom')
            .append($('<option></option>'))
            .on('change', function () {
                var view = gApp.getWindows().getActiveWindow().getView();
                var scene = view.getScene();

                var zoomPoint = null;
                if (scene.getProperty('singlePage')) {
                    var pageBBox = scene.getActivePage().getGeometryBBox();
                    if (pageBBox && !pageBBox.isEmpty()) {
                        zoomPoint = pageBBox.getSide(GRect.Side.CENTER);
                    }
                }
                if (!zoomPoint) {
                    zoomPoint = view.getViewTransform().mapPoint(new GPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
                }

                view.zoomAt(zoomPoint, parseInt($(this).val()) / 100.0);
            });

        for (var z = 0; z < zoomLevels.length; ++z) {
            $('<option></option>')
                .text(zoomLevels[z].toString() + '%')
                .attr('value', zoomLevels[z])
                .appendTo(select);
        }

        return select;
    };

    /** @private */
    GHeader.prototype._updateZoomFromWindow = function () {
        var zoom = this._htmlElement.find('.view > .zoom');
        var window = gApp.getWindows().getActiveWindow();

        zoom
            .find('*').prop('disabled', !window);

        if (window) {
            var zoomLevel = GMath.round(window.getView().getZoom() * 100, false, 0);
            zoom
                .find('option:first-child')
                .text(zoomLevel.toString() + '%')
                .attr('value', zoomLevel);
            zoom.val(zoomLevel);
        }
    };

    GHeader.prototype._updateView = function () {
        this._htmlElement.find('.view').css('visibility', gApp.getWindows().getActiveWindow() ? '' : 'hidden');
    };

    _.GHeader = GHeader;
})(this);

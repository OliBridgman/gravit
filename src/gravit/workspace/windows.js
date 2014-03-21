(function (_) {
    /**
     * The global window container class
     * @class EXWindows
     * @extends GEventTarget
     * @constructor
     */
    function EXWindows(htmlElement) {
        this._htmlElement = htmlElement;
        this._windows = [];
    };
    GObject.inherit(EXWindows, GEventTarget);

    // -----------------------------------------------------------------------------------------------------------------
    // EXWindows.WindowEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a window event occurrs
     * @class EXWindows.WindowEvent
     * @extends GEvent
     * @constructor
     */
    EXWindows.WindowEvent = function (type, window) {
        this.type = type;
        this.window = window;
    };
    GObject.inherit(EXWindows.WindowEvent, GEvent);

    /**
     * Enumeration of window event types
     * @enum
     */
    EXWindows.WindowEvent.Type = {
        Added: 0,
        Removed: 1,
        Deactivated: 10,
        Activated: 11
    };

    /**
     * @type {EXWindows.WindowEvent.Type}
     */
    EXWindows.WindowEvent.prototype.type = null;

    /**
     * The affected window
     * @type {EXWindow}
     */
    EXWindows.WindowEvent.prototype.window = null;

    /** @override */
    EXWindows.WindowEvent.prototype.toString = function () {
        return "[Object EXWindows.WindowEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXWindows Class
    // -----------------------------------------------------------------------------------------------------------------      

    /**
     * @type {JQuery}
     * @private
     */
    EXWindows.prototype._htmlElement = null;

    /**
     * @type {Array<EXWindow>}
     * @private
     */
    EXWindows.prototype._windows = null;

    /**
     * @type {EXWindow}
     * @private
     */
    EXWindows.prototype._activeWindow = null;

    /**
     * @type {Array<Number>}
     * @private
     */
    EXWindows.prototype._viewMargin = null;

    /**
     * Returns a list of all opened windows
     * @return {Array<EXWindow>}
     */
    EXWindows.prototype.getWindows = function () {
        return this._windows;
    };

    /**
     * Returns the currently active window
     * @return {EXWindow}
     */
    EXWindows.prototype.getActiveWindow = function () {
        return this._activeWindow;
    };

    /**
     * Mark a given window as being the active one
     * @param {EXWindow} window may be null to only deactivate the current one
     */
    EXWindows.prototype.activateWindow = function (window) {
        if (window != this._activeWindow) {

            // If we have an active window, clear that one out, first
            if (this._activeWindow) {
                // Mark deactivated on document
                this._activeWindow.getDocument()._activeWindow = null;

                // Detach it's container
                this._activeWindow._container.detach();
            }

            // Check to activate the document properly if it was changed
            if (window === null) {
                gApp.activateDocument(null, true);
            } else if ((window && this._activeWindow && window.getDocument() !== this._activeWindow.getDocument()) || !this._activeWindow) {
                gApp.activateDocument(window.getDocument(), true);
            }

            var previousActiveWindow = this._activeWindow;
            this._activeWindow = window;

            // Send deactivation event after document change if we had an active window
            if (this._activeWindow && this.hasEventListeners(EXWindows.WindowEvent)) {
                this.trigger(new EXWindows.WindowEvent(EXWindows.WindowEvent.Type.Deactivated, previousActiveWindow));
            }

            // Activate the new window if we have any
            if (window) {
                // Mark as active on document
                window.getDocument()._activeWindow = window;

                // Attach container and relayout it
                this._htmlElement.append(window._container);
                this._relayoutWindow(window);
                window.getView().focus();

                // Send out an event
                if (this.hasEventListeners(EXWindows.WindowEvent)) {
                    this.trigger(new EXWindows.WindowEvent(EXWindows.WindowEvent.Type.Activated, window));
                }
            }
        }
    };

    /**
     * Add a new window for a given document
     * @param {EXDocument|EXWindow} source the source to add a window from
     * which can either be a document or a window. If it is a window, the
     * newly added window will be an exact clone of the source
     * @return {EXWindow}
     */
    EXWindows.prototype.addWindow = function (source) {
        var document = source instanceof EXWindow ? source.getDocument() : source;
        var window = this._addWindow(document);

        // If we have a source, copy it's settings
        if (source instanceof EXWindow) {
            var sourceView = source.getView();
            // TODO : Serialize/deserialize window settings instead
            window.getView().transform(sourceView.getScrollX(), sourceView.getScrollY(), sourceView.getZoom(), sourceView.getOrientation());
        }

        return window;
    };

    /**
     * Closes and removes a window. If the window to be closed
     * is the last window available for a document, then the
     * document will be closed as well
     * @param {EXWindow} window
     */
    EXWindows.prototype.closeWindow = function (window) {
        var document = window.getDocument();

        // If window is the active one, try to activate a previous one, first
        if (window === this._activeWindow) {
            var windowIndex = this._windows.indexOf(window);

            if (windowIndex > 0) {
                this.activateWindow(this._windows[windowIndex - 1]);
            } else if (windowIndex + 1 < this._windows.length) {
                this.activateWindow(this._windows[windowIndex + 1]);
            } else {
                this.activateWindow(null);
            }
        }

        // Remove from the document's windows
        document._windows.splice(document._windows.indexOf(window), 1);

        // Remove from our windows
        this._windows.splice(this._windows.indexOf(window), 1);

        // Remove the window's container once and forever
        window._container.remove();

        // Send out an event
        if (this.hasEventListeners(EXWindows.WindowEvent)) {
            this.trigger(new EXWindows.WindowEvent(EXWindows.WindowEvent.Type.Removed, window));
        }

        // If this was the only window for the document left,
        // then remove/close our document now
        if (document._windows.length === 0) {
            gApp.closeDocument(document);
        }
    };

    /**
     * Called from the workspace to initialize
     */
    EXWindows.prototype.init = function () {
        // TODO
    };

    /**
     * Called from the workspace to relayout
     */
    EXWindows.prototype.relayout = function (viewMargin) {
        this._viewMargin = viewMargin;
        if (this._activeWindow) {
            this._relayoutWindow(this._activeWindow);
        }
    };

    /**
     * Relayouts a given window to the current settings
     * @param {EXWindow} window
     * @private
     */
    EXWindows.prototype._relayoutWindow = function (window) {
        // TODO : Take care on ruler spacing
        var myWidth = this._htmlElement.width();
        var myHeight = this._htmlElement.height();
        window._container.width(myWidth);
        window._container.height(myHeight);
        window.getView().setViewMargin([this._viewMargin[0] + EXWindow.VIEW_PADDING,
            this._viewMargin[1] + EXWindow.VIEW_PADDING, this._viewMargin[2] + EXWindow.VIEW_PADDING,
            this._viewMargin[3] + EXWindow.VIEW_PADDING]);
        window.getView().resize(myWidth, myHeight);
    };

    /**
     * Internal adding of a new window
     * @param {EXDocument} document
     * @returns {EXWindow}
     * @private
     */
    EXWindows.prototype._addWindow = function (document) {
        var window = new EXWindow(document);

        // Add and trigger
        document._windows.push(window);
        this._windows.push(window);

        // Send out an event
        if (this.hasEventListeners(EXWindows.WindowEvent)) {
            this.trigger(new EXWindows.WindowEvent(EXWindows.WindowEvent.Type.Added, window));
        }

        // Mark the window being active
        this.activateWindow(window);

        // Return the new window
        return window;
    };

    _.EXWindows = EXWindows;
})(this);

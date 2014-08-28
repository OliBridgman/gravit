(function (_) {
    /**
     * The global window container class
     * @class GWindows
     * @extends GEventTarget
     * @constructor
     */
    function GWindows(htmlElement) {
        this._htmlElement = htmlElement;
        this._windows = [];
    };
    IFObject.inherit(GWindows, GEventTarget);

    // -----------------------------------------------------------------------------------------------------------------
    // GWindows.WindowEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a window event occurrs
     * @class GWindows.WindowEvent
     * @extends GEvent
     * @constructor
     */
    GWindows.WindowEvent = function (type, window) {
        this.type = type;
        this.window = window;
    };
    IFObject.inherit(GWindows.WindowEvent, GEvent);

    /**
     * Enumeration of window event types
     * @enum
     */
    GWindows.WindowEvent.Type = {
        Added: 0,
        Removed: 1,
        Deactivated: 10,
        Activated: 11
    };

    /**
     * @type {GWindows.WindowEvent.Type}
     */
    GWindows.WindowEvent.prototype.type = null;

    /**
     * The affected window
     * @type {GWindow}
     */
    GWindows.WindowEvent.prototype.window = null;

    /** @override */
    GWindows.WindowEvent.prototype.toString = function () {
        return "[Object GWindows.WindowEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GWindows Class
    // -----------------------------------------------------------------------------------------------------------------      

    /**
     * @type {JQuery}
     * @private
     */
    GWindows.prototype._htmlElement = null;

    /**
     * @type {Array<GWindow>}
     * @private
     */
    GWindows.prototype._windows = null;

    /**
     * @type {GWindow}
     * @private
     */
    GWindows.prototype._activeWindow = null;

    /**
     * @type {Array<Number>}
     * @private
     */
    GWindows.prototype._viewOffset = null;

    /**
     * Returns a list of all opened windows
     * @return {Array<GWindow>}
     */
    GWindows.prototype.getWindows = function () {
        return this._windows;
    };

    /**
     * Returns the currently active window
     * @return {GWindow}
     */
    GWindows.prototype.getActiveWindow = function () {
        return this._activeWindow;
    };

    /**
     * Mark a given window as being the active one
     * @param {GWindow} window may be null to only deactivate the current one
     */
    GWindows.prototype.activateWindow = function (window) {
        if (window != this._activeWindow) {

            // If we have an active window, clear that one out, first
            if (this._activeWindow) {
                // Notify the window
                this._activeWindow.deactivate();

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
            if (this._activeWindow && this.hasEventListeners(GWindows.WindowEvent)) {
                this.trigger(new GWindows.WindowEvent(GWindows.WindowEvent.Type.Deactivated, previousActiveWindow));
            }

            // Activate the new window if we have any
            if (window) {
                // Notify the window
                this._activeWindow.activate();

                // Mark as active on document
                window.getDocument()._activeWindow = window;

                // Attach container and relayout it
                this._htmlElement.append(window._container);
                this._relayoutWindow(window);
                window.getView().focus();

                // Send out an event
                if (this.hasEventListeners(GWindows.WindowEvent)) {
                    this.trigger(new GWindows.WindowEvent(GWindows.WindowEvent.Type.Activated, window));
                }
            }
        }
    };

    /**
     * Add a new window for a given document
     * @param {GDocument|GWindow} source the source to add a window from
     * which can either be a document or a window. If it is a window, the
     * newly added window will be an exact clone of the source
     * @return {GWindow}
     */
    GWindows.prototype.addWindow = function (source) {
        var document = source instanceof GWindow ? source.getDocument() : source;
        var window = this._addWindow(document);

        // If we have a source, copy it's settings
        if (source instanceof GWindow) {
            var sourceView = source.getView();
            // TODO : Serialize/deserialize window settings instead
            window.getView().transform(sourceView.getScrollX(), sourceView.getScrollY(), sourceView.getZoom());
        } else {
            // Otherwise let view zoom the active page
            window.getView().zoomActivePage();
        }

        return window;
    };

    /**
     * Closes and removes a window. If the window to be closed
     * is the last window available for a document, then the
     * document will be closed as well
     * @param {GWindow} window
     */
    GWindows.prototype.closeWindow = function (window) {
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
        if (this.hasEventListeners(GWindows.WindowEvent)) {
            this.trigger(new GWindows.WindowEvent(GWindows.WindowEvent.Type.Removed, window));
        }

        // Release window
        window.release();

        // If this was the only window for the document left,
        // then remove/close our document now
        if (document._windows.length === 0) {
            gApp.closeDocument(document);
        }
    };

    /**
     * Called from the workspace to initialize
     */
    GWindows.prototype.init = function () {
        // TODO
    };

    /**
     * Called from the workspace to relayout
     */
    GWindows.prototype.relayout = function (viewOffset) {
        this._viewOffset = viewOffset ? viewOffset : this._viewOffset;
        if (this._activeWindow) {
            this._relayoutWindow(this._activeWindow);
        }
    };

    /**
     * Relayouts a given window to the current settings
     * @param {GWindow} window
     * @private
     */
    GWindows.prototype._relayoutWindow = function (window) {
        // TODO : Take care on ruler spacing
        var myWidth = this._htmlElement.width();
        var myHeight = this._htmlElement.height();
        window._container.width(myWidth);
        window._container.height(myHeight);
        window.getView().setViewOffset(this._viewOffset);
        var oldW = window.getView().getWidth();
        var oldH = window.getView().getHeight();
        window.getView().resize(myWidth, myHeight);
        if (oldW != null && oldH != null && (oldW != myWidth || oldH != myHeight)) {
            window.getView().scrollBy((oldW - myWidth) / 2, (oldH - myHeight) / 2);
        }
    };

    /**
     * Internal adding of a new window
     * @param {GDocument} document
     * @returns {GWindow}
     * @private
     */
    GWindows.prototype._addWindow = function (document) {
        var window = new GWindow(document);

        // Add and trigger
        document._windows.push(window);
        this._windows.push(window);

        // Send out an event
        if (this.hasEventListeners(GWindows.WindowEvent)) {
            this.trigger(new GWindows.WindowEvent(GWindows.WindowEvent.Type.Added, window));
        }

        // Mark the window being active
        this.activateWindow(window);

        // Return the new window
        return window;
    };

    _.GWindows = GWindows;
})(this);

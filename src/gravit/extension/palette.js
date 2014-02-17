(function (_) {

    /**
     * Base class for an palette
     * @class EXPalette
     * @extends GEventTarget
     * @constructor
     */
    function EXPalette() {
        this._documentStates = [];
    };
    GObject.inherit(EXPalette, GEventTarget);

    EXPalette.GROUP_PROPERTIES = 'properties';
    EXPalette.GROUP_COLOR = 'color';
    EXPalette.GROUP_STRUCTURE = 'structure';

    // -----------------------------------------------------------------------------------------------------------------
    // EXPalette.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the palette requires an update like changed
     * title or enabled status
     * @class EXPalette.UpdateEvent
     * @extends GEvent
     * @constructor
     */
    EXPalette.UpdateEvent = function () {
    };
    GObject.inherit(EXPalette.UpdateEvent, GEvent);

    /** @override */
    EXPalette.UpdateEvent.prototype.toString = function () {
        return "[Object EXPalette.UpdateEvent]";
    };

    EXPalette.UPDATE_EVENT = new EXPalette.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // EXPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A class that keeps a Palette-State for each document
     * @class EXPalette.DocumentState
     * @constructor
     */
    EXPalette.DocumentState = function (document) {
        this.document = document;
    };

    /**
     * @type {EXDocument}
     */
    EXPalette.DocumentState.prototype.document = null;

    /**
     * Called whenever this state gets activated
     */
    EXPalette.DocumentState.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called whenever this state gets deactivated
     */
    EXPalette.DocumentState.prototype.deactivate = function () {
        // NO-OP
    };

    /**
     * Called when this state gets initialized
     */
    EXPalette.DocumentState.prototype.init = function () {
        // NO-OP
    };

    /**
     * Called when this state gets released
     */
    EXPalette.DocumentState.prototype.release = function () {
        // NO-OP
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXPalette Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<EXPalette.DocumentState>}
     * @private
     */
    EXPalette.prototype._documentStates = null;

    /**
     * @type {JQuery}
     * @private
     */
    EXPalette.prototype._disabledLayer = null;

    /**
     * Get the unique id of the palette.
     */
    EXPalette.prototype.getId = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the title of the palette
     * @return {String|GLocale.Key}
     */
    EXPalette.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the default group of the palette, null for none
     * @return {String}
     */
    EXPalette.prototype.getGroup = function () {
        return null;
    };

    /**
     * Get the default shortcut of the palette to activate it
     * @return {Array<Number>}
     * @version 1.0
     */
    EXPalette.prototype.getShortcut = function () {
        return null;
    };

    /**
     * Whether the palette is enabled or. Note that this
     * will only disable the palette's panel so if the
     * palette provides a custom menu, the enabled status
     * of those needs to be manually managed by the palette.
     * @return {Boolean}
     */
    EXPalette.prototype.isEnabled = function () {
        return true;
    };

    /**
     * Called to let the palette initialize on a given panel
     * and within a given menu if any
     * @param {HTMLDivElement} htmlElement the panel
     * @param {GUIMenu} menu the menu
     * @version 1.0
     */
    EXPalette.prototype.init = function (htmlElement, menu) {
        gApp.addEventListener(EXApplication.DocumentEvent, this._documentEvent, this);
    };

    /**
     * Should create a new state for a given document if desired.
     * @param {EXDocument} document
     * @return {EXPalette.DocumentState}
     * @private
     */
    EXPalette.prototype._createDocumentState = function (document) {
        return null;
    };

    /**
     * Called whenever a given document state should be activated
     * @param {EXPalette.DocumentState} state
     * @private
     */
    EXPalette.prototype._activateDocumentState = function (state) {
        return null;
    };

    /**
     * Called whenever a given document state should be deactivated
     * @param {EXPalette.DocumentState} state
     * @private
     */
    EXPalette.prototype._deactivateDocumentState = function (state) {
        return null;
    };

    /**
     * @param {EXApplication.DocumentEvent} event
     * @private
     */
    EXPalette.prototype._documentEvent = function (event) {
        switch (event.type) {
            case EXApplication.DocumentEvent.Type.Added:
                // Initiate a new state and add it
                var state = this._createDocumentState(event.document);
                if (state) {
                    state.init();
                    this._documentStates.push(state);

                    this.trigger(EXPalette.UPDATE_EVENT);
                }
                break;
            case EXApplication.DocumentEvent.Type.Removed:
                // Find and release state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.release();
                    this._documentStates.splice(this._documentStates.indexOf(state), 1);

                    this.trigger(EXPalette.UPDATE_EVENT);
                }
                break;
            case EXApplication.DocumentEvent.Type.Activated:
                // Find and activate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.activate();
                    this._activateDocumentState(state);

                    this.trigger(EXPalette.UPDATE_EVENT);
                }
                break;
            case EXApplication.DocumentEvent.Type.Deactivated:
                // Find and deactivate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.deactivate();
                    this._deactivateDocumentState(state);

                    this.trigger(EXPalette.UPDATE_EVENT);
                }
                break;

            default:
                break;
        }
    };

    /**
     * @param {EXDocument} document
     * @return {EXPalette.DocumentState}
     * @private
     */
    EXPalette.prototype._findDocumentState = function (document) {
        for (var i = 0; i < this._documentStates.length; ++i) {
            if (this._documentStates[i].document === document) {
                return this._documentStates[i];
            }
        }
    };

    /** @override */
    EXPalette.prototype.toString = function () {
        return "[Object EXPalette]";
    };

    _.EXPalette = EXPalette;
})(this);
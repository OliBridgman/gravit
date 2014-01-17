(function (_) {

    /**
     * @class GUIKey
     * @constructor
     * @version 1.0
     */
    function GUIKey() {
    };

    /**
     * Enumeration of available key code constants
     * @version 1.0
     */
    GUIKey.Constant = {
        /**
         * A printable character
         * @version 1.0
         */
        CHARACTER: 0,

        /**
         * Space key
         * @version 1.0
         */
        SPACE: 1,

        /**
         * Enter key
         * @version 1.0
         */
        ENTER: 2,

        /**
         * Tab key
         * @version 1.0
         */
        TAB: 3,

        /**
         * Backspace key
         * @version 1.0
         */
        BACKSPACE: 4,

        /**
         * Control key
         * @version 1.0
         */
        CONTROL: 5,

        /**
         * Shift key
         * @version 1.0
         */
        SHIFT: 6,

        /**
         * Alt key
         * @version 1.0
         */
        ALT: 7,

        /**
         * Left arrow
         * @version 1.0
         */
        LEFT: 8,

        /**
         * Up arrow
         * @version 1.0
         */
        UP: 9,

        /**
         * Right arrow
         * @version 1.0
         */
        RIGHT: 10,

        /**
         * Down arrow
         * @version 1.0
         */
        DOWN: 11,

        /**
         * Page-up key
         * @version 1.0
         */
        PAGE_UP: 12,

        /**
         * Page-down key
         * @version 1.0
         */
        PAGE_DOWN: 13,

        /**
         * Home/POS1 key
         * @version 1.0
         */
        HOME: 14,

        /**
         * End key
         * @version 1.0
         */
        END: 15,

        /**
         * Insert key
         * @version 1.0
         */
        INSERT: 16,

        /**
         * Delete key
         * @version 1.0
         */
        DELETE: 17,

        /**
         * Escape key
         * @version 1.0
         */
        ESCAPE: 18,

        /**
         * Command key
         * @version 1.0
         */
        COMMAND: 19,

        /**
         * Function Key 'F1'
         */
        F1: 30,

        /**
         * Function Key 'F2'
         */
        F2: 31,

        /**
         * Function Key 'F3'
         */
        F3: 32,

        /**
         * Function Key 'F4'
         */
        F4: 33,

        /**
         * Function Key 'F5'
         */
        F5: 34,

        /**
         * Function Key 'F6'
         */
        F6: 35,

        /**
         * Function Key 'F7'
         */
        F7: 36,

        /**
         * Function Key 'F8'
         */
        F8: 37,

        /**
         * Function Key 'F9'
         */
        F9: 38,

        /**
         * Function Key 'F10'
         */
        F10: 39,

        /**
         * Function Key 'F11'
         */
        F11: 40,

        /**
         * Function Key 'F12'
         */
        F12: 41,

        // Special identifiers

        /**
         * Meta key (command on mac, control on others)
         * @version 1.0
         */
        META: 100,

        /**
         * Option key (mostly alt)
         * @version 1.0
         */
        OPTION: 101,

        /**
         * Remove key (backspace on mac, del on others)
         */
        REMOVE: 102
    };

    GUIKey.prototype.translateKey = function (keyCode) {
        var result = null;
        switch (keyCode) {
            case 32 :
                result = GUIKey.Constant.SPACE;
                break;
            case 13 :
                result = GUIKey.Constant.ENTER;
                break;
            case 9 :
                result = GUIKey.Constant.TAB;
                break;
            case 8 :
                result = GUIKey.Constant.BACKSPACE;
                break;
            case 16 :
                result = GUIKey.Constant.SHIFT;
                break;
            case 17:
                result = GUIKey.Constant.CONTROL;
                break;
            case 18:
                result = GUIKey.Constant.ALT;
                break;
            case 37 :
                result = GUIKey.Constant.LEFT;
                break;
            case 38 :
                result = GUIKey.Constant.UP;
                break;
            case 39 :
                result = GUIKey.Constant.RIGHT;
                break;
            case 40 :
                result = GUIKey.Constant.DOWN;
                break;
            case 33 :
                result = GUIKey.Constant.PAGE_UP;
                break;
            case 34 :
                result = GUIKey.Constant.PAGE_DOWN;
                break;
            case 36 :
                result = GUIKey.Constant.HOME;
                break;
            case 35 :
                result = GUIKey.Constant.END;
                break;
            case 45 :
                result = GUIKey.Constant.INSERT;
                break;
            case 46 :
                result = GUIKey.Constant.DELETE;
                break;
            case 27 :
                result = GUIKey.Constant.ESCAPE;
                break;
            case 112 :
                result = GUIKey.Constant.F1;
                break;
            case 113 :
                result = GUIKey.Constant.F2;
                break;
            case 114 :
                result = GUIKey.Constant.F3;
                break;
            case 115 :
                result = GUIKey.Constant.F4;
                break;
            case 116 :
                result = GUIKey.Constant.F5;
                break;
            case 117 :
                result = GUIKey.Constant.F6;
                break;
            case 118 :
                result = GUIKey.Constant.F7;
                break;
            case 119 :
                result = GUIKey.Constant.F8;
                break;
            case 120 :
                result = GUIKey.Constant.F9;
                break;
            case 121 :
                result = GUIKey.Constant.F10;
                break;
            case 122 :
                result = GUIKey.Constant.F11;
                break;
            case 123 :
                result = GUIKey.Constant.F12;
                break;
            default:
                break;
        }

        if (result == null) {
            result = String.fromCharCode(keyCode);
        }

        return result;
    };

    GUIKey.prototype.transformKey = function (keyCode) {
        if (keyCode === GUIKey.Constant.META || keyCode === GUIKey.Constant.COMMAND) {
            if (gSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS && gSystem.hardware === GSystem.Hardware.Desktop) {
                return GUIKey.Constant.COMMAND;
            } else {
                return GUIKey.Constant.CONTROL;
            }
        } else if (keyCode === GUIKey.Constant.OPTION) {
            return GUIKey.Constant.ALT;
        } else if (keyCode === GUIKey.Constant.REMOVE) {
            if (gSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS) {
                return GUIKey.Constant.BACKSPACE;
            } else {
                return GUIKey.Constant.DELETE;
            }
        } else {
            return keyCode;
        }
    };

    GUIKey.prototype.toLocalizedName = function (keyCode) {
        keyCode = this.transformKey(keyCode);
        return gLocale.getValue(GUIKey, "key." + keyCode.toString());
    };

    GUIKey.prototype.toLocalizedShort = function (keyCode) {
        // Handle special chars on mac
        if (gSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS && gSystem.hardware === GSystem.Hardware.Desktop) {
            if (keyCode == GUIKey.Constant.ESCAPE) {
                return '\u238B';
            } else if (keyCode == GUIKey.Constant.TAB) {
                return '\u21E5';
            } else if (keyCode == GUIKey.Constant.OPTION || keyCode == GUIKey.Constant.ALT) {
                return '\u2325';
            } else if (keyCode == GUIKey.Constant.META || keyCode == GUIKey.Constant.COMMAND) {
                return '\u2318';
            } else if (keyCode == GUIKey.Constant.SHIFT) {
                return '\u21E7';
            } else if (keyCode == GUIKey.Constant.CONTROL) {
                return '\u2303';
            } else if (keyCode == GUIKey.Constant.SPACE) {
                return '\u2423';
            } else if (keyCode == GUIKey.Constant.ENTER) {
                return '\u23CE';
            } else if (keyCode == GUIKey.Constant.REMOVE) {
                return '\u232B';
            } else if (keyCode == GUIKey.Constant.UP) {
                return '\u2191';
            } else if (keyCode == GUIKey.Constant.DOWN) {
                return '\u2193';
            } else if (keyCode == GUIKey.Constant.LEFT) {
                return '\u2190';
            } else if (keyCode == GUIKey.Constant.RIGHT) {
                return '\u2192';
            }
        }

        keyCode = this.transformKey(keyCode);
        var name = gLocale.getValue(GUIKey, "key." + keyCode.toString() + ".short", null);
        if (!name) {
            return gLocale.getValue(GUIKey, "key." + keyCode.toString());
        } else {
            return name;
        }
    };

    GUIKey.prototype.toSystemShortcut = function (character) {
        if (gSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS && gSystem.hardware === GSystem.Hardware.Desktop) {
            if (character === '-') {
                return '\u2212';
            } else if (character === '+') {
                return '\u002B';
            }
        }
        return character.toUpperCase();
    }

    GUIKey.prototype.shortcutToString = function (shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                // On platform others than mac we'll use a separator
                if (gSystem.operatingSystem != GSystem.OperatingSystem.OSX_IOS) {
                    result += "+";
                }
            }
            if (typeof shortcut[i] == 'number') {
                result += this.toLocalizedShort(shortcut[i]);
            } else {
                // Return uppercase chars
                result += this.toSystemShortcut(shortcut[i]);
            }
        }
        return result;
    };

    _.GUIKey = GUIKey;
    _.guiKey = new GUIKey();
})(this);
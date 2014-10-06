(function (_) {

    /**
     * @class IFSystem
     * @constructor
     * @version 1.0
     */
    function IFSystem() {
    };

    /**
     * @enum
     * @version 1.0
     */
    IFSystem.OperatingSystem = {
        /**
         * Linux/unix based operating system
         * @type {Number}
         * @version 1.0
         */
        Unix: 0,

        /**
         * Windows based operating system
         * @type {Number}
         * @version 1.0
         */
        Windows: 1,

        /**
         * OSX/IOS based operating system
         * @type {Number}
         * @version 1.0
         */
        OSX_IOS: 2
    };

    /**
     * @enum
     * @version 1.0
     */
    IFSystem.Hardware = {
        /**
         * PC/Laptop based hardware
         * @type {Number}
         * @version 1.0
         */
        Desktop: 0,

        /**
         * Tablet based hardware
         * @type {Number}
         * @version 1.0
         */
        Tablet: 1,

        /**
         * Phone based hardware
         * @type {Number}
         * @version 1.0
         */
        Phone: 2
    };

    /**
     * Property defining whether the system is in little endian (true)
     * or in big endian (false) mode
     * @type {Boolean}
     * @version 1.0
     */
    IFSystem.littleEndian = true;

    /**
     * Property defining the operating system type
     * @type {Number}
     * @see IFSystem.OperatingSystem
     * @version 1.0
     */
    IFSystem.operatingSystem = null;

    /**
     * Property defining the hardware type
     * @type {Number}
     * @see IFSystem.Hardware
     * @version 1.0
     */
    IFSystem.hardware = null;

    /**
     * Property defining the system's language
     * @type {String}
     * @version 1.0
     */
    IFSystem.language = null;

    // Test little/big-endian using typed arrays
    IFSystem.littleEndian = (function () {
        var testBuffer = new ArrayBuffer(8);
        var testArray = new Uint32Array(testBuffer);
        testArray[1] = 0x0a0b0c0d;
        return !(testBuffer[4] === 0x0a && testBuffer[5] === 0x0b && testBuffer[6] === 0x0c && testBuffer[7] === 0x0d);
    })();

    IFSystem.hardware = (function () {
        var tablet = !!navigator.userAgent.match(/(iPad|SCH-I800|xoom|kindle)/i);
        var phone = !!navigator.userAgent.match(/(iPhone|iPod|blackberry|android 0.5|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i);

        if (tablet) {
            return IFSystem.Hardware.Tablet;
        } else if (phone) {
            return IFSystem.Hardware.Phone;
        } else {
            return IFSystem.Hardware.Desktop;
        }
    })();

    IFSystem.operatingSystem = (function () {
        var os_data = [
            { string: navigator.platform, subString: "Win", identity: IFSystem.OperatingSystem.Windows },
            { string: navigator.platform, subString: "Mac", identity: IFSystem.OperatingSystem.OSX_IOS },
            { string: navigator.userAgent, subString: "iPhone", identity: IFSystem.OperatingSystem.OSX_IOS },
            { string: navigator.userAgent, subString: "iPad", identity: IFSystem.OperatingSystem.OSX_IOS },
            { string: navigator.userAgent, subString: "Android", identity: IFSystem.OperatingSystem.Unix },
            { string: navigator.platform, subString: "Linux", identity: IFSystem.OperatingSystem.Unix }
        ];

        for (var i = 0; i < os_data.length; i++) {
            var dataString = os_data[i].string;
            if (dataString.indexOf(os_data[i].subString) != -1) {
                return os_data[i].identity;
            }
        }

        return IFSystem.OperatingSystem.Windows;
    })();

    IFSystem.language = (function () {
        var lang = ((navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage) || '').split("-");

        if (lang.length == 2) {
            return  lang[0].toLowerCase();
        } else if (lang) {
            return lang[0].toLowerCase();
        }

        return null;
    })();

    console.log('HW=' + IFSystem.hardware + '; OS=' + IFSystem.operatingSystem + '; LANG=' + IFSystem.language);

    _.IFSystem = IFSystem;
})(this);
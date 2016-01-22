var BookIt = BookIt || {};

BookIt.Session = (function () {
    var instance;

    function init() {

        return {
            // Public methods and variables.
            set: function (sessionData) {
                window.localStorage.setItem(BookIt.Settings.sessionIdKey, JSON.stringify(sessionData));
            },

            get: function () {

                var result = null;

                try {
                    result = JSON.parse(window.localStorage.getItem(BookIt.Settings.sessionIdKey));
                } catch(e){}

                return result;
            }
        };
    };

    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
}());
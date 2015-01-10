(function () {
    'use strict';
    String.prototype.format = function () {
        var s = this,
            i = arguments.length - 1;
        while (i > -1) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
            i = i - 1;
        }
        return s;
    };
    /**
     * String functionality to add equality check by ignoring the case,
     * by converting to upper case.
     *
     * @param {type} compareStr The string to compare to.
     * @returns {Boolean}   The values are not equal.
     */
    String.prototype.equalsIgnoreCase = function (compareStr) {
        var s = this;
        if (compareStr === null || typeof compareStr !== 'string') {
            return false;
        }
        return s.toUpperCase() === compareStr.toUpperCase();
    };
    String.prototype.startsWith = function (prefix) {
        return this.indexOf(prefix, 0) !== -1;
    };
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
    /**
     * Will pad a string with zeros (or whatever p is)
     *
     * @param {number} s  The number of digits to retain
     * @param {String} p (Optional) the padding character
     *
     * @returns {String} The padded string.
     */
    String.prototype.padTo = function (s, p) {
        p = p || '0';
        return (this.length < s) ? p + this.padTo(s - 1, p) : this;
    };
    Date.prototype.toISOString = function () {
        return new XDate(this).toString('u');
    };
    
    String.prototype.parseQueryString = function() {
        var queryString = {};
        this.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) { queryString[$1] = $3; }
        );
        return queryString;
    };
    
})();

function findPropertyByName (val, names, newValue) {
    names = names.split('.');
    while (val && names.length) {
        if (newValue) {
            val[ _.first(names) ] = (names.length === 1) ? newValue : {};
        }
        val = val[ names.shift() ];
    }

    return val;
}

// This will be a static for the page - modify to get it once and cache (global function)
function getScrollbarWidth () {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    document.body.appendChild(outer);
    var widthNoScroll = outer.offsetWidth;
    outer.style.overflow = "scroll";
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);
    var widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    return widthNoScroll - widthWithScroll;
}

/*
 * Will prevent the <-- BACKSPACE from causing a navigation to occur in some browser
 */
// TODO: jQuery Dependency
var $ = $ | false;
if($) {
    $(document).unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' && (
                d.type.toUpperCase() === 'TEXT' ||
                d.type.toUpperCase() === 'PASSWORD' ||
                d.type.toUpperCase() === 'FILE' ||
                d.type.toUpperCase() === 'EMAIL' ||
                d.type.toUpperCase() === 'NUMBER'
                )) || d.tagName.toUpperCase() === 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }
        if (doPrevent) {
            event.preventDefault();
        }
    });

    function isIE10 () {
        return $('.ie10').length > 0;
    }
}


(function (log4javascript) {
    var logRoot = log4javascript.getRootLogger();
    logRoot.removeAllAppenders();
    logRoot.addAppender(new log4javascript.BrowserConsoleAppender());
    var level = log4javascript.Level.WARN;
    var index = window.location.href.indexOf('log_level=');
    if (index >= 0) {
        var l_str = window.location.href.substring(index + 10);
        if (l_str.indexOf('&') > 0) {
            l_str = l_str.substring(0, l_str.indexOf('&'));
        }
        level = log4javascript.Level[l_str.trim()];
        console.log("Configuring default logging level to " + l_str);
    }
    logRoot.setLevel(level);
})(log4javascript);


function isValidDate (d) {
    return _.isDate(d);
}

// copyright 1999 Idocs, Inc. http://www.idocs.com
// Distribute this script freely but keep this notice in place
function numbersonly (myfield, e) {
// TODO: Probably should rewrite as a filter
    var key;
    var keychar;
    if (window.event) {
        key = window.event.keyCode;
    } else if (e) {
        key = e.which;
    } else {
        return true;
    }
    keychar = String.fromCharCode(key);
    if ((key === null) || (key === 0) || (key === 8) ||
        (key === 9) || (key === 13) || (key === 27)) {
        return true;
    } else if ((("0123456789").indexOf(keychar) > -1)) {
        return true;
    } else if (keychar === ".") {
        var value = myfield.value; // does not include keypress value
        return (value.split('.').length - 1) < 1;
    }

    return false;
}


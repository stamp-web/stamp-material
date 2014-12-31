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

var Operation = {
    EQUALS: 'eq',
    NOT_EQUALS: 'ne',
    OR: 'or',
    AND: 'and',
    IS_NULL: 'is null',
    LESS_THAN: 'lt',
    LESS_THAN_EQUALS: 'le',
    GREATER_THAN: 'gt',
    GREATER_THAN_EQUALS: 'ge',
    /**
     * Whether a defined operation is unary or binary.  Will return true
     * if the operation only supports a subject with no value.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is an unary operation.
     */
    isUnary: function (op) {
        var value = false;
        if (op === Operation.IS_NULL) {
            value = true;
        }
        return value;
    },
    /**
     * Whether a defined operation is a logical operator or not.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is a logical operation.
     */
    isLogical: function (op) {
        return (op === Operation.AND || op === Operation.OR);
    }
};
var Predicate = function (config)
{
    if (!config) {
        config = {};
    }
    this.subject = config.subject;
    this.value = config.value;
    this.operator = (config.operator) ? config.operator : Operation.EQUALS;
    /**
     * Will serialie the predicate to an ODATA compliant serialized string.
     *
     * @return {String} The compliant ODATA query string
     */
    this.serialize = function () {
        var retValue = '';
        if (this.operator) {
            if (this.subject === undefined) {
                throw {
                    key: 'INVALID_SUBJECT',
                    msg: 'The subject is required and is not specified.'
                };
            }
            if (Operation.isLogical(this.operator) && (!(this.subject instanceof Predicate ||
                this.value instanceof Predicate) || this.subject instanceof Predicate && this.value === undefined)) {
                throw {
                    key: 'INVALID_LOGICAL',
                    msg: 'The predicate does not represent a valid logical expression.'
                };
            }
            retValue = '(' + ((this.subject instanceof Predicate) ? this.subject.serialize() : this.subject) + ' ' + this.operator;
            if (!Operation.isUnary(this.operator)) {
                if (this.value === undefined) {
                    throw {
                        key: 'INVALID_VALUE',
                        msg: 'The value was required but was not defined.'
                    };
                }
                retValue += ' ';
                if (angular.isString(this.value)) {
                    retValue += '\'' + this.value + '\'';
                } else if (angular.isNumber(this.value) || typeof this.value === 'boolean') {
                    retValue += this.value;
                } else if (this.value instanceof Predicate) {
                    retValue += this.value.serialize();
                } else if (angular.isDate(this.value)) {
                    retValue += 'datetimeoffset\'' + this.value.toISOString() + '\'';
                }
                else {
                    throw {
                        key: 'UNKNOWN_TYPE',
                        msg: 'Unsupported value type: ' + (typeof this.value)
                    };
                }

            }
            retValue += ')';
        }
        return retValue;
    };
    return this;
};
/**
 * Return a logical expression using the specified predicates and the specified operation.  If more than two
 * predicates or config objects are defined they will continue to be chained with the specified logial operator
 * into a compound expression.
 *
 * @param {Operation} op (optional) The operation.
 * @param {Predicate[]|Object[]} predicates The predicates to serve as the values in the logical expression.
 *
 * @return {Predicate} A new predicate representing the logical expression.
 */
Predicate.logical = function (op) {
    if (op === null || !Operation.isLogical(op)) {
        throw {
            key: 'INVALID_LOGICAL',
            msg: 'The predicates are not valid for a logial expression.'
        };
    }
    var left = angular.isArray(arguments[1]) ? arguments[1].shift() : arguments[1];
    var args = angular.isArray(arguments[1]) ? arguments[1] : Array.prototype.slice.apply(arguments).slice(2, arguments.length);
    var len = args.length;
    for (var i = 0; i < len; i++) {
        var right = args[i];
        left = new Predicate({
            subject: left,
            operator: op,
            value: right
        });
    }
    return left;
};
/**
 * Generate a like predicate expression for the specified field and value.
 *
 * @param (String} field the field.
 * @param (Object) value the object to compare to
 *
 * @return {Predicate} a like expression predicate.
 */
Predicate.like = function (field, value) {
    var p = new Predicate({
        subject: 'substringof(\'' + value + '\',' + field + ')',
        operator: Operation.EQUALS,
        value: true
    });
    return p;
};
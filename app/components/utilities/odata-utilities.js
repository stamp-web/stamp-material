//(function(angular) {

    "use strict";

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

Predicate.fromModel = function (model) {
    var searchParams = [];
    for (var name in model) {
        if (angular.isObject(model[name])) {
            if (_.has(model[name], 'id')) {
                searchParams.push(new Predicate({
                    subject: name,
                    operator: Operation.EQUALS,
                    value: model[name].id
                }));
            } else {
                for (var subName in model[name]) {
                    if (angular.isString(model[name][subName])) {
                        var v = model[name][subName];
                        var date = new Date(v);
                        if (isValidDate(date)) {
                            v = date;
                        }
                        searchParams.push(new Predicate({
                            subject: name,
                            operator: (subName === 'start') ? Operation.GREATER_THAN_EQUALS : Operation.LESS_THAN_EQUALS,
                            value: v
                        }));
                    }
                }
            }

        } else if (_.has(model, name)) {
            if (angular.isDefined(model[name])) {
                var v2 = model[name];
                if (typeof v2 === 'boolean') {
                    v2 = (v2) ? 1 : 0;
                }
                else if (!isNaN(v2)) {
                    v2 = +v2;
                    if (v2 < 0) {
                        continue;
                    }
                }
                searchParams.push(new Predicate({
                    subject: name,
                    value: v2
                }));
            }
        }
    }
    return searchParams;
};

    var ODataParser = function() {
        var REGEX = {

            parenthesis: /([(](.*)[)])$/,
            andor: /^(.*) (or|and) (.*)$/,
            op: /(\w*) (eq|gt|lt|ge|le|ne) (datetimeoffset'(.*)'|'(.*)'|[0-9]*)/,
            startsWith: /^startswith[(](.*),'(.*)'[)]/,
            endsWith: /^endswith[(](.*),'(.*)'[)]/,
            contains: /^contains[(](.*),'(.*)'[)]/
        } ;


        function buildLike(match,key) {
            var right = (key === 'startsWith') ? match[2] + '*' : (key === 'endsWith') ? '*' + match[2] : '*' + match[2] + '*';
            if( match[0].charAt(match[0].lastIndexOf(')')-1) === "\'") {
                right = "\'" + right + "\'";
            }
            return new Predicate({
                subject: match[1],
                operator: 'like',
                value: right
            });
        }
        return {
            /**
             * Given a structure of predicates flatten it to a flat array (if the predicate subject exists create an array of the predicates).
             * This will remove any logical operations and result only value binary predicates (equals, less than etc.)
             *
             * @param predicates  predicate object.
             * @return flattened array.
             */
                // NOT SURE IF WE NEED THIS YET
            /*
            flatten: function(predicate) {
                var val = [];
                if( predicate ) {
                    if( Operation.isLogical(predicate.operator) && predicate.subject instanceof Predicate && predicate.value instanceof Predicate) {
                        var appendIt = function(arr, v) {
                            var found = false;

                            for(var i = 0; i < arr.length; i++ ) {
                                if( found ) {
                                    break;
                                }
                                if( angular.isArray(v)) {
                                    for(var j = 0; j < v.length; j++ ) {
                                        found = appendIt(arr, v[j]) || found;
                                        if( found ) {
                                            break;
                                        }
                                    }
                                } else if( v instanceof Predicate) {
                                    var p = arr[i];
                                    if( angular.isArray(p)) {
                                        p = p[0];
                                    }
                                    else if( p.subject === v.subject) {
                                        var sa = [];
                                        sa.push(p);
                                        sa.push(v);
                                        arr[i] = sa;
                                        found = true;
                                    }

                                } else {
                                        console.log("v was neither a predicate nor an array!");
                                        console.log(v);
                                    }
                            }
                            if( !found ) {
                                if( angular.isArray(v)) {
                                    for(var j = 0; j < v.length; j++ ) {
                                        found = appendIt(arr, v[j]) || found;
                                    }
                                } else if( v instanceof Predicate) {
                                    arr.push(v);
                                    found = true;
                                }

                            }
                            return found;
                        }
                        appendIt(val, this.flatten(predicate.subject));
                        appendIt(val, this.flatten(predicate.value));

                    } else {
                        val.push(predicate);
                    }
                }
                return val;

            },*/

            parse: function(filter) {
                var that = this;
                var obj = {};
                if( !angular.isString(filter)) {
                    return obj;
                }
                if( filter ) {
                    filter = filter.trim();
                }
                var found = false;
                _.each(REGEX, function (regex, key) {
                    if (found) {
                        return;
                    }

                    var match = filter.match(regex);
                    if (match) {
                        found = true;
                        switch (regex) {
                            case REGEX.parenthesis:
                                var s = match.length > 2 ? match[2] : match[1];
                                var fnMatch;
                                if( (fnMatch = filter.match(REGEX.startsWith)) !== null) {
                                    obj = buildLike(fnMatch,"startsWith");
                                    break;
                                } else if( (fnMatch = filter.match(REGEX.endsWith)) !== null) {
                                    obj = buildLike(fnMatch,"endsWith");
                                    break;
                                } else if ( (fnMatch = filter.match(REGEX.contains)) !== null) {
                                    obj = buildLike(fnMatch,"contains");
                                    break;
                                }
                                obj = that.parse(s);
                                // If the "(" is not the first character, we need to process the left side and then substitute the right side
                                if( filter.indexOf(s) !== 1) {
                                    var d_s = filter.substring(0,filter.indexOf(s) -1);
                                    var d_obj = that.parse(d_s + " $TEMP$");
                                    d_obj.value = obj;
                                    obj = d_obj;
                                }
                                break;
                            case REGEX.andor:
                                obj = new Predicate({
                                    subject: that.parse(match[1]),
                                    operator: match[2],
                                    value: that.parse(match[3])
                                });
                                break;
                            case REGEX.op:
                                obj = new Predicate({
                                    subject: match[1],
                                    operator: match[2],
                                    value: ( match[3].indexOf('\'') === -1) ? +match[3] : match[3]
                                });
                                break;
                        }
                    }
                });
                //logger.debug(obj);
                return obj;
            }
        };
    }



//})(angular);


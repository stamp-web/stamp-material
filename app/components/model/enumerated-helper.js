(function(angular) {
    "use strict";

    angular.module("stampweb.model.enumerated-helper",[])
        .constant("CurrencyCode", function() {
            function getValues() {
                return [ this.USD, this.CAD, this.EUR, this.GBP, this.JPY, this.AUS];
            }
            return {
                USD: { value: 'USD', text: 'USD ($)'},
                EUR: { value: 'EUR', text: 'EUR (€)'},
                CAD: { value: 'CAD', text: 'CAD (C$)'},
                GBP: { value: 'GBP', text: 'GBP (£)'},
                JPY: { value: 'JPY', text: 'JPY (¥)'},
                AUS: { value: 'AUS', text: 'AUS (A$)'},
                values: getValues
            }
        }())
        .constant("Condition", function () {
            function getValues() {
                return [this.MINT, this.MINT_NH, this.MINT_NG, this.USED, this.CTO];
            }
            return {
                MINT: {ordinal: 0, text: "Mint"},
                MINT_NH: {ordinal: 1, text: "Mint (NH)"},
                MINT_NG: {ordinal: 4, text: "Mint no gum"},
                USED: {ordinal: 2, text: "Used"},
                CTO: {ordinal: 3, text: "Cancel to order"},
                values: getValues
            };
        }())
        .constant("Grade", function() {
            function getValues() {
                return [this.XF, this.VF, this.FVF, this.F, this.VG, this.D, this.CTS];
            }
            return {
                XF: {ordinal: 0, text: 'Extra-Fine (XF)'},
                VF: {ordinal: 1, text: 'Very-Fine (VF)'},
                FVF: {ordinal: 2, text: 'Fine-Very-Fine (FVF)'},
                F: {ordinal: 3, text: 'Fine (F)'},
                VG: {ordinal: 4, text: 'Very-Good (VG)'},
                D: {ordinal: 5, text: 'Damaged (D)'},
                CTS: {ordinal: 6, text: 'Cut-to-shape (CTS)'},
                values: getValues
            }
        }())
        .directive("currencySelector", function($compile, CurrencyCode) {
            return {
                restrict: 'E',
                require: '^ngModel',
                scope: true,
                link: function(scope,el,attrs) {
                    scope.currency = CurrencyCode.values();
                    var showLabel = (attrs.showLabel && attrs.showLabel === 'true');
                    var tmpl = showLabel ? '<div class="selector-wrapper" label-transform><label class="select">Currency</label>\n' : '' +
                        '<md-select ng-model="' + attrs.ngModel + '" class="currency-selector">\n' +
                        '   <md-option ng-value="c.value" ng-repeat="c in currency">{{ ::c.text }}</md-option>\n' +
                        '</md-select>' + (showLabel ? '</div>' : '');
                    var elm = $compile(tmpl)(scope);
                    el.replaceWith(elm);
                }
            }
        })
        .directive("gradeSelector", function($compile, Grade) {
            return {
                restrict: 'E',
                require: '^ngModel',
                scope: true,
                link: function(scope,el,attrs) {
                    scope.grades = Grade.values();
                    var tmpl = '<div class="selector-wrapper" label-transform><label>Grade</label>\n' +
                        '<md-select ng-model="' + attrs.ngModel + '" class="grade-selector">\n' +
                        '   <md-option ng-value="g.ordinal" ng-repeat="g in grades">{{ ::g.text }}</md-option>\n' +
                        '</md-select></div>';
                    var elm = $compile(tmpl)(scope);
                    el.replaceWith(elm);
                }
            }
        })
        .directive("conditionSelector", function($compile, Condition, $timeout) {
           return {
               restrict: 'E',
               require: '^ngModel',
               scope: true,
               link: function(scope,el,attrs) {
                   scope.conditions = Condition.values();

                   var tmpl = '<div class="selector-wrapper" label-transform><label>Condition</label>\n' +
                           '<md-select ng-model="' + attrs.ngModel + '" class="condition-selector">\n' +
                           '   <md-option ng-value="cond.ordinal" ng-repeat="cond in conditions">{{ ::cond.text }}</md-option>\n' +
                           '</md-select></div>';
                   var elm = $compile(tmpl)(scope);

                   el.replaceWith(elm);
               }
           }
        })
        .directive("labelTransform", function($timeout) {
            return {
                restrict: 'A',
                scope: true,
                link: function(scope,el,attrs) {
                    var select = el.find('md-select');
                    var selectLabel = el.find('md-select-label');
                    var m = select.attr('ng-model');
                    var placeholder = select.attr('placeholder');
                    scope.$watch(m, function (newValue, oldValue) {
                        $timeout(function () {
                            el.find('label').show();
                            if (newValue !== undefined && newValue !== oldValue) {
                                el.find('label').removeClass('no-select');
                            } else if (selectLabel.text() !== placeholder) {
                                el.find('label').addClass('no-select');
                            } else {
                                el.find('label').hide();
                            }
                        }, 0, false);
                    });
                }
            }
        });

})(angular);
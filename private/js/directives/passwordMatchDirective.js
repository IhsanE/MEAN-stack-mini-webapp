angular.module('sampleApp', []).directive('passwordMatch', ['$rootScope', function ($rootScope) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var otherValue = $rootScope.$$childTail.regForm[attrs.passwordMatch].$viewValue;
                if (otherValue != undefined) {
                    var v = viewValue == otherValue;
                    $rootScope.$$childTail.regForm[attrs.passwordMatch].$parsers[0](
                        $rootScope.$$childTail.regForm[attrs.passwordMatch].$viewValue
                    );
                    ctrl.$setValidity('passwordmatch', v);
                } else {
                    ctrl.$setValidity('passwordmatch', true);
                }
                return viewValue;
            });
            ctrl.$parsers.unshift(function (viewValue) {
                var v = viewValue == $rootScope.$$childTail.regForm[attrs.passwordMatch].$viewValue;
                ctrl.$setValidity('passwordmatch', v);
                return viewValue;
            });
        }
    }
}])

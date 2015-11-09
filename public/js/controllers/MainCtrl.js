mainApp.controller('MainController', function($scope, $http, $window) {
	$scope.showRegister = false;
	$scope.showRegister = false;
	$scope.showHome = true;
	$scope.registrationSuccessful = false;
	$scope.registrationFailure = false;
	$scope.loginFailure = false;
	$scope.Password = '';
	$scope.ConfirmPassword = '';

	$scope.currentView = "/views/home.html";

	$scope.home_page = function(){
		$scope.showHome = true;
		$scope.showRegister = false;
		$scope.showLogin = false;
	}

	$scope.register_form = function(){
		$scope.showRegister = true;
		$scope.showLogin = false;
		$scope.showHome = false;
	}

	$scope.login_form = function(){
		$scope.showRegister = false;
		$scope.showLogin = true
		$scope.showHome = false;
	}

	$scope.login = function(){

		var data = {
			email : $scope.Email,
			password : $scope.Password
		};

		$http({
	    	method: 'POST',
			url: '/login',
			data: data
		})
		.then(function successCallback(response) {
		    console.log("Success");
		    console.log(response);
			$scope.loginFailure = false;
			// Get the new index.html file based on user type (admin, normal, super)
			$window.location.reload();
	    	// this callback will be called asynchronously
	    	// when the response is available
		  	},
		function errorCallback(response) {
			console.log("Failure");
			console.log(response);
			$scope.loginFailure = true;
	    	// called asynchronously if an error occurs
	    	// or server returns response with an error status.
	  	});
	}

	$scope.register = function(){

		var data = {
			first : $scope.First,
			email : $scope.Email,
			description: $scope.Description,
			password : $scope.Password
		};

		$http({
	    	method: 'POST',
			url: '/register',
			data: data
		})
		.then(function successCallback(response) {
		    console.log("Success");
		    console.log(response);
	    	$scope.registrationSuccessful = true;
			$scope.registrationFailure = false;
		  	},
		function errorCallback(response) {
			console.log("Failure");
			console.log(response);
			$scope.registrationFailure = true;
			$scope.registrationSuccessful = false;
	    	// called asynchronously if an error occurs
	    	// or server returns response with an error status.
	  	});
	}
});

angular.module('MainCtrl', []).controller('MainController', function($scope, $http, $window, Upload, $timeout) {
    $scope.showProfile = false;
    $scope.showAggregate = false;
    $scope.showPeople = true;
    $scope.file = null;
    $scope.image = 0;
    $scope.first = '';
    $scope.editOtherDict = {};

    $scope.logLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                console.log(pos.coords.latitude);
                console.log(pos.coords.longitude);

                data = {
                    lat : pos.coords.latitude,
                    long: pos.coords.longitude
                };

                $http({
                        method: 'POST',
                        url: '/logLocation',
                        data: data
                    });
            });
        }
    }

    $scope.editOther = function(pos) {
        $scope.editOtherDict[pos] = false;
    }

    $scope.submitEditOther = function(pos) {
        $scope.editOtherDict[pos] = true;
        console.log($scope.collection[pos]);

        data = {
            first: $scope.collection[pos].first,
            last: $scope.collection[pos].last,
            email: $scope.collection[pos].email,
            description: $scope.collection[pos].description
        };

        $http({
                method: 'POST',
                url: '/updateOtherProfileData',
                data: data
            })
            .then(function successCallback(response) {
                    console.log("Success");
                    console.log(response);
                    $scope.getUserList();
                    // this callback will be called asynchronously
                    // when the response is available
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.getUserList = function() {
        $http({
                method: 'GET',
                url: '/UserList'
            })
            .then(function successCallback(response) {
                    console.log("Success");
                    $scope.collection = response.data;
                    console.log($scope.collection);
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);

                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.getProfileData = function() {
        $http({
                method: 'GET',
                url: '/ProfileData'
            })
            .then(function successCallback(response) {
                    console.log("Success");
                    if (response.data.data != "failure") {
                        var data = response.data[0];
                        console.log(response);
                        $scope.email = data.email;
                        $scope.first = data.first;
                        $scope.last = data.last;
                        $scope.description = data.description;
                        $scope.type = data.type;
                        console.log($scope.first);
                    }
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);

                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.getUserList();

    $scope.profile_form = function() {
        console.log("show profile");
        $scope.showAggregate = false;
        $scope.showPeople = false;
        $scope.showProfile = true;

        $scope.getProfileData();
    }

    $scope.aggregate_form = function() {
        $scope.showPeople = false;
        $scope.showProfile = false;
        $scope.showAggregate = true;

        $scope.getAggregatedData();
    }

    $scope.people_form = function() {
        $scope.showPeople = true;
        $scope.showProfile = false;
        $scope.showAggregate = false;

        $scope.getUserList();
    }

    $scope.getAggregatedData = function() {
        $http({
                method: 'GET',
                url: '/GetAggregatedData'
            })
            .then(function successCallback(response) {
                    console.log("Success");
                    if (response.data != "failure") {
                        console.log(response.data);
                        $scope.GLOBAL_URLS = [];
                        $scope.GLOBAL_LOCATIONS = response.data.locations;

                        // Remove non numeric values
                        // Organize data into a list of JSON to be sortable
                        for (var key in response.data.urls){
                            data = {
                                "url" : key,
                                "value" : response.data.urls[key]
                            };
                            if (typeof(data.value) == "number")
                                $scope.GLOBAL_URLS.push(data);
                        }
                    }
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);

                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.changeDisplayPicture = function(fileList) {
        $scope.file = fileList[0];
        var fd = new FormData();
        fd.append('upload', $scope.file);
        console.log("this is yourfile");
        console.log($scope.file);
        if ($scope.file) {
            var fd = new FormData();
            fd.append('file', $scope.file);
            $http.post("/changeProfilePic", fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                })
                .success(function() {
                    $scope.image += 1;
                })
                .error(function() {
                    $scope.image += 1;
                });

        }
    }

    $scope.updateProfile = function() {
        data = {
            first: $scope.first,
            last: $scope.last,
            email: $scope.email,
            description: $scope.description
        };

        $http({
                method: 'POST',
                url: '/updateProfileData',
                data: data
            })
            .then(function successCallback(response) {
                    console.log("Success");
                    console.log(response);
                    $window.location.reload();
                    // this callback will be called asynchronously
                    // when the response is available
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }



    $scope.delete = function(index) {
        var email = $scope.collection[index].email;
        $http({
                method: 'POST',
                url: '/DeleteUser',
                data: {
                    email: email
                }
            })
            .then(function successCallback(response) {
                    $scope.getUserList();
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);

                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.promote = function(index) {
        var email = $scope.collection[index].email;
        $http({
                method: 'POST',
                url: '/PromoteUser',
                data: {
                    email: email
                }
            })
            .then(function successCallback(response) {
                    $scope.getUserList();
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);

                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.demote = function(index) {
        var email = $scope.collection[index].email;
        $http({
                method: 'POST',
                url: '/DemoteUser',
                data: {
                    email: email
                }
            })
            .then(function successCallback(response) {
                    $scope.getUserList();
                },
                function errorCallback(response) {
                    console.log("Failure");
                    console.log(response);

                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    }

    $scope.getProfileData();
    $scope.logLocation();
});

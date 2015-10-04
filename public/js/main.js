var app = angular.module('Illuminatify', []);

app.controller('IlluminatifyController', ["$scope", "$document", "$compile", "$timeout", "IlluminatifyDataService",
    function ($scope, $document, $compile, $timeout, IlluminatifyDataService) {
        $scope.status = "Search";
        $scope.illuminaughtyArray = [];
        
        $scope.search = function () {
            var searchText = $scope.searchText;
            searchText = encodeURIComponent(searchText.trim());
            if (searchText != '') {
            $scope.status = "Loading";
            IlluminatifyDataService.getData(searchText)
                .then(function (result) {
                    $scope.status = "Results";
                    $scope.illuminaughtyArray = result.data;
                }, function () {
                    $scope.searchText = '';
                    $scope.status = "Search";   
                })
            }
        }
        $scope.feelingIlluminaughty = function () {
            console.log(102);
        }
        
        $scope.searchAgain = function() {
            $scope.searchText = '';
            $scope.status = "Search";
        }
    }]);

app.factory("IlluminatifyDataService", ["$http", "$q", function ($http, $q) {
    var _data = [];

    var _getData = function (searchTerm) {
        var deferred = $q.defer();
        $http.get("/search/" + searchTerm)
            .then(function (result) {
                //success
                _data = result.data;
                deferred.resolve(_data);
            }, function () {
                // error
                deferred.reject();
            });
        return deferred.promise;
    }
    return {
        data: _data,
        getData: _getData
    };
}]);

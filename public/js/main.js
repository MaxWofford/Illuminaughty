var app = angular.module('Illuminatify', []);

app.controller('IlluminatifyController', ["$scope", "$document", "$compile", "$timeout", "IlluminatifyDataService",
    function ($scope, $document, $compile, $timeout, IlluminatifyDataService) {
        console.log(101);
        IlluminatifyDataService.getData("Data")
            .then(function(result) {
                console.log(result);
            }, function() {
                console.log("Error");
            })
    }]);
app.factory("IlluminatifyDataService", ["$http", "$q", function ($http, $q) {
	var _data = [];			

    var _getData = function (searchTerm) {
        var deferred = $q.defer();
        console.log(102);
        $http.get("/search/" + searchTerm)
            .then(function (result) {
                //success
                console.log(result);
                angular.copy(result.data, _data);
                deferred.resolve(_data);
            },
            function () {
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

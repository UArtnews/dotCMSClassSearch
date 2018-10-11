// JavaScript Document
var myApp = angular.module("myApp", ['ngRoute', 'ui', 'ui.grid', 'ui.grid.saveState']);

myApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/class-search/',
            {
                templateUrl: 'templates/list-view.html',
                controller: 'CourseListCtrl'
            }
        ).
            when('/class-search/mode/:mode/',
            {
                templateUrl: 'templates/list-view.html',
                controller: 'CourseListCtrl'
            }
        ).
            when('/class-search/term/:term/',
            {
                templateUrl: 'templates/list-view.html',
                controller: 'CourseListCtrl'
            }
        ).
             when('/class-search/online/:online/',
            {
                templateUrl: 'templates/list-view.html',
                controller: 'CourseListCtrl'
            }
        ).
            otherwise({redirectTo: '/class-search'});
    }]);


myApp.factory('myService', function($http, $q, $log, $rootScope) {
    return {
        getData: function() {
            //console.log('calling data');
            $rootScope.loading = true;
            //create our deferred object.
            var deferred = $q.defer();
            //make the call.
            $http({method: 'GET', url: 'data/courses.json'}).success(function(data, status, headers, config) {
                //$log.info(data, status, headers(), config);
                //when data is returned resolve the deferment.
                deferred.resolve(data);
    			//console.log(data);

                $rootScope.loading = false;
            }).error(function(){
                //or reject it if there's a problem.
                deferred.reject();
            });
            //return the promise that work will be done.
            return deferred.promise;
        }
    }
});

myApp.factory('courseService', function($http, $q, $log, $rootScope) {
    return {
        getData: function(id) {
            $rootScope.loading = true;
            //create our deferred object.
            var deferred = $q.defer();
            //make the call.
            $http({method: 'GET', url: 'data/course.dot?id='+id}).success(function(data, status, headers, config) {
                //$log.info(data, status, headers(), config);
                //when data is returned resolve the deferment.
                deferred.resolve(data);

                $rootScope.loading = false;
            }).error(function(){
                //or reject it if there's a problem.
                //$log.info(data, status, headers(), config);
                deferred.reject();
            });
            //return the promise that work will be done.
            return deferred.promise;
        }
    }
});

myApp.directive('showForm', function($location) {
    if($location.path() == '/class-search/:term?'){
        return true;
    }
    else {
        return false;
    }
});

myApp.directive('listing', function($compile) {
    return {
        restrict: "A",
        replace: true,
        link: function(scope, element, attrs) {
            var html = "<div>There are no courses found for this search term</div>";
            var template = angular.element(html);
            var templateFn = $compile(template);
            templateFn(scope);
        }
    }
});


myApp.service('filterCustom', function() {
        this.filter = function (searchObj) {
            //build and return a filter object
            if(searchObj.mode == "all"){
                var modeval = "";
            }
            else {
                var modeval = searchObj.mode;
            }

            if(searchObj.term == "all"){
                var termval = "";
            }
            else {
                var termval = searchObj.term;
            }
            if(searchObj.career == "all"){
                var careerval = "";
            }
            else {
                var careerval = searchObj.career;
            }


                    var filter =  {'Term' : termval, "Instruction_Mode" : modeval};
                    return filter;
        };
});


myApp.filter('setcareer', function() {
    return function (input, field, regex) {
        if (input && regex !== undefined) {
            var patt = new RegExp('^' + regex);
            var out = [];
            for (var i = 0; i < input.length; i++) {
                if (patt.test(input[i][field])) {
                    out.push(input[i]);
                }
            }
            return out;
        }
        else {
            return input;
        }
    }
});

/* Controllers */
var courseListCtrl = myApp.controller('CourseListCtrl', function($scope, $location, $routeParams, $route, myService, filterCustom, $http, $filter, uiGridConstants) {
$scope.myData = null;
    myService.getData().then(function (data) {
        //console.log($routeParams);
        $scope.data = data;
        $scope.dataArrived = true;
        $scope.datarows = true;
        if($routeParams.term){
            //console.log('term param is set');
            re = new RegExp($routeParams.term, 'i');
            var termItems = [];
            //console.log(re);
            if($routeParams.term != 'all'){
                angular.forEach(data, function(item){
                    if(item.Term.match(re)){
                        termItems.push(item);
                    }
                    $scope.myData = termItems;
                    if(termItems.length == 0){
                        $scope.datarows = false;
                    }
                    else {
                        $scope.datarows = true;
                    }
                });
            }
            else {
                $scope.myData = data;
                $scope.datarows = true;
            }
        }
        else if($routeParams.online){
            //console.log('term param is set');
            re = new RegExp($routeParams.online, 'i');
            var termItems = [];
            //console.log(re);
            if($routeParams.online != 'all'){
                angular.forEach(data, function(item){
                    if(item.Term.match(re)){
                        //console.log(item);
                        if(item.Instruction_Mode=="WW") {
                            termItems.push(item);
                        }
                    }
                     $scope.myData = termItems;
                     $scope.mode.value = "online";
                     $scope.term.value = $routeParams.online;
                     $scope.searchObj.mode = "WW";
                     $scope.searchObj.term = $routeParams.online;
                      if($scope.searchObj.term == 'fall'){
                            $scope.termMessage = "Classes for the next fall term will be available for viewing in mid-March.";
                        }
                        else if($scope.searchObj.term == 'spring'){
                            $scope.termMessage = "Classes for the next spring term will be available for viewing in October.";
                        }
                        else if($scope.searchObj.term == 'summer'){
                            $scope.termMessage = "Classes for the next summer term will be available for viewing in late February or early March.";
                        }
                    if(termItems.length == 0){
                        $scope.datarows = false;
                    }
                    else {
                        $scope.datarows = true;
                    }
                });
            }
            else {
                $scope.myData = data;
                $scope.datarows = true;
            }
        }
        else if($routeParams.mode == "w"){
            console.log("it is w mode");
            var imode = "WW";
            var modeItems = [];
            $scope.mode.value = "online";
            $scope.searchObj.mode = "WW";
            angular.forEach(data, function(item){
                //console.log(item.Instruction_Mode);
                if(item.Instruction_Mode == imode){
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        }
        else if($routeParams.mode == "wfall"){
            console.log("it is w mode");
            var imode = "WW";
            var modeItems = [];
            $scope.mode.value = "online";
            $scope.term.value = "fall";
            $scope.searchObj.mode = "WW";
            $scope.searchObj.term = "fall";
            angular.forEach(data, function(item){
                //console.log(item.Term);
                if(item.Instruction_Mode == imode){
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        }
        else {
            //console.log("no term or mode");
            $scope.myData = data;
        }
        $scope.gridOptions.data = $scope.myData;
        return $scope.myPromise = true;
    });

    $scope.filterOptions = {
        filterText: '',
        useExternalFilter: false
    };

//    load up the grid options here
//    var custHeaderRowTemplate = '<div ng-style="{\'z-index\': col.zIndex()}" ng-class="{\'col_select\': col.showSortButtonDown(), \'col_select_up\': col.showSortButtonUp() }" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    //set up grid options for ng-grid
    var custField = '<div class="ngCellText colt{{$index}}">{{row.getProperty(col.field)}}</div>';
    $scope.gridOptions = {
        data: $scope.myData,
        columnDefs: [
            {field: 'Id', visible: false, width: 0},
            {field: 'Title', displayName: 'Title', width: '260',
                enableFiltering: true,
                cellTemplate: '<div><a href="#course-detail/{{row.entity[\'Id\']}}" data-backdrop="true" data-toggle="modal" data-target="#model-1">{{row.entity[col.field]}}</a></div>',
				
			},
            
            {field: 'Career', visible: false, enableFiltering: false, enableSorting: true},
            {field: 'Term', displayName: 'Term', enableFiltering: false},
            {field: 'Course', displayName: 'Course Number'},
            {field: 'Start_Time', displayName: 'Start Time', enableFiltering: false},
            {field: 'Days', visible: true, enableFiltering: false, enableSorting: true},
            {field: 'Start_Date', displayName: 'Start Date'},
            {field: 'Instruction_Mode', visible: false}
        ],
        sortInfo: {fields: ['Title'], directions: ['asc']},
        enableFiltering: true,
        enableSorting: true,
        enablePaging: false,
        showGridFooter: true,
        multiSelect: false,
        showColumnMenu: false,
        pagingOptions: $scope.pagingOptions,
        showFilter: false,
        displaySelectionCheckbox: false,
        onRegisterApi: function(gridApi){
            $scope.gridApi = gridApi;
        }
    };
    $scope.state = {};

    $scope.searchObj = {
        career: "all",
        term: "all",
        mode: "all"
    };

//    set the filterText to blank to start with


    $scope.field = {
        type: "title"
    };

    $scope.term = {
        'value': 'all'
    };

    $scope.mode = {
        'value': 'all'
    };

    $scope.career = {
        'value': 'all'
    };

    if($scope.searchObj.term == 'fall'){
        $scope.termMessage = "Classes for the next fall term will be available for viewing in mid-March.";
    }
    else if($scope.searchObj.term == 'spring'){
        $scope.termMessage = "Classes for the next spring term will be available for viewing in October.";
    }
    else if($scope.searchObj.term == 'summer'){
        $scope.termMessage = "Classes for the next summer term will be available for viewing in late February or early March.";
    }

    var init = function () {
        if ($routeParams.term) {
            var thisTerm = $routeParams.term;
            $scope.searchObj.term = $routeParams.term;
            $scope.term.value = thisTerm.charAt(0).toUpperCase() + thisTerm.slice(1);
            //console.log($scope.term.value);
            $scope.newTermValue($routeParams.term);
        }
    };

    $scope.saveState = function() {
        $scope.state = $scope.gridApi.saveState.save();
    };

    $scope.restoreState = function() {
        $scope.gridApi.saveState.restore( $scope, $scope.state );
    };

    $scope.newCareerValue = function(value) {
        //console.log(value);
        var thisData = $scope.data;
        $scope.career.value = value;
        if(value == "undergraduate") {
            var icareer = "Undergraduate";
            var careerItems = [];
            $scope.searchObj.career = "Undergraduate";
            angular.forEach(thisData, function (item) {
                //console.log(item.Career);
                if (item.Career == icareer) {
                    careerItems.push(item);
                }
                });
            }
                else if(value == "graduate") {
                    var icareer = "Graduate";
                    var careerItems = [];
                    $scope.searchObj.career = "Graduate";
                    angular.forEach(thisData, function (item) {
                    if (item.Career == icareer) {
                        careerItems.push(item);
                    }
                });
            }
                else if(value == "law") {
                    var icareer = "Law";
                    var careerItems = [];
                    $scope.searchObj.career = "Law";
                    angular.forEach(thisData, function (item) {
                        if (item.Career == icareer) {
                            careerItems.push(item);
                        }
                    });
            }
                else if(value == "all") {
                    var icareer = "";
                    var careerItems = [];
                    $scope.searchObj.career = value;
                    careerItems = $scope.data;
            }
            var filter = filterCustom.filter($scope.searchObj);
            $scope.myData = careerItems;
            $scope.gridOptions.data = $filter('filter')( $scope.myData, filter  , undefined );
        };


    $scope.newModeValue = function(value){
        //console.log(value);
        if(value == "online"){
            $scope.mode.value = "online";
            var imode = "WW";
            var modeItems = [];
            $scope.searchObj.mode = "WW";
            angular.forEach($scope.data, function(item){
                if(item.Instruction_Mode == imode){
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        }
        else if(value == "traditional"){
            $scope.mode.value = "traditional";
            var imode = "P";
            var modeItems = [];
            $scope.searchObj.mode = "P";
            angular.forEach($scope.data, function(item){
                if(item.Instruction_Mode == imode){
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        }
        else {
            $scope.mode.value = "all";
            $scope.searchObj.mode = "";
            $scope.myData = $scope.data;
        }
        var filter = filterCustom.filter($scope.searchObj);
        //console.log($scope.myData);
        $scope.gridOptions.data = $filter('filter')( $scope.myData, filter  , undefined );
    };


    $scope.newTermValue = function(value){
        $scope.term.value = value;
        $scope.searchObj.term = value;
        if(value == 'fall'){
            $scope.termMessage = "Classes for the next fall term will be available for viewing in mid-March.";
        }
        else if(value == 'spring'){
            $scope.termMessage = "Classes for the next spring term will be available for viewing in October.";
        }
        else if(value == 'summer'){
            $scope.termMessage = "Classes for the next summer term will be available for viewing in late February or early March.";
        }
       if($scope.myData){
           $scope.myData = $scope.data;
       }
        var filter = filterCustom.filter($scope.searchObj);
        //console.log(filter);
        $scope.gridOptions.data = $filter('filter')( $scope.myData, filter  , undefined );
        if($scope.gridOptions.data == null){
            $scope.datarows = false;
            console.log($scope.gridOptions.data);
            console.log($scope.datarows);
        }
        else if($scope.gridOptions.data.length < 1){
            $scope.datarows = false;
            console.log($scope.datarows);
        }
        else {
            $scope.datarows = true;
            console.log($scope.gridOptions.data.length);
        }
    };



    $scope.newTypeValue = function(value) {
        //console.log('loading new type: ' + value);
        $scope.field.type = value;

    };

    $scope.isList = function(list){
        if(list === undefined){
            return "nothing";
        }
        else if(list.length > 0){
            return true;
        }
        else {
            //     console.log('none');
            return "none";
        }
    };

    $scope.changeView = function(view){
        $location.path(view); // path not hash
        //myApp.getCourse();
    };

    // fire on controller loaded
    init();


});


var courseDetailCtrl = myApp.controller('CourseDetailCtrl', function ($scope, courseService, $routeParams) {
$scope.currCourse = {};
    courseService.getData($routeParams.Id).then(function (data) {
        $scope.dataArrived = true;
        $scope.currCourse = data;
        return $scope.currCourse;
    });
    //console.log($routeParams.Id);
    $scope.courseId = $routeParams.Id;


});


myApp.directive('daysofweek', function() {
    return {
        replace: true,
        scope: {
            days: "@"
        },
        template: '<p>Days: <span>{{day_string}}</span></p>',
        link: function (scope, element, attrs) {
            attrs.$observe('days', function(val) {
                var new_days = [];
                var days_array = val.split(' ');
                var dayslength = days_array.length;
                for (var i = 0; i < dayslength; i++){
                    if(days_array[i] === 'M'){
                        new_days.push('Monday');
                    }
                    else if(days_array[i] === 'T'){
                        new_days.push('Tuesday');
                    }
                    else if(days_array[i] === 'W'){
                        new_days.push('Wednesday');
                    }
                    else if(days_array[i] === 'Th'){
                        new_days.push('Thursday');
                    }
                    else if(days_array[i] === 'F'){
                        new_days.push('Friday');
                    }
                    else {
                        new_days.push(days_array[i]);
                    }
                }
                scope.day_string = new_days.join(", ");
            });
        }
    }
});

//myApp.directive('setId', function() {
//    return {
//        scope: {
//            restrict: A;
//            controller: function(){
//                return scope.courseId;
//            }
//        }
//    }
//});
var myApp = angular.module("myApp", ['ngRoute', 'ui', 'ui.grid', 'ui.grid.saveState', 'ui.grid.grouping']);

myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/class-search/', {
        templateUrl: 'templates/list-view.html',
        controller: 'CourseListCtrl'
    }).
    when('/class-search/mode/:mode/', {
        templateUrl: 'templates/list-view.html',
        controller: 'CourseListCtrl'
    }).
    when('/class-search/term/:term/', {
        templateUrl: 'templates/list-view.html',
        controller: 'CourseListCtrl'
    }).
    when('/course-detail/:Id', {
        templateUrl: 'templates/course-detail.html',
        controller: 'CourseDetailCtrl',
    }).
    otherwise({
        redirectTo: '/class-search'
    });
}]);


myApp.factory('myService', function($http, $q, $log, $rootScope) {
    return {
        getData: function() {

            $rootScope.loading = true;
            //create our deferred object.
            var deferred = $q.defer();
            //make the call.
            $http({
                method: 'GET',
                url: 'data/courses.json'
            }).success(function(data, status, headers, config) {
                // $log.info(data, status, headers(), config);
                //when data is returned resolve the deferment.
                deferred.resolve(data);

                $rootScope.loading = false;
            }).error(function() {
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
            $http({
                method: 'GET',
                url: 'data/course.dot?id=' + id
            }).success(function(data, status, headers, config) {
                //$log.info(data, status, headers(), config);
                //when data is returned resolve the deferment.
                deferred.resolve(data);

                $rootScope.loading = false;
            }).error(function() {
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
    if ($location.path() == '/class-search/:term?') {
        return true;
    } else {
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
    this.filter = function(searchObj) {
          //build and return a filter object
            if (searchObj.mode == "all") {
                var modeval = "";
            } else {
                var modeval = searchObj.mode;
            }
            if (searchObj.term == "all") {
                var termval = "";
            } else {
                var termval = searchObj.term;
            }
            if (searchObj.career == "all") {
                var careerval = "";
            } else {
                var careerval = searchObj.career;
            }
                    //"Career" : careerval
    
            var filter = {
                'Term': termval,
                "Instruction_Mode": modeval
            };
            
            return filter;
        };
});
myApp.service('cleanDataFilter', function() {
        this.filter = function(cData,sItem,itemType) {
                if(sItem == "all"){return cData;}
              //build and return a filter object
                var searchItem = sItem;
                var dupItems = [];
                angular.forEach(cData, function(item) {
                   if (item[itemType] == searchItem) {
                       dupItems.push(item);
                   }
                });
                return dupItems;
        };
});




myApp.filter('setcareer', function() {
//++++++++++++++++++++++++++++++++TODO is this being used?+++++++++++++++++++++++++++++++++
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
var courseListCtrl = myApp.controller('CourseListCtrl', function($scope, $location, $routeParams, $route, myService, $http, filterCustom, cleanDataFilter, $filter, uiGridConstants, uiGridGroupingConstants, $timeout) {



    $scope.myData = null;
    myService.getData().then(function(data) {

        $scope.data = data;
        $scope.dataCache = data;
        $scope.dataArrived = true;
        $scope.datarows = true;


        if ($routeParams.term) {
            re = new RegExp($routeParams.term, 'i');
            var termItems = [];
            if ($routeParams.term != 'all') {
                angular.forEach(data, function(item) {
                    if (item.Term.match(re)) {
                        termItems.push(item);
                    }
                    $scope.myData = termItems;
                    if (termItems.length == 0) {
                        $scope.datarows = false;
                    } else {
                        $scope.datarows = true;
                    }
                });
            } else {
                $scope.myData = data;
                $scope.datarows = true;
            }
        } else if ($routeParams.mode == "w") {
            var imode = "WW";
            var modeItems = [];
            $scope.mode.value = "online";
            $scope.searchObj.mode = "WW";
            angular.forEach(data, function(item) {

                if (item.Instruction_Mode == imode) {
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        } else {

            $scope.myData = data;
        }
        $scope.gridOptions.data = $scope.myData;

        //+++++++++++++++++++++++++++RESET AND SAVING FILTER FLAGS++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $scope.gridOptions.saveSort = true;
        $scope.gridOptions.saveFilter = true;
        $scope.resetState = function() {
            clearLocalStorage('gridState', '/', '');
            clearLocalStorage('gridCustomFilters', '/', '');//+++CUSTOM FILTER BUTTONS STORAGE+++
            restoreState($scope);
            $scope.gridApi.grid.clearAllFilters();
            //+++++++++++++++++++++++++++++CUSTOM FILTER BUTTONS STORAGE+++++++++++++++++++++++
            $scope.newCareerValue("");
            $scope.newModeValue("");
            $scope.newTermValue("");
            //+++++++++++++++++++++++++++++CUSTOM FILTER BUTTONS STORAGE+++++++++++++++++++++++
        };
        //+++++++++++++++++++++++++++RESET AND SAVING FILTER FLAGS++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        
        $scope.newTermValue("");
        $scope.newModeValue("");
        $scope.newCareerValue("");
        
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
        //useExternalFiltering: true,
        saveFocus: false,
        saveScroll: true,
       // saveGroupingExpandedStates: true,
        enableFiltering: true,
        saveSort: true,
        saveFilter: true,
        //saveWidths: true,
        //saveOrder: true,
       // saveScroll: true,
       // saveFocus: true,
       // saveVisible: true,
        //savePagination: true,
       // savePinning: true,
       // saveGrouping: true,
       // saveGroupingExpandedStates: true,
      //  saveTreeView: true,
      //  saveSelection: true,
        data: $scope.myData,
        columnDefs: [{
                field: 'Id',
                visible: false,
                width: 0
            },
            {
                field: 'Title',
                displayName: 'Title',
                condition: uiGridConstants.filter.EXACT,
                width: '260',
                cellTemplate: '<div><a href="#course-detail/{{row.entity[\'Id\']}}">{{row.entity[col.field]}}</a></div>',
            },
            {
                field: 'Career',
                visible: true,
                enableFiltering: false,
                condition: uiGridConstants.filter.EXACT,
                enableSorting: true
            },
            {
                field: 'Term',
                displayName: 'Term',
                condition: uiGridConstants.filter.EXACT,
                enableFiltering: false
            },
            {
                field: 'Course',
                displayName: 'Course #'
            },
            {
                field: 'Section',
                displayName: 'Section',
                enableFiltering: false
            },
            {
                field: 'Start_Date',
                displayName: 'Start Date'
            },
            {
                field: 'Instruction_Mode',
                visible: true,
                displayName: 'Course Type',
                condition: uiGridConstants.filter.EXACT,
                enableFiltering: false
            }
        ],
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            //+++++++++++++++++++++++++++++++SAVING FILTERS +++++++++++++++++++++++++++++++++++++++++++++++++++
            //$scope.gridApi.core.on.filterChanged($scope, saveState);
            
            $scope.gridApi.core.on.filterChanged( $scope, function() {
            //$scope.gridApi.saveScrollFocus($scope.gridApi);
                saveState();
                //console.log("changed!");                
            });

            // Setup events so we're notified when grid state changes.
            //$scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
            //$scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
            //$scope.gridApi.grouping.on.aggregationChanged($scope, saveState);
            //$scope.gridApi.grouping.on.groupingChanged($scope, saveState);
            //$scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
            $scope.gridApi.core.on.sortChanged($scope, saveState);
            
            restoreState($scope);
            //+++++++++++++++++++++++++++++++SAVING FILTERS +++++++++++++++++++++++++++++++++++++++++++++++++++
        },
        sortInfo: {
            fields: ['Title'],
            directions: ['asc']
        },
                saveFocus: false,
        saveScroll: true,
        enableFiltering: true,
        enableSorting: true,
        enablePaging: false,
        showGridFooter: true,
        multiSelect: false,
        showColumnMenu: false,
        pagingOptions: $scope.pagingOptions,
        showFilter: false,
        displaySelectionCheckbox: false
    };

    $scope.searchObj = {
        career: "all",
        term: "all",
        mode: "all"
    };
    //++++++++++++++++++++++++++++++SAVE AND RESTORE STATE FUNCTIONS++++++++++++++++++++++++++++++++++++++  
    var saveState = function() {
        var state = $scope.gridApi.saveState.save();
        //console.log(state);
        setLocalStorage('gridState', JSON.stringify(state), .25)
    };

    var restoreState = function($scope) {
        $timeout(function() {
            var state = getLocalStorage('gridState');
            
            if (state) $scope.gridApi.saveState.restore($scope, JSON.parse(state));
            //$scope.gridApi.restoreScrollFocus($scope.gridApi, $scope, JSON.parse(state));
            //localStorageService.get('gridState');
        });
    };
    //++++++++++++++++++++++++++++++SAVE AND RESTORE STATE FUNCTIONS++++++++++++++++++++++++++++++++++++++  

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

    if ($scope.searchObj.term == 'fall') {
        $scope.termMessage = "Classes for the next fall term will be available for viewing in mid-March.";
    } else if ($scope.searchObj.term == 'spring') {
        $scope.termMessage = "Classes for spring 2019 will be posted on Oct. 24.";
    } else if ($scope.searchObj.term == 'summer') {
        $scope.termMessage = "Classes for the next summer term will be available for viewing in late February or early March.";
    }

    var init = function() {
   
        
    };

    
    $scope.newCareerValue = function(value) {
        
        //+++++++++++++++++++++++++++++++STORE THIS CUSTOM FILTER+++++++++++++++++++
        var storedCareers = new customFilterStorage();
        storedCareers.filterKey = "careers";
        storedCareers.filterValue = value;
        storedCareers.init();
        value = storedCareers.filterValue;
        //+++++++++++++++++++++++++++++++STORE THIS CUSTOM FILTER+++++++++++++++++++
        var thisData = $scope.data;
        
        $scope.career.value = value;
        if (value == "undergraduate") {
            var icareer = "Undergraduate";
            var careerItems = [];
            $scope.searchObj.career = "Undergraduate";
            angular.forEach(thisData, function(item) {
                if (item.Career == icareer) {
                    careerItems.push(item);
                }
            });
        } else if (value == "graduate") {
            var icareer = "Graduate";
            var careerItems = [];
            $scope.searchObj.career = "Graduate";
            angular.forEach(thisData, function(item) {
                if (item.Career == icareer && item.Career !== "Undergraduate") {
                    careerItems.push(item);
                }
            });
        } else if (value == "law") {
            var icareer = "Law";
            var careerItems = [];
            $scope.searchObj.career = "Law";
            angular.forEach(thisData, function(item) {
                if (item.Career == icareer) {
                    careerItems.push(item);
                }
            });
        } else if (value == "all") {
            var icareer = "";
            var careerItems = [];
            $scope.searchObj.career = value;
            careerItems = $scope.data;
        }
        var filter = filterCustom.filter($scope.searchObj);
        
        
        $scope.myData = cleanDataFilter.filter(careerItems,$scope.searchObj.career,"Career");
        $scope.myData = cleanDataFilter.filter($scope.myData,$scope.searchObj.mode,"Instruction_Mode");
        
        $scope.gridOptions.data = $filter('filter')($scope.myData, filter, undefined);

    };

    $scope.newModeValue = function(value) {
        //+++++++++++++++++++++++++++++++STORE THIS CUSTOM FILTER+++++++++++++++++++
        var storedIMode = new customFilterStorage();
        storedIMode.filterKey = "instructionMode";
        storedIMode.filterValue = value;
        storedIMode.init();
        value = storedIMode.filterValue;
        //+++++++++++++++++++++++++++++++STORE THIS CUSTOM FILTER+++++++++++++++++++
        var thisData = $scope.data;
        
        if (value == "online") {
            $scope.mode.value = "online";
            var imode = "WW";
            var modeItems = [];
            $scope.searchObj.mode = "WW";
            angular.forEach(thisData, function(item) {
                if (item.Instruction_Mode == imode) {
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        } else if (value == "traditional") {
            $scope.mode.value = "traditional";
            var imode = "P";
            var modeItems = [];
            $scope.searchObj.mode = "P";
            angular.forEach(thisData, function(item) {
                if (item.Instruction_Mode == imode || item.Instruction_Mode == "PR") {
                    modeItems.push(item);
                }
            });
            $scope.myData = modeItems;
        } else {
            $scope.mode.value = "all";
            $scope.searchObj.mode = "all";
            $scope.myData = $scope.data;
        }
        var filter = filterCustom.filter($scope.searchObj);
                
        $scope.myData = cleanDataFilter.filter($scope.myData,$scope.searchObj.career,"Career");
        $scope.myData = cleanDataFilter.filter($scope.myData,$scope.searchObj.mode,"Instruction_Mode");
        
       $scope.gridOptions.data = $filter('filter')($scope.myData, filter, undefined);
    };


    $scope.newTermValue = function(value) {
        var isInit = (value == "") ? true : false;
    
        //+++++++++++++++++++++++++++++++STORE THIS CUSTOM FILTER+++++++++++++++++++
        var storedTerm = new customFilterStorage();
        storedTerm.filterKey = "term";
        storedTerm.filterValue = value;
        storedTerm.init();
        value = storedTerm.filterValue;
        //+++++++++++++++++++++++++++++++STORE THIS CUSTOM FILTER+++++++++++++++++++
        $scope.term.value = value;
        $scope.searchObj.term = value;
        
        if (value == 'fall') {
            $scope.termMessage = "Classes for the next fall term will be available for viewing in mid-March.";
        } else if (value == 'spring') {
            $scope.termMessage = "Classes for spring 2019 will be posted on Oct. 24.";
        } else if (value == 'summer') {
            $scope.termMessage = "Classes for the next summer term will be available for viewing in late February or early March.";
        }
        if ($scope.myData) {
            $scope.myData = isInit ? $scope.dataCache : $scope.data;
            //$scope.myData = $scope.dataCache;
        }
        var filter = filterCustom.filter($scope.searchObj);
        
        $scope.myData = cleanDataFilter.filter($scope.myData,$scope.searchObj.career,"Career");
        $scope.myData = cleanDataFilter.filter($scope.myData,$scope.searchObj.mode,"Instruction_Mode");
        
        $scope.gridOptions.data = $filter('filter')($scope.myData, filter, undefined);
        $scope.dataCache = $scope.gridOptions.data;
        
        if ($scope.gridOptions.data == null) {
            $scope.datarows = false;
        } else if ($scope.gridOptions.data.length < 1) {
            $scope.datarows = false;
        } else {
            $scope.datarows = true;
            
        }
        
    };



    $scope.newTypeValue = function(value) {
        $scope.field.type = value;
    };

    $scope.isList = function(list) {
        if (list === undefined) {
            return "nothing";
        } else if (list.length > 0) {
            return true;
        } else {
            //     console.log('none');
            return "none";
        }
    };

    $scope.changeView = function(view) {
        $location.path(view); // path not hash
        //myApp.getCourse();
    };



    // fire on controller loaded
    init();
    


});


var courseDetailCtrl = myApp.controller('CourseDetailCtrl', function($scope, courseService, $routeParams) {
    $scope.currCourse = {};
    courseService.getData($routeParams.Id).then(function(data) {
        $scope.dataArrived = true;
        $scope.currCourse = data;
        //console.log($routeParams.Id);
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
        link: function(scope, element, attrs) {
            attrs.$observe('days', function(val) {
                var new_days = [];
                var days_array = val.split(' ');
                var dayslength = days_array.length;
                for (var i = 0; i < dayslength; i++) {
                    if (days_array[i] === 'M') {
                        new_days.push('Monday');
                    } else if (days_array[i] === 'T') {
                        new_days.push('Tuesday');
                    } else if (days_array[i] === 'W') {
                        new_days.push('Wednesday');
                    } else if (days_array[i] === 'Th') {
                        new_days.push('Thursday');
                    } else if (days_array[i] === 'F') {
                        new_days.push('Friday');
                    } else {
                        new_days.push(days_array[i]);
                    }
                }
                scope.day_string = new_days.join(", ");
            });
        }
    }
});

//+++++++++++++++++++++++++++GENERIC LOCAL STORAGE FUNCTIONS++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function setLocalStorage(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getLocalStorage(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
// this deletes the cookie when called
function clearLocalStorage(name, path, domain) {
    if (getLocalStorage(name)) document.cookie = name + "=" +
        ((path) ? ";path=" + path : "") +
        ((domain) ? ";domain=" + domain : "") +
        ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}
//+++++++++++++++++++++++++++GENERIC LOCAL STORAGE FUNCTIONS++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++++CUSTOM FILTER SAVE OBJECT+++++++++++++++++++++++++++++++++++
function customFilterStorage() {
    var cfsObj = this;
    this.storageMap = {careers: "all", term: "all", instructionMode: "all"};
    this.htmlElement = [];
    this.filterValue = "";
    this.filterKey = "";
    this.storageValue = "";
    this.storageKey = "";
    this.storageName = "gridCustomFilters";
    this.IsDefault = true;
    this.init = function() {
       cfsObj.retrieveStorage();
       
        if (cfsObj.IsDefault) {
            cfsObj.prepareStorage();
        } else {
            cfsObj.prepareFilter();
        }
    };
    this.storageDefaults = function() {
        cfsObj.storageMap = {careers: "all", term: "all", instructionMode: "all"};
        this.filterValue = cfsObj.storageMap[cfsObj.filterKey];
        cfsObj.IsDefault = true;
    };
    this.prepareStorage = function() {
        cfsObj.updateValue();
        cfsObj.storageMap = JSON.stringify(cfsObj.storageMap);
        cfsObj.createStorage(.25);
    };
    this.prepareFilter = function() {
        //cfsObj.retrieveStorage();
        cfsObj.updateValue();
        cfsObj.filterValue = cfsObj.storageMap[cfsObj.filterKey];
        cfsObj.storageMap = JSON.stringify(cfsObj.storageMap);
        cfsObj.createStorage(.25);
    };
    this.updateValue = function() {
        var obj = cfsObj.storageMap;
        
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if (!obj.hasOwnProperty(prop)) continue;
            if (cfsObj.filterKey == prop) {
                //obj[prop] = cfsObj.filterValue;
                if(cfsObj.filterValue == "") {cfsObj.filterValue = obj[prop]}else{obj[prop] = cfsObj.filterValue;}
            }
        }
        cfsObj.storageMap = obj;
    };
    this.retrieveStorage = function() {
        var name = cfsObj.storageName + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                cfsObj.storageMap = c.substring(name.length, c.length);
                    try {
                        cfsObj.storageMap = JSON.parse(cfsObj.storageMap);
                        cfsObj.IsDefault = false;
                    } catch(e) {
                        console.log("JSON Parsing Error, Default took over "  + e); // error in the above string (in this case, yes)!
                    }
                return;
            }
        }
       cfsObj.storageDefaults();
    };
    this.createStorage = function(exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cfsObj.storageName + "=" + cfsObj.storageMap + ";" + expires + ";path=/";
    };
    this.deleteStorage = function(name, path, domain) {
        if (getLocalStorage(name)) document.cookie = name + "=" +
            ((path) ? ";path=" + path : "") +
            ((domain) ? ";domain=" + domain : "") +
            ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
    };
}

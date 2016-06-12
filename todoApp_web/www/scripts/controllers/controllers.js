'use strict';

angular.module('todoApp')


    .controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthService', '$localStorage', function ($scope, $state, $rootScope, ngDialog, AuthService, $localStorage ) {

        var loginData = $localStorage.getObject('userinfo','{}');
        var currentUser = $localStorage.getObject('currentUser','{}');
        if (loginData && currentUser)
        {
            $rootScope.currentUser = currentUser;
            $scope.loggedIn = AuthService.isAuthenticated();
            $scope.username = AuthService.getUserFullName();

            $state.go('app.tasks');
        }
        else
        {
            $scope.loggedIn = false;
            $scope.username = '';
        }

        if(AuthService.isAuthenticated()) {
            $scope.loggedIn = true;
            $scope.username = AuthService.getUserFullName();
        }

        $scope.openLogin = function () {
            ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
        };

        $scope.logOut = function() {
            AuthService.logout();
            $scope.loggedIn = false;
            $scope.username = '';
            $localStorage.storeObject('currentUser', '');
            $rootScope.currentUser = '';
            $state.go('app');
        };

        $rootScope.$on('login:Successful', function () {

            $localStorage.storeObject('currentUser', $rootScope.currentUser);

            $scope.loggedIn = AuthService.isAuthenticated();
            $scope.username = AuthService.getUserFullName();

            console.log("success!");
            console.log($state);
            $state.go('app.tasks');

        });

        $rootScope.$on('registration:Successful', function () {
            $scope.loggedIn = AuthService.isAuthenticated();
            $scope.username = AuthService.getUserFullName();
        });

        $scope.stateis = function(curstate) {
            return $state.is(curstate);
        };

        $scope.addTask = function () {
            ngDialog.open({ template: 'views/task/addtask.html', scope: $scope, className: 'ngdialog-theme-default', controller:"AddTaskController" });
        };

    }])



    .controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthService','$state', function ($scope, ngDialog, $localStorage, AuthService, $state) {


        $scope.loginData = $localStorage.getObject('userinfo','{}');
        if ( $scope.loginData )
            $scope.rememberMe = true;

        console.log($scope.loginData);

        $scope.doLogin = function() {

            if($scope.rememberMe)
                $localStorage.storeObject('userinfo',$scope.loginData);
            else
                $localStorage.storeObject('userinfo','');

            AuthService.login($scope.loginData);

            ngDialog.close();
        };

        $scope.openRegister = function () {
            ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
        };

    }])

    .controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthService', function ($scope, ngDialog, $localStorage, AuthService) {

        $scope.register={};
        $scope.loginData={};

        $scope.doRegister = function() {

            AuthService.register($scope.registration);

            ngDialog.close();
        };
    }])

    .controller('AddTaskController', ['$scope', '$state', '$rootScope', 'ngDialog', 'Tasks', function ($scope, $state, $rootScope, ngDialog, Tasks) {

        $scope.taskData = '';

        $scope.addTask = function() {
            console.log("Add task");

            console.log($scope.taskData);

            var task = {
                "title": $scope.taskData.title,
                "description": $scope.taskData.description,
                "worktime": "0",
                "breaktime": "0",
                "status": "NotStarted",
                "customerId":$rootScope.currentUser.id
            };

            console.log(task);

            Tasks.create(task)
                .$promise.then(
                function (response) {
                    console.log(response);
                    $state.go($state.current, {}, {reload: true});
                },
                function (response) {
                    console.log(response);

                    //$scope.message = "Error: " + response.status + " " + response.statusText;
                });

            ngDialog.close();
        };
    }])

    .controller('TaskController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthService','Customer','Tasks', function ($scope, $state, $rootScope, ngDialog, AuthService, Customer, Tasks) {

        $scope.tasks = [];

        $rootScope.persistCurrentTask = function () {
            if ( $rootScope.currentTask )
            {
                Tasks.upsert($rootScope.currentTask)
                    .$promise.then(
                    function (response) {
                        console.log("Update task: " + $rootScope.currentTask)
                        console.log(response);
                    },
                    function (response) {
                        console.log(response);
                        //$scope.message = "Error: " + response.status + " " + response.statusText;
                    });
            }
        };

        Customer.tasks({id:$rootScope.currentUser.id})
            .$promise.then(
            function (response) {
                console.log(response);
                $scope.tasks = response;
            },
            function (response) {
                console.log(response);

                //$scope.message = "Error: " + response.status + " " + response.statusText;
            });


        $scope.startTask = function (task) {
            $rootScope.currentTask = task;

            ngDialog.open({ template: 'views/task/startTask.html',
                preCloseCallback:function(){
                    console.log("EXIT!!");
                    $rootScope.persistCurrentTask();
                }
                , scope: $scope, className: 'ngdialog-theme-default',
                controller:"StartTaskController" });
        };
    }])


    .controller('StartTaskController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthService','Customer','ngAudio', function ($scope, $state, $rootScope, ngDialog, AuthService, Customer,ngAudio) {

        $scope.timerRunning = true;
        $scope.isTakingABreak = false;
        $scope.isPause = false;
        $scope.timerButtonText = "Pause";
        $scope.message = "Stay focused";

        $scope.sound = ngAudio.load("./sounds/gong.mp3");

        var focusTimeInSeconds = 25*60;
        var chillTimeInSeconds = 5*60;
        $scope.$broadcast('timer-start');

        $scope.$on('timer-stopped', function (event, data){
          
            if($scope.isPause)
                return;
            $scope.sound.play();

ngAudio
            console.log('Timer Stopped - data = ', data);
            if ($scope.isTakingABreak ) {
                $scope.isTakingABreak = false;
                $scope.$broadcast("timer-add-cd-seconds",focusTimeInSeconds);
                $scope.message = "Stay focused";
            }
            else {
                $scope.isTakingABreak = true;
                $scope.$broadcast("timer-add-cd-seconds",chillTimeInSeconds);
                $scope.message = "Take a break and stretch your legs";
            }
        });

        $scope.$on('timer-tick', function (event, args) {
            console.log( $scope.timerType + ' - event.name = ' + event.name + ', timeoutId = ' + args.timeoutId + ', millis = ' + args.millis + '\n');

            if ($scope.isTakingABreak )
                $rootScope.currentTask.breaktime += 1;
            else
                $rootScope.currentTask.worktime += 1;
        });

        $scope.stopOrResumeTask = function(){
            if ( $scope.timerRunning)
            {
                $scope.isPause = true;
                $scope.timerButtonText = "Resume";
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }
            else
            {
                $scope.isPause = false;
                $scope.timerButtonText = "Pause";
                $scope.$broadcast('timer-resume');
                $scope.timerRunning = true;
            }
        };

        $scope.completeTask = function(){
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;

            $rootScope.currentTask.status = "Completed";
            $rootScope.persistCurrentTask();
            ngDialog.close();
        };

    }])
;

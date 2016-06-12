angular.module('todoApp.controllers', [])

  .controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, AuthService,$state,$ionicHistory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};
    $scope.registration = {};

    // ## fake login
     $scope.loginData ={
     email: "morten@brudvik.com",
     password: "123"
     };

     var user = {
     id: "57521336c37e6211000adce1",
     tokenId: "I5Bw7bJgvBpmrhuCFBuOukO2vSY9hU5eRF2EVLB0C2rIKpi8BXLGVtlpA9Bl65D6",
     username: "morten@brudvik.com",
     email: "morten@brudvik.com",
     firstname: "Morten",
     lastname: "Brudvik",
     password: "123"
     };



    // ## end of fake login

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      AuthService.login($scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };

    $scope.doLogin();


    $scope.logOut = function () {
      $scope.loggedIn = false;
      $scope.firstname = "";

      AuthService.logout();

      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go("app.tasks");
    };

    $rootScope.$on('login:Successful', function () {
      $scope.loggedIn = true;
      $scope.firstname = $rootScope.user.firstname;
      console.log('login sucess');
    });

    // ## Registration

    $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
      $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
      $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
      $scope.registration.username = $scope.registration.email;
      console.log('Doing registration', $scope.registration);

      AuthService.register($scope.registration);

      $scope.loginData.email = $scope.registration.email;
      $scope.loginData.password = $scope.registration.password;


      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeRegister();
      }, 1000);
    };

    $rootScope.$on('registration:Successful', function () {
      AuthService.login($scope.loginData);

    });

  })

  .controller('TaskCtrl', function ($scope, $rootScope, Customer, $ionicModal, Tasks, $state) {
    $scope.tasks = [];
    $scope.showTasks = false;

    console.log("Init task list");


    $scope.loadTasks = function () {
      Customer.tasks({id: $rootScope.user.id})
        .$promise.then(
        function (response) {
          console.log(response);
          $scope.tasks = response;
        },
        function (response) {
          console.log(response);

          //$scope.message = "Error: " + response.status + " " + response.statusText;
        });
    };

    $rootScope.$on('login:Successful', function () {
      $scope.loadTasks();
      $scope.showTasks = true;
    });

    $rootScope.$on('logout:Successful', function(){
      $scope.tasks = [];
      $scope.showTasks = false;
    });

    $ionicModal.fromTemplateUrl('templates/addTask.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.addTaskForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeAddTaskForm = function () {
      $scope.addTaskForm.hide();
    };

    // Open the login modal
    $scope.showAddTaskForm = function () {
      console.log("Add Task");
      $scope.taskData = {
        title: "",
        description: ""
      };
      $scope.addTaskForm.show();
    };

    $scope.taskData = {
      title: "",
      description: ""
    };

    $scope.submitTask = function () {

      console.log("Add task");
      var task = $scope.taskData;
      console.log(task);

      task.customerId = $rootScope.user.id;

      Tasks.create(task).
        $promise.
        then(function(response){
         $scope.loadTasks();
      },function(response){

      });

      $scope.closeAddTaskForm();
    };

    $scope.startTask = function (task) {
      $rootScope.currentTask = task;
      $state.go('app.starttask');

    };

    $rootScope.persistCurrentTask = function () {
      if ($rootScope.currentTask) {
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
  })
  .controller('StartTaskCtrl', function ($scope, $rootScope, Customer, $state) {

    $scope.timerRunning = true;
    $scope.isTakingABreak = false;
    $scope.isPause = false;
    $scope.message = "Task Focus";


    $scope.title = $rootScope.currentTask.title;
    $scope.description = $rootScope.currentTask.description;

    var focusTimeInSeconds = 25 * 60;
    var chillTimeInSeconds = 5 * 60;
    $scope.$broadcast('timer-start');

    $scope.$on('timer-stopped', function (event, data) {

      if ($scope.isPause)
        return;
      //$scope.sound.play();

      console.log('Timer Stopped - data = ', data);
      if ($scope.isTakingABreak) {
        $scope.isTakingABreak = false;
        $scope.$broadcast("timer-add-cd-seconds", focusTimeInSeconds);
        $scope.message = "Task Focus";
      }
      else {
        $scope.isTakingABreak = true;
        $scope.$broadcast("timer-add-cd-seconds", chillTimeInSeconds);
        $scope.message = "Take a break!";
      }
    });

    $scope.$on('timer-tick', function (event, args) {
      console.log($scope.timerType + ' - event.name = ' + event.name + ', timeoutId = ' + args.timeoutId + ', millis = ' + args.millis + '\n');

      if ($scope.isTakingABreak)
        $rootScope.currentTask.breaktime += 1;
      else
        $rootScope.currentTask.worktime += 1;
    });

    $scope.stopOrResumeTask = function () {
      if ($scope.timerRunning) {
        $scope.isPause = true;
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
      }
      else {
        $scope.isPause = false;
        $scope.$broadcast('timer-resume');
        $scope.timerRunning = true;
      }
    };

    $scope.completeTask = function () {
      $scope.$broadcast('timer-stop');
      $scope.timerRunning = false;

      $rootScope.currentTask.status = "Completed";
      $rootScope.persistCurrentTask();
      $state.go("app.tasks");
    };

    $scope.$on("$ionicView.leave", function (event, data) {
      // handle event
      console.log("Leaving Start Task View: ", $rootScope.currentTask);
      $rootScope.persistCurrentTask();
    });

  })

  .controller('HistoryCtrl', function ($scope, $rootScope, Customer, $ionicModal, Tasks, $state) {
    $scope.tasks = [];

    $scope.loadHistory = function(){
      Customer.tasks({id: $rootScope.user.id})
        .$promise.then(
        function (response) {
          console.log(response);
          $scope.tasks = response;
        },
        function (response) {
          console.log(response);

          //$scope.message = "Error: " + response.status + " " + response.statusText;
        });
    };

    $scope.loadHistory();

    $rootScope.$on('login:Successful', function () {
      $scope.loadHistory();
    });

  })
;

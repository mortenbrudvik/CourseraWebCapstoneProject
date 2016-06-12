'use strict';

angular.module('todoApp', ['ui.router','ngResource','ngDialog', 'lbServices', 'timer','ngAudio'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'

                    },
                    'content': {
                        templateUrl : 'views/start.html'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }
            })

            .state('app.tasks', {
                url: 'tasks',
                views: {
                    'content@': {
                        templateUrl : 'views/task/tasks.html',
                        controller : 'TaskController'
                   }
                }
            });

        $urlRouterProvider.otherwise('/');
    })
    .run(['$rootScope', '$state', 'AuthService', function($rootScope, $state, AuthService) {
        $rootScope.$on('$stateChangeStart', function(event, next) {
            // redirect to login page if not logged in
            console.log($state);
            console.log(event);
            console.log(next);

            if( next.name == "app" && AuthService.isAuthenticated()  )
            {
                event.preventDefault();
            }

        });
    }]);

;

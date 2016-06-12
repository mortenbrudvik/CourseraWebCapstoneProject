
angular.module('todoApp.services',[])
  .constant("baseURL", "https://mortenbrudvik.herokuapp.com/api/")
  .factory('AuthService', ['Customer', '$q', '$rootScope', '$ionicPopup','$localStorage',
    function(Customer, $q, $rootScope, $ionicPopup,$localStorage) {
      function login(loginData) {
        return Customer
          .login(loginData)
          .$promise
          .then(function(response) {

              var user = {
                id: response.user.id,
                  tokenId: response.id,
                  username: response.user.username,
                  email: response.user.email,
                  firstname: response.user.firstname,
                  lastname: response.user.lastname,
                  password: loginData.password
              };

            console.log(user);
            $rootScope.user = user;

            $rootScope.$broadcast('login:Successful');
            },
            function(response){

              var message = '<div><p>' +  response.data.error.message +
                '</p><p>' + response.data.error.name + '</p></div>';

              var alertPopup = $ionicPopup.alert({
                title: '<h4>Login Failed!</h4>',
                template: message
              });

              alertPopup.then(function(res) {
                console.log('Login Failed!');
              });
            });
      }

      function isAuthenticated() {

        if (getUser()) {
          return true;
        }
        else{
          return false;
        }
      }

      function getUser()
      {
        var user = $localStorage.get("currentUser",{});

        if ( !user)
          return null;

        return user;
      }

      function getUserFullName() {
        var user = getUser();

        return user.firstname;
      }

      function logout() {
        return Customer
          .logout()
          .$promise
          .then(function() {

            $rootScope.user = null;
            $rootScope.$broadcast('logout:Successful');

          });
      }

      function register(registerData) {
        return Customer
          .create({
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
            firstname: registerData.firstname,
            lastname: registerData.lastname
          })
          .$promise
          .then (function(response) {
              $rootScope.$broadcast('registration:Successful');
            },
            function(response){

              var message = '<div><p>' +  response.data.err.message +
                '</p><p>' + response.data.err.name + '</p></div>';

              var alertPopup = $ionicPopup.alert({
                title: '<h4>Registration Failed!</h4>',
                template: message
              });

              alertPopup.then(function(res) {
                console.log('Registration Failed!');
              });

            });
      }

      return {
        login: login,
        logout: logout,
        register: register,
        isAuthenticated: isAuthenticated,
        getUserFullName: getUserFullName,
        getUser: getUser
      };
    }])

  .factory('$localStorage', ['$window', function ($window) {
    return {
      store: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      remove: function (key) {
        $window.localStorage.removeItem(key);
      },
      storeObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key, defaultValue) {
        return JSON.parse($window.localStorage[key] || defaultValue);
      }
    }
  }])
;

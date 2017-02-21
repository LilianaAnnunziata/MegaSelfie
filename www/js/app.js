// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
//var fb = new Firebase("https://megaselfie-f2e6f.firebaseio.com");

angular.module('app', ['ionic', 'app.controllers','camera', 'app.routes', 'app.directives','app.services',
  'omr.directives',
  'ngStorage',
  'ngCordova',
  'ngCordovaOauth',
  'firebase'])

//configurazione per def costanti, impostazioni su servizi
.config(function($ionicConfigProvider, $sceDelegateProvider){
  $ionicConfigProvider.views.maxCache(0);
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
})


//inizializzazione dopo che tutti i moduli sono stati caricati
.run(function($ionicPlatform, databaseMegaselfie) {
  $ionicPlatform.ready(function() {

    //nascondo lo splashscreen
    navigator.splashscreen.hide();

    universalLinks.subscribe('redirectToSharedEvent', function (eventData) {
      databaseMegaselfie.getSharedEvent(eventData.params.eventId);
    });

    //imposto l'autohide della barra dei pulsanti su android
    //window.navigationbar.setUp(true);
    cordova.plugins.diagnostic.requestCameraAuthorization(function(status){
      console.log("Authorization request for camera use was " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied"));
    }, function(error){
      console.error(error);
    });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }



  });
})

/*
  This directive is used to disable the "drag to open" functionality of the Side-Menu
  when you are dragging a Slider component.
*/
.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            function stopDrag(){
              $ionicSideMenuDelegate.canDragContent(false);
            }

            function allowDrag(){
              $ionicSideMenuDelegate.canDragContent(true);
            }

            $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
            $element.on('touchstart', stopDrag);
            $element.on('touchend', allowDrag);
            $element.on('mousedown', stopDrag);
            $element.on('mouseup', allowDrag);

        }]
    };
}])

/*
  This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
  return {
    restrict: 'A',
    replace: false,
    transclude: false,
    link: function(scope, element, attrs) {
      var href = attrs['hrefInappbrowser'];

      attrs.$observe('hrefInappbrowser', function(val){
        href = val;
      });

      element.bind('click', function (event) {

        window.open(href, '_system', 'location=yes');

        event.preventDefault();
        event.stopPropagation();

      });
    }
  };
})
.directive('logOut', function($localStorage,$state) {
  return {
    link: function($scope, element ) {
      element.on('click', function() {
        firebase.auth().signOut().then(function() {

          $localStorage.$reset()
          $state.go("login");

        }, function(error) {
          console.log(error)
        });
      });
    }
  }
});

angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  .state('menu.home', {
    url: '/page1',
    views: {
      'side-menu21': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('menu.createLiveEvent', {
    url: '/page2',
    views: {
      'side-menu21': {
        templateUrl: 'templates/createLiveEvent.html',
        controller: 'createLiveEventCtrl'
      }
    }
  })

  .state('menu.createSharedEvent', {
    url: '/page3',
    views: {
      'side-menu21': {
        templateUrl: 'templates/createSharedEvent.html',
        controller: 'createSharedEventCtrl'
      }
    }
  })

    .state('menu', {
      url: '/side-menu21',
      templateUrl: 'templates/menu.html',
      controller: 'menuCtrl'
    })





  .state('menu.store', {
    url: '/page6',
    views: {
      'side-menu21': {
        templateUrl: 'templates/store.html',
        controller: 'storeCtrl'
      }
    }
  })

  .state('menu.camera', {
    url: '/page7',
    views: {
      'side-menu21': {
        templateUrl: 'templates/camera.html',
        controller: 'cameraCtrl'
      }
    }
  })

  .state('countdown', {
    url: '/page8',


        templateUrl: 'templates/countdown.html',
        controller: 'countdownCtrl'


  })

  .state('eventEdit', {
    url: '/page9',
    templateUrl: 'templates/eventEdit.html',
    controller: 'eventEditCtrl'
  })

  .state('eventInfo', {
    url: '/page11',
    templateUrl: 'templates/eventInfo.html',
    controller: 'eventInfoCtrl'
  })

  .state('gallery', {
    url: '/page10',
    templateUrl: 'templates/gallery.html',
    controller: 'galleriaCtrl'
  })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })


    //$urlRouterProvider.otherwise('/side-menu21/page1')
    $urlRouterProvider.otherwise('/login');

});

//Funzioni con un particolare scopo
angular.module('app.controllers', ['ngCordova','omr.directives'])

.controller('homeCtrl', ['$scope', '$stateParams', 'storage','$firebaseObject', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope, $stateParams,storage,$firebaseObject) {

    /*var user = firebase.auth().currentUser;
    console.log(user);

    if (user != null) {
      console.log("user");

      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: "+profile.providerId);
        console.log("  Provider-specific UID: "+profile.uid);
        console.log("  Name: "+profile.displayName);
        console.log("  Email: "+profile.email);
        console.log("  Photo URL: "+profile.photoURL);
      });
    }
*/

  /*Riferimento al database*/
    var refDB = firebase.database().ref().child("data");
    var syncObj = $firebaseObject(refDB);
    syncObj.$bindTo($scope,"pippo");


    var fileButton = document.getElementById('file') ;
    fileButton.addEventListener('change', function (e) {
      var file = e.target.files[0];
      var refStore = firebase.storage().ref('ecco/'+file.name);

      var uploadTask = refStore.put(file);
      uploadTask.on('state_changed', function(snapshot){
        console.log("eccomi uploadTask");

        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function(error) {
        console.log("eccomi errore "+error)
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = uploadTask.snapshot.downloadURL;
      });
    })

 /* $scope.download = function (){
    var url = storage.download('ecco2/prova1');
    console.log("    "+url);
    $scope.srcImg = url;
  }
*/

    $scope.downloadBy = function () {
      storage.download('ecco2/prova1').then(function (imgSrc) {
        $scope.srcImg = imgSrc;
      });

    }


   /*$scope.eventList = [
  {nameEvent:"event1", description:"B", img:"img/nTHXu7GgQXe7wCYeSmqu_icon.png"},
  {nameEvent:"event2", description:"B", img:"img/nTHXu7GgQXe7wCYeSmqu_icon.png"}
];*/
}])
.controller('createLiveEventCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('createSharedEventCtrl', ['$scope', 'dateFilter','$http','$cordovaCamera','storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, dateFilter, $http, $cordovaCamera,storage) {

  $scope.date = dateFilter(new Date(), "dd/MM/yyyy");
  console.log($scope.date);

  var event = $scope.event;

     $scope.submitData = function (event) {

       if ($scope.createSharedEventForm.$valid && $scope.imgURI!= undefined) {
         var startTime = dateFilter(event.startTime,"HH:mm");
         var endTime = dateFilter(event.endTime,"HH:mm");
         var description = event.description;
         if (description == undefined)
           description = "";
         if(startTime == null)
           startTime ="00:00";
         if(endTime == null)
           endTime ="00:00";

         var objToSend = {
           eventName:event.nameSharedEvent,
           description:description,
           startDate:dateFilter(event.startDate, "dd/MM/yyyy"),
           startTime:startTime,
           endDate:dateFilter(event.endDate, "dd/MM/yyyy"),
           endTime: endTime
         }
          console.log(objToSend.toString());
         alert($scope.imgURI);
         storage.upload('ecco2/',"prova3",$scope.imgURI);
         //$location.path("menu.home");
       }
       else {
         alert("not valid input");
       }
     }

  $scope.choosePhoto = function () {
    var imgRect = document.getElementById("createSharedEventContentId").getBoundingClientRect();
    console.log("rect= "+imgRect.width +" " +imgRect.height+" "+imgRect.bottom+" "+imgRect.left);
    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    var options = setOptionsCamera(srcType,imgRect.width,imgRect.height);

    $cordovaCamera.getPicture(options).then(function (imageURI) {
        $scope.imgURI = "data:image/jpeg;base64,"+imageURI;
    }, function (err) {
      console.log("error createSharedEventCtrl: "+ err);
    });

  };
}])

.controller('menuCtrl', ['$scope', '$http', '$sessionStorage', '$location',
  function($scope, $http, $sessionStorage, $location) {

    $scope.init = function() {
      if($sessionStorage.hasOwnProperty("accessToken") === true) {
        $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $sessionStorage.accessToken, fields: "id,name,gender,location,website,picture.type(large),relationship_status", format: "json" }}).then(function(result) {
          $scope.profileData = result.data;
        }, function(error) {
          alert("There was a problem getting your profile.  Check the logs for details.");
          console.log(error);
        });
      } else {
        alert("aasdasd");
      }
    };
}])

.controller('loginCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('signupCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('storeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('cameraCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('countdownCtrl', ['$scope','$timeout','$cordovaFile', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope,$timeout,$cordovaFile, $stateParams) {
  $scope.counter = 10;

  var rect = document.getElementById("contentCamera").getBoundingClientRect();
  console.log("rect= "+rect.height +" " +rect.width+" "+rect.bottom+" "+rect.left);

  var tapEnabled = true; //enable tap take picture
  var dragEnabled = true; //enable preview box drag across the screen
  var toBack = true; //send preview box to the back of the webview
  var rect = {x: 30, y: 80, width: 300, height:300};
  //cordova.plugins.camerapreview.startCamera(rect, "front", tapEnabled, dragEnabled, toBack)

  cordova.plugins.camerapreview.startCamera(rect, 'front', true, true, false);

  $scope.playCountdown = function () {
    $scope.onTimeout = function () {
      $scope.counter--;
      countdown = $timeout($scope.onTimeout, 1000);
      if($scope.counter == 0) {
        console.log("Ecco");

        var options = {
          name: "Megaselfie", //image suffix
          dirName: "Megaselfie", //foldername
          orientation: "landscape", //or portrait
          type: "front" //or front
        };

        cordova.plugins.camerapreview.stopCamera();
        window.plugins.CameraPictureBackground.takePicture(success, error, options);

        function success(imgData) {

          $scope.$apply(function() {

            $scope.imgURI = imgData;
          });
          console.log("  " + $scope.imgURI);

        }

        function error(imgurl) {
          console.log("Error Not save");
        }

        $timeout.cancel(countdown);
        $scope.counter = "OK!";
      }
    }
    var countdown = $timeout($scope.onTimeout,1000);
  }
  $scope.prova = function () {
    console.log(cordova.file.applicationDirectory);
    console.log(cordova.file.dataDirectory);
    console.log(cordova.file.externalApplicationStorageDirectory);
    console.log(cordova.file.externalRootDirectory);
  }
}])

.controller('eventEditCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('eventInfoCtrl', ['$scope','$cordovaCamera','storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $cordovaCamera,storage) {

  $scope.takeImage = false;
  $scope.takePhoto = function () {
    $cordovaCamera.getPicture(setOptionsCamera(Camera.PictureSourceType.CAMERA)).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
      $scope.takeImage = true;
      console.log($scope.takeImage);
    }, function (err) {
      console.log("error eventInfoCtrl "+ err)
    });
  };

  $scope.sharePhoto = function () {
    storage.upload('ecco2/',"share",$scope.imgURI);
  }
}])


.controller('galleryCtrl', ['$scope', '$stateParams','$firebaseArray', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {
  var userReference = fb.child('text').on("value", function(snapshot) {
    console.log("Valore recuperato: " + snapshot.val());
  }, function (errorObject) {
    console.log("Errore: " + errorObject.code);
  });

}])

.controller("LoginController", ['$scope', '$state','$cordovaOauth', '$sessionStorage', '$location',
  function($scope,$state, $cordovaOauth, $sessionStorage, $location) {

  $scope.login = function() {
    $cordovaOauth.facebook("727495594069595", ["email"]).then(function(result) {
      $sessionStorage.accessToken = result.access_token;

      $state.go("menu.home");
      //$location.path("menu.home");
      //  $location.path("/page1");
      //scope.$apply;
      // $window.location.href = "/templates/home";

    }, function(error) {
      alert("There was a problem signing in!  See the console for logs");
      console.log(error);
    });
  };

}])

.controller("MenuController", ['$scope', '$http', '$sessionStorage', '$location',
  function($scope, $http, $sessionStorage, $location) {

  $scope.init = function() {
    if($sessionStorage.hasOwnProperty("accessToken") === true) {
      $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $sessionStorage.accessToken, fields: "id,name,gender,location,website,picture.type(large),relationship_status", format: "json" }}).then(function(result) {
        $scope.profileData = result.data;
      }, function(error) {
        alert("There was a problem getting your profile.  Check the logs for details.");
        console.log(error);
      });
    } else {
      alert("aasdasd");
    }
  };
}]);

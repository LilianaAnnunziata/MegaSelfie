function setOptionsCamera(srcType) {

  var options = {
    quality: 75,
    destinationType: Camera.DestinationType.DATA_URL, //formato del valore di ritorno
    sourceType: srcType,//sorgente della foto
    allowEdit: false,//permette la modifica
    encodingType: Camera.EncodingType.JPEG, //formato di codifica della foto
   // targetWidth: width,//scalatura img
    //targetHeight: height,
    mediaType:Camera.PICTURE, //setta il tipo di media da selezionare
    saveToPhotoAlbum: true, //salva img nell'album
    cameraDiretion: Camera.FRONT
  };
  return options;
}
//Funzioni con un particolare scopo
angular.module('app.controllers', ['ngCordova','omr.directives'])

.controller('homeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


$scope.eventList = [
  {nameEvent:"event1", description:"B", img:"img/nTHXu7GgQXe7wCYeSmqu_icon.png"},
  {nameEvent:"event2", description:"B", img:"img/nTHXu7GgQXe7wCYeSmqu_icon.png"}
];
}])
.controller('createLiveEventCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('createSharedEventCtrl', ['$scope', 'dateFilter','$http','$location','$cordovaCamera','$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, dateFilter, $http, $location, $cordovaCamera, $stateParams) {

  $scope.date = dateFilter(new Date(), "dd/MM/yyyy");
  console.log($scope.date);

  var event = $scope.event;

     $scope.submitData = function (event) {
       if ($scope.createSharedEventForm.$valid ) {
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
          console.log(objToSend);
          $http.get("http://localhost:3000/birds/about");

         //$location.path("menu.home");
       }
       else {
         console.log("not valid input");
       }
     }

  $scope.choosePhoto = function () {
    var imgRect = document.getElementById("imgContainer").getBoundingClientRect();
    console.log("rect= "+imgRect.width +" " +imgRect.height+" "+imgRect.bottom+" "+imgRect.left);
    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    var options = setOptionsCamera(srcType);

    $cordovaCamera.getPicture(options).then(function (imageData) {
      console.log("createSharedEventCtrl choosePhoto OK "+imageData);
        $scope.imgURI ="data:image/jpeg;base64," + imageData;

    }, function (err) {
      console.log("error ChoosePhoto in createSharedEventCtrl");
    });

  };
}])

.controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


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
        $scope.counter = 10;
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

.controller('eventInfoCtrl', ['$scope','$cordovaCamera','$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $cordovaCamera) {
  $scope.takePhoto = function () {
    var imgRect = document.getElementById("imgContainer").getBoundingClientRect();
    console.log("rect= "+imgRect.width +" " +imgRect.height+" "+imgRect.bottom+" "+imgRect.left);
    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptionsCamera(srcType);


    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
      console.log("error eventInfoCtrl")
    });
  };
  $scope.choosePhoto = function () {
    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    var options = setOptionsCamera(srcType);


    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64,"+imageData;
    }, function (err) {
      // An error occured. Show a message to the user
    });
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

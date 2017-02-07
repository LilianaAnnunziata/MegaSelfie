//Funzioni con un particolare scopo
angular.module('app.controllers', ['ngCordova', 'omr.directives','ionic', 'ion-gallery'])

  .controller('homeCtrl', ['$scope','$localStorage','$firebaseStorage','shareData','myService', '$state',
    function ($scope,$localStorage,$firebaseStorage, shareData, myService, $state) {

    $scope.goTo=function(info){
      var object=JSON.parse(info);
      myService.set(object.eventID);
      shareData.setData(object.eventID);
    }
      /*Riferimento al database*/
      //var refDB = window.database.ref().child("data");
      // var syncObj = $firebaseObject(refDB);
      // syncObj.$bindTo($scope,"pippo");

      /*$scope.init = function () {
       var ref = firebase.storage().ref('event1/1.jpg');
       var storageFire =  $firebaseStorage(ref);
       storageFire.$getDownloadURL().then(function (imgSrc){
       // storage.download('ecco2/prova1').then(function (imgSrc) {
       alert(imgSrc)
       $scope.srcImg = imgSrc;
       //  $window.location.reload();
       });
       }
       $scope.init();
       */

      var query = window.database.ref('users/' + $localStorage.uid + '/events');
      //var query = window.database.ref('users/K5fyK0CzdsOxDsSp5xDI3lM5YCB2/events');
      $scope.eventList= [];
      query.once("value")
        .then(function(snapshot) {
          //iterazione su tutti gli eventi dell'utente
          snapshot.forEach(function(childSnapshot) {
            // recupero nome dell'evento
            var eventKey = childSnapshot.key;
           //creazione obj da inserire nella lista
            var obj = {};
            //recupero ruolo
            obj.role = childSnapshot.val().role;
            //accedo al nodo events, nel database
            var eventRef = window.database.ref('events/'+ eventKey);

            //accedo a campi dell'evento
            eventRef.once("value").then(function(snapshot) {
              var eventObj = snapshot.val();
              obj.description = eventObj.description;
              obj.title = eventObj.title;
              obj.eventID=eventKey;

              var eventStorageRef = window.storage.ref(eventKey+"/icon.png");
              var storageFire =  $firebaseStorage(eventStorageRef);
              storageFire.$getDownloadURL().then(function (imgSrc){
               obj.src = imgSrc;
               $scope.eventList.push(obj);
              });
            });
          });
        });
    }])


  .controller('createLiveEventCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams) {


    }])

  .controller('createSharedEventCtrl', ['$scope', 'dateFilter', '$http', '$cordovaCamera', 'storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, dateFilter, $http, $cordovaCamera, storage) {

      $scope.date = dateFilter(new Date(), "dd/MM/yyyy");
      console.log($scope.date);

      var event = $scope.event;

      $scope.submitData = function (event) {

        if ($scope.createSharedEventForm.$valid && $scope.imgURI != undefined) {
          var startTime = dateFilter(event.startTime, "HH:mm");
          var endTime = dateFilter(event.endTime, "HH:mm");
          var description = event.description;
          if (description == undefined)
            description = "";
          if (startTime == null)
            startTime = "00:00";
          if (endTime == null)
            endTime = "00:00";

          var objToSend = {
            eventName: event.nameSharedEvent,
            description: description,
            startDate: dateFilter(event.startDate, "dd/MM/yyyy"),
            startTime: startTime,
            endDate: dateFilter(event.endDate, "dd/MM/yyyy"),
            endTime: endTime
          }
          console.log(objToSend.toString());
          alert($scope.imgURI);
          storage.upload('ecco2/', "prova3", $scope.imgURI);
          //$location.path("menu.home");
        }
        else {
          alert("not valid input");
        }
      }

      $scope.choosePhoto = function () {
        var imgRect = document.getElementById("createSharedEventContentId").getBoundingClientRect();
        console.log("rect= " + imgRect.width + " " + imgRect.height + " " + imgRect.bottom + " " + imgRect.left);
        var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
        var options = setOptionsCamera(srcType, imgRect.width, imgRect.height);

        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.imgURI = "data:image/jpeg;base64," + imageURI;
        }, function (err) {
          console.log("error createSharedEventCtrl: " + err);
        });

      };
    }])

  .controller('menuCtrl', ['$scope', '$http', '$sessionStorage', '$location',
    function ($scope, $http, $sessionStorage, $location) {

      $scope.init = function () {
        if ($sessionStorage.hasOwnProperty("accessToken") === true) {
          $http.get("https://graph.facebook.com/v2.2/me", {
            params: {
              access_token: $sessionStorage.accessToken,
              fields: "id,name,gender,location,website,picture.type(large),relationship_status",
              format: "json"
            }
          }).then(function (result) {
            $scope.profileData = result.data;
          }, function (error) {
            alert("There was a problem getting your profile.  Check the logs for details.");
            console.log(error);
          });
        } else {
          // alert("aasdasd");
        }
      };
    }])

  .controller('loginCtrl', ['$scope', '$stateParams', '$firebaseObject',
    '$cordovaOauth', '$sessionStorage', '$firebaseAuth', '$state', '$localStorage',
    function ($scope, $stateParams, $firebaseObject, $cordovaOauth, $sessionStorage,
              $firebaseAuth, $state, $localStorage) {
      if ($localStorage.uid)
        $state.go("menu.home");
      else {
        $scope.login = function () {
          $cordovaOauth.facebook("727495594069595", ["email"]).then(function (result) {
            var credentials = firebase.auth.FacebookAuthProvider.credential(result.access_token);
            $sessionStorage.accessToken = result.access_token;
            return firebase.auth().signInWithCredential(credentials);
          }).then(function (firebaseUser) {
            //memorizza firebaseUser.uid
              $localStorage.uid = firebaseUser.uid;
              var refDB = window.database.ref().child("users/" + firebaseUser.uid);
              refDB.once('value', function (snapshot) {

                //Se utente non esiste
                  if (snapshot.val() === null) {
                    window.database.ref().child("users/" + firebaseUser.uid).set({
                      events: {
                        event1: {
                          role: "user"
                        }
                      }
                    });
                    $state.go("menu.home");
                  }else { //se utente esiste già nel database
                    $state.go("menu.home");
                  }
                })
          }).catch(function (error) {
              alert("Authentication failed");
              console.error("Authentication failed:", error);
          });
        }
      }
    }
  ])

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

  .controller('countdownCtrl', ['$scope', '$timeout', '$cordovaFile', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $timeout, $cordovaFile, $stateParams) {
      $scope.counter = 10;

      var rect = document.getElementById("contentCamera").getBoundingClientRect();
      console.log("rect= " + rect.height + " " + rect.width + " " + rect.bottom + " " + rect.left);

      var tapEnabled = true; //enable tap take picture
      var dragEnabled = true; //enable preview box drag across the screen
      var toBack = true; //send preview box to the back of the webview
      var rect = {x: 30, y: 80, width: 300, height: 300};
      //cordova.plugins.camerapreview.startCamera(rect, "front", tapEnabled, dragEnabled, toBack)

      cordova.plugins.camerapreview.startCamera(rect, 'front', true, true, false);

      $scope.playCountdown = function () {
        $scope.onTimeout = function () {
          $scope.counter--;
          countdown = $timeout($scope.onTimeout, 1000);
          if ($scope.counter == 0) {
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

              $scope.$apply(function () {

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
        var countdown = $timeout($scope.onTimeout, 1000);
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


  .controller('eventInfoCtrl', ['$scope', '$cordovaCamera', 'storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $cordovaCamera, storage) {

      $scope.takeImage = false;
      $scope.takePhoto = function () {
        $cordovaCamera.getPicture(setOptionsCamera(Camera.PictureSourceType.CAMERA)).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
          $scope.takeImage = true;
          console.log($scope.takeImage);
        }, function (err) {
          console.log("error eventInfoCtrl " + err)
        });
      };

      $scope.sharePhoto = function () {
        storage.upload('ecco2/', "share2", $scope.imgURI);
      }
    }])





  .controller("MenuController", ['$scope', '$http', '$sessionStorage', '$location',
    function ($scope, $http, $sessionStorage, $location) {

      $scope.init = function () {
        if ($sessionStorage.hasOwnProperty("accessToken") === true) {
          $http.get("https://graph.facebook.com/v2.2/me", {
            params: {
              access_token: $sessionStorage.accessToken,
              fields: "id,name,gender,location,website,picture.type(large),relationship_status",
              format: "json"
            }
          }).then(function (result) {
            $scope.profileData = result.data;
          }, function (error) {
            alert("There was a problem getting your profile.  Check the logs for details.");
            console.log(error);
          });
        } else {
          alert("aasdasd");
        }
      };
    }])

  .controller('galleriaCtrl', ['$scope', '$stateParams','storage','$firebaseObject', '$firebaseStorage', 'shareData','$window',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName

    function ($scope, $stateParams, storage, $firebaseObject, $firebaseStorage, shareData,$window) {
      $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
      });

      var lynk;
      var count;
      $scope.prova = function () {
//ottenere numero foto ed eventi
        /*
         $scope.myGoBack = function() {
         $ionicHistory.goBack();
         };
         */
        $scope.items = [];

        $scope.data = shareData.getData();



        //  console.log("qua va" + $scope.data)
        //percorso per le foto degli eventi
        var query = firebase.database().ref("events/" + $scope.data + '/pictures');
        query.once("value")
          .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {

              // childData will be the actual contents of the child
              var childData = childSnapshot.val();
//console.log("nome immagini"+childData);


              var ref = firebase.storage().ref($scope.data + '/' + childData);
              var storageFire = $firebaseStorage(ref);

              storageFire.$getDownloadURL().then(function (imgSrc) {
                // storage.download('ecco2/prova1').then(function (imgSrc) {
                // $scope.srcImg = imgSrc;

                //    console.log("data" + $scope.data)
                lynk = imgSrc.toString();
                //  console.log("pulled")
                $scope.items.push({src: lynk});

              });
            });
          });

      }

      //istanziare la gallery

      $scope.prova();


    }]);


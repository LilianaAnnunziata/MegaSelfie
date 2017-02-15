//Funzioni con un particolare scopo
angular.module('app.controllers', ['ngCordova', 'omr.directives','ionic', 'ion-gallery','angular-svg-round-progressbar'])

  .controller('homeCtrl', ['$scope', '$localStorage', '$firebaseStorage', 'shareData', 'GeoAlert','databaseMegaselfie','$state',
    function ($scope, $localStorage, $firebaseStorage, shareData, GeoAlert, databaseMegaselfie, $state) {


    var liveEvent;

      $scope.goTo = function (info) {
        var object = JSON.parse(info);
        shareData.setData(object);
      }


      function onConfirm(idx,eventObj) {
        if(idx == 2){
          databaseMegaselfie.enrollEvent(eventObj.eventID);
          $state.go("menu.countdown");
        }
      }

      $scope.coordinate = function () {
        GeoAlert.begin(function (eventObj) {
          navigator.notification.confirm(
            'Do you want to partecipate to the Event?'+eventObj.title+"\n",
            function(buttonIndex){
              onConfirm(buttonIndex, eventObj);
            },
            'Target!',
            ['No', 'Yes']
          );
        });
      }
      $scope.stop = function () {
        GeoAlert.end();
      }

      var query = window.database.ref('users/' + $localStorage.uid);
      //var query = window.database.ref('users/K5fyK0CzdsOxDsSp5xDI3lM5YCB2/events');
      $scope.eventList = [];
      query.on("value", function (snapshot) {
        //iterazione su tutti gli eventi dell'utente
        snapshot.forEach(function (childSnapshot) {
          // recupero nome dell'evento
          var eventKey = childSnapshot.key;
          //creazione obj da inserire nella lista
          var obj = {};
          //recupero ruolo da users
          obj.role = childSnapshot.val().role;
          //accedo al nodo events, nel database
          var eventRef = window.database.ref('events/' + eventKey);
          //accedo a campi dell'evento

          eventRef.on("value", function (snapshot) {
            var eventObj = snapshot.val();
            //console.log(eventKey)
            obj.eventID = eventKey;
            obj.title = eventObj.title;
            obj.description = eventObj.description;
            obj.start = eventObj.start;
            obj.timeStart = eventObj.TimeStart;
            obj.end = eventObj.end;
            obj.timeEnd = eventObj.TimeEnd;
            var eventStorageRef = window.storage.ref(eventKey + "/" + "icon.png");
            var storageFire = $firebaseStorage(eventStorageRef);
            storageFire.$getDownloadURL().then(function (imgSrc) {
              obj.src = imgSrc;
              $scope.eventList.push(obj);
            });
          });
        });
      });
    }])


  .controller('createLiveEventCtrl', ['$scope', '$stateParams', 'dateFilter', '$localStorage', '$state', 'databaseMegaselfie','$q',
    function ($scope, $stateParams, dateFilter, $localStorage, $state,databaseMegaselfie,$q) {

      $scope.startLiveEvent = function (liveEvent) {
        console.log(liveEvent.name + " " + liveEvent.range);
/*
        navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude,
            lng = position.coords.longitude,
            today = new Date();
          console.log(" " + lat + " "+lng);

          if (liveEvent.name === undefined)
            liveEvent.name = '';
          console.log("range" + liveEvent.range)
          if (liveEvent.range === undefined)
            liveEvent.range = 0;

          var objToSend = {
            title: liveEvent.name,
            start: dateFilter(today, "dd/MM/yyyy"),
            TimeStart: dateFilter(today, "HH:mm"),
            users: {
              admin: $localStorage.uid
            }
          };
          console.log(objToSend + " " + liveEvent.range);

          var coordinate = {latitude: lat, longitude: lng, range: liveEvent.range}

          var newEventKey =  databaseMegaselfie.createEventMegaselfie(objToSend,coordinate)


        });*/
        $state.go("countdown");

      }
    }
  ])

  .controller('createSharedEventCtrl', ['$scope', 'dateFilter', '$http', '$cordovaCamera',
    'storage', '$localStorage', '$state',
    'databaseMegaselfie','$q',
    function ($scope, dateFilter, $http, $cordovaCamera, storage, $localStorage, $state,databaseMegaselfie,$q) {

      $scope.date = dateFilter(new Date(), "dd/MM/yyyy");

      var event = $scope.event;

      $scope.submitData = function (event) {

        if ($scope.createSharedEventForm.$valid && $scope.imgURI != undefined) {
          var startTime = dateFilter(event.startTime, "HH:mm");
          var endTime = dateFilter(event.endTime, "HH:mm");
          var description = event.description;
          console.log(description);
          if (description == undefined)
            description = "";
          if (startTime == null)
            startTime = "00:00";
          if (endTime == null)
            endTime = "00:00";

          var objToSend = {
            title: event.nameSharedEvent,
            description: description,
            start: dateFilter(event.startDate, "dd/MM/yyyy"),
            TimeStart: startTime,
            end: dateFilter(event.endDate, "dd/MM/yyyy"),
            TimeEnd: endTime,
            users: {
              admin: $localStorage.uid
            },
          }
          console.log(objToSend);

         /*$q.when(databaseMegaselfie.createEventMegaselfie(objToSend))
            .then(function (newEventKey) {
              console.log("then"+newEventKey.key)

             // storage.upload(newEventKey + '/', "icon.png", $scope.imgURI);

              $state.go("menu.home");
          })*/
         var newEventKey = databaseMegaselfie.createEventMegaselfie(objToSend)
         storage.upload(newEventKey + '/', "icon.png", $scope.imgURI);
         $state.go("menu.home");
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

  .controller('menuCtrl', ['$scope', '$http', '$location', '$localStorage',
    function ($scope, $http, $location, $localStorage) {

      $scope.init = function () {
        if ($localStorage.hasOwnProperty("accessToken") === true) {
          $http.get("https://graph.facebook.com/v2.2/me", {
            params: {
              access_token: $localStorage.accessToken,
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
    '$cordovaOauth', '$firebaseAuth', '$state', '$localStorage',
    function ($scope, $stateParams, $firebaseObject, $cordovaOauth,
              $firebaseAuth, $state, $localStorage) {
      if ($localStorage.uid)
        $state.go("menu.home");
      else {
        $scope.login = function () {
          $cordovaOauth.facebook("727495594069595", ["email"]).then(function (result) {
            var credentials = firebase.auth.FacebookAuthProvider.credential(result.access_token);
            $localStorage.accessToken = result.access_token;
            return firebase.auth().signInWithCredential(credentials);
          }).then(function (firebaseUser) {
            //memorizza firebaseUser.uid
            $localStorage.uid = firebaseUser.uid;
            var refDB = window.database.ref();
            var refDBUsers = refDB.child("users/" + firebaseUser.uid);
            refDBUsers.once('value', function (snapshot) {

              //Se utente non esiste
              if (snapshot.val() === null) {
                refDBUsers.set({
                  event1: {
                    role: "user"
                  }
                });

                refDB.child("events/event1/users/")
                var updates = {'events/event1/users/user': $localStorage.uid};
                console.log(updates);
                refDB.update(updates);

                $state.go("menu.home");

              } else { //se utente esiste già nel database
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

  .controller('countdownCtrl', ['$scope', '$timeout', '$cordovaFile', '$stateParams', '$http','$localStorage','storage','$state',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $timeout, $cordovaFile, $stateParams, $http,$localStorage,storage, $state) {


     // var rect = document.getElementById("contentCamera").getBoundingClientRect();
     // console.log("rect= " + rect.height + " " + rect.width + " " + rect.bottom + " " + rect.left);

      var rect = {x: 30, y: 80, width: 200, height: 200};
     // cordova.plugins.camerapreview.startCamera(rect, "front", tapEnabled, dragEnabled, toBack)

      cordova.plugins.camerapreview.startCamera(rect, 'front', true, true, false);
      $scope.onTimeout = function () {
        if ($scope.timer === 0) {
          $scope.$broadcast('timer-stopped', 0);
          $timeout.cancel(mytimeout);
          cordova.plugins.camerapreview.takePicture({maxWidth:300, maxHeight:300})
          cordova.plugins.camerapreview.setOnPictureTakenHandler(function(picture) {
            document.getElementById('originalPicture').src = picture[0];
            cordova.plugins.camerapreview.stopCamera();
//console.log(picture[0])
            console.log(picture[1])


            // databaseMegaselfie.joinEvent($scope.obj.eventID)
            //  storage.upload($scope.obj.eventID + "/", $localStorage.uid, $scope.imgURI);

            //$scope.imgURI = picture[0];

          });




          return;



        }
        $scope.timer--;
        mytimeout = $timeout($scope.onTimeout, 1000);
      };
      // functions to control the timer
      // starts the timer
      $scope.startTimer = function () {
        mytimeout = $timeout($scope.onTimeout, 1000);
        $scope.started = true;
      };

      // stops and resets the current timer
      $scope.stopTimer = function (closingModal) {
        if (closingModal != true) {
          $scope.$broadcast('timer-stopped', $scope.timer);
        }
        $scope.timer = $scope.timeForTimer;
        $scope.started = false;
        $scope.paused = false;
        $timeout.cancel(mytimeout);
      };
      // pauses the timer
      $scope.pauseTimer = function () {
        $scope.$broadcast('timer-stopped', $scope.timer);
        $scope.started = false;
        $scope.paused = true;
        $timeout.cancel(mytimeout);
      };

      // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
      $scope.$on('timer-stopped', function (event, remaining) {
        if (remaining === 0) {
          $scope.done = true;
         ;

          //  cordova.plugins.camerapreview.stopCamera();
          //  window.plugins.CameraPictureBackground.takePicture(success, error, options);

        }
      });
      // UI
      // When you press a timer button this function is called
      $scope.selectTimer = function (val) {
        $scope.timeForTimer = val;
        $scope.timer = val
        $scope.started = false;
        $scope.paused = false;
        $scope.done = false;
      };

      // This function helps to display the time in a correct way in the center of the timer
      $scope.humanizeDurationTimer = function (input, units) {
        // units is a string with possible values of y, M, w, d, h, m, s, ms
        if (input == 0) {
          return 0;
        } else {
          var duration = moment().startOf('day').add(input, units);
          var format = "";
          if (duration.hour() > 0) {
            format += "H[h] ";
          }
          if (duration.minute() > 0) {
            format += "m[m] ";
          }
          if (duration.second() > 0) {
            format += "s[s] ";
          }
          return duration.format(format);
        }
      };


//camera



      $scope.uscita=function(){
        cordova.plugins.camerapreview.stopCamera()
        $state.go('menu.createLiveEvent');
      }



            //   cordova.plugins.camerapreview.stopCamera





      }

    ])

  .controller('eventEditCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams) {


    }])


  .controller('eventInfoCtrl', ['$scope', '$cordovaCamera', 'storage', 'shareData', '$localStorage','databaseMegaselfie',
    function ($scope, $cordovaCamera, storage, shareData, $localStorage,databaseMegaselfie) {

      $scope.obj = shareData.getData();
      console.log(shareData.getData())

      $scope.takeImage = false;
      $scope.takePhoto = function () {
        $cordovaCamera.getPicture(setOptionsCamera(Camera.PictureSourceType.CAMERA)).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
          $scope.takeImage = true;
        }, function (err) {
          console.log("error eventInfoCtrl " + err)
        });
      };

      $scope.sharePhoto = function () {
        databaseMegaselfie.joinEvent($scope.obj.eventID)
        storage.upload($scope.obj.eventID + "/", $localStorage.uid, $scope.imgURI);
      }
    }])


  .controller('galleriaCtrl', ['$scope', '$stateParams', 'storage', '$firebaseObject', '$firebaseStorage', 'shareData', '$window',
    function ($scope, $stateParams, storage, $firebaseObject, $firebaseStorage, shareData, $window) {
      //funzione per il tasto di back
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
//ottenere nome dell'evento selezionato passato attraverso il service
        $scope.data = shareData.getData();


        //  console.log("qua va" + $scope.data)
        //percorso per le foto degli eventi
        var query = firebase.database().ref("events/" + $scope.data.eventID + '/pictures');
        query.once("value")
          .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {

              // childData will be the actual contents of the child
              var childData = childSnapshot.val();


              var ref = firebase.storage().ref($scope.data.eventID + '/' + childData);
              var storageFire = $firebaseStorage(ref);

              storageFire.$getDownloadURL().then(function (imgSrc) {

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


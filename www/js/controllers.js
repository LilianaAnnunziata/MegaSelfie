//Funzioni con un particolare scopo
angular.module('app.controllers', ['ngCordova', 'omr.directives', 'ionic', 'ion-gallery', 'angular-svg-round-progressbar'])

  .controller('homeCtrl', ['$scope', '$localStorage', '$firebaseStorage', 'shareData', 'GeoAlert', 'databaseMegaselfie', '$state',
    function ($scope, $localStorage, $firebaseStorage, shareData, GeoAlert, databaseMegaselfie, $state) {


      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storePosition);
      } else {
        alert("GPS is off")
      }

      function storePosition(position) {
        $localStorage.lat = position.coords.latitude;
        $localStorage.long = position.coords.longitude;
        GeoAlert.begin();
      }


      $scope.goTo = function (info) {
        var object = JSON.parse(info);
        shareData.setData(object);
      }

      var query = window.database.ref('users/' + $localStorage.uid);
      //var query = window.database.ref('users/K5fyK0CzdsOxDsSp5xDI3lM5YCB2/events');
      $scope.eventList = [];
      query.on("value", function (snapshot) {
        //iterazione su tutti gli eventi dell'utente
        snapshot.forEach(function (childSnapshot) {
          // recupero nome dell'evento
          var eventKey = childSnapshot.key;
          //console.log(eventKey)
          //creazione obj da inserire nella lista
          var obj = {};
          //recupero ruolo da users
          obj.role = childSnapshot.val().role;
          //accedo al nodo events, nel database
          var eventRef = window.database.ref('events/' + eventKey);
          //accedo a campi dell'evento

          eventRef.on("value", function (snapshot) {
            var eventObj = snapshot.val();
            obj.eventID = eventKey;
            obj.title = eventObj.title;
            obj.description = eventObj.description;
            obj.createdBy = eventObj.createdBy;
            obj.start = eventObj.start;
            obj.timeStart = eventObj.TimeStart;
            obj.end = eventObj.end;
            obj.timeEnd = eventObj.TimeEnd;
            obj.timestamp = eventObj.timestamp;
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


  .controller('createLiveEventCtrl', ['$scope', '$stateParams', 'dateFilter', '$localStorage', '$state', 'databaseMegaselfie', '$cordovaGeolocation', 'shareData',
    function ($scope, $stateParams, dateFilter, $localStorage, $state, databaseMegaselfie, $cordovaGeolocation, shareData) {

      var options = {timeout: 10000, enableHighAccuracy: true};
      $scope.liveEvent = {};
      $scope.liveEvent.range = 100;
      $scope.isDisabled = true;

      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

        var latLng = $scope.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var mapOptions = {
          center: latLng,
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.circle = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: $scope.map,
          center: $scope.latLng,
          radius: 100
        });

      }, function (error) {
        navigator.notification.alert('Please activate the GPS sensor');

      });

      $scope.slideChange = function (liveEvent) {
        var range = parseInt(liveEvent.range);
        if ($scope.circle)
          $scope.circle.setMap(null);
        $scope.circle = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: $scope.map,
          center: $scope.latLng,
          radius: range
        });
      };

      $scope.startLiveEvent = function (liveEvent) {

        navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude,
            lng = position.coords.longitude,
            today = new Date();

          var objToSend = {
            createdBy: $localStorage.profileData.name,
            title: liveEvent.name,
            start: dateFilter(today, "dd/MM/yyyy"),
            TimeStart: dateFilter(today, "HH:mm"),
            users: {
              admin: $localStorage.uid
            }
          };
          var coordinate = {latitude: lat, longitude: lng, range: liveEvent.range}

          var imgSrc = cordova.file.applicationDirectory + 'www/img/liveIcon.png';

          window.resolveLocalFileSystemURL(imgSrc, function (fileEntry) {
              // success callback; generates the FileEntry object needed to convert to Base64 string convert to Base64 string
              function win(file) {
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                  var img = evt.target.result; // this is your Base64 string

                  var newEventKey = databaseMegaselfie.createEventMegaselfie(objToSend, coordinate, img)

                  objToSend.eventID = newEventKey;
                  objToSend.range = liveEvent.range;
                  console.log(objToSend);

                  shareData.setData(objToSend);
                };
                reader.readAsDataURL(file);
              };
              var fail = function (evt) {
                console.log("Error file")
              };
              fileEntry.file(win, fail);
            },
            // error callback
            function (error) {
              console.log("Errore" + error)
            }
          );


        });
        $state.go("countdown");
      }

      $scope.activateEventButton = function () {
        $scope.isDisabled = false;

      }
    }
  ])

  .controller('createSharedEventCtrl', ['$scope', 'dateFilter', '$http', '$cordovaCamera', '$localStorage', '$state',
    'databaseMegaselfie',
    function ($scope, dateFilter, $http, $cordovaCamera, $localStorage, $state, databaseMegaselfie) {

      $scope.date = dateFilter(new Date(), "dd/MM/yyyy");

      var event = $scope.event;

      $scope.submitData = function (event) {

        if ($scope.createSharedEventForm.$valid && $scope.imgURI) {
          var startTime = dateFilter(event.startTime, "HH:mm");
          var endTime = dateFilter(event.endTime, "HH:mm");
          var description = event.description;
          var statData = dateFilter(event.startDate, "dd/MM/yyyy");
          var endData = dateFilter(event.endDate, "dd/MM/yyyy");
          if (!description)
            description = "";
          if (!startTime)
            startTime = "00:00";
          if (!endTime)
            endTime = "00:00";

          var d = new Date(dateFilter(event.endDate, "MM/dd/yyyy") +" "+endTime);
          var n = d.getTime();

          console.log(d +" "+n);

          var objToSend = {
            createdBy: $localStorage.profileData.name,
            title: event.nameSharedEvent,
            description: description,
            start: statData,
            TimeStart: startTime,
            end: endData,
            TimeEnd: endTime,
            timestamp: n,
            users: {
              admin: $localStorage.uid
            }
          }

          databaseMegaselfie.createEventMegaselfie(objToSend, null, $scope.imgURI);
          console.log($localStorage);
          setTimeout(function () {
            $state.go("menu.home");
          }, 2500);
        }
        else
          alert("Input not valid");
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
            $localStorage.profileData = $scope.profileData = result.data;
          }, function (error) {
            alert("There was a problem getting your profile");
            console.log(error);
          });
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

  .controller('countdownCtrl', ['$scope', '$timeout', '$cordovaFile', '$stateParams', '$http', '$localStorage', '$state', 'shareData', 'databaseMegaselfie',
    function ($scope, $timeout, $cordovaFile, $stateParams, $http, $localStorage, $state, shareData, databaseMegaselfie) {

      var rect = {x: 0, y: 0, width: window.screen.width, height: window.screen.height};
      cordova.plugins.camerapreview.startCamera(rect, 'front', true, true, true);
      $scope.onTimeout = function () {
        if ($scope.timer === 0) {
          $scope.$broadcast('timer-stopped', 0);
          $timeout.cancel(mytimeout);

          cordova.plugins.camerapreview.takePicture({maxWidth:window.screen.width, maxHeight:window.screen.height})
          cordova.plugins.camerapreview.setOnPictureTakenHandler(function(picture) {

            document.getElementById('originalPicture').src = picture[0];
            cordova.plugins.camerapreview.stopCamera();

            var img = document.getElementById('originalPicture').src;
            window.resolveLocalFileSystemURL(img, function (fileEntry) {
                // success callback; generates the FileEntry object needed to convert to Base64 string convert to Base64 string
                function win(file) {
                  var reader = new FileReader();
                  reader.onloadend = function (evt) {
                    var obj = evt.target.result; // this is your Base64 string
                    databaseMegaselfie.joinEvent(shareData.getData().eventID, obj, 'live');
                  };
                  reader.readAsDataURL(file);
                };
                var fail = function (evt) {
                  console.log("Error file")
                };
                fileEntry.file(win, fail);
              },
              // error callback
              function (error) {
                console.log("Errore" + error)
              }
            );
          });
          return;
        }
        $scope.timer--;
        mytimeout = $timeout($scope.onTimeout, 1000);
      };
      // functions to control the timer starts the timer
      $scope.startTimer = function () {
        mytimeout = $timeout($scope.onTimeout, 1000);
        $scope.started = true;
      };


      // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
      $scope.$on('timer-stopped', function (event, remaining) {
        if (remaining === 0) {
          $scope.done = true;
          //  cordova.plugins.camerapreview.stopCamera();
          //  window.plugins.CameraPictureBackground.takePicture(success, error, options);

        }
      });
      // UI When you press a timer button this function is called
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

      $scope.uscita = function () {
        cordova.plugins.camerapreview.stopCamera()
        $state.go('menu.home');
      }
    }

  ])

  .controller('eventEditCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams) {


    }])


  .controller('eventInfoCtrl', ['$scope', '$cordovaCamera', 'shareData', '$localStorage', 'databaseMegaselfie',
    function ($scope, $cordovaCamera, shareData, $localStorage, databaseMegaselfie) {

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
        databaseMegaselfie.joinEvent($scope.obj.eventID, $scope.imgURI)
      }
    }])


  .controller('galleriaCtrl', ['$scope', '$stateParams', 'storage', '$firebaseObject', '$firebaseStorage', 'shareData', '$window',
    function ($scope, $stateParams, storage, $firebaseObject, $firebaseStorage, shareData, $window) {
      //funzione per il tasto di back
      $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
      });

      var lynk;
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


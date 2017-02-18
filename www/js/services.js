//servizi built-in. NB istanziati una sola volta
angular.module('app.services', [])

  .factory("chatMessages", ["$firebaseArray",
    function ($firebaseArray) {
      // create a reference to the database where we will store our data
      var ref = firebase.database().ref();

      return $firebaseArray(ref);
    }
  ])
  .factory("store", ["$firebaseStorage",
    function ($firebaseStorage) {
      // create a reference to the database where we will store our data
      var ref = firebase.storage().ref();

      return $firebaseStorage(ref);
    }
  ])

  .service('databaseMegaselfie', ["$firebaseObject", "$localStorage", 'storage',
    function ($firebaseObject, $localStorage, storage) {

      var database = window.database.ref();

      this.getRefDatabase = function (path) {
        refDB = database.ref(path);
        console.log("eccomiii");
        return $firebaseObject(refDB);
      }

      this.createEventMegaselfie = function (objToSend, coordinates, img) {

        //restituisce la nuova chiave dell'evento
        var newEventKey = database.child('events').push().key;

        // scrive un nuovo evento sia in events, sia in users
        var updates = {};

        //Se è un evento Live
        if (coordinates)
          updates['/coordinates/' + newEventKey] = coordinates;

        updates['/events/' + newEventKey] = objToSend;
        updates['/users/' + $localStorage.uid + '/' + newEventKey] = {role: 'admin'};

        console.log("databaseMegaselfie:CreateEvent " + newEventKey)
        database.update(updates);

        if (img)
          storage.upload(newEventKey + '/', "icon.png", img);

        return newEventKey;
      }

      /*Partecipa all'evento=> aggiungo in events/idEvento/pictures*/
      this.joinEvent = function (eventID, img) {

        //inserisce la foto in pictures
        var updates = {};
        updates['/events/' + eventID + "/" + "pictures/" + $localStorage.uid] = $localStorage.uid;
        //updates['/users/' + $localStorage.uid + '/' + newEventKey ] = userRole;

        database.update(updates);
        //Caricamento immagine
        storage.upload(eventID + "/", $localStorage.uid, img);
      }

      /*iscrizione all'evento=> aggiunta in events/idEvento/users*/
      this.enrollEvent = function (eventID) {
        var updates = {};
        updates['/events/' + eventID + "/" + "users"] = {user: $localStorage.uid};
        updates['/users/' + $localStorage.uid + '/' + eventID] = {role: 'user'};

        console.log(updates)
        database.update(updates);
      }
    }
  ])

  .service('storage', [
    function () {

      var storage = firebase.storage();

      this.download = function (path) {
        var refStorage = storage.ref(path);
        return refStorage.getDownloadURL() + ".json";
        /*.then(function (url) {
         // This can be downloaded directly:
         var xhr = new XMLHttpRequest();
         xhr.responseType = 'blob';
         xhr.onload = function (event) {
         var blob = xhr.response;
         };
         xhr.open('GET', url);
         xhr.send();

         console.log("download " + url);
         // var pathReference = storage.ref('ecco2/prova1.jpg').getDownloadURL().then(function(url) {
         urlToReturn = url;
         });
         return urlToReturn;*/
      }
      this.upload = function (path, filename, imgURI) {
        var refStore = storage.ref(path + filename);


        var uploadTask = refStore.put(dataURItoBlob(imgURI, 'image/jpeg'));
        // var uploadTask = refStore.put(imgURI);

        console.log("EKDKFF")
        uploadTask.on('state_changed', function (snapshot) {
          console.log("uploadTask");

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
        }, function (error) {
          console.log("Errore " + error)
        }, function () {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          var downloadURL = uploadTask.snapshot.downloadURL;
          alert("Upload Complete!")
        });

      }


    }])

  .service('shareData', function () {
    return {
      setData: setData,
      getData: getData,
      shared_data: {}
    }

    function setData(data) {
      this.shared_data = data
    }

    function getData() {
      return this.shared_data
    }
  })


  .factory('saveData', function () {
    var savedData = {}

    function set(data) {
      savedData = data;
    }

    function get() {
      return savedData;
    }

    return {
      set: set,
      get: get
    }

  })

  .factory("Profile", ["$firebaseObject",
    function ($firebaseObject) {
      return function (username) {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("rooms").push();
        var profileRef = ref.child(username);

        // return it as a synchronized object
        return $firebaseObject(profileRef);
      }
    }
  ])


  .factory('GeoAlert', ["$localStorage", "$state", "databaseMegaselfie", '$ionicPopup', 'firebase',
    function ($localStorage, $state, databaseMegaselfie, $ionicPopup, firebase) {
      var interval, alert = false;
      //var duration = 6000;
      //  var processing = false;
      var callback;
      var eventList = [];
      var ref=window.database.ref();

      // Credit: http://stackoverflow.com/a/27943/52160
      function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
          ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
      }

      function deg2rad(deg) {
        return deg * (Math.PI / 180)
      }

      function onConfirm(idx, eventObj) {
        console.log(idx)
        if (idx) {
          //databaseMegaselfie.enrollEvent(eventObj.eventID);
          console.log("ok")
          alert = true;
          //$state.go("countdown");

          return;
        } else {
          alert = false;
          console.log("no")
        }
      }

      function hb() {
        // if(processing) return;
        //  processing = true;
          var eventDistMin = [];

          navigator.geolocation.getCurrentPosition(function (position) {
            console.log("3")
            // processing = false;
            //itera su tutti gli eventi nella lista
            eventList.forEach(function (event) {
              console.log("4")

              var dist = getDistanceFromLatLonInKm(event.lat, event.long, position.coords.latitude, position.coords.longitude);

              if (dist <= event.minDistance) {
                //itera su tutti gli eventi
                console.log("5")
                var id = event.eventKey;
                var promise = ref.child('events/' + id + "/" + "users").once('value').then(function (eventUser) {
                  console.log("6")
                  if (!eventUser.val() || !eventUser.val().user || eventUser.val().user != $localStorage.uid) {
                    console.log(eventUser.val())

                    var confirmPopup = $ionicPopup.confirm({
                      title: 'Do you want to partecipate to the Event?' +"\n",
                      template: 'Start Date and Time:'
                    });

                    confirmPopup.then(function (buttonIndex) {
                      console.log("7")
                      onConfirm(buttonIndex);
                    });
                    return eventUser.val();
                  }
                }, function (error) {
                  console.error(error);
                });
                eventDistMin.push(promise);
              }
            })
          });
        return firebase.Promise.all(eventDistMin);
      }

      function loadMeetings(city, state) {
        //$('#meetingsTable').empty();
        return ref.child('states').child(state).child(city).once('value').then(function (snapshot) {
          var reads = [];
          snapshot.forEach(function (childSnapshot) {
            var id = childSnapshot.key();
            var promise = ref.child('meetings').child(id).once('value').then(function (snap) {
              return snap.val();
            }, function (error) {
              // The Promise was rejected.
              console.error(error);
            });
            reads.push(promise);
          });
          return Promise.all(reads);
        }, function (error) {
          // The Promise was rejected.
          console.error(error);
        }).then(function (values) {
          console.log('all done', values); // [snap, snap, snap]
        });
      }

      function getEvent() {
        var eventUserRef = window.database.ref().child('events/' + event.eventKey + '/users');
        console.log("geol " + event.eventKey);
        eventUserRef.once("value").then(function (eventUser) {
          console.log("6")

          console.log(eventUser.val())
          if (!alert && (!eventUser.val() || !eventUser.val().user || eventUser.val().user != $localStorage.uid)) {
            console.log("7eccomi");

            /* var confirmPopup = $ionicPopup.confirm({
             title: 'Do you want to partecipate to the Event?'+eventObj.title+"\n",
             template: 'Are you sure you want to eat this ice cream?'
             });

             confirmPopup.then(function(buttonIndex) {
             onConfirm(buttonIndex, eventObj);
             });

             navigator.notification.confirm(
             'Do you want to partecipate to the Event?'+eventObj.title+"\n",
             function(buttonIndex){
             onConfirm(buttonIndex, eventObj);
             },
             'Target!',
             ['No', 'Yes']
             );*/
            // callback(eventObj);
          }
        });
      }

      return {
        begin: function () {
          //callback = cb;
          // interval = window.setInterval(hb, duration);

          alert = false;
          window.database.ref('coordinates/').once("value",
            function (snapshot) {
              snapshot.forEach(function (childSnapshot) {
                var obj = {}
                obj.eventKey = childSnapshot.key;
                obj.lat = childSnapshot.val().latitude;
                obj.long = childSnapshot.val().longitude;
                obj.minDistance = childSnapshot.val().range;
                console.log("1")
                eventList.push(obj);

              });
            }).then(function () {
            console.log("2")

            hb().then(function (prova) {
              console.log("8")
            });
          })
        },
        end: function () {
          window.clearInterval(interval);
        }
      };

    }]);


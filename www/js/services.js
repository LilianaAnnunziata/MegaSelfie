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

  .service('databaseMegaselfie', ["$firebaseObject", "$localStorage", 'storage', 'shareData', '$state', '$firebaseStorage', '$ionicPopup',
    function ($firebaseObject, $localStorage, storage, shareData, $state, $firebaseStorage, $ionicPopup) {

      var database = window.database.ref();

      //Recupero connessione
      this.getConnection = function () {
        var connectedRef = window.database.ref(".info/connected");
        connectedRef.on("value", function (snap) {
          if (!snap.val()) {
            $ionicPopup.alert({
              title: 'Connection off',
              template: 'Verify your network'
            });
          }
        });
      };

      //creazione Evento: se Live ho parametro coordinates, altrimenti no
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

        //caricamento evento nel DB: evento creato in: events/eventKey; users/uid/eventKey; coordinates/eventKey (se Live)
        database.update(updates);

        //caricamento immagine
        if (img)
          storage.upload(newEventKey + '/', "icon.png", img);

        //return della nuova chiave
        return newEventKey;
      };

      /*Partecipa all'evento=> aggiungo in events/eventKey/pictures*/
      this.joinEvent = function (eventID, img, type) {

        //inserisce la foto in pictures
        var updates = {};
        updates['/events/' + eventID + "/" + "pictures/" + $localStorage.uid] = $localStorage.uid;

        database.update(updates);

        //Caricamento immagine
        storage.upload(eventID + "/", $localStorage.uid, img, type);
      };

      /*iscrizione all'evento=> aggiunta in events/eventKey/users; events/eventKey */
      this.enrollEvent = function (eventID) {
        var updates = {};
        updates['/events/' + eventID + "/" + "users/" + $localStorage.uid] = 'user';
        updates['/users/' + $localStorage.uid + '/' + eventID] = {role: 'user'};

        database.update(updates);
      };

      this.startLiveEvent = function (eventID) {
        var updates = {};
        updates['/events/' + eventID + '/countdownStarted'] = true;
        updates['/events/' + eventID + '/closed'] = true;

        database.update(updates);
      };

      this.deleteEvent = function (eventID, role) {
        var updates = {};

        if(role == 'admin'){
          updates['/coordinates/' + eventID] = null;
        }

        updates['/events/' + eventID + "/users/" + $localStorage.uid] = null;
        updates['/events/' + eventID + "/pictures/" + $localStorage.uid] = null;
        updates['/users/' + $localStorage.uid + "/" + eventID] = null;

        database.update(updates);

        storage.deleteSelfie(eventID);
      };

      this.getSharedEvent = function (eventID) {
        var obj = {};
        var eventStorageRef = window.storage.ref(eventID + "/" + "icon.png");
        var storageFire = $firebaseStorage(eventStorageRef);

        storageFire.$getDownloadURL().then(function (imgSrc) {
          obj.src = imgSrc;

          database.child('events/' + eventID).once('value', function (eventSnapshot) {

            var eventObj = eventSnapshot.val();
            var start = eventObj.start ? eventObj.start.split(" ") : undefined;
            var end = eventObj.end.split(" ");
            var endDateSplit = end[0].split("/");
            var endTimeSplit = end[1].split(":");

            obj.timestamp = new Date(endDateSplit[2], endDateSplit[1] - 1, endDateSplit[0], endTimeSplit[0], endTimeSplit[1]).getTime();
            obj.title = eventObj.title;
            obj.description = eventObj.description;
            obj.createdBy = eventObj.createdBy;
            obj.startDate = start[0];
            obj.startTime = start[1];
            obj.endDate = end[0];
            obj.endTime = end[1];
            shareData.setData(obj);
          }).then(function () {
            var confirmed = confirm('Do you want to participate to "' + obj.title + '"?');
            if (confirmed) {
              var updates = {};
              updates['/events/' + eventID + "/" + "users/" + $localStorage.uid] = 'user';
              updates['/users/' + $localStorage.uid + '/' + eventID] = {role: 'user'};
              database.update(updates);
              $state.go("eventInfo");
            }
            else
              $state.go("menu.home");
          });
        })
      }
    }
  ])

  .service('storage', ['$state', '$localStorage', '$ionicPopup',
    function ($state, $localStorage, $ionicPopup) {

      var storage = firebase.storage();

      //download delle immagini
      this.download = function (path) {
        var refStorage = storage.ref(path);
        return refStorage.getDownloadURL() + ".json";
      };

      //caricamento delle immagini su DB
      this.upload = function (path, filename, imgURI, type) {
        var refStore = storage.ref(path + filename);

        var metadata = {
          customMetadata: {
            'author': $localStorage.profileData.name
          }
        };

        //conversione img in Blob
        var uploadTask = refStore.put(dataURItoBlob(imgURI, 'image/jpeg'));

        //caricamento immagine
        uploadTask.on('state_changed', function (snapshot) {
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
          // Caricamento immagine avvenuto con successo
          uploadTask.snapshot.downloadURL;
          $ionicPopup.alert({
            title: "Info",
            template: 'Upload successful.',
            okText: 'OK :)',
            okType: 'button-calm'
          });

          refStore.updateMetadata(metadata).then(function (metadata) {
            console.log(metadata.customMetadata.author)
          }).catch(function (error) {
            console.log("Non è andato" + error)
          });
          if (type == 'live')
            $state.go("gallery");
        });
      };

      this.deleteSelfie = function (eventID) {
        // riferimento a file che deve essere cancellato
        var desertRef = storage.ref(eventID + "/" + $localStorage.uid);
        // Cancellazione File
        desertRef.delete().then(function () {
          console.log();
        }).catch(function (error) {
          switch (error.code) {
            case 'storage/object_not_found':
              // File doesn't exist
              break;

            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              $ionicPopup.alert({
                title: 'Selfie not deleted!'
              });
              break;

            case 'storage/canceled':
              // User canceled the upload
              break;
            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              break;
          }
        });


      }
    }])

  .service('shareData', function () {
    return {
      setData: setData,
      getData: getData,
      shared_data: {}
    };

    function setData(data) {
      this.shared_data = data
    }

    function getData() {
      return this.shared_data
    }
  })


  .factory('saveData', function () {
    var savedData = {};

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


  .factory('GeoAlert', ["$localStorage", "$state", "databaseMegaselfie", 'shareData', 'firebase',
    function ($localStorage, $state, databaseMegaselfie, shareData, firebase) {

      var eventList = [];

      // restituisce la distanza
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

      function hb() {
        var conf, cantConfirm;
        //itera su tutti gli eventi nella lista
        eventList.forEach(function (event) {

          var dist = getDistanceFromLatLonInKm(event.lat, event.long, $localStorage.lat, $localStorage.long);

          //se l'utente è nei pressi del raggio dell'evento. NB in metri
          var range = event.minDistance / 1000;
          if (dist <= range) {
            //recupera gli eventi live
            var eventRef = window.database.ref().child('events/' + event.eventKey);
            eventRef.once("value").then(function (eventSnapshot) {
              var eventObj = eventSnapshot.val();
              eventObj.eventID = event.eventKey;

              //Se l'utente non è iscritto all'evento

              if (!eventObj.users || (!eventObj.users[$localStorage.uid] &&
                eventObj.users.admin != $localStorage.uid)) {

                if (!cantConfirm)
                  conf = confirm('The Selfie event "' + eventObj.title + '" is close. Do you want to participate?');

                if (conf) {
                  cantConfirm = true;
                  //iscrivi utente all'evento
                  shareData.setData(eventObj);
                  databaseMegaselfie.enrollEvent(eventObj.eventID);
                  $state.go("countdown");
                }
              }
            });
          }
        });
      }

      return {
        begin: function () {
          eventList = [];
          window.database.ref('coordinates/').once("value",
            function (snapshot) {
              snapshot.forEach(function (childSnapshot) {
                var obj = {};
                obj.eventKey = childSnapshot.key;
                obj.lat = childSnapshot.val().latitude;
                obj.long = childSnapshot.val().longitude;
                obj.minDistance = childSnapshot.val().range;
                eventList.push(obj);

              })
            }).then(function () {
            hb();
          })
        }
      };
    }]);


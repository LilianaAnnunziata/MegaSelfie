//servizi built-in. NB istanziati una sola volta
angular.module('app.services', [])

  .factory("chatMessages", ["$firebaseArray",
    function($firebaseArray) {
      // create a reference to the database where we will store our data
      var ref = firebase.database().ref();

      return $firebaseArray(ref);
    }
  ])
  .factory("store", ["$firebaseStorage",
    function($firebaseStorage) {
      // create a reference to the database where we will store our data
      var ref = firebase.storage().ref();

      return $firebaseStorage(ref);
    }
  ])

  .service('database', ["$firebaseObject",
    function($firebaseObject){

      var database = firebase.database();

      this.getRefDatabase = function (path) {
        refDB = database.ref(path);
        console.log("eccomiii");
        return $firebaseObject(refDB);
      }
    }
  ])

  .service('storage', [
  function(){

    var storage = firebase.storage();

    this.download = function (path) {
      var refStorage=storage.ref(path);
      return refStorage.getDownloadURL() + ".json"; /*.then(function (url) {
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
    this.upload = function(path,filename,imgURI){
      var refStore = storage.ref(path+filename);

      var uploadTask = refStore.put(dataURItoBlob(imgURI,'image/jpeg'));

      uploadTask.on('state_changed', function(snapshot){
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
      }, function(error) {
        console.log("Errore "+error)
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = uploadTask.snapshot.downloadURL;
        alert("Upload Complete!")
      });

    }


}])

.service('shareData', function() {
  return {
    setData : setData,
    getData : getData,
    shared_data : {}
  }

  function setData(data) {
    this.shared_data = data
  }

  function getData() {
    return this.shared_data
  }
})


  .factory('saveData', function() {
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
  function($firebaseObject) {
    return function(username) {
      // create a reference to the database node where we will store our data
      var ref = firebase.database().ref("rooms").push();
      var profileRef = ref.child(username);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
])


  .factory('GeoAlert', function() {
    console.log('GeoAlert service instantiated');
    var interval;
    var duration = 6000;
    var long, lat;
    var processing = false;
    var callback;
    var minDistance;
    var eventKey;

    // Credit: http://stackoverflow.com/a/27943/52160
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1);
      var a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

    function hb() {
      if(processing) return;
      processing = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        processing = false;
        console.log(lat, long);
        console.log(position.coords.latitude, position.coords.longitude);
        var dist = getDistanceFromLatLonInKm(lat, long, position.coords.latitude, position.coords.longitude);
        console.log("dist in km is "+dist);
        if(dist <= minDistance) {
          var eventRef = window.database.ref().child('events/'+eventKey);
          eventRef.once("value", function (snapshot) {
            var eventObj = snapshot.val();
            console.log(eventObj)
            callback(eventObj);
          })
        }
      });
    }

    return {
      begin:function(cb) {
        callback = cb;
        interval = window.setInterval(hb, duration);

        window.database.ref('coordinates/').on("value",
          function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
              eventKey = childSnapshot.key;
              lat = childSnapshot.val().latitude;
              long = childSnapshot.val().longitude;
              minDistance = childSnapshot.val().range;

              console.log(lat+" "+long+" "+minDistance);
              hb();
            });
        })
      },
      end: function() {
        window.clearInterval(interval);
      }
    };

  });


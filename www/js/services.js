//servizi built-in. NB istanziati una sola volta
angular.module('app.services', [])

.service('storage', [
  function(){

    var storage = firebase.storage();

    this.download = function (path) {
      return storage.ref(path).getDownloadURL(); /*.then(function (url) {
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
}]);

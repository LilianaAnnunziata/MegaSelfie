angular.module('camera', ['ionic', 'ngCordova'])

.controller("cameraCtrl", function ($scope, $cordovaCamera) {
  canvasMain = document.getElementById("camera");;
  CanvasCamera.initialize(canvasMain);
  // define options
  var opt = {
    quality: 75,
    destinationType: CanvasCamera.DestinationType.DATA_URL,
    encodingType: CanvasCamera.EncodingType.JPEG,
    saveToPhotoAlbum:true,
    correctOrientation:true,
    width:640,
    height:480
  };
  CanvasCamera.start(opt);
  $scope.takePhoto = function () {
    CanvasCamera.takePhoto();
  }
                /*$scope.takePhoto = function () {
                  var options = {
                    quality: 75,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    //allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    // targetWidth: 300,
                    // targetHeight: 300,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: true,
                };

                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        //$scope.imgURI = "data:image/jpeg;base64," + imageData;
                    }, function (err) {
                        // An error occured. Show a message to the user
                    });
                }


                $scope.choosePhoto = function () {
                  var options = {
                    quality: 75,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    //allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    //targetWidth: 300,
                    //targetHeight: 300,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: true,
                  };

                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $scope.imgURI = "data:image/jpeg;base64," + imageData;
                    }, function (err) {
                        // An error occured. Show a message to the user
                    });
                }*/


            });

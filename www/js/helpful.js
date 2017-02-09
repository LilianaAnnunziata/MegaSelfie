/**
 * Created by Liliana on 28/01/2017.
 */
function setOptionsCamera(srcType, width, height) {

  var options;
  if(width != undefined && height != undefined) {
    console.log("heigth settato")
    options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL, //formato del valore di ritorno
      sourceType: srcType,//sorgente della foto
      allowEdit: false,//permette la modifica
      encodingType: Camera.EncodingType.JPEG, //formato di codifica della foto
      targetWidth: width,//scalatura img
      targetHeight: height,
      mediaType: Camera.PICTURE, //setta il tipo di media da selezionare
      saveToPhotoAlbum: true, //salva img nell'album
      cameraDiretion: Camera.FRONT
    };
  } else {
    console.log("heigth non settato")
    options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL, //formato del valore di ritorno
      sourceType: srcType,//sorgente della foto
      allowEdit: false,//permette la modifica
      encodingType: Camera.EncodingType.JPEG, //formato di codifica della foto
      mediaType: Camera.PICTURE, //setta il tipo di media da selezionare
      saveToPhotoAlbum: true, //salva img nell'album
      cameraDiretion: Camera.FRONT
    };
  }

  return options;
}
function dataURItoBlob(dataURI, imgType) {
  var isSemicolonExist = (dataURI.indexOf(',') >= 0) ? true : false;
 // alert(isSemicolonExist);
  var binary=[];
  if(isSemicolonExist)
    binary = atob(dataURI.split(',')[1]);
  else
    binary = atob(dataURI);
  var array = [];
  for(var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  var blob = new Blob([new Uint8Array(array)], {type: imgType});
  return blob;
}


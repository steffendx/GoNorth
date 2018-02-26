if(Dropzone) {
    Dropzone.prototype.defaultOptions.dictDefaultMessage = "Ziehe Dateien hierher zum Hochladen";
    Dropzone.prototype.defaultOptions.dictFallbackMessage = "Dein Browser unterstützt kein Drag'n'Drop Upload.";
    Dropzone.prototype.defaultOptions.dictFallbackText = "Bitte benutze das alte Upload Formular.";
    Dropzone.prototype.defaultOptions.dictFileTooBig = "Die Datei ist zu Groß ({{filesize}}MiB). Maximale Dateigröße: {{maxFilesize}}MiB.";
    Dropzone.prototype.defaultOptions.dictInvalidFileType = "Dateityp ist nicht erlaubt.";
    Dropzone.prototype.defaultOptions.dictResponseError = "Server hat mit {{statusCode}} Code geantwortet.";
    Dropzone.prototype.defaultOptions.dictCancelUpload = "Upload abbrechen";
    Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = "Soll der Upload wirklich abgebrochen werden?";
    Dropzone.prototype.defaultOptions.dictRemoveFile = "Datei entfernen";
    Dropzone.prototype.defaultOptions.dictMaxFilesExceeded = "Es können keine weiteren Dateien hochgeladen werden.";
}
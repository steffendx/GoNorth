if(Dropzone) {
    Dropzone.prototype.defaultOptions.dictDefaultMessage = "Drop file to upload";
    Dropzone.prototype.defaultOptions.dictFallbackMessage = "Your browser does not support Drag'n'Drop upload.";
    Dropzone.prototype.defaultOptions.dictFallbackText = "Please use the old upload form.";
    Dropzone.prototype.defaultOptions.dictFileTooBig = "The file is too big ({{filesize}}MiB). Maximal file size: {{maxFilesize}}MiB.";
    Dropzone.prototype.defaultOptions.dictInvalidFileType = "Invalid file type.";
    Dropzone.prototype.defaultOptions.dictResponseError = "Server responsed with {{statusCode}} Code.";
    Dropzone.prototype.defaultOptions.dictCancelUpload = "Cancel upload";
    Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = "Are you sure you want to cancel the upload?";
    Dropzone.prototype.defaultOptions.dictRemoveFile = "Remove file";
    Dropzone.prototype.defaultOptions.dictMaxFilesExceeded = "You can not upload any more files.";
}
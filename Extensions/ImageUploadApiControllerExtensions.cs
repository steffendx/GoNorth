using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Extension class for Image Upload Api Controller
    /// </summary>
    public static class BaseImageUploadApiControllerExtensions
    {
        /// <summary>
        /// Builds the image mime map
        /// </summary>
        /// <returns>Image Mime Map</returns>
        private static Dictionary<string, string> BuildImageMimeMap()
        {
            Dictionary<string, string> imageMimeMap = new Dictionary<string, string>();
            imageMimeMap.Add(".png", "image/png");
            imageMimeMap.Add(".jpg", "image/jpeg");
            imageMimeMap.Add(".jpeg", "image/jpeg");
            imageMimeMap.Add(".jpe", "image/jpeg");
            imageMimeMap.Add(".gif", "image/gif");

            return imageMimeMap;
        }

        /// <summary>
        /// Validate the image upload data
        /// </summary>
        /// <param name="controller">Controller that contains the Request to validate</param>
        /// <returns>Errormessage, null if all is good</returns>
        public static string ValidateImageUploadData(this ControllerBase controller)
        {
             // Validate Date
            if(controller.Request.Form.Files.Count != 1)
            {
                return "OnlyOneFileAllowed";
            }

            IFormFile uploadFile = controller.Request.Form.Files[0];
            if(!uploadFile.ContentType.StartsWith("image/"))
            {
                return "OnlyImagesAreAllowed";
            }

            if(!BuildImageMimeMap().ContainsKey(Path.GetExtension(uploadFile.FileName).ToLowerInvariant()))
            {
                return "ImageFormatNotSupported";
            }

            return null;
        }

        /// <summary>
        /// Returns the miem type for an extension
        /// </summary>
        /// <param name="controller">Controller that contains the Request to validate</param>
        /// <param name="extension">Extension of the file</param>
        /// <returns>Mime Type, "" if mime type is not valid</returns>
        public static string GetImageMimeTypeForExtension(this ControllerBase controller, string extension)
        {
            extension = extension.ToLowerInvariant();
            Dictionary<string, string> mimeMap = BuildImageMimeMap();
            if(!mimeMap.ContainsKey(extension))
            {
                return "";
            }

            return mimeMap[extension];
        }
    }
}
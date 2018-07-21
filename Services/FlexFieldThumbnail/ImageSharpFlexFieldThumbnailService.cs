using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Bmp;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;

namespace GoNorth.Services.FlexFieldThumbnail
{
    /// <summary>
    /// Base Class for Flex Field Thumbnail Service
    /// </summary>
    public class ImageSharpFlexFieldThumbnailService : IFlexFieldThumbnailService
    {
        /// <summary>
        /// Thumbnail Size
        /// </summary>
        private const int ThumbnailSize = 150;

        /// <summary>
        /// Image Access
        /// </summary>
        private readonly IFlexFieldObjectImageAccess _imageAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="imageAccess">Image Access</param>
        public ImageSharpFlexFieldThumbnailService(IFlexFieldObjectImageAccess imageAccess)
        {
            _imageAccess = imageAccess;
        }

        /// <summary>
        /// Generates a thumbnail image for a flex field image
        /// </summary>
        /// <param name="sourceFile">Source File</param>
        /// <param name="targetFile">Target File</param>
        /// <returns>true if image was generated, else false (if image is already smaller than thumbnail, no thumbnail will be generated)</returns>
        public bool GenerateThumbnail(string sourceFile, string targetFile)
        {
            using(Image<Rgba32> image = OpenRawImage(sourceFile))
            {
                if(image.Width <= ThumbnailSize && image.Height <= ThumbnailSize)
                {
                    return false;
                }

                ResizeImage(image);
                SaveThumbnail(image, targetFile);
            }

            return true;
        }

        /// <summary>
        /// Opens the raw image
        /// </summary>
        /// <param name="sourceFile">Source File</param>
        /// <returns>Raw Image</returns>
        private Image<Rgba32> OpenRawImage(string sourceFile)
        {
            using(Stream imageStream = _imageAccess.OpenFlexFieldObjectImage(sourceFile))
            {
                Image<Rgba32> rawImage = Image.Load(imageStream);
                return rawImage;
            }
        }

        /// <summary>
        /// Resizes the image to the Thumbnail Size
        /// </summary>
        /// <param name="image">Image to format</param>
        private void ResizeImage(Image<Rgba32> image)
        {
            ResizeOptions fillOptions = new ResizeOptions();
            fillOptions.Mode = ResizeMode.Max;
            fillOptions.Position = AnchorPosition.TopLeft;
            fillOptions.Size = new SixLabors.Primitives.Size(ThumbnailSize, ThumbnailSize);

            image.Mutate(i => i.Resize(fillOptions));
        }

        /// <summary>
        /// Saves the thumbnail image
        /// </summary>
        /// <param name="thumbnailImage">Thumbnail image</param>
        /// <param name="targetFile">Target filename</param>
        private void SaveThumbnail(Image<Rgba32> thumbnailImage, string targetFile)
        {
            using(Stream imageSaveStream = _imageAccess.CreateFlexFieldThumbnailImage(targetFile))
            {
                thumbnailImage.Save(imageSaveStream, GetEncoder(targetFile));
            }
        }

        /// <summary>
        /// Returns the encoder based on the image filename
        /// </summary>
        /// <param name="targetFile">Target File</param>
        /// <returns>Image Encoder</returns>
        private IImageEncoder GetEncoder(string targetFile)
        {   
            string extensions = Path.GetExtension(targetFile).ToLowerInvariant();
            switch(extensions)
            {
            case ".png":
                return new PngEncoder();
            case ".jpg":
            case ".jpeg":
                return new JpegEncoder();
            case ".gif":
                return new GifEncoder();
            case ".bmp":
                return new BmpEncoder();
            }

            return new PngEncoder();
        }   
    }
}

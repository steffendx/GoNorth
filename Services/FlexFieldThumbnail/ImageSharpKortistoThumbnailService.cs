using GoNorth.Data.Kortisto;

namespace GoNorth.Services.FlexFieldThumbnail
{
    /// <summary>
    /// Kortisto Thumbnail Service
    /// </summary>
    public class ImageSharpKortistoThumbnailService : ImageSharpFlexFieldThumbnailService, IKortistoThumbnailService
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="imageAccess">Image Access</param>
        public ImageSharpKortistoThumbnailService(IKortistoNpcImageAccess imageAccess) : base(imageAccess)
        {
        }
    }
}

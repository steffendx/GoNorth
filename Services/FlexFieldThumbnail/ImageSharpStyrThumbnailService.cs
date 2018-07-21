using GoNorth.Data.Styr;

namespace GoNorth.Services.FlexFieldThumbnail
{
    /// <summary>
    /// Styr Thumbnail Service
    /// </summary>
    public class ImageSharpStyrThumbnailService : ImageSharpFlexFieldThumbnailService, IStyrThumbnailService
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="imageAccess">Image Access</param>
        public ImageSharpStyrThumbnailService(IStyrItemImageAccess imageAccess) : base(imageAccess)
        {
        }
    }
}

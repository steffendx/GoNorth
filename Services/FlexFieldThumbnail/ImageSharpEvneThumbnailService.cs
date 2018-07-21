using GoNorth.Data.Evne;

namespace GoNorth.Services.FlexFieldThumbnail
{
    /// <summary>
    /// Evne Thumbnail Service
    /// </summary>
    public class ImageSharpEvneThumbnailService : ImageSharpFlexFieldThumbnailService, IEvneThumbnailService
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="imageAccess">Image Access</param>
        public ImageSharpEvneThumbnailService(IEvneSkillImageAccess imageAccess) : base(imageAccess)
        {
        }
    }
}

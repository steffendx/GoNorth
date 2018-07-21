using System.Threading.Tasks;

namespace GoNorth.Services.FlexFieldThumbnail
{
    /// <summary>
    /// Interface for Flex Field Thumbnail Service
    /// </summary>
    public interface IFlexFieldThumbnailService
    {
        /// <summary>
        /// Generates a thumbnail image for a flex field image
        /// </summary>
        /// <param name="sourceFile">Source File</param>
        /// <param name="targetFile">Target File</param>
        /// <returns>true if image was generated, else false (if image is already smaller than thumbnail, no thumbnail will be generated)</returns>
        bool GenerateThumbnail(string sourceFile, string targetFile);
    }
}

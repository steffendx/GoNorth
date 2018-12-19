namespace GoNorth.Config
{
    /// <summary>
    /// Interface to access config in a view
    /// </summary>
    public interface IConfigViewAccess
    {
        /// <summary>
        /// Returns if the GDPR functionality is used
        /// </summary>
        /// <returns>true if GDPR is used, else false</returns>
        bool IsUsingGdpr();

        /// <summary>
        /// Returns if the Legal Notice functionality is used
        /// </summary>
        /// <returns>true if Legal Notice is used, else false</returns>
        bool IsUsingLegalNotice();
    }
}
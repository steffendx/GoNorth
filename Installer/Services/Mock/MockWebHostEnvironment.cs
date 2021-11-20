using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace Installer.Services.Mock
{
    /// <summary>
    /// Mock Webhost Environment
    /// </summary>
    public class MockWebHostEnvironment : IWebHostEnvironment
    {
        /// <summary>
        /// Web Root Path
        /// </summary>
        public string WebRootPath { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
        
        /// <summary>
        /// Web Root File provider
        /// </summary>
        public IFileProvider WebRootFileProvider { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
        
        /// <summary>
        /// Application Name
        /// </summary>
        public string ApplicationName { get => "GoNorth"; set {} }
        
        /// <summary>
        /// Content Root File provider
        /// </summary>
        public IFileProvider ContentRootFileProvider { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
        
        /// <summary>
        /// Content Root path
        /// </summary>
        public string ContentRootPath { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
        
        /// <summary>
        /// Environment name
        /// </summary>
        public string EnvironmentName { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
    }
}
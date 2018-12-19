// GoNorth - Created by Steffen Noertershaeuser
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using GoNorth.Logging;

namespace GoNorth
{
    /// <summary>
    /// Program root class
    /// </summary>
    public class Program
    {
        /// <summary>
        /// Main Entry
        /// </summary>
        /// <param name="args">Arguments</param>
        public static void Main(string[] args)
        {
            BuildWebHost(args).Build().Run();
        }

        /// <summary>
        /// Builds the web Host
        /// </summary>
        /// <param name="args">Arguments</param>
        /// <returns>WebHost</returns>
        public static IWebHostBuilder BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureLogging(builder => builder.AddFile())
                .UseStartup<Startup>();
    }
}

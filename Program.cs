// GoNorth - Created by Steffen Noertershaeuser
using Microsoft.Extensions.Hosting;
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
            CreateHostBuilder(args).Build().Run();
        }

        /// <summary>
        /// Builds the web Host
        /// </summary>
        /// <param name="args">Arguments</param>
        /// <returns>WebHost</returns>
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureLogging(builder => builder.AddFile())
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}

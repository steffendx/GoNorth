using System;
using System.Threading;
using System.Threading.Tasks;
using GoNorth.Data.User;
using GoNorth.Services.DataMigration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace GoNorth.Services.DataMigration
{
    /// <summary>
    /// Data Migration Manager middle middleware extensions
    /// </summary>
    public static class DataMigratorMiddlewareExtension
    {
        /// <summary>
        /// Runs the data migration process
        /// </summary>
        /// <param name="builder">Application builder</param>
        /// <param name="dataMigrator">Data migrator</param>
        /// <returns>Application builder</returns>
        public static void UseAutoDataMigration(this IApplicationBuilder builder, IDataMigrator dataMigrator)
        {
            var applicationLifetime = builder.ApplicationServices.GetRequiredService<IApplicationLifetime>();
			Task initializationTask = null;
			applicationLifetime.ApplicationStarted.Register(() =>
			{
				initializationTask = dataMigrator.UpdateMigratableData();
			});

			builder.Use(async (context, next) =>
			{
				await initializationTask;
				await next.Invoke();
			});
        }
    }
}
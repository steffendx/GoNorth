using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Utility class to easily gemerate placeholders
    /// </summary>
    public static class ScribanPlaceholderGenerator
    {
        /// <summary>
        /// Returns the Export Template Placeholders for a value object
        /// </summary>
        /// <param name="localizerFactory">String localizer factory</param>
        /// <param name="objectPrefix">Object prefix</param>
        /// <typeparam name="T">Type of the placeholders</typeparam>
        /// <returns>Placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholdersForObject<T>(IStringLocalizerFactory localizerFactory, string objectPrefix)
        {
            Dictionary<Type, IStringLocalizer> localizers = new Dictionary<Type, IStringLocalizer>();

            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            placeholders.AddRange(GetValueLabelPlaceholders(typeof(T), localizerFactory, objectPrefix, localizers));
            placeholders.AddRange(GetKeyCollectionPlaceholders(typeof(T), localizerFactory, objectPrefix, localizers));

            placeholders = placeholders.OrderBy(p => p.Name).ToList();

            return placeholders;
        }

        /// <summary>
        /// Returns the value label placeholders for an object
        /// </summary>
        /// <param name="objectType">Object Type</param>
        /// <param name="localizerFactory">Localizer factory</param>
        /// <param name="objectPrefix">Object prefix for the key</param>
        /// <param name="localizers">Localizer lookup table</param>
        /// <returns>Placeholders</returns>
        private static List<ExportTemplatePlaceholder> GetValueLabelPlaceholders(Type objectType, IStringLocalizerFactory localizerFactory, string objectPrefix, Dictionary<Type, IStringLocalizer> localizers)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            List<PropertyInfo> props = objectType.GetProperties().Where(prop => Attribute.IsDefined(prop, typeof(ScribanExportValueLabel)) || Attribute.IsDefined(prop, typeof(ScribanExportValueObjectLabel))).ToList();
            foreach (PropertyInfo curProperty in props)
            {
                AddPropertyLabel(placeholders, curProperty, localizerFactory, objectPrefix, localizers);
            }

            return placeholders;
        }

        /// <summary>
        /// Returns the key collection placeholders for an object
        /// </summary>
        /// <param name="objectType">Object Type</param>
        /// <param name="localizerFactory">Localizer factory</param>
        /// <param name="objectPrefix">Object prefix for the key</param>
        /// <param name="localizers">Localizer lookup table</param>
        /// <returns>Placeholders</returns>
        private static List<ExportTemplatePlaceholder> GetKeyCollectionPlaceholders(Type objectType, IStringLocalizerFactory localizerFactory, string objectPrefix, Dictionary<Type, IStringLocalizer> localizers)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            List<PropertyInfo> props = objectType.GetProperties().Where(prop => Attribute.IsDefined(prop, typeof(ScribanKeyCollectionLabel))).ToList();
            foreach (PropertyInfo curProperty in props)
            {
                List<ScribanKeyCollectionLabel> keyCollectionLabels = curProperty.GetCustomAttributes(false).Where(a => a is ScribanKeyCollectionLabel).Cast<ScribanKeyCollectionLabel>().ToList();
                foreach(ScribanKeyCollectionLabel curLabel in keyCollectionLabels)
                {
                    string propertyName = StandardMemberRenamer.Rename(curProperty.Name);
                    string valuePrefix = curLabel.PrefixKey;
                    if(curLabel.UseParentPrefix)
                    {
                        valuePrefix = string.Format("{0}.{1}.{2}", objectPrefix, propertyName, curLabel.PrefixKey);
                    }
                    else
                    {
                        AddPropertyLabel(placeholders, curProperty, localizerFactory, objectPrefix, localizers);
                    }
                    placeholders.AddRange(GetValueLabelPlaceholders(curLabel.ValueType, localizerFactory, valuePrefix, localizers));
                }
            }

            return placeholders;
        }

        /// <summary>
        /// Adds the placeholder definition for a property
        /// </summary>
        /// <param name="placeholders">Placeholders to fill</param>
        /// <param name="property">Property</param>
        /// <param name="localizerFactory">Localizer factory</param>
        /// <param name="objectPrefix">Object prefix for the key</param>
        /// <param name="localizers">Localizers</param>
        private static void AddPropertyLabel(List<ExportTemplatePlaceholder> placeholders, PropertyInfo property, IStringLocalizerFactory localizerFactory, string objectPrefix, Dictionary<Type, IStringLocalizer> localizers)
        {
            IStringLocalizer localizer = EnsureLocalizer(localizerFactory, localizers, property.DeclaringType);

            string propertyName = StandardMemberRenamer.Rename(property.Name);
            string placeholderName = string.Format("{0}.{1}", objectPrefix, propertyName);
            placeholders.Add(new ExportTemplatePlaceholder
            {
                Name = placeholderName,
                Description = localizer[string.Format("PlaceholderDesc_{0}", property.Name)]
            });

            if (Attribute.IsDefined(property, typeof(ScribanExportValueObjectLabel)))
            {
                placeholders.AddRange(GetValueLabelPlaceholders(property.PropertyType, localizerFactory, placeholderName, localizers));
                placeholders.AddRange(GetKeyCollectionPlaceholders(property.PropertyType, localizerFactory, placeholderName, localizers));
            }
        }

        /// <summary>
        /// Returns a localizer for a type. If no localizer exists in the lookup table a new localizer is created
        /// </summary>
        /// <param name="localizerFactory">Localizer factory</param>
        /// <param name="localizers">Localizer lookup table</param>
        /// <param name="localizerType">Type of the localizer</param>
        /// <returns>Localizer</returns>
        private static IStringLocalizer EnsureLocalizer(IStringLocalizerFactory localizerFactory, Dictionary<Type, IStringLocalizer> localizers, Type localizerType)
        {
            if (!localizers.ContainsKey(localizerType))
            {
                localizers.Add(localizerType, localizerFactory.Create(localizerType));
            }
            IStringLocalizer localizer = localizers[localizerType];
            return localizer;
        }
    }
}
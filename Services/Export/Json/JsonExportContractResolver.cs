using System;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// JSON Export Contract Resolver
    /// </summary>
    public class JsonExportContractResolver : DefaultContractResolver
    {
        /// <summary>
        /// Creates a json property for a member
        /// </summary>
        /// <param name="member">Member</param>
        /// <param name="memberSerialization">Member Serialization</param>
        /// <returns>Json Property</returns>
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            JsonProperty property = base.CreateProperty(member, memberSerialization);

            if (Attribute.IsDefined(member, typeof(JsonExportIgnoreAttribute)))
            {
                property.ShouldSerialize = i => false;
            }

            return property;
        }
    }
}
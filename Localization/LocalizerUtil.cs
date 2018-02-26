using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace GoNorth.Localization
{
    /// <summary>
    /// Localizer Util
    /// </summary>
    public static class LocalizerUtil
    {
        /// <summary>
        /// Trims a prefix
        /// </summary>
        /// <param name="name">Name</param>
        /// <param name="prefix">Prefix to trim</param>
        /// <returns>Trimed name</returns>
        public static string TrimPrefix(string name, string prefix)
        {
            if (name == null) throw new ArgumentNullException(nameof(name));
            if (prefix == null) throw new ArgumentNullException(nameof(prefix));

            if (name.StartsWith(prefix, StringComparison.Ordinal))
            {
                return name.Substring(prefix.Length);
            }
            return name;
        }

        /// <summary>
        /// Expands paths
        /// </summary>
        /// <param name="name">Name to expand</param>
        /// <param name="baseName">Base Name</param>
        /// <returns>Expands</returns>
        public static IEnumerable<string> ExpandPaths(string name, string baseName)
        {
            if (name == null) throw new ArgumentNullException(nameof(name));
            if (baseName == null) throw new ArgumentNullException(nameof(baseName));

            return ExpandPathIterator(name, baseName);
        }

        /// <summary>
        /// Expands a path itertor
        /// </summary>
        /// <param name="name">Name</param>
        /// <param name="baseName">Base Name</param>
        /// <returns>Expanded</returns>
        private static IEnumerable<string> ExpandPathIterator(string name, string baseName)
        {
            StringBuilder expansion = new StringBuilder();

            // Start replacing periods, starting at the beginning.
            string[] components = name.Split(new[] { '.' }, StringSplitOptions.RemoveEmptyEntries);
            for (int curComponent1 = 0; curComponent1 < components.Length; ++curComponent1)
            {
                for (int curComponent2 = 0; curComponent2 < components.Length; ++curComponent2)
                {
                    expansion.Append(components[curComponent2]).Append(curComponent2 < curComponent1 ? Path.DirectorySeparatorChar : '.');
                }
                // Remove trailing period.
                yield return expansion.Remove(expansion.Length - 1, 1).ToString();
                expansion.Clear();
            }

            // Do the same with the name where baseName prefix is removed.
            string nameWithoutPrefix = TrimPrefix(name, baseName);
            if (nameWithoutPrefix != string.Empty && nameWithoutPrefix != name)
            {
                nameWithoutPrefix = nameWithoutPrefix.Substring(1);
                string[] componentsWithoutPrefix = nameWithoutPrefix.Split(new[] { '.' }, StringSplitOptions.RemoveEmptyEntries);
                for (int curComponent1 = 0; curComponent1 < componentsWithoutPrefix.Length; ++curComponent1)
                {
                    for (int curComponent2 = 0; curComponent2 < componentsWithoutPrefix.Length; ++curComponent2)
                    {
                        expansion.Append(componentsWithoutPrefix[curComponent2]).Append(curComponent2 < curComponent1 ? Path.DirectorySeparatorChar : '.');
                    }

                    // Remove trailing period.
                    yield return expansion.Remove(expansion.Length - 1, 1).ToString();
                    expansion.Clear();
                }
            }
        }
    }
}
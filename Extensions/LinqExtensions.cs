using System;
using System.Collections.Generic;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Extension class for Linq
    /// </summary>
    public static class LinqExtensions
    {
        /// <summary>
        /// Distincts a list by a key
        /// </summary>
        /// <param name="source">Source enumerable</param>
        /// <param name="keySelector">Key selector function</param>
        /// <typeparam name="TSource">Source type</typeparam>
        /// <typeparam name="TKey">Type of the key</typeparam>
        /// <returns>Distinct enumerable</returns>
        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            HashSet<TKey> knownKeys = new HashSet<TKey>();
            foreach (TSource element in source)
            {
                if (knownKeys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }
    }
}
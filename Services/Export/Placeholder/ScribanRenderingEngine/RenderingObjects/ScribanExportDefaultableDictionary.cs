using System.Collections;
using System.Collections.Generic;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Dictionary for scriban that can provide a default value. Used for better error handling
    /// </summary>
    public abstract class ScribanExportDefaultableDictionary<T> : IDictionary<string, T>
    {
        /// <summary>
        /// Dictionary for the objects
        /// </summary>
        protected IDictionary<string, T> _objectDictionary;

        /// <summary>
        /// Returns the enumerator
        /// </summary>
        /// <returns>Enumerator</returns>
        public IEnumerator<KeyValuePair<string, T>> GetEnumerator()
        {
            return _objectDictionary.GetEnumerator();
        }

        /// <summary>
        /// Returns the enumerator
        /// </summary>
        /// <returns>Enumerator</returns>
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        /// <summary>
        /// Adds an object
        /// </summary>
        /// <param name="item">Item to add</param>
        public void Add(KeyValuePair<string, T> item)
        {
            _objectDictionary.Add(item);
        }

        /// <summary>
        /// Clears the objects
        /// </summary>
        public void Clear()
        {
            _objectDictionary.Clear();
        }

        /// <summary>
        /// Returns true if an item exists in the collection
        /// </summary>
        /// <param name="item">Item</param>
        /// <returns>true if the item exists</returns>
        public bool Contains(KeyValuePair<string, T> item)
        {
            return _objectDictionary.Contains(item);
        }

        /// <summary>
        /// Copys the values into an array
        /// </summary>
        /// <param name="array">Target array</param>
        /// <param name="arrayIndex">Array index</param>
        public void CopyTo(KeyValuePair<string, T>[] array, int arrayIndex)
        {
            _objectDictionary.CopyTo(array, arrayIndex);
        }

        /// <summary>
        /// Removes a value
        /// </summary>
        /// <param name="item">Item to remove</param>
        /// <returns>true if an item was removed, else false</returns>
        public bool Remove(KeyValuePair<string, T> item)
        {
            return _objectDictionary.Remove(item.Key);
        }

        /// <summary>
        /// Returns the count
        /// </summary>
        public int Count
        {
            get { return _objectDictionary.Count; }
        }

        /// <summary>
        /// Returns true if the collcetion is readonly, else false
        /// </summary>
        public bool IsReadOnly
        {
            get { return _objectDictionary.IsReadOnly; }
        }

        /// <summary>
        /// Checks if a key exists in the dictionary
        /// </summary>
        /// <param name="key">Key of the dictionary</param>
        /// <returns>true if a key exists, else false</returns>
        public bool ContainsKey(string key)
        {
            return _objectDictionary.ContainsKey(key);
        }
        
        /// <summary>
        /// Adds a new object
        /// </summary>
        /// <param name="key">Key of the object</param>
        /// <param name="value">Value to add</param>
        public void Add(string key, T value)
        {
            _objectDictionary.Add(key, value);
        }
        
        /// <summary>
        /// Removes a value
        /// </summary>
        /// <param name="key">Key</param>
        /// <returns>true if a value was removed, else false</returns>
        public bool Remove(string key)
        {
            return _objectDictionary.Remove(key);
        }

        /// <summary>
        /// Trys to get a value
        /// </summary>
        /// <param name="key">Key to load</param>
        /// <param name="value">Return value</param>
        /// <returns>True if an object could be found, else false</returns>
        public bool TryGetValue(string key, out T value)
        {
            if (!_objectDictionary.TryGetValue(key, out value))
            {
                value = BuildDefaultvalue(key);
                return false;
            }

            return true;
        }

        /// <summary>
        /// Returns a field by name. If the field does not exists, a field with an error message is returned
        /// </summary>
        /// <value>Field</value>
        public T this[string key]
        {
            get
            {
                try
                {
                    return _objectDictionary[key];
                }
                catch (KeyNotFoundException)
                {
                    return BuildDefaultvalue(key);
                }
            }

            set { _objectDictionary[key] = value; }
        }

        /// <summary>
        /// Keys of the dictionary
        /// </summary>
        /// <value>Keys</value>
        public ICollection<string> Keys
        {
            get { return _objectDictionary.Keys; }
        }

        /// <summary>
        /// Values of the dictionary
        /// </summary>
        /// <value>Value collection</value>
        public ICollection<T> Values
        {
            get { return _objectDictionary.Values; }
        }

        /// <summary>
        /// Builds a missing object that can be returned
        /// </summary>
        /// <param name="key">Key of the object</param>
        /// <returns>Default object</returns>
        protected abstract T BuildDefaultvalue(string key);

        /// <summary>
        /// Constructor
        /// </summary>
        public ScribanExportDefaultableDictionary()
        {
            _objectDictionary = new Dictionary<string, T>();
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="existingObject">Existing objects to use</param>
        public ScribanExportDefaultableDictionary(IDictionary<string, T> existingObject)
        {
            _objectDictionary = existingObject;
        }
    }
}
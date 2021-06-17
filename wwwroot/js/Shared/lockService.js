(function (GoNorth) {
    "use strict";
    (function (LockService) {

        /// Storage key
        var externalUserRandomIdentifierStorageKey = "GoNorthExternalUserRandomIdentifer";

        /// Refresh Lock Timeout
        var refreshLockTimeout = null;

        /// Currently active lock category
        var activeLockCategory = null;

        /// Currently active lock id
        var activeLockId = null;

        /// True if the active lock appends the project id to the key
        var activeLockAppendsProjectIdToKey = false;

        /// External access token
        var activeExternalAccessToken = null;

        /**
         * Releases the current lock if a lock is acquired, else does nothing
         */
        LockService.releaseCurrentLock = function () {
            if (refreshLockTimeout) {
                clearTimeout(refreshLockTimeout);
                refreshLockTimeout = null;
            }

            if (activeLockCategory && activeLockId) {
                let url = "/api/LockServiceApi/DeleteLock";
                if (activeExternalAccessToken) {
                    url = "/api/LockServiceApi/DeleteExternalLock";
                }

                url += "?category=" + activeLockCategory + "&id=" + activeLockId;
                if (activeLockAppendsProjectIdToKey) {
                    url += "&appendProjectIdToKey=true";
                }

                if (activeExternalAccessToken) {
                    url += "&token=" + encodeURIComponent(activeExternalAccessToken) + "&userIdentifier=" + getExternalUserIdentifier();
                }

                if (navigator && navigator.sendBeacon) {
                    navigator.sendBeacon(url)
                }
                else {
                    GoNorth.HttpClient.post(url, {});
                }

                activeLockCategory = null;
                activeLockId = null;
                activeLockAppendsProjectIdToKey = false;
                activeExternalAccessToken = null;
            }
        }

        /**
         * Releases the current lock 
         */
        window.addEventListener("unload", function () {
            LockService.releaseCurrentLock();
        });

        /**
         * Releases the current lock 
         */
        window.addEventListener("beforeunload", function () {
            LockService.releaseCurrentLock();
        });
        
        /**
         * Generates an external user identifier
         * @returns {string} External user identifier
         */
        function generateExternalUserIdentifier() {
            return Math.round(Math.random() * 10000000000 + 1000).toString();
        }

        /**
         * Returns an external user identifier
         * @param {object} storage Storage object to use
         * @returns {string} External user identifier
         */
        function getExternalUserIdentifierFromStorage(storage) {
            try {
                var userIdentifier = storage.getItem(externalUserRandomIdentifierStorageKey);
                if (!userIdentifier) 
                {
                    var userIdentifier = generateExternalUserIdentifier();
                    storage.setItem(externalUserRandomIdentifierStorageKey, userIdentifier);
                }
                return userIdentifier;
            } catch (e) {
                return null;
            }
        }

        /**
         * Returns an identifier for an external user
         * @returns {string}  External user identifier
         */
        function getExternalUserIdentifier() {
            var userIdentifier = getExternalUserIdentifierFromStorage(localStorage);
            if(userIdentifier) 
            {
                return userIdentifier;
            }

            var userIdentifier = getExternalUserIdentifierFromStorage(sessionStorage);
            if(userIdentifier) 
            {
                return userIdentifier;
            }

            return "FallbackExternalUser";
        };

        /**
         * Acquires a lock
         * 
         * @param {string} category Category for the lock
         * @param {string} id Id of the resource to lock
         * @param {boolean} appendProjectIdToKey True if the project id must be appended to the key
         * @param {string} externalAccessToken External access token, if specified external access is asumed
         * @returns {jQuery.Deferred} Deferred for the lock result
         */
        LockService.acquireLock = function (category, id, appendProjectIdToKey, externalAccessToken) {
            var def = new jQuery.Deferred();

            var url = "/api/LockServiceApi/AcquireLock";
            if (externalAccessToken) {
                url = "/api/LockServiceApi/AcquireExternalLock";
            }

            url += "?category=" + category + "&id=" + id;
            if (appendProjectIdToKey) {
                url += "&appendProjectIdToKey=true";
            }

            if (externalAccessToken) {
                url += "&token=" + encodeURIComponent(externalAccessToken) + "&userIdentifier=" + getExternalUserIdentifier();
                activeExternalAccessToken = externalAccessToken;
            } else {
                activeExternalAccessToken = null;
            }

            GoNorth.HttpClient.post(url, {}).done(function (data) {
                def.resolve(data.lockedByOtherUser, data.lockedByUserName);
                if (!data.lockedByOtherUser) {
                    refreshLockTimeout = setTimeout(function () {
                        LockService.acquireLock(category, id, activeLockAppendsProjectIdToKey, activeExternalAccessToken);
                    }, data.lockValidForMinutes * 60 * 1000 - 100);

                    activeLockCategory = category;
                    activeLockId = id;
                    activeLockAppendsProjectIdToKey = !!appendProjectIdToKey;
                }
            }).fail(function (xhr) {
                def.reject();
            });

            return def.promise();
        }

        /**
         * Checks the lock state for a resource
         * 
         * @param {string} category Category for the lock
         * @param {string} id Id of the resource to lock
         * @param {boolean} appendProjectIdToKey True if the project id must be appended to the key
         * @returns {jQuery.Deferred} Deferred for the lock result
         */
        LockService.checkLock = function (category, id, appendProjectIdToKey) {
            var def = new jQuery.Deferred();

            var url = "/api/LockServiceApi/CheckLock";
            if (activeExternalAccessToken) {
                url = "/api/LockServiceApi/CheckExternalLock";
            }

            url += "?category=" + category + "&id=" + id;
            if (appendProjectIdToKey) {
                url += "&appendProjectIdToKey=true";
            }

            if (activeExternalAccessToken) {
                url += "&token=" + encodeURIComponent(activeExternalAccessToken);
            }

            GoNorth.HttpClient.get(url).done(function (data) {
                def.resolve(data.lockedByOtherUser, data.lockedByUserName);
            }).fail(function (xhr) {
                def.reject();
            });

            return def.promise();
        }

    }(GoNorth.LockService = GoNorth.LockService || {}));
}(window.GoNorth = window.GoNorth || {}));
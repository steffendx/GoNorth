(function(GoNorth) {
    "use strict";
    (function(LockService) {
        
        /// Refresh Lock Timeout
        var refreshLockTimeout = null;

        /// Currently active lock category
        var activeLockCategory = null;
        
        /// Currently active lock id
        var activeLockId = null;

        /// True if the active lock appends the project id to the key
        var activeLockAppendsProjectIdToKey = false;

        /**
         * Releases the current lock if a lock is acquired, else does nothing
         */
        LockService.releaseCurrentLock = function() {
            if(refreshLockTimeout)
            {
                clearTimeout(refreshLockTimeout);
                refreshLockTimeout = null;
            }

            if(activeLockCategory && activeLockId) 
            {
                let url = "/api/LockServiceApi/DeleteLock?category=" + activeLockCategory + "&id=" + activeLockId;
                if(activeLockAppendsProjectIdToKey)
                {
                    url += "&appendProjectIdToKey=true";
                }

                if(navigator && navigator.sendBeacon) 
                {
                    navigator.sendBeacon(url)
                }
                else
                {
                    GoNorth.HttpClient.post(url, {});
                }

                activeLockCategory = null;
                activeLockId = null;
                activeLockAppendsProjectIdToKey = false;
            }
        }

        /**
         * Releases the current lock 
         */
        window.addEventListener("unload", function() {
            LockService.releaseCurrentLock();
        });

        /**
         * Releases the current lock 
         */
        window.addEventListener("beforeunload", function() {
            LockService.releaseCurrentLock();
        });

        /**
         * Acquires a lock
         * 
         * @param {string} category Category for the lock
         * @param {string} id Id of the resource to lock
         * @param {boolean} appendProjectIdToKey True if the project id must be appended to the key
         * @returns {jQuery.Deferred} Deferred for the lock result
         */
        LockService.acquireLock = function(category, id, appendProjectIdToKey) {
            var def = new jQuery.Deferred();

            var url = "/api/LockServiceApi/AcquireLock?category=" + category + "&id=" + id;
            if(appendProjectIdToKey)
            {
                url += "&appendProjectIdToKey=true";
            }

            GoNorth.HttpClient.post(url, {}).done(function(data) {
                def.resolve(data.lockedByOtherUser, data.lockedByUserName);
                if(!data.lockedByOtherUser)
                {
                    refreshLockTimeout = setTimeout(function() {
                        LockService.acquireLock(category, id, true, activeLockAppendsProjectIdToKey);
                    }, data.lockValidForMinutes * 60 * 1000 - 100);

                    activeLockCategory = category;
                    activeLockId = id;
                    activeLockAppendsProjectIdToKey = !!appendProjectIdToKey;
                }
            }).fail(function(xhr) {
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
        LockService.checkLock = function(category, id, appendProjectIdToKey) {
            var def = new jQuery.Deferred();

            var url = "/api/LockServiceApi/CheckLock?category=" + category + "&id=" + id;
            if(appendProjectIdToKey)
            {
                url += "&appendProjectIdToKey=true";
            }

            GoNorth.HttpClient.get(url).done(function(data) {
                def.resolve(data.lockedByOtherUser, data.lockedByUserName);
            }).fail(function(xhr) {
                def.reject();
            });

            return def.promise();
        }

    }(GoNorth.LockService = GoNorth.LockService || {}));
}(window.GoNorth = window.GoNorth || {}));
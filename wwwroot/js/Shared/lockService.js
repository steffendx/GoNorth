(function(GoNorth) {
    "use strict";
    (function(LockService) {
        
        /// Refresh Lock Timeout
        var refreshLockTimeout = null;

        /**
         * Releases the current lock if a lock is acquired, else does nothing
         */
        LockService.releaseCurrentLock = function() {
            if(refreshLockTimeout)
            {
                clearTimeout(refreshLockTimeout);
                refreshLockTimeout = null;
            }
        }

        /**
         * Acquires a lock
         * 
         * @param {string} category Category for the lock
         * @param {string} id Id of the resource to lock
         * @returns {jQuery.Deferred} Deferred for the lock result
         */
        LockService.acquireLock = function(category, id) {
            var def = new jQuery.Deferred();

            jQuery.ajax({ 
                url: "/api/LockServiceApi/AcquireLock?category=" + category + "&id=" + id, 
                headers: GoNorth.Util.generateAntiForgeryHeader(),
                type: "POST"
            }).done(function(data) {
                def.resolve(data.lockedByOtherUser, data.lockedByUserName);
                if(!data.lockedByOtherUser)
                {
                    refreshLockTimeout = setTimeout(function() {
                        LockService.acquireLock(category, id, true);
                    }, data.lockValidForMinutes * 60 * 1000 - 100);
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
         * @returns {jQuery.Deferred} Deferred for the lock result
         */
        LockService.checkLock = function(category, id) {
            var def = new jQuery.Deferred();

            jQuery.ajax({ 
                url: "/api/LockServiceApi/CheckLock?category=" + category + "&id=" + id, 
                type: "GET"
            }).done(function(data) {
                def.resolve(data.lockedByOtherUser, data.lockedByUserName);
            }).fail(function(xhr) {
                def.reject();
            });

            return def.promise();
        }

    }(GoNorth.LockService = GoNorth.LockService || {}));
}(window.GoNorth = window.GoNorth || {}));
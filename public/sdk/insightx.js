/**
 * InsightX JavaScript Web SDK
 * Lightweight telemetry ingestion library for product analytics.
 */
(function (global) {
  'use strict';

  // Config defaults
  var config = {
    apiKey: null,
    apiHost: '', // Empty means relative path (same host)
    endpoint: '/api/v1/track',
    debug: true
  };

  var initialized = false;
  var eventQueue = [];
  var userId = null;
  var sessionId = null;

  // Simple UUID helper
  function generateUUID() {
    return 'ix-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  // Get or create unique visitor IDs
  function initIdentities() {
    try {
      userId = localStorage.getItem('insightx_user_id');
      if (!userId) {
        userId = generateUUID();
        localStorage.setItem('insightx_user_id', userId);
      }

      sessionId = sessionStorage.getItem('insightx_session_id');
      if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('insightx_session_id', sessionId);
      }
    } catch (e) {
      // Fallback if cookies/localStorage blocked
      userId = userId || 'ix-anon-usr-' + Math.random().toString(36).substr(2, 9);
      sessionId = sessionId || 'ix-anon-ses-' + Math.random().toString(36).substr(2, 9);
    }
  }

  // Gather system details
  function getSystemMetadata() {
    var metadata = {
      $url: window.location.href,
      $path: window.location.pathname,
      $referrer: document.referrer || '$direct',
      $language: navigator.language || navigator.userLanguage || 'unknown',
      $screen_width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      $screen_height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      $viewport: (window.innerWidth || 0) + 'x' + (window.innerHeight || 0),
      $user_agent: navigator.userAgent
    };

    // Simple Browser/OS extraction
    var ua = navigator.userAgent;
    var browser = 'Other';
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Safari') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';

    var device = 'Desktop';
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
      device = 'Mobile';
    }

    metadata['$browser'] = browser;
    metadata['$device'] = device;

    return metadata;
  }

  // Flush events to server
  function flush() {
    if (!initialized || !config.apiKey) return;
    if (eventQueue.length === 0) return;

    var eventsToFlush = eventQueue.slice();
    eventQueue = [];

    eventsToFlush.forEach(function (payload) {
      var url = config.apiHost + config.endpoint;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.apiKey
        },
        body: JSON.stringify(payload)
      })
      .then(function (response) {
        if (!response.ok) {
          if (config.debug) console.warn('InsightX: Tracking failed with status ' + response.status);
          // Put back in queue if not client error
          if (response.status >= 500) {
            eventQueue.push(payload);
          }
        } else {
          if (config.debug) console.log('InsightX: Event tracked successfully ->', payload.event_name);
        }
      })
      .catch(function (error) {
        if (config.debug) console.error('InsightX: Connection error:', error);
        // Put back in queue to retry later
        eventQueue.push(payload);
      });
    });
  }

  // Public SDK Object
  var InsightX = {
    /**
     * Initialize the tracker
     * @param {string} apiKey - Project API Token
     * @param {object} options - Custom config options
     */
    init: function (apiKey, options) {
      if (!apiKey) {
        console.error('InsightX: API Key is required for initialization.');
        return;
      }
      config.apiKey = apiKey;
      if (options && typeof options === 'object') {
        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            config[key] = options[key];
          }
        }
      }
      initIdentities();
      initialized = true;
      if (config.debug) console.log('InsightX: SDK Initialized. User:', userId, 'Session:', sessionId);

      // Auto-flush queue
      flush();
    },

    /**
     * Associate a user with custom traits
     * @param {string} newUserId - User account identifier
     * @param {object} properties - User traits (email, plan, etc.)
     */
    identify: function (newUserId, properties) {
      if (!newUserId) return;
      userId = newUserId;
      try {
        localStorage.setItem('insightx_user_id', userId);
      } catch (e) {}

      // Automatically track identity sync
      this.track('$identify', properties || {});
    },

    /**
     * Track a custom behavioral event
     * @param {string} eventName - Name of the action (e.g. "Add to Cart")
     * @param {object} properties - Context variables
     */
    track: function (eventName, properties) {
      if (!eventName) {
        console.error('InsightX: Event name cannot be empty.');
        return;
      }

      var customProperties = properties || {};
      var systemMetadata = getSystemMetadata();

      // Combine user parameters with automatically resolved metadata
      var eventProperties = {};
      for (var k in systemMetadata) eventProperties[k] = systemMetadata[k];
      for (var p in customProperties) eventProperties[p] = customProperties[p];

      var payload = {
        event_name: eventName,
        user_id: userId || 'ix-anon-usr',
        session_id: sessionId || 'ix-anon-ses',
        timestamp: new Date().toISOString(),
        properties: eventProperties
      };

      eventQueue.push(payload);

      if (initialized) {
        flush();
      } else {
        if (config.debug) console.log('InsightX: SDK offline. Event queued:', eventName);
      }
    },

    /**
     * Force immediate flush of events in queue
     */
    flush: function () {
      flush();
    }
  };

  // Expose to window / environment
  if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = InsightX;
  } else {
    global.InsightX = InsightX;
  }

})(window);

/**
 * InsightX JavaScript Web SDK (Production Build)
 * Lightweight event tracking agent for SaaS platforms.
 */
(function (global) {
  'use strict';

  var config = {
    apiKey: null,
    apiHost: 'http://localhost:3000', // Points to Express backend collector
    endpoint: '/api/v1/track',
    debug: true
  };

  var initialized = false;
  var eventQueue = [];
  var userId = null;
  var sessionId = null;

  function generateUUID() {
    return 'ix-usr-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

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
      userId = userId || 'ix-usr-fallback';
      sessionId = sessionId || 'ix-ses-fallback';
    }
  }

  function getSystemMetadata() {
    var ua = navigator.userAgent;
    var browser = 'Other';
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Safari') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';

    var device = 'Desktop';
    if (/Mobi|Android|iPhone/i.test(ua)) device = 'Mobile';

    return {
      $url: window.location.href,
      $path: window.location.pathname,
      $referrer: document.referrer || '$direct',
      $language: navigator.language || 'en',
      $viewport: window.innerWidth + 'x' + window.innerHeight,
      $browser: browser,
      $device: device
    };
  }

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
      .then(function (res) {
        if (!res.ok && config.debug) {
          console.warn('InsightX Ingestion Failure status:', res.status);
        }
      })
      .catch(function (err) {
        if (config.debug) console.error('InsightX connection error:', err);
        eventQueue.push(payload); // Retry later
      });
    });
  }

  var InsightX = {
    init: function (apiKey, options) {
      config.apiKey = apiKey;
      if (options && typeof options === 'object') {
        for (var k in options) {
          if (options.hasOwnProperty(k)) config[k] = options[k];
        }
      }
      initIdentities();
      initialized = true;
      if (config.debug) console.log('InsightX Telemetry SDK Active. ID:', userId);

      // 1. Autocapture Page View
      this.track('$pageview', {
        title: document.title,
        url: window.location.href,
        path: window.location.pathname
      });

      // 2. Autocapture Global JS Errors
      window.addEventListener('error', function (e) {
        InsightX.track('$error', {
          message: e.message || 'Uncaught Script Error',
          filename: e.filename || 'unknown',
          lineno: e.lineno || 0,
          colno: e.colno || 0,
          stack: e.error ? e.error.stack : 'No stack trace available.'
        });
      });

      // 3. Declarative click trackers binding
      document.addEventListener('click', function (e) {
        var target = e.target;
        while (target && target !== document) {
          if (target.nodeType === 1) { // Ensure it's an element node
            var evName = target.getAttribute('data-ix-event');
            if (evName) {
              var propsStr = target.getAttribute('data-ix-properties') || '{}';
              var props = {};
              try { props = JSON.parse(propsStr); } catch (err) {}
              InsightX.track(evName, props);
              break;
            }
          }
          target = target.parentNode;
        }
      });

      flush();
    },

    identify: function (newUserId, properties) {
      if (!newUserId) return;
      userId = newUserId;
      try {
        localStorage.setItem('insightx_user_id', userId);
      } catch (e) {}
      this.track('$identify', properties || {});
    },

    track: function (eventName, properties) {
      if (!eventName) return;
      var props = properties || {};
      var sys = getSystemMetadata();
      
      var eventProperties = {};
      for (var s in sys) eventProperties[s] = sys[s];
      for (var p in props) eventProperties[p] = props[p];

      var payload = {
        event_name: eventName,
        user_id: userId,
        session_id: sessionId,
        properties: eventProperties
      };

      eventQueue.push(payload);
      if (initialized) flush();
    }
  };

  if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = InsightX;
  } else {
    global.InsightX = InsightX;
  }

})(window);

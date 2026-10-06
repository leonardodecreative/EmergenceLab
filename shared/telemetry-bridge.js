(function () {
  const CHANNEL = "emergence-lab-v2-telemetry";
  const STORAGE = "el.v2.telemetry.readonly";
  const listeners = new Set();
  let channel = null;

  try {
    channel = new BroadcastChannel(CHANNEL);
  } catch (error) {}

  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function notify(event) {
    listeners.forEach(function (listener) {
      try {
        listener(event);
      } catch (error) {}
    });
  }

  function publishTelemetry(payload) {
    const event = {
      type: "telemetry",
      payload: payload,
      timestamp: Date.now(),
      source: location.pathname
    };

    try {
      localStorage.setItem(STORAGE, JSON.stringify(event));
    } catch (error) {}

    if (channel) {
      channel.postMessage(event);
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ emergenceLabTelemetry: true, event: event }, "*");
    }
  }

  if (channel) {
    channel.onmessage = function (message) {
      if (message.data && message.data.type === "telemetry") {
        notify(message.data);
      }
    };
  }

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE) {
      return;
    }

    const packet = safeParse(event.newValue);
    if (packet && packet.type === "telemetry") {
      notify(packet);
    }
  });

  window.addEventListener("message", function (event) {
    const data = event.data;
    if (!data || !data.emergenceLabTelemetry || !data.event) {
      return;
    }

    if (data.event.type === "telemetry") {
      notify(data.event);
    }
  });

  window.EmergenceTelemetry = {
    publishTelemetry: publishTelemetry,
    subscribe: function (listener) {
      listeners.add(listener);
      return function () {
        listeners.delete(listener);
      };
    },
    lastTelemetry: function () {
      return safeParse(localStorage.getItem(STORAGE));
    },
    channelName: CHANNEL,
    storageKey: STORAGE
  };
})();
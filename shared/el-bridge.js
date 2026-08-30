/* Emergence Lab V2 shared bridge: site/lab telemetry and commands. */
(function(){
  const CHANNEL = "emergence-lab-v2";
  const STORAGE_KEY = "el.v2.telemetry";
  const COMMAND_KEY = "el.v2.command";
  const listeners = new Set();
  let bc = null;
  try { bc = new BroadcastChannel(CHANNEL); } catch(e) {}
  function safeParse(text, fallback=null){ try { return JSON.parse(text); } catch(e){ return fallback; } }
  function emitLocal(type, payload){
    const event = { type, payload, ts: Date.now(), source: location.pathname };
    listeners.forEach(fn => { try { fn(event); } catch(e) {} });
    if (window.parent && window.parent !== window) window.parent.postMessage({ elBridge: true, ...event }, "*");
    document.querySelectorAll("iframe").forEach(frame => { try { frame.contentWindow.postMessage({ elBridge: true, ...event }, "*"); } catch(e) {} });
  }
  function publish(type, payload){
    const event = { type, payload, ts: Date.now(), source: location.pathname };
    try { localStorage.setItem(type === "command" ? COMMAND_KEY : STORAGE_KEY, JSON.stringify(event)); } catch(e) {}
    if (bc) bc.postMessage(event);
    emitLocal(type, payload);
  }
  if (bc) bc.onmessage = ev => {
    const event = ev.data;
    if (!event || !event.type) return;
    listeners.forEach(fn => { try { fn(event); } catch(e) {} });
  };
  window.addEventListener("message", ev => {
    const data = ev.data;
    if (!data || !data.elBridge || !data.type) return;
    listeners.forEach(fn => { try { fn(data); } catch(e) {} });
  });
  window.addEventListener("storage", ev => {
    if (ev.key !== STORAGE_KEY && ev.key !== COMMAND_KEY) return;
    const event = safeParse(ev.newValue);
    if (!event || !event.type) return;
    listeners.forEach(fn => { try { fn(event); } catch(e) {} });
  });
  window.ELBridge = {
    publishTelemetry(payload){ publish("telemetry", payload); },
    publishCommand(payload){ publish("command", payload); },
    on(fn){ listeners.add(fn); return () => listeners.delete(fn); },
    lastTelemetry(){ return safeParse(localStorage.getItem(STORAGE_KEY)); },
    lastCommand(){ return safeParse(localStorage.getItem(COMMAND_KEY)); }
  };
})();

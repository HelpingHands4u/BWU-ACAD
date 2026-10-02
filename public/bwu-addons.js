/* Shared add-ons: backend API client, floating chatbot, responsive helpers.
 * Does not alter any existing page data or behaviour. */
(function () {
  var cfg = window.BWU_CONFIG || {};

  /* ---------- Backend API client ---------- */
  function apiUrl(path) {
    var base = (cfg.API_BASE_URL || "").replace(/\/$/, "");
    var prefix = cfg.API_PREFIX || "/api/v1";
    return base + prefix + (path.charAt(0) === "/" ? path : "/" + path);
  }
  async function request(path, opts) {
    opts = opts || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    var token = localStorage.getItem("bwu_id_token"); // Firebase ID token, set after login
    if (token) headers.Authorization = "Bearer " + token;
    var res = await fetch(apiUrl(path), {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw Object.assign(new Error((data && (data.detail || data.message)) || res.statusText), { status: res.status, data: data });
    return data;
  }
  window.BWU_API = {
    url: apiUrl,
    request: request,
    get: function (p) { return request(p); },
    post: function (p, b) { return request(p, { method: "POST", body: b }); },
    put: function (p, b) { return request(p, { method: "PUT", body: b }); },
    patch: function (p, b) { return request(p, { method: "PATCH", body: b }); },
    del: function (p) { return request(p, { method: "DELETE" }); },
    setToken: function (t) { t ? localStorage.setItem("bwu_id_token", t) : localStorage.removeItem("bwu_id_token"); },
    health: function () { return request("/health"); },
    isConfigured: function () { return !!cfg.API_BASE_URL; },
  };

  /* ---------- Styles (chatbot + responsive) ---------- */
  var css = `
  :root{--bwu-chat-main:#1e1b5e;--bwu-chat-main2:#3b33b8;--bwu-chat-comp:#f5a623;--bwu-chat-comp2:#ffc95c;--bwu-chat-bg:#fbfaf6;--bwu-chat-ink:#1a1838}
  img,video,iframe{max-width:100%}
  table{max-width:100%}
  @media(max-width:768px){
    body{overflow-x:hidden}
    .table,.marks-panel,.tablewrap,.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .navlinks.bwu-open{display:flex!important;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:#fff;padding:8px 20px 16px;gap:0;border-bottom:1px solid #e3e8f1;box-shadow:0 14px 30px rgba(20,32,58,.1);z-index:30}
    .navlinks.bwu-open a{padding:12px 0}
    .navlinks.bwu-open a.active:after{display:none}
    .nav-inner{position:relative}
    .mobile{background:none;border:1px solid #e3e8f1;border-radius:9px;width:40px;height:40px;cursor:pointer}
  }
  #bwu-chat-fab{position:fixed;right:22px;bottom:22px;width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;z-index:9998;
    background:linear-gradient(135deg,var(--bwu-chat-comp),var(--bwu-chat-comp2));color:var(--bwu-chat-main);font-size:24px;
    box-shadow:0 12px 30px rgba(245,166,35,.45),0 0 0 4px rgba(30,27,94,.12);display:grid;place-items:center;transition:transform .25s}
  #bwu-chat-fab:hover{transform:scale(1.07) rotate(-6deg)}
  #bwu-chat-fab .bwu-dot{position:absolute;top:6px;right:6px;width:12px;height:12px;border-radius:50%;background:var(--bwu-chat-main2);border:2px solid #fff}
  #bwu-chat{position:fixed;right:22px;bottom:96px;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 130px));z-index:9999;
    background:var(--bwu-chat-bg);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;font-family:Inter,Segoe UI,Arial,sans-serif;
    box-shadow:0 30px 70px rgba(16,14,60,.35);border:1px solid rgba(30,27,94,.12);
    opacity:0;transform:translateY(16px) scale(.97);pointer-events:none;transition:opacity .22s,transform .22s}
  #bwu-chat.open{opacity:1;transform:none;pointer-events:auto}
  .bwu-ch-head{background:linear-gradient(135deg,var(--bwu-chat-main),var(--bwu-chat-main2));color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;border-bottom:3px solid var(--bwu-chat-comp)}
  .bwu-ch-av{width:40px;height:40px;border-radius:12px;background:var(--bwu-chat-comp);color:var(--bwu-chat-main);display:grid;place-items:center;font-size:18px;flex:none}
  .bwu-ch-head b{display:block;font-size:15px}.bwu-ch-head small{color:#d6d3ff;font-size:11px}
  .bwu-ch-x{margin-left:auto;background:rgba(255,255,255,.12);border:0;color:#fff;width:32px;height:32px;border-radius:9px;cursor:pointer}
  .bwu-ch-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
  .bwu-msg{max-width:84%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
  .bwu-msg.bot{background:#fff;color:var(--bwu-chat-ink);border:1px solid #ebe8f7;border-bottom-left-radius:4px;align-self:flex-start}
  .bwu-msg.user{background:var(--bwu-chat-comp);color:var(--bwu-chat-main);font-weight:600;border-bottom-right-radius:4px;align-self:flex-end}
  .bwu-typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:var(--bwu-chat-main2);animation:bwuB 1s infinite}
  .bwu-typing span:nth-child(2){animation-delay:.15s}.bwu-typing span:nth-child(3){animation-delay:.3s}
  @keyframes bwuB{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
  .bwu-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}
  .bwu-chips button{border:1px solid rgba(59,51,184,.25);background:#fff;color:var(--bwu-chat-main2);border-radius:20px;padding:6px 11px;font-size:11px;font-weight:600;cursor:pointer}
  .bwu-chips button:hover{background:var(--bwu-chat-main2);color:#fff}
  .bwu-ch-form{display:flex;gap:8px;padding:12px;border-top:1px solid #ebe8f7;background:#fff}
  .bwu-ch-form input{flex:1;border:1px solid #e1def0;border-radius:12px;padding:11px 13px;font-size:13px;outline:none;background:var(--bwu-chat-bg)}
  .bwu-ch-form input:focus{border-color:var(--bwu-chat-main2)}
  .bwu-ch-form button{border:0;border-radius:12px;width:44px;background:var(--bwu-chat-main);color:var(--bwu-chat-comp);cursor:pointer;font-size:15px}
  @media(max-width:520px){#bwu-chat{right:8px;left:8px;width:auto;bottom:84px;height:calc(100vh - 100px)}#bwu-chat-fab{right:14px;bottom:14px;width:56px;height:56px}}
  `;
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- Mobile menu (hamburger was not wired) ---------- */
  document.querySelectorAll("button.mobile").forEach(function (btn) {
    btn.setAttribute("aria-label", "Open menu");
    btn.addEventListener("click", function () {
      var nav = btn.closest(".nav-inner") && btn.closest(".nav-inner").querySelector(".navlinks");
      if (nav) nav.classList.toggle("bwu-open");
    });
  });

  /* ---------- Floating chatbot ---------- */
  var fab = document.createElement("button");
  fab.id = "bwu-chat-fab";
  fab.setAttribute("aria-label", "Open BWU assistant");
  fab.innerHTML = '<i class="fa-solid fa-comments"></i><span class="bwu-dot"></span>';
  var box = document.createElement("div");
  box.id = "bwu-chat";
  box.setAttribute("role", "dialog");
  box.innerHTML =
    '<div class="bwu-ch-head"><div class="bwu-ch-av"><i class="fa-solid fa-graduation-cap"></i></div><div><b>BWU Assistant</b><small>Academic help desk</small></div><button class="bwu-ch-x" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<div class="bwu-ch-body"></div>' +
    '<div class="bwu-chips"><button>How do I log in?</button><button>Where is my attendance?</button><button>Exam & results</button></div>' +
    '<form class="bwu-ch-form"><input placeholder="Ask about courses, attendance, results..." autocomplete="off"/><button type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form>';
  document.body.appendChild(box);
  document.body.appendChild(fab);

  var body = box.querySelector(".bwu-ch-body");
  var input = box.querySelector("input");
  var history = [];
  function add(role, text) {
    var m = document.createElement("div");
    m.className = "bwu-msg " + role;
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }
  function toggle(open) {
    box.classList.toggle("open", open);
    fab.querySelector(".bwu-dot").style.display = "none";
    if (open) setTimeout(function () { input.focus(); }, 150);
  }
  fab.addEventListener("click", function () { toggle(!box.classList.contains("open")); });
  box.querySelector(".bwu-ch-x").addEventListener("click", function () { toggle(false); });
  add("bot", "Hi! I'm the BWU Assistant. Ask me anything about the academic portal.");

  function localReply(q) {
    q = q.toLowerCase();
    if (/login|sign in|password/.test(q)) return "Use the Student, Faculty or Admin Login buttons on the home page with your university email.";
    if (/attend/.test(q)) return "Students can see attendance on their dashboard. Admins use the Attendance Overview page.";
    if (/exam|mark|result|cgpa|sgpa/.test(q)) return "Marks, exams and SGPA/CGPA are on the student dashboard. Faculty manage them in Marks & Examination.";
    if (/timetable|routine|schedule/.test(q)) return "The timetable is on your dashboard; admins manage it in Class Timetable Management.";
    return "The AI isn't connected yet — answers here are basic for now. Smarter replies are coming soon!";
  }
  async function ask(text) {
    if (!text.trim()) return;
    add("user", text);
    history.push({ role: "user", content: text });
    var t = add("bot", "");
    t.innerHTML = '<span class="bwu-typing"><span></span><span></span><span></span></span>';
    var reply;
    try {
      if (cfg.CHAT_ENDPOINT) {
        var r = await fetch(cfg.CHAT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history: history }) });
        var d = await r.json();
        reply = d.reply || d.message || d.content || "No reply received.";
      } else {
        await new Promise(function (r) { setTimeout(r, 500); });
        reply = localReply(text);
      }
    } catch (e) {
      reply = "Sorry, the assistant is unavailable right now.";
    }
    t.textContent = reply;
    history.push({ role: "assistant", content: reply });
    body.scrollTop = body.scrollHeight;
  }
  box.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    ask(v);
  });
  box.querySelectorAll(".bwu-chips button").forEach(function (b) {
    b.addEventListener("click", function () { ask(b.textContent); });
  });
})();

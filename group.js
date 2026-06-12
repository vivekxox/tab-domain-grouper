// Tab Domain Grouper — collection page logic

const GLOBE_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="#8b98a8" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="9"></circle>
  <path d="M3 12h18"></path>
  <path d="M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9z"></path>
</svg>`;

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function renderEmpty() {
  const wrap = document.getElementById("wrap");
  wrap.innerHTML =
    '<div class="empty">This tab group is no longer available.<br>' +
    "Run the extension again to build a fresh one.</div>";
}

function render(data) {
  const tabs = Array.isArray(data.tabs) ? data.tabs : [];

  document.title = data.domain || "Tab Group";

  // favicon
  const faviconEl = document.getElementById("favicon");
  if (data.favIconUrl) {
    const img = document.createElement("img");
    img.src = data.favIconUrl;
    img.alt = "";
    img.addEventListener("error", () => {
      faviconEl.innerHTML = GLOBE_SVG;
    });
    faviconEl.appendChild(img);
  } else {
    faviconEl.innerHTML = GLOBE_SVG;
  }

  document.getElementById("domain").textContent = data.domain || "";
  document.getElementById("collected").textContent =
    "Collected " + formatTimestamp(data.collectedAt);
  document.getElementById("badge").textContent =
    tabs.length + (tabs.length === 1 ? " tab" : " tabs");
  document.getElementById("footDomain").textContent = data.domain || "";

  // list
  const list = document.getElementById("list");
  list.innerHTML = "";
  for (const t of tabs) {
    const li = document.createElement("li");
    li.className = "card";

    const a = document.createElement("a");
    a.className = "card-title";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = t.title || t.url;

    const urlDiv = document.createElement("div");
    urlDiv.className = "card-url";
    urlDiv.textContent = t.url;

    li.appendChild(a);
    li.appendChild(urlDiv);
    list.appendChild(li);
  }

  // copy all
  const btn = document.getElementById("copyBtn");
  const label = document.getElementById("copyLabel");
  btn.addEventListener("click", async () => {
    const text = tabs.map((t) => t.url).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Fallback for environments where the async clipboard API is blocked.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    btn.classList.add("copied");
    label.textContent = "Copied!";
    setTimeout(() => {
      btn.classList.remove("copied");
      label.textContent = "Copy all URLs";
    }, 1600);
  });
}

const params = new URLSearchParams(location.search);
const id = params.get("id");

if (!id) {
  renderEmpty();
} else {
  chrome.storage.local.get(id, (res) => {
    const data = res[id];
    if (!data) {
      renderEmpty();
    } else {
      render(data);
    }
  });
}

# Tab Domain Grouper

> A one-click Chrome extension that folds duplicate-domain tabs into a single clean collection page — so your tab bar stays manageable.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4d9bff?style=flat&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-2f6bff?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## What it does

Click the toolbar icon once. The extension scans every tab in your current window and groups any tabs that share the same domain into a single **collection page** — a clean, dark, monospace-styled page that lists each tab's title and URL with one-click links.

| Scenario | Behaviour |
|---|---|
| 3 tabs open on `linkedin.atlassian.net` | Folded into 1 collection page |
| 1 tab open on `github.com` | Left alone |
| The tab you're currently on | Always left untouched |
| Pinned tabs | Left alone |
| `chrome://` / extension pages | Left alone |

If you have multiple domains with 2+ tabs, you get one collection page per domain — all opened quietly in the background without stealing focus.

---

## Screenshot

<img width="800" alt="Tab Domain Grouper collection page" src="https://github.com/vivekxox/tab-domain-grouper/raw/main/screenshot.png" />

---

## Install

### From source (Developer Mode)

1. [Download the latest zip](https://github.com/vivekxox/tab-domain-grouper/archive/refs/heads/main.zip) and unzip it — or clone the repo:
   ```bash
   git clone https://github.com/vivekxox/tab-domain-grouper.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Toggle **Developer mode** on (top-right corner)
4. Click **Load unpacked** and select the `tab-domain-grouper` folder
5. Click the 🧩 puzzle icon in your toolbar → pin **Tab Domain Grouper**

> **Note:** Keep the folder in a permanent location — Chrome loads the extension from disk each time.

---

## Usage

Just click the icon. That's it.

- A blue number badge on the icon tells you how many collection pages were created.
- Each collection page has a **Copy all URLs** button for quick export.
- Close a collection page when you're done — the data doesn't persist after the page is closed.

---

## File structure

```
tab-domain-grouper/
├── manifest.json      # Manifest V3 config
├── background.js      # Service worker — core grouping logic
├── group.html         # Collection page markup + styles
├── group.js           # Collection page runtime logic
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## How it works

1. On toolbar click, `background.js` queries all tabs in the current window via `chrome.tabs`.
2. Tabs are bucketed by `hostname` (full subdomain — `mail.google.com` and `docs.google.com` are separate buckets).
3. Buckets with 2+ tabs get a collection page. The grouped tab data is saved to `chrome.storage.local` and the collection page reads it on load.
4. The original tabs are closed. Single-tab domains and the active tab are never touched.

---

## Permissions

| Permission | Why |
|---|---|
| `tabs` | Read tab URLs and titles; close tabs after grouping |
| `storage` | Pass grouped tab data to the collection page |

No network requests are made. No data leaves your browser.

---

## FAQ

**"Same domain" — does `mail.google.com` group with `docs.google.com`?**
No. The extension matches on full hostname. Open an issue if you'd prefer root-domain grouping (e.g. everything under `*.google.com` together).

**Can I reopen a collection page after closing it?**
The data is cleared when you close it. Just run the extension again to regroup.

**Will Chrome warn me about developer mode extensions?**
Chrome occasionally shows a banner for locally-loaded extensions. You can dismiss it — it's informational only.

---

## License

MIT — do whatever you like with it.

---

*Built with the Tab Domain Grouper — [github.com/vivekxox/tab-domain-grouper](https://github.com/vivekxox/tab-domain-grouper)*

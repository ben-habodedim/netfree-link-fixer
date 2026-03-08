console.log("Netfree Link Fixer v2 loaded");

// פלטפורמות נתמכות
const SUPPORTED_DOMAINS = [
  "drive.google.com",
  "docs.google.com",
  "drive.usercontent.google.com",
  "dropbox.com",
  "mega.nz",
  "wetransfer.com",
  "magicode.net",
  "magicode.me",
  "send.magicode.me"
];

let autoFixEnabled = true;

// טעינת הגדרות
function loadSettings() {
  chrome.storage.sync.get(["autoFixEnabled"], (res) => {
    autoFixEnabled = res.autoFixEnabled ?? true;

    if (autoFixEnabled) {
      fixAllLinks();
      scanTextNodes();
    }
  });
}

// בדיקת פלטפורמה
function isSupported(url) {
  try {
    const u = new URL(url);
    return SUPPORTED_DOMAINS.some(domain =>
      u.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

// ניקוי קישור
function cleanBrokenUrl(url) {

  let cleaned = url;

  // תווים שחוזרים מעל 3 פעמים
  cleaned = cleaned.replace(/(.)\1{3,}/g, "");

  // כוכביות
  cleaned = cleaned.replace(/\*/g, "");

  return cleaned;
}

// בדיקה אם צריך תיקון
function needsFix(url) {
  return isSupported(url) && cleanBrokenUrl(url) !== url;
}

// תיקון קישור
function fixLink(link) {

  const original = link.href;

  if (!needsFix(original)) return;

  const fixed = cleanBrokenUrl(original);

  link.href = fixed;

  console.log("Fixed:", original, "→", fixed);

}

// תיקון כל הקישורים
function fixAllLinks() {

  document.querySelectorAll("a[href]").forEach(link => {
    fixLink(link);
  });

}

// סריקת טקסטים
function scanTextNodes() {

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let node;

  while(node = walker.nextNode()) {

    let text = node.nodeValue;

    if (!text.includes("http")) continue;

    let cleaned = cleanBrokenUrl(text);

    if (cleaned !== text) {
      node.nodeValue = cleaned;
    }

  }

}

// טיפול בלחיצה
document.addEventListener("click", (event) => {

  if (autoFixEnabled) return;

  const link = event.target.closest("a");

  if (!link) return;

  const url = link.href;

  if (needsFix(url)) {

    event.preventDefault();

    const fixed = cleanBrokenUrl(url);

    window.location.href = fixed;

  }

}, true);

// MutationObserver
const observer = new MutationObserver(() => {

  if (!autoFixEnabled) return;

  fixAllLinks();
  scanTextNodes();

});

function startObserver() {

  observer.observe(document.body,{
    childList:true,
    subtree:true
  });

}

loadSettings();

startObserver();
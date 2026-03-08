const checkbox = document.getElementById("autoFix");

chrome.storage.sync.get(["autoFixEnabled"], (res) => {

  checkbox.checked = res.autoFixEnabled ?? true;

});

checkbox.addEventListener("change", () => {

  chrome.storage.sync.set({
    autoFixEnabled: checkbox.checked
  });

});
document.addEventListener("DOMContentLoaded", () => {
  // Load stored credentials if they exist
  chrome.storage.local.get(["username", "password"], (result) => {
    if (result.username) {
      document.getElementById("username").value = result.username;
    }
    if (result.password) {
      document.getElementById("password").value = result.password;
    }
  });

  document.getElementById("save").addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Save the credentials to Chrome storage
    chrome.storage.local.set({ username, password }, () => {
      document.getElementById("status").textContent = "Credentials saved";
    });
  });
});

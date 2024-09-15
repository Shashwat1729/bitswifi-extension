let loginTabId = null;
let instructTabId = null;

chrome.action.onClicked.addListener(() => {
  // Open the login page in a new tab and track its ID
  chrome.tabs.create(
    { url: "http://172.16.0.30:8090/httpclient.html" },
    (loginTab) => {
      loginTabId = loginTab.id;

      // Function to check if the desired URL is opened
      function checkNewTabs(tabId) {
        chrome.tabs.get(tabId, (tab) => {
          if (tab.url === "http://172.16.100.117/Instruct2024.php") {
            instructTabId = tabId;
            // Close both tabs
            chrome.tabs.remove(loginTabId, () => {
              console.log(
                "Login tab closed because the desired page was opened"
              );
            });
            chrome.tabs.remove(instructTabId, () => {
              console.log("Instruct tab closed");
            });
          }
        });
      }

      // Listener to detect when a new tab is created
      chrome.tabs.onCreated.addListener((newTab) => {
        checkNewTabs(newTab.id);
      });

      // Listener to detect when a tab is updated (which might include URL changes)
      chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === "complete") {
          checkNewTabs(tabId);
        }
      });

      // Wait for the login page to be fully loaded
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === loginTabId && info.status === "complete") {
          // Retrieve saved credentials from storage
          chrome.storage.local.get(["username", "password"], (result) => {
            const username = result.username;
            const password = result.password;

            // Execute script to fill the login form and submit it
            chrome.scripting
              .executeScript({
                target: { tabId: loginTabId },
                func: (username, password) => {
                  const usernameField = document.querySelector(
                    "#credentials #username"
                  );
                  const passwordField = document.querySelector(
                    "#credentials #password"
                  );
                  if (usernameField && passwordField) {
                    usernameField.value = username;
                    passwordField.value = password;

                    // Create and dispatch an Enter key event on the password field
                    const event = new KeyboardEvent("keydown", {
                      key: "Enter",
                      code: "Enter",
                      keyCode: 13,
                      which: 13,
                      bubbles: true,
                      cancelable: true,
                    });
                    passwordField.dispatchEvent(event);
                  } else {
                    console.error("Username or password field not found");
                  }
                },
                args: [username, password],
              })
              .catch((err) => console.error("Error executing script:", err));
          });

          // Remove the listener after the login process
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }
  );
});

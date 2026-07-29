// Remembers the client's login details on this device until they log out.
const KEY = "echo_remembered_client";

export function loadRememberedClient() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch (_e) {
    return null;
  }
}

export function rememberClient(accountNumber, phone) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ accountNumber, phone }));
  } catch (_e) { /* storage unavailable */ }
}

export function forgetClient() {
  try {
    localStorage.removeItem(KEY);
  } catch (_e) { /* storage unavailable */ }
}
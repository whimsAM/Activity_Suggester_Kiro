"use strict";

const API_BASE = "https://bored-api.appbrewery.com";

const els = {
  type: document.getElementById("type"),
  participants: document.getElementById("participants"),
  price: document.getElementById("price"),
  kidFriendly: document.getElementById("kidFriendly"),
  button: document.getElementById("suggest"),
  result: document.getElementById("result"),
};

/**
 * Build the API URL from the selected filters.
 * When no filters are set we hit /random; otherwise /filter and
 * pick a random match client-side so repeated clicks still vary.
 */
function buildUrl() {
  const type = els.type.value;
  const participants = els.participants.value;
  const price = els.price.value;

  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (participants) params.set("participants", participants);
  if (price === "free") {
    params.set("minprice", "0");
    params.set("maxprice", "0");
  } else if (price === "low") {
    params.set("minprice", "0");
    params.set("maxprice", "0.3");
  } else if (price === "high") {
    params.set("minprice", "0.3");
    params.set("maxprice", "1");
  }

  const query = params.toString();
  return query ? `${API_BASE}/filter?${query}` : `${API_BASE}/random`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function applyKidFilter(activities) {
  if (!els.kidFriendly.checked) return activities;
  return activities.filter((a) => a.kidFriendly !== false && a.accessibility !== 0);
}

function priceLabel(price) {
  if (price === 0 || price === "0") return "Free";
  if (typeof price === "number") {
    if (price <= 0.3) return "Low cost";
    if (price <= 0.6) return "Moderate";
    return "Splurge";
  }
  return "—";
}

function titleCase(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoading() {
  els.result.innerHTML =
    '<div class="state"><div class="spinner"></div>Finding something to do…</div>';
}

function showError(message) {
  els.result.innerHTML =
    '<div class="state error">' + message + "</div>";
}

function renderActivity(a) {
  const type = titleCase(a.type);
  const participants = a.participants != null ? a.participants : "—";
  const duration = titleCase(a.duration);
  const price = priceLabel(a.price);
  const kid = a.kidFriendly === false ? "No" : "Yes";

  const linkRow =
    a.link && a.link.trim()
      ? '<div class="link-row"><a href="' +
        encodeURI(a.link) +
        '" target="_blank" rel="noopener noreferrer">Learn more →</a></div>'
      : "";

  els.result.innerHTML =
    '<article class="card">' +
    '<span class="type-badge">' + type + "</span>" +
    "<h2>" + escapeHtml(a.activity) + "</h2>" +
    '<div class="meta">' +
    metaItem("Participants", participants) +
    metaItem("Duration", duration) +
    metaItem("Budget", price) +
    metaItem("Kid-friendly", kid) +
    "</div>" +
    linkRow +
    "</article>";
}

function metaItem(key, value) {
  return (
    '<div class="meta-item"><span class="k">' +
    key +
    '</span><span class="v">' +
    escapeHtml(String(value)) +
    "</span></div>"
  );
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function suggest() {
  els.button.disabled = true;
  showLoading();

  try {
    const res = await fetch(buildUrl(), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    // /random returns a single object; /filter returns an array.
    let activities = Array.isArray(data) ? data : [data];
    activities = applyKidFilter(activities);

    if (!activities.length || (activities[0] && activities[0].error)) {
      showError(
        "No activity matches those filters. Try loosening them and search again."
      );
      return;
    }

    renderActivity(pickRandom(activities));
  } catch (err) {
    showError(
      "Couldn't reach the activity service. Check your connection and try again."
    );
    console.error(err);
  } finally {
    els.button.disabled = false;
  }
}

els.button.addEventListener("click", suggest);

// Offer a suggestion on first load.
suggest();

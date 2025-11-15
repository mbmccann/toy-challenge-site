// script.js

let voters = []; // holds parsed CSV data

// Naive CSV parser
function parseCsv(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

// Load voters.csv when the page loads
async function loadData() {
  try {
    const res = await fetch("voters.csv");
    const text = await res.text();
    voters = parseCsv(text);
    console.log("Loaded voters:", voters);
  } catch (err) {
    console.error("Error loading CSV:", err);
  }
}

// Handle form submission
function setupForm() {
  const form = document.getElementById("lookup-form");
  const resultsDiv = document.getElementById("results");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstNameInput = document.getElementById("firstName").value.trim();
    const lastNameInput = document.getElementById("lastName").value.trim();
    const countyInput = document.getElementById("county").value.trim();

    const firstLower = firstNameInput.toLowerCase();
    const lastLower = lastNameInput.toLowerCase();
    const countyLower = countyInput.toLowerCase();

    const hasFirst = firstLower.length > 0;
    const hasLast = lastLower.length > 0;
    const hasCounty = countyLower.length > 0;

    // Filter the voters array based on whichever fields the user filled in.
    const matches = voters.filter((v) => {
      const vFirst = (v.first_name || "").toLowerCase();
      const vLast = (v.last_name || "").toLowerCase();
      const vCounty = (v.county || "").toLowerCase();

      let ok = true;

      if (hasFirst) {
        ok = ok && vFirst.includes(firstLower);
      }
      if (hasLast) {
        ok = ok && vLast.includes(lastLower);
      }
      if (hasCounty) {
        ok = ok && vCounty.includes(countyLower);
      }

      return ok;
    });

    // Clear previous results
    resultsDiv.innerHTML = "";

    // If no filters at all and no voters (e.g. data load failed)
    if (matches.length === 0 && !hasFirst && !hasLast && !hasCounty) {
      const p = document.createElement("p");
      p.textContent = "No records to show (did the data load correctly?).";
      resultsDiv.appendChild(p);
      return;
    }

    if (matches.length === 0) {
      const p = document.createElement("p");
      p.textContent = "No matches found with those filters.";
      resultsDiv.appendChild(p);
      return;
    }

    // Summary line
    const summary = document.createElement("p");
    summary.textContent = `Showing ${matches.length} record${
      matches.length > 1 ? "s" : ""
    } matching your filters.`;
    resultsDiv.appendChild(summary);

    // Render each match safely using textContent
    matches.forEach((m) => {
      const item = document.createElement("div");
      item.className = "result-item";

      const nameEl = document.createElement("strong");
      nameEl.textContent = `${m.first_name} ${m.last_name}`;
      item.appendChild(nameEl);

      const countyEl = document.createElement("div");
      countyEl.textContent = `County: ${m.county}`;
      item.appendChild(countyEl);

      const reasonEl = document.createElement("div");
      reasonEl.className = "result-reason";
      reasonEl.textContent = `Reason: ${m.reason}`;
      item.appendChild(reasonEl);

      resultsDiv.appendChild(item);
    });
  });
}

// When the page is ready, load data + set up the form
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupForm();
});

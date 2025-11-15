// script.js

let voters = []; // will hold our parsed CSV data

// Naive CSV parser: good enough for our simple file (no commas in fields)
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

    if (!firstNameInput || !lastNameInput) {
      resultsDiv.innerHTML = "<p>Please enter first and last name.</p>";
      return;
    }

    const firstLower = firstNameInput.toLowerCase();
    const lastLower = lastNameInput.toLowerCase();
    const countyLower = countyInput.toLowerCase();

    const matches = voters.filter((v) => {
      const vFirst = (v.first_name || "").toLowerCase();
      const vLast = (v.last_name || "").toLowerCase();
      const vCounty = (v.county || "").toLowerCase();

      const nameMatches =
        vFirst.includes(firstLower) && vLast.includes(lastLower);

      const countyMatches = countyLower
        ? vCounty.includes(countyLower)
        : true; // if county not provided, ignore it

      return nameMatches && countyMatches;
    });

    if (matches.length === 0) {
      resultsDiv.innerHTML = "<p>No matches found in this toy list.</p>";
      return;
    }

    // Render results
    const html = matches
      .map((m) => {
        return `
          <div class="result-item">
            <strong>${m.first_name} ${m.last_name}</strong>
            <div>County: ${m.county}</div>
            <div class="result-reason">Reason: ${m.reason}</div>
          </div>
        `;
      })
      .join("");

    resultsDiv.innerHTML = `
      <p>Found ${matches.length} possible match${matches.length > 1 ? "es" : ""}:</p>
      ${html}
    `;
  });
}

// When the page is ready, load data + set up the form
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupForm();
});
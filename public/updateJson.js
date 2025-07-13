const fs = require("fs");
const path = require("path");
const csv = require("csv-parser"); // Install using: npm install csv-parser

const csvFilePath = path.join(__dirname, "data.csv"); // Update with your CSV filename
const jsonFilePath = path.join(__dirname, "data.json"); // Update with your JSON filename

const csvData = [];
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

// Read CSV file and store data
fs.createReadStream(csvFilePath)
  .pipe(csv({ headers: false }))
  .on("data", (row) => {
    csvData.push({
      email: row[0],          // First field
      userId: row[1],         // Second field (wallet address)
      userCreated: row[2],    // Third field (date)
    });
  })
  .on("end", () => {
    console.log("CSV file successfully read.");

    // Update JSON data with "userCreated" field
    const updatedJson = jsonData.map((user) => {
      const matchedCsvRecord = csvData.find((csvRecord) => csvRecord.userId === user.userId);

      if (matchedCsvRecord) {
        return { ...user, userCreated: matchedCsvRecord.userCreated };
      }
      return user; // Keep the original record if no match is found
    });

    // Write updated JSON to a new file
    fs.writeFileSync(jsonFilePath, JSON.stringify(updatedJson, null, 2), "utf-8");
    console.log("JSON file updated successfully.");
  });


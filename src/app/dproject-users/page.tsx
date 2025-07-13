'use client';
// app/page.tsx

import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const Page: React.FC = () => {
  const [csvData, setCsvData] = useState<string[][]>([]);

  useEffect(() => {
    // Fetch the CSV file
    fetch('/dproject_users_20250210_1356.csv')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        return response.text();
      })
      .then((data) => {
        // Parse the CSV file
        const parsedData = Papa.parse(data, { header: false });
        setCsvData(parsedData.data);
      })
      .catch((error) => {
        console.error('Error fetching or parsing CSV:', error);
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ fontWeight: "bold", margin: "10px", justifyContent: 'center', alignItems: 'center' }}>DProject Users</h1>
      {csvData.length > 0 ? (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {csvData[0].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Page;

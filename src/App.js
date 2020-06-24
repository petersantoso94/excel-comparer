import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import "./App.css";

function App() {
  const [file1Data, setfile1Data] = useState({});
  const [file2Data, setfile2Data] = useState({});
  const sheetFile1Component = [];
  const sheetFile2Component = [];
  const FileOnChangeHandler = (evt, setFileFunction) => {
    let file1 = evt.target.files;
    if (!file1 || file1.length === 0) {
      return;
    }
    let sheetObject = {};
    readXlsxFile(file1[0], { getSheets: true }).then((sheets) => {
      sheets.forEach((sheet) => {
        sheetObject = { ...sheetObject, [sheet.name]: [] };
        readXlsxFile(file1[0], { sheet: sheet.name }).then((data) => {
          data.forEach((row, idx) => {
            if (idx === 0) {
              //header part
              sheetObject[sheet.name] = data;
            }
          });
          setFileFunction({ ...sheetObject });
        });
      });
    });
  };
  const pushSheetData = (key, sheetComponent) => {
    sheetComponent.push(
      <li key={key + new Date().getMilliseconds()}>{key}</li>
    );
  };
  // if there is file data, start to separate the sheet and header
  if (file1Data && file2Data) {
    Object.keys(file1Data).forEach((key) =>
      pushSheetData(key, sheetFile1Component)
    );
    Object.keys(file2Data).forEach((key) =>
      pushSheetData(key, sheetFile2Component)
    );
  }
  return (
    <div>
      <table className="CompareTable">
        <thead>
          <tr>
            <td>File1</td>
            <td>File2</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2}>Input:</td>
          </tr>
          <tr>
            <td>
              <input
                type="file"
                onChange={(e) => FileOnChangeHandler(e, setfile1Data)}
              ></input>
            </td>
            <td>
              <input
                type="file"
                onChange={(e) => FileOnChangeHandler(e, setfile2Data)}
              ></input>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Sheets to compare:</td>
          </tr>
          <tr>
            <td>
              <ul>{sheetFile1Component}</ul>
            </td>
            <td>
              <ul>{sheetFile2Component}</ul>
            </td>
          </tr>
          <tr>
            <td>Data:{JSON.stringify(file1Data)}</td>
            <td>Data:{JSON.stringify(file2Data)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;

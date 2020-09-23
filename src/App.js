import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Icon from "@material-ui/core/Icon";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CircularProgress from "@material-ui/core/CircularProgress";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import "./App.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  grid: {
    marginLeft: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    width: "80%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  table: {
    minWidth: 850,
  },
  mt10: {
    marginTop: theme.spacing(1),
  },
}));
function App() {
  const [file1Data, setfile1Data] = useState({});
  const [file2Data, setfile2Data] = useState({});
  const [selectedSheet1, setselectedSheet1] = useState("");
  const [selectedSheet2, setselectedSheet2] = useState("");
  const [selectedColumn1, setselectedColumn1] = useState(0);
  const [selectedColumn2, setselectedColumn2] = useState(0);
  const [selectedDiffColumn1, setselectedDiffColumn1] = useState(0);
  const [selectedDiffColumn2, setselectedDiffColumn2] = useState(0);
  const [diff1, setdiff1] = useState([]);
  const [diff2, setdiff2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const headerFile1 = [];
  const headerFile2 = [];
  const sheetFile1Component = [];
  const sheetFile2Component = [];
  const headerFile1Component = [];
  const headerFile2Component = [];
  const diff1ColumnComponent = [];
  const diff2ColumnComponent = [];
  const classes = useStyles();
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const FileOnChangeHandler = (
    evt,
    setFileFunction,
    setSelectedSheetFunction
  ) => {
    let file1 = evt.target.files;
    if (!file1 || file1.length === 0) {
      return;
    }
    setSelectedSheetFunction("");
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
  const pushOptionData = (key, sheetComponent, value = null) => {
    sheetComponent.push(
      <option value={value != null ? value : key} key={key + uuidv4()}>
        {key}
      </option>
    );
  };
  const selectOnChangeHandler = (evt, handler) => {
    // reset the diff on change
    setdiff1([]);
    setdiff2([]);
    handler(evt.target.value);
  };
  const onSort = (sortedList) => {};
  const ComparingHandler = (evt) => {
    setLoading(true);
    let diffs1 = file1Data[selectedSheet1].map((a) => [...a]);
    let diffs2 = file2Data[selectedSheet2].map((a) => [...a]);
    file1Data[selectedSheet1].forEach((fl1, id1) => {
      if (id1 > 0) {
        // only compare row data
        file2Data[selectedSheet2].forEach((fl2, id2) => {
          if (id2 > 0 && fl1[selectedColumn1] === fl2[selectedColumn2]) {
            // only compare row data with same data in compareable column
            headerFile1.forEach((_, i1) => {
              headerFile2.forEach((_, i2) => {
                if (fl1[i1] == fl2[i2]) {
                  diffs1[id1][i1] = "-";
                  diffs2[id2][i2] = "-";
                }
              });
            });
          }
        });
      }
    });
    setdiff1([...diffs1]);
    setdiff2([...diffs2]);
    setLoading(false);
  };
  const addDifferentColumn = (diffArray, headerFile, component) => {
    diffArray.forEach((diff, row) => {
      let caughtIdx = [-1];
      diff.forEach((cell, col) => {
        if (cell !== "-" && !caughtIdx.includes(col) && row > 0) {
          // push to column array if there is any diff
          pushOptionData(headerFile[col], component, col);
          // add col in caughtIdx array so it wont search the same col
          caughtIdx.push(col);
        }
      });
    });
  };
  // if there is file data, start to separate the sheet and header
  if (file1Data && file2Data) {
    Object.keys(file1Data).forEach((key) =>
      pushOptionData(key, sheetFile1Component)
    );
    Object.keys(file2Data).forEach((key) =>
      pushOptionData(key, sheetFile2Component)
    );
  }
  // if there is selected sheet
  if (selectedSheet1 && headerFile1.length === 0) {
    // 0 because the header always start with 0
    file1Data[selectedSheet1][0].forEach((header, idx) => {
      pushOptionData(`${header}`, headerFile1Component, idx);
      headerFile1.push(header);
    });
  }
  if (selectedSheet2 && headerFile2.length === 0) {
    file2Data[selectedSheet2][0].forEach((header, idx) => {
      pushOptionData(`${header}`, headerFile2Component, idx);
      headerFile2.push(header);
    });
  }
  if (diff1 && diff1.length > 0) {
    addDifferentColumn(diff1, headerFile1, diff1ColumnComponent);
  }
  if (diff2 && diff2.length > 0) {
    addDifferentColumn(diff2, headerFile2, diff2ColumnComponent);
  }
  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={1}
        direction="row"
        justify="center"
        alignItems="center"
      >
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <AppBar position="static" color="secondary">
              <p>File Excel 1</p>
            </AppBar>
            <input
              className={classes.mt10}
              type="file"
              onChange={(e) =>
                FileOnChangeHandler(e, setfile1Data, setselectedSheet1)
              }
            ></input>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="sheet-from-file1">
                Sheet to compare:
              </InputLabel>
              <Select
                native
                value={selectedSheet1}
                onChange={(e) => selectOnChangeHandler(e, setselectedSheet1)}
                inputProps={{
                  id: "sheet-from-file1",
                }}
              >
                <option aria-label="None" value="" />
                {sheetFile1Component}
              </Select>
            </FormControl>
            {headerFile1Component.length > 0 ? (
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="column-from-file1">
                  Column as key to compare:
                </InputLabel>
                <Select
                  native
                  value={selectedColumn1}
                  onChange={(e) => selectOnChangeHandler(e, setselectedColumn1)}
                  inputProps={{
                    id: "column-from-file1",
                  }}
                >
                  <option aria-label="None" value="" />
                  {headerFile1Component}
                </Select>
              </FormControl>
            ) : (
              <></>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <AppBar position="static" color="secondary">
              <p>File Excel 2</p>
            </AppBar>
            <input
              className={classes.mt10}
              type="file"
              onChange={(e) =>
                FileOnChangeHandler(e, setfile2Data, setselectedSheet2)
              }
            ></input>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="sheet-from-file2">
                Sheet to compare:
              </InputLabel>
              <Select
                native
                value={selectedSheet2}
                onChange={(e) => selectOnChangeHandler(e, setselectedSheet2)}
                inputProps={{
                  id: "sheet-from-file2",
                }}
              >
                <option aria-label="None" value="" />
                {sheetFile2Component}
              </Select>
            </FormControl>
            {headerFile2Component.length > 0 ? (
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="column-from-file2">
                  Column as key to compare:
                </InputLabel>
                <Select
                  native
                  value={selectedColumn2}
                  onChange={(e) => selectOnChangeHandler(e, setselectedColumn2)}
                  inputProps={{
                    id: "column-from-file2",
                  }}
                >
                  <option aria-label="None" value="" />
                  {headerFile2Component}
                </Select>
              </FormControl>
            ) : (
              <></>
            )}
          </Paper>
        </Grid>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <AppBar position="static" color="secondary">
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="File 1" />
                  <Tab label="File 2" />
                </Tabs>
              </AppBar>
              <TabPanel value={tabValue} index={0}>
                <Box mb={3}>
                  <Grid item xs={3}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="column-with-differences">
                        Column with differences
                      </InputLabel>
                      <Select
                        native
                        value={selectedDiffColumn1}
                        onChange={(e) => {
                          setselectedDiffColumn1(e.target.value);
                        }}
                        inputProps={{
                          id: "column-with-differences",
                        }}
                      >
                        <option aria-label="None" value={0} />
                        {diff1ColumnComponent}
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        {diff1.map((row, idx) => {
                          if (idx === 0) {
                            let result = [];
                            row.forEach((x, colidx) => {
                              if (
                                selectedDiffColumn1 == 0 ||
                                colidx === selectedColumn1 ||
                                (selectedDiffColumn1 > 0 &&
                                  selectedDiffColumn1 == colidx)
                              )
                                result.push(
                                  <TableCell key={uuidv4()}>{x}</TableCell>
                                );
                            });
                            return result;
                          }
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {diff1.map((row, idx) => {
                        let result = [];
                        if (idx > 0) {
                          let colResult = [];
                          row.forEach((x, colidx) => {
                            if (
                              selectedDiffColumn1 == 0 ||
                              colidx === selectedColumn1 ||
                              (selectedDiffColumn1 > 0 &&
                                selectedDiffColumn1 == colidx)
                            )
                              colResult.push(
                                <TableCell key={x + uuidv4()}>{x}</TableCell>
                              );
                          });
                          result.push(
                            <TableRow key={"1" + uuidv4()}>
                              {colResult}
                            </TableRow>
                          );

                          return result;
                        }
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Box mb={3}>
                  <Grid item xs={3}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="column-with-differences2">
                        Column with differences
                      </InputLabel>
                      <Select
                        native
                        value={selectedDiffColumn2}
                        onChange={(e) => {
                          setselectedDiffColumn2(e.target.value);
                        }}
                        inputProps={{
                          id: "column-with-differences2",
                        }}
                      >
                        <option aria-label="None" value={0} />
                        {diff2ColumnComponent}
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        {diff2.map((row, idx) => {
                          if (idx === 0) {
                            let result = [];
                            row.forEach((x, colidx) => {
                              if (
                                selectedDiffColumn2 == 0 ||
                                colidx === selectedColumn2 ||
                                (selectedDiffColumn2 > 0 &&
                                  selectedDiffColumn2 == colidx)
                              )
                                result.push(
                                  <TableCell key={x + uuidv4()}>{x}</TableCell>
                                );
                            });
                            return result;
                          }
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {diff2.map((row, idx) => {
                        let result = [];
                        if (idx > 0) {
                          let colResult = [];
                          row.forEach((x, colidx) => {
                            if (
                              selectedDiffColumn2 == 0 ||
                              colidx === selectedColumn2 ||
                              (selectedDiffColumn2 > 0 &&
                                selectedDiffColumn2 == colidx)
                            )
                              colResult.push(
                                <TableCell key={x + uuidv4()}>{x}</TableCell>
                              );
                          });
                          result.push(
                            <TableRow key={"2" + uuidv4()}>
                              {colResult}
                            </TableRow>
                          );

                          return result;
                        }
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
          </Grid>
        )}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<Icon>search</Icon>}
              onClick={ComparingHandler}
              disabled={headerFile2.length === 0 || headerFile1.length === 0}
            >
              Compare
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

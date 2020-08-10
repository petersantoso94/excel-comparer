import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import DragSortableList from "react-drag-sortable";
import "./App.css";

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
}));
function App() {
  const [file1Data, setfile1Data] = useState({});
  const [file2Data, setfile2Data] = useState({});
  const [selectedSheet1, setselectedSheet1] = useState("");
  const [selectedSheet2, setselectedSheet2] = useState("");
  const [diff1, setdiff1] = useState([]);
  const [diff2, setdiff2] = useState([]);
  const headerFile1 = [];
  const headerFile2 = [];
  const sheetFile1Component = [];
  const sheetFile2Component = [];
  const classes = useStyles();
  const FileOnChangeHandler = (evt, setFileFunction, setSelectedSheetFunction) => {
    let file1 = evt.target.files;
    if (!file1 || file1.length === 0) {
      return;
    }
    setSelectedSheetFunction("")
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
      <option value={key} key={key + uuidv4()}>
        {key}
      </option>
    );
  };
  const selectSheetHandler = (evt, handler) => {
    const sheet = evt.target.value;
    handler(sheet);
  };
  const onSort = (sortedList) => {};
  const ComparingHandler = (evt) => {
    let diffs1 = file1Data[selectedSheet1].map((a) => [...a]);
    let diffs2 = file2Data[selectedSheet2].map((a) => [...a]);
    let sameIdx1 = 0;
    let sameIdx2 = 0;
    headerFile1.forEach((head1, idx) => {
      if (head1.rank === 0) {
        sameIdx1 = idx;
        return;
      }
    });
    headerFile2.forEach((head2, idx) => {
      if (head2.rank === 0) {
        sameIdx2 = idx;
        return;
      }
    });
    file1Data[selectedSheet1].forEach((fl1, id1) => {
      if (id1 > 0) {
        // only compare row data
        file2Data[selectedSheet2].forEach((fl2, id2) => {
          if (id2 > 0 && fl1[sameIdx1] === fl2[sameIdx2]) {
            // only compare row data with same data in compareable column
            headerFile1.forEach((head1, i1) => {
              headerFile2.forEach((head2, i2) => {
                if (
                  head1.rank > 0 &&
                  head2.rank > 0 &&
                  head1.rank === head2.rank
                ) {
                  if (fl1[i1] == fl2[i2]) {
                    diffs1[id1][i1] = "-";
                    diffs2[id2][i2] = "-";
                  }
                }
              });
            });
          }
        });
      }
    });
    setdiff1([...diffs1]);
    setdiff2([...diffs2]);
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
  // if there is selected sheet
  if (selectedSheet1 && headerFile1.length === 0) {
    // 0 because the header always start with 0
    file1Data[selectedSheet1][0].forEach((header) => {
      headerFile1.push({
        content: (
          <ListItem button>
            <ListItemText inset primary={header} />
          </ListItem>
        ),
      });
    });
  }
  if (selectedSheet2 && headerFile2.length === 0) {
    file2Data[selectedSheet2][0].forEach((header) => {
      headerFile2.push({
        content: (
          <ListItem button>
            <ListItemText inset primary={header} />
          </ListItem>
        ),
      });
    });
  }
  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={3}
        direction="row"
        justify="center"
        alignItems="center"
      >
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <p>File Excel 1</p>
            <input
              type="file"
              onChange={(e) => FileOnChangeHandler(e, setfile1Data, setselectedSheet1)}
            ></input>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="sheet-from-file1">
                Sheet to compare:
              </InputLabel>
              <Select
                native
                value={selectedSheet1}
                onChange={(e) => selectSheetHandler(e, setselectedSheet1)}
                inputProps={{
                  id: "sheet-from-file1",
                }}
              >
                <option aria-label="None" value="" />
                {sheetFile1Component}
              </Select>
            </FormControl>
            {headerFile1.length > 0 ? (
              <List component="nav" aria-label="contacts">
                <DragSortableList
                  items={headerFile1}
                  onSort={onSort}
                  type="vertical"
                />
              </List>
            ) : (
              <></>
            )}
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {diff1.map((row, idx) => {
                      if (idx === 0) {
                        let result = [];
                        row.forEach((x) => {
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
                      result.push(
                        <TableRow key={"1" + uuidv4()}>
                          {row.map((x) => {
                            result.push(
                              <TableCell key={x + uuidv4()}>{x}</TableCell>
                            );
                          })}
                        </TableRow>
                      );

                      return result;
                    }
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <p>File Excel 2</p>
            <input
              type="file"
              onChange={(e) => FileOnChangeHandler(e, setfile2Data,setselectedSheet2)}
            ></input>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="sheet-from-file2">
                Sheet to compare:
              </InputLabel>
              <Select
                native
                value={selectedSheet2}
                onChange={(e) => selectSheetHandler(e, setselectedSheet2)}
                inputProps={{
                  id: "sheet-from-file2",
                }}
              >
                <option aria-label="None" value="" />
                {sheetFile2Component}
              </Select>
            </FormControl>
            {headerFile2.length > 0 ? (
              <List component="nav" aria-label="contacts">
                <DragSortableList
                  items={headerFile2}
                  onSort={onSort}
                  type="vertical"
                />
              </List>
            ) : (
              <></>
            )}
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {diff2.map((row, idx) => {
                      if (idx === 0) {
                        let result = [];
                        row.forEach((x) => {
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
                      result.push(
                        <TableRow key={"2" + uuidv4()}>
                          {row.map((x) => {
                            result.push(
                              <TableCell key={x + uuidv4()}>{x}</TableCell>
                            );
                          })}
                        </TableRow>
                      );

                      return result;
                    }
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
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

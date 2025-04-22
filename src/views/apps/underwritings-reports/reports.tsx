"use client";
import React, { useEffect } from "react";

import {
  Autocomplete,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button } from "primereact/button";
import { ReportService } from "@/services/remote-api/api/report-services";

const reportService = new ReportService();

const useStyles = makeStyles((theme: any) => ({
  input1: {
    width: "50%",
  },
  clientTypeRadioGroup: {
    flexWrap: "nowrap",
    "& label": {
      flexDirection: "row",
    },
  },
  formControl: {
    minWidth: 182,
  },
  formControl1: {
    margin: theme?.spacing ? theme.spacing(1) : "8px",
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  inputRoot: {
    "&$disabled": {
      color: "black",
    },
    benifitAutoComplete: {
      width: 500,
      "& .MuiInputBase-formControl": {
        maxHeight: 200,
        overflowX: "hidden",
        overflowY: "auto",
      },
    },
  },
  disabled: {},
  actionContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  saveBtn: {
    marginRight: "5px",
  },
  buttonPrimary: {
    backgroundColor: "#D80E51",
    color: "#f1f1f1",
  },
  buttonSecondary: {
    backgroundColor: "#01de74",
    color: "#f1f1f1",
  },
}));

// Define types for selectedValues state
interface SelectedValues {
  reportType: string;
  startDate: number | null;
  endDate: number | null;
}

// Define types for serviceTypeList
interface ServiceType {
  label: string;
  value: string;
}

const Reports: React.FC = () => {
  const classes = useStyles();

  const [selectedValues, setSelectedValues] = React.useState<SelectedValues>({
    reportType: "",
    startDate: null,
    endDate: new Date().getTime(), // Default endDate to current date in timestamp format
  });

  const [serviceTypeList, setServiceTypeList] = React.useState<ServiceType[]>([]);

  const handleInputChange = (field: keyof SelectedValues, value: any) => {
    const formattedValue =
      field === "startDate" || field === "endDate"
        ? value
          ? new Date(value).getTime()
          : null // Convert date to timestamp
        : value;

    setSelectedValues((prevState) => ({
      ...prevState,
      [field]: formattedValue,
    }));
  };

  const isButtonDisabled = !(
    selectedValues.reportType &&
    selectedValues.startDate &&
    selectedValues.endDate
  );

  // const reportOptions = () => {
  //   const rl$ = reportService.getReportList();

  //   rl$.subscribe((result: any) => {
  //     console.log(result);
  //   });
  // };

  useEffect(() => {
    const rl$ = reportService.getReportList();
    rl$.subscribe((result: any) => {

      // Convert the array into the desired format
      const formattedArray: ServiceType[] = result.map((item: any) => ({
        label: item
          .replace(/_/g, " ") // Replace underscores with spaces
          .toLowerCase() // Convert to lowercase
          .replace(/^\w/, (c: string) => c.toUpperCase()), // Capitalize the first letter
        value: item,
      }));

      // Set the formatted array to serviceTypeList
      setServiceTypeList(formattedArray);
    })
  }, []);

  const DownloadReport = () => {
    const fileName = selectedValues.reportType || "report"; // Default file name if reportType is empty
    reportService.downloadReport(selectedValues).subscribe((blob: Blob) => {
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const a = document.createElement("a");

      a.href = downloadUrl;
      a.download = fileName; // Set the default file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a); // Clean up the DOM

      // Release the object URL
      window.URL.revokeObjectURL(downloadUrl);
    });
  };

  return (
    <>
      <Paper elevation={0} style={{ padding: "2%" }}>
        <Grid container alignItems="center" spacing={3}>
          {/* Service Type Dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl} fullWidth>
              <Autocomplete
                id="service-type-autocomplete"
                options={serviceTypeList}
                value={serviceTypeList.find((item) => item.value === selectedValues.reportType) || null}
                onChange={(event, newValue) => {
                  handleInputChange("reportType", newValue?.value || "");
                }}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => (
                  <TextField {...params} label="Category" variant="outlined" fullWidth />
                )}
              />
            </FormControl>
          </Grid>

          {/* Start Date Picker */}
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["year", "month", "day"]}
                label="Start Date"
                value={selectedValues.startDate}
                onChange={(date) => handleInputChange("startDate", date)}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* End Date Picker */}
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["year", "month", "day"]}
                maxDate={new Date()}
                label="End Date"
                value={selectedValues.endDate}
                onChange={(date) => handleInputChange("endDate", date)}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Download Button */}
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip
              title={isButtonDisabled ? "Please fill all the fields" : ""}
              arrow
            >
              <span>
                <Button
                  className={`responsiveButton ${classes.buttonPrimary}`}
                  type="button"
                  style={{
                    height: "56px", // Matches the height of input fields
                    borderRadius: "8px",
                  }}
                  onClick={DownloadReport}
                  disabled={isButtonDisabled} // Disable button if fields are not filled
                >
                  Download
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default Reports;

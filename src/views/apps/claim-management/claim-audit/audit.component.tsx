"use client"
import React, { useState } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  MenuItem,
  Select,
} from '@mui/material';
import TextField from '@mui/material/TextField';

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { CSSProperties} from '@mui/styles';
import { makeStyles, useTheme } from '@mui/styles';


import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import { Button } from 'primereact/button';

import ClaimAudit from './claim.audit.list.component';


const useStyles = makeStyles(theme => ({
  AccordionSummary: {
    backgroundColor: '#f1f1f1',
    color: '#a1a1a1',
    height: ' 36px',
  },
  AccordionDetails: {
    backgroundColor: '#fff',
  },
}));

const searchByOptions = [
  {
    value: 1,
    label: 'CLAIM RECEIVE DATE',
  },
  {
    value: 2,
    label: 'BATCH NUMBER',
  },
  {
    value: 3,
    label: 'MEMBERSHIP NO',
  },
  {
    value: 4,
    label: 'PROVIDER',
  },
];

const claimCategoryOptions = [
  {
    value: 1,
    label: 'ALL',
  },
  {
    value: 2,
    label: 'REGULAR',
  },
  {
    value: 3,
    label: 'E_CLAIM',
  },
];

const auditTypeOptions = [
  {
    value: 1,
    label: 'NORMAL',
  },
  {
    value: 2,
    label: 'INDEMNITY',
  },
];

const auditStatusOptions = [
  {
    value: 1,
    label: 'NEW',
  },
  {
    value: 2,
    label: 'FAILED',
  },
];

const payeeOptions = [
  {
    value: 1,
    label: 'PROVIDER',
  },
  {
    value: 2,
    label: 'MEMBER',
  },
  {
    value: 3,
    label: 'NOMINEE',
  },
  {
    value: 4,
    label: 'CORPORATE',
  },
  {
    value: 5,
    label: 'BROKER',
  },
  {
    value: 6,
    label: 'INSURER',
  },
];

const TypographyStyle2:CSSProperties = {
  fontSize: '13px',
  fontWeight: '500',
  alignItems: 'end',
  display: 'flex',
  textTransform: 'capitalize',
  width: '150px',
  marginLeft: '10px',
  color:"#3c3c3c"
};

const TypographyStyle1 = {
  fontSize: '14px',
  color:"#a1a1a1"
};

export default function ClaimsAuditDetailsComponent() {
  const [expanded, setExpanded] = useState(true);
  const [searchBy, setSearchBy] = useState();
  const [claimCategory, setClaimCategory] = useState();
  const [auditType, setAuditType] = useState();
  const [auditStatus, setAuditStatus] = useState();
  const [payee, setPayee] = useState();
  const [startDate, setstartdate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const theme = useTheme();
  const [dates, setDates] = useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null });
  const classes = useStyles();

  return (
    <div>
      <Box component="h2" marginBottom={'2%'}>
        Claims Audit
      </Box>
      <Accordion style={{ margin: '10px 0', borderRadius: '10px' }} expanded={expanded} elevation={0}>
        <AccordionSummary
          className={classes.AccordionSummary}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          onClick={() => {
            setExpanded(!expanded);
          }}>
          <Typography>Search Claim</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.AccordionDetails}>
          <Box paddingBottom={'3%'} borderRadius={'10px'} border={'1 px solid rgba(0,0,0,0.1)'}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6} md={4}>
                <Box display={'flex'} marginY={'10px'} marginX={'3%'}>
                  <Typography style={TypographyStyle1}>Search By</Typography>&nbsp;
                  <span>:</span>&nbsp;
                  <Select
                    name="searchBy"
                    label="Search By"
                    value={searchBy}
                    onChange={(e:any) => {
                      setSearchBy(e.target.value);
                    }}
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={TypographyStyle2}>
                    {searchByOptions.map(ele => {
                      return (
                        <MenuItem key={ele.value} value={ele.value}>
                          {ele.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <Box display={'flex'} marginY={'10px'} marginX={'3%'}>
                  <Typography style={TypographyStyle1}>Claim category</Typography>&nbsp;
                  <span>:</span>&nbsp;
                  <Select
                    name="claimCategory"
                    label="Claim category"
                    value={claimCategory}
                    onChange={(e:any) => {
                      setClaimCategory(e.target.value);
                    }}
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={TypographyStyle2}>
                    {claimCategoryOptions.map(ele => {
                      return (
                        <MenuItem key={ele.value} value={ele.value}>
                          {ele.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <Box display={'flex'} marginY={'10px'} marginX={'3%'}>
                  <Typography style={TypographyStyle1}>audit Type</Typography>&nbsp;
                  <span>:</span>&nbsp;
                  <Select
                    name="auditType"
                    label="Audit Type"
                    value={auditType}
                    onChange={ (e:any) => {
                      setAuditType(e.target.value);
                    }}
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={TypographyStyle2}>
                    {auditTypeOptions.map(ele => {
                      return (
                        <MenuItem key={ele.value} value={ele.value}>
                          {ele.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <Box display={'flex'} marginY={'10px'} marginX={'3%'}>
                  <Typography style={TypographyStyle1}>audit Status</Typography>&nbsp;
                  <span>:</span>&nbsp;
                  <Select
                    name="auditStatus"
                    label="Audit Status"
                    value={auditStatus}
                    onChange={ (e:any) => {
                      setAuditStatus(e.target.value);
                    }}
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={TypographyStyle2}>
                    {auditStatusOptions.map(ele => {
                      return (
                        <MenuItem key={ele.value} value={ele.value}>
                          {ele.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <Box display={'flex'} marginY={'10px'} marginX={'3%'}>
                  <Typography style={TypographyStyle1}>Payee</Typography>&nbsp;
                  <span>:</span>&nbsp;
                  <Select
                    name="payee"
                    label="Payee"
                    value={payee}
                    onChange={ (e:any) => {
                      setPayee(e.target.value);
                    }}
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={TypographyStyle2}>
                    {payeeOptions.map(ele => {
                      return (
                        <MenuItem key={ele.value} value={ele.value}>
                          {ele.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
              </Grid>
            </Grid>

            {searchBy == 4 && (
              <Box display={'flex'} marginY={'3%'} marginX={'0%'}>
                <Typography style={TypographyStyle1}>Provider</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Select
                  name="searchBy"
                  label="Provider"
                  value={claimCategoryOptions[0].value}

                  // onChange={handleChange}
                  inputProps={{ 'aria-label': 'Without label' }}
                  style={TypographyStyle2}>
                  {claimCategoryOptions.map(ele => {
                    return (
                      <MenuItem key={ele.value} value={ele.value}>
                        {ele.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
            )}

            {searchBy != 2 && searchBy != 3 && (
              <>
                <Box component="h3" marginY={'3%'} marginX={'0%'}>
                  Claim Recieving Date
                </Box>
                <Box display={'flex'} marginY={'3%'} marginX={'0%'}>
                  <Box display={'flex'}>
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      }}>
                      From
                    </Typography>
                    &nbsp;
                    <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                    <Box style={{ marginBottom: '10px' }}>
                      {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          views={['year', 'month', 'date']}
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="normal"
                          autoOk={true}
                          id="startDate"
                          value={startDate}
                          onChange={setstartdate}
                          error={!startDate}
                          helperText={!startDate ? 'Select a date' : ''}
                          KeyboardButtonProps={{
                            'aria-label': 'change ing date',
                          }}
                        />
                      </MuiPickersUtilsProvider> */}
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          views={["year", "month", "day"]}
                          label="Start Date"
                          value={startDate}
                          onChange={(newValue:any) => setstartdate(newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              margin="normal"
                              style={{ marginBottom: '0px' }}
                              variant="outlined"
                              error={!startDate}
                              helperText={!startDate ? 'Select a date' : ''}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Box>
                  <Box display={'flex'} marginLeft={'3%'}>
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      }}>
                      To
                    </Typography>
                    &nbsp;
                    <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                    <Box style={{ marginBottom: '10px' }}>
                      {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          views={['year', 'month', 'date']}
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="normal"
                          autoOk={true}
                          id="endDate"
                          error={!endDate}
                          helperText={!endDate ? 'Select a date' : ''}
                          value={endDate}
                          onChange={setEndDate}
                          KeyboardButtonProps={{
                            'aria-label': 'change ing date',
                          }}
                        />
                      </MuiPickersUtilsProvider> */}
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          views={["year", "month", "day"]}
                          label="End Date"
                          value={endDate}
                          onChange={(newValue:any) => setEndDate(newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              margin="normal"
                              style={{ marginBottom: '0px' }}
                              variant="outlined"
                              error={!endDate}
                              helperText={!endDate ? 'Select a date' : ''}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {searchBy == 2 && (
              <Box display={'flex'} marginY={'3%'} marginX={'0%'}>
                <Typography style={TypographyStyle1}>Batch number</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Select
                  name="searchBy"
                  label="Batch number"
                  value={claimCategoryOptions[0].value}

                  // onChange={handleChange}
                  inputProps={{ 'aria-label': 'Without label' }}
                  style={TypographyStyle2}>
                  {claimCategoryOptions.map(ele => {
                    return (
                      <MenuItem key={ele.value} value={ele.value}>
                        {ele.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
            )}

            {searchBy == 3 && (
              <Box display={'flex'} marginY={'3%'} marginX={'0%'}>
                <Typography
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}>
                  Membership number
                </Typography>
                &nbsp;
                <span style={{ display: 'flex', alignItems: 'flex-end' }}>:</span>&nbsp;
                <TextField
                  id="membership-no"
                  name="membership-no"
                  value={''}
                  onChange={() => {}}
                  label="membership-no"
                  style={TypographyStyle2}
                />
              </Box>
            )}

            <Box marginY={'3%'} marginX={'0%'}>
              <Button
                className="p-button-secondary"
                color="secondary"
                onClick={() => {
                  setDates({ startDate: startDate, endDate: endDate });
                }}>
                GO
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      <ClaimAudit searchDate={dates} />
      {/* <AuditTable /> */}
    </div>
  );
}

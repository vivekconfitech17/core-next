import React, { useEffect, useRef } from 'react';

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useFormik } from 'formik';

// import DateFnsUtils from '@date-io/date-fns';
import * as yup from 'yup';
import moment from 'moment';
import { Button } from 'primereact/button';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const useStyles = makeStyles((theme:any) => ({
  secondaryColor: {
    color: theme?.palette?.secondary?.main,
  },
  flexGrid: {
    display: 'flex',
    alignContent: 'end',
    justifyContent: 'end',
  },
  selectEmpty:{},
  rowActionBtn:{},
  formControl:{}
}));

const validationSchema = yup.object({
  ruleName: yup.string().required('Rule name is required'),
});

function removeQuotes(value:any) {
  if (typeof value === 'string') {
    return value.replace(/'/g, '');
  }

  
return value;
}

function splitConditions(conditionString:any) {
  const conditions = conditionString.split(/\s*(\|\||&&)\s*/);

  const connectors = conditions
    .map((operator:any, index:number) => {
      if (index % 2 !== 0) {
        return operator;
      }

      
return null;
    })
    .filter(Boolean);

  const splitConditions = conditions
    .map((condition:any) => {
      // const parts = condition.match(/\s*([\w']+)\s*([><=!]+)\s*([\w'"]+)\s*/);
      // const parts = condition.match(/\s*([\w']+)\s*([><=!]+)\s*([^\s]+)/);
      const parts = condition.match(/\s*([\w']+)\s*([><=!]+)\s*([^\s)]+)/);

      if (parts) {
        return {
          selectedParameter: parts[1],
          selectedOperator: parts[2],
          ruleValue: parts[3],
        };
      }

      
return null;
    })
    .filter(Boolean);

  return { splitConditions: splitConditions, connectors: connectors };
}

type DialogProps = {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  forProductRule: any;
  parameters?: any; 
  onAdd: (param: any) => void; 
  paymentFrequencies?: any; 
  data: any; 
  editIndex: number;
  onExitClick: () => void;
};

const PremiumRuleDesignModal = ({
  openDialog,
  setOpenDialog,
  forProductRule,
  parameters = [],
  onAdd,
  paymentFrequencies = [],
  data,
  editIndex,
  onExitClick
}:DialogProps) => {
  const initRuleObject = {
    selectedParameter: '',
    selectedOperator: '',
    ruleValue: '',
    selectedConnector: '',
    parameterDetails: { paramterComparisonTypes: [] },
  };

  const frmRef = useRef(null);

  const [state, setState] = React.useState({
    rules: [{ ...initRuleObject }],
    premiumPaymentFrequencies: (data && data[editIndex]?.premiumPaymentFrequencies) || [
      { premiumAmount: 0, premiumPaymentFrequncyId: '' },
    ],
  });

  const classes = useStyles();

  const expression = data ? data[editIndex]?.expression : '';
  const conditions = expression && splitConditions(expression);

  // const onSubmit = formikValues => {
  //   const expression = ruleTextstring(formikValues);

  //     if (!expression) {
  //     return;
  //   }

  //   if (!state?.premiumPaymentFrequencies || state?.premiumPaymentFrequencies?.length == 0) {
  //     return;
  //   }

  //   const payload = {
  //     name: formik.values.ruleName,
  //     expression: expression,
  //     coverType: formik.values.coverType,
  //     validFrom: moment(formik.values.validFrom).unix(),
  //     validUpTo: moment(formik.values.validUpTo).unix(),
  //     premiumPaymentFrequencies: state.premiumPaymentFrequencies,
  //   };

  //   if (data && data[editIndex]?.id) {
  //     payload.id = data[editIndex]?.id;
  //   }

  //   onAdd(payload);
  // };

  function prepopulateForm(parsedConditions:any, connectors:any) {
    for (let i = 0; i < parsedConditions.length; i++) {
      const condition = parsedConditions[i];

      PopulateParameter(i)({
        target: {
          name: 'selectedParameter',
          value: parameters.find((item:any) => item.name == condition?.selectedParameter),
        },
      });
      PopulateParameter(i)({
        target: {
          name: 'selectedOperator',
          value: parameters
            .find((item:any) => item.name == condition?.selectedParameter)
            ?.paramterComparisonTypes.find((item:any) => item.symbol == condition?.selectedOperator),
        },
      });
      PopulateParameter(i)({
        target: {
          name: 'ruleValue',
          value: removeQuotes(condition?.ruleValue),
        },
      });

      if (i <= connectors.length) {
        PopulateParameter(i)({
          target: {
            name: 'selectedConnector',
            value: connectors[i],
          },
        });
      }
    }
  }

  useEffect(() => {
    if (conditions) {
      prepopulateForm(conditions.splitConditions, conditions.connectors);
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      ruleTextArea: '',
      ruleName: data ? data[editIndex]?.name : '',
      coverType: data ? data[editIndex]?.coverType : 'PER_MEMBER',
      validFrom: data && data[editIndex]?.validFrom ? moment.unix(data[editIndex]?.validFrom)?.toLocaleString() : new Date(),
      validUpTo: data && data[editIndex]?.validUpTo ? moment.unix(data[editIndex]?.validUpTo)?.toLocaleString() : null,
    },
    validationSchema: validationSchema,
    onSubmit:(values, formActions) => {
      const expression = ruleTextstring(values);

      if (!expression) {
        return;
      }
  
      if (!state?.premiumPaymentFrequencies || state?.premiumPaymentFrequencies?.length === 0) {
        return;
      }
  
      const payload:any = {
        name: values.ruleName,
        expression: expression,
        coverType: values.coverType,
        validFrom: moment(values.validFrom).unix(),
        validUpTo: moment(values.validUpTo).unix(),
        premiumPaymentFrequencies: state.premiumPaymentFrequencies,
      };

      if (data && data[editIndex]?.id) {
        payload.id = data[editIndex]?.id;
      }
  
      onAdd(payload);
  
      // Reset the form after submission
      formActions.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onExitClick();
    setOpenDialog(false);
  };

//   const getParameterTypeByID = id => {
//     if (!id) return;
    
// return parameters?.filter(( item:any )=> item.id === id)[0].name;
//   };

  const buildMenuForDropdownRange = (paramDetails:any) => {
    const menuList = [];

    for (let idx = paramDetails.start; idx <= paramDetails.end; idx += paramDetails.count) {
      menuList.push(<MenuItem value={idx}>{idx}</MenuItem>);
    }

    return menuList;
  };

  const handleChangeParameter = (idx:any) => (e:any) => {
    const { name, value, checked } = e.target;
    const rules = [...state.rules];

    rules[idx] = {
      ...rules[idx],
    };

    if (name === 'selectedConnector') {
      rules[idx].selectedConnector = value;
      handleAddMore(rules, idx);
      
return;
    } else if (name === 'selectedParameter') {
      const selectedParam = parameters.filter(( item:any )=> item.id === value);

      rules[idx].parameterDetails = selectedParam[0];
      rules[idx].selectedParameter = selectedParam[0].id;
    } else if (name === 'selectedOperator') {
      const selectedOperator:any = rules[idx].parameterDetails.paramterComparisonTypes.filter(( item:any )=> item.id === value);

      rules[idx].selectedOperator = selectedOperator[0].id;
    } else if (name === 'ruleValue') {
      rules[idx].ruleValue = value;
    }

    setState({
      ...state,
      rules,
    });
  };

  const PopulateParameter = (idx:any ) => (e:any ) => {
    const { name, value, checked } = e.target;

    setState(prevState => {
      const rules = [...prevState.rules];
      const updatedRule = { ...rules[idx] }; // Create a new object for the specific rule

      if (name === 'selectedConnector') {
        updatedRule.selectedConnector = value;

        // handleAddMore(rules, idx);
      } else if (name === 'selectedParameter') {
        updatedRule.parameterDetails = value;
        updatedRule.selectedParameter = value?.id;
      } else if (name === 'selectedOperator') {
        const selectedOperator:any  = rules[idx].parameterDetails?.paramterComparisonTypes?.find(( item:any )=> item.id === value?.id);

        updatedRule.selectedOperator = selectedOperator?.id;

        // updatedRule.selectedOperator = value?.id;
      } else if (name === 'ruleValue') {
        updatedRule.ruleValue = value;
      }

      rules[idx] = updatedRule;
      
return {
        ...prevState,
        rules,
      };
    });
  };

  const handleAddMore = (ruleList:any , idx:any ) => {
    if (idx === state.rules.length - 1) {
      const item = { ...initRuleObject };

      /** When Select Connector changes */
      if (ruleList) {
        item.selectedParameter = state.rules[state.rules.length - 1].selectedParameter;
        item.parameterDetails = state.rules[state.rules.length - 1].parameterDetails;

        setState({
          ...state,
          rules: [...ruleList, item],
        });
      } else {
        /** When Add button click */
        const rules:any  = [...state.rules];

        rules[idx] = {
          ...rules[idx],
          selectedConnector: '&&',
          addClicked: true,
        };

        setState({
          ...state,
          rules: [...rules, item],
        });
      }
    } else {
      setState({
        ...state,
        rules: [...ruleList],
      });
    }
  };

  const handleRemoveRow = (idx:any ) => (e:any ) => {
    state.rules.splice(idx, 1);
    setState({
      ...state,
      rules: state.rules,
    });
  };

  const handleAddPremiumAmt = () => {
    const premiumPaymentFrequencies = [
      ...state.premiumPaymentFrequencies,
      { premiumAmount: '', premiumPaymentFrequncyId: '' },
    ];

    setState({
      ...state,
      premiumPaymentFrequencies,
    });
  };

  const ruleTextstring = (formikValues:any ) => {
    /** Rule text population */
    let populateRuleText = '';

    state.rules.map((item:any , idx:number) => {
      const op = item.parameterDetails.paramterComparisonTypes.filter((o:any ) => o.id === item.selectedOperator);

      if (op.length > 0) {
        if (idx > 0 && idx < state.rules.length) {
          populateRuleText += ' ';
        }

        const findElem = state.rules.map(o => o.selectedParameter === item.selectedParameter);
        const firstIdx = findElem.indexOf(true);
        const lastIdx = findElem.lastIndexOf(true);

        if (firstIdx !== lastIdx && firstIdx === idx) {
          populateRuleText += '(';
        }

        populateRuleText += `${item.parameterDetails.name}${op[0].symbol}`;

        if (
          (item.parameterDetails.paramterUiRenderType.type === 'textbox' &&
            item.parameterDetails.paramterDataType.type === 'numeric') ||
          item.parameterDetails.paramterUiRenderType.type === 'dropdown_range'
        ) {
          populateRuleText += parseInt(item.ruleValue);
        } else {
          populateRuleText += `'${item.ruleValue}'`;
        }

        if (item.isPercentage) {
          populateRuleText += `${item.selectedPercentType}${item.percentDependsOn}`;
        }

        if (firstIdx !== lastIdx && lastIdx === idx) {
          populateRuleText += ')';

          if (item.selectedConnector && idx < state.rules.length - 1) {
            populateRuleText += ` ^`;
          }
        } else if (item.selectedConnector && idx < state.rules.length - 1) {
          populateRuleText += ` ${item.selectedConnector}`;
        }
      }
    });

    return populateRuleText;
  };

  const previewRule = () => {
    const populateRuleText = ruleTextstring(formik.values);

    if (populateRuleText) {
      formik.setFieldValue('ruleTextArea', populateRuleText);
    }
  };

  // const addBtnClick = () => {
  //   frmRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  // };

  const handlePremiumInfo = (idx:any , e:any ) => {
    const { name, value } = e.target;

    state.premiumPaymentFrequencies[idx][name] = value;
    setState({
      ...state,
      premiumPaymentFrequencies: state.premiumPaymentFrequencies,
    });
  };

  const handleRemovePremiumAmt = (idx:any ) => (e:any ) => {
    state.premiumPaymentFrequencies.splice(idx, 1);
    setState({
      ...state,
      premiumPaymentFrequencies: state.premiumPaymentFrequencies,
    });
  };

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={openDialog}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        Adding rules for - <span className={classes.secondaryColor}>{forProductRule?.name} </span>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit} noValidate ref={frmRef}>
          <Box padding={5}>
            <Grid container spacing={1}>
              {state.rules.map((item:any , idx:number) => (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="select-parameter-label">Select Parameter</InputLabel>
                      <Select
                        name="selectedParameter"
                        value={item.selectedParameter ?? ''}
                        onChange={handleChangeParameter(idx)}
                        displayEmpty
                        className={classes.selectEmpty}
                        inputProps={{ 'aria-label': 'Without label' }}>
                        {parameters &&
                          parameters.map((p:any ) => (
                            <MenuItem value={p.id} key={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="select-operator-label">Operator</InputLabel>
                      <Select
                        name="selectedOperator"
                        value={item.selectedOperator ?? ''}
                        onChange={handleChangeParameter(idx)}
                        displayEmpty
                        className={classes.selectEmpty}
                        inputProps={{ 'aria-label': 'Without label' }}>
                        {item.parameterDetails?.paramterComparisonTypes?.map(( p:any )=> (
                          <MenuItem key={p.id} value={p.id} disabled={p.disabled}>
                            {p.symbol}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {
                    <Grid xs={12} sm={6} md={3}>
                      {(() => {
                        switch (item.parameterDetails?.paramterUiRenderType?.type) {
                          case 'dropdown':
                            return (
                              <FormControl fullWidth>
                                <InputLabel id="select-value-label">Select Value</InputLabel>
                                <Select
                                  name="ruleValue"
                                  value={item.ruleValue ?? ''}
                                  onChange={handleChangeParameter(idx)}
                                  displayEmpty
                                  className={classes.selectEmpty}
                                  inputProps={{ 'aria-label': 'Without label' }}>
                                  {item.parameterDetails.parameterValues.map(( p:any )=> (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            );
                          case 'dropdown_range':
                            return (
                              <FormControl fullWidth>
                                <InputLabel id="select-value-label">Select Value</InputLabel>
                                <Select
                                  name="ruleValue"
                                  value={item.ruleValue ?? ''}
                                  onChange={handleChangeParameter(idx)}
                                  displayEmpty
                                  className={classes.selectEmpty}
                                  inputProps={{ 'aria-label': 'Without label' }}>
                                  {buildMenuForDropdownRange(item.parameterDetails)}
                                </Select>
                              </FormControl>
                            );
                          default:
                            return (
                              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <FormControl fullWidth>
                                  <TextField
                                    type={item.parameterDetails?.paramterDataType?.type === 'numeric' ? 'number' : 'text'}
                                    name="ruleValue"
                                    value={item.ruleValue ?? ''}
                                    label="Value"
                                    onChange={handleChangeParameter(idx)}
                                  />
                                </FormControl>
                              </div>
                            );
                        }
                      })()}
                    </Grid>
                  }

                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <InputLabel id="select-connector-label">Connector</InputLabel>
                      <Select
                        name="selectedConnector"
                        value={item.selectedConnector ?? ''}
                        onChange={handleChangeParameter(idx)}
                        displayEmpty
                        className={classes.selectEmpty}
                        inputProps={{ 'aria-label': 'Without label' }}
                        disabled={item?.addClicked}>
                        <MenuItem value="&&">AND</MenuItem>
                        <MenuItem value="||">OR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={1} className={classes.rowActionBtn}>
                    {idx === state.rules.length - 1 && (
                      <IconButton color="primary" aria-label="add" onClick={handleAddMore.bind(this, null, idx)}>
                        <AddCircleOutlineIcon style={{color:"#D80E51"}}/>
                      </IconButton>
                    )}
                    {state.rules.length > 1 && (
                      <IconButton color="secondary" aria-label="delete" onClick={handleRemoveRow(idx)}>
                        <RemoveCircleOutlineIcon style={{color:"rgb(255, 50, 67)"}} />
                      </IconButton>
                    )}
                  </Grid>
                </>
              ))}
            </Grid>
          </Box>

          {/* <form onSubmit={formik.handleSubmit} noValidate ref={frmRef}> */}
          <Box padding={5}>
            <Grid container spacing={1}>
              <Grid item xs={10}>
                <FormControl fullWidth>
                  <TextField name="ruleTextArea" value={formik.values.ruleTextArea} label="Rule" disabled />
                </FormControl>
              </Grid>
              <Grid item xs={2} className={classes.flexGrid}>
                <Button onClick={previewRule} color="primary" className="p-button-outlined">
                  Preview
                </Button>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    required
                    name="ruleName"
                    value={formik.values.ruleName}
                    label="Rule Name"
                    onChange={formik.handleChange}
                    error={formik.touched.ruleName && Boolean(formik.errors.ruleName)}

                    // helperText={formik.touched.ruleName && formik.errors.ruleName}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="select-connector-label">Cover type</InputLabel>
                  <Select
                    name="coverType"
                    value={formik.values.coverType}
                    onChange={formik.handleChange}

                    // className={classes.selectEmpty}
                    inputProps={{ 'aria-label': 'Without label' }}

                  // disabled={state.rules[idx]?.addClicked}
                  >
                    <MenuItem value="PER_MEMBER">Per Member</MenuItem>
                    <MenuItem value="PER_FAMILY">Per Family</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                   
                    <Grid item xs={4}>
                    <DatePicker
                      views={["year", "month", "day"]}
                      label="Valid from"
                      value={formik.values.validFrom}
                      onChange={(val:any) => {
                        formik.setFieldValue('validFrom', val);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          margin="normal"
                        />
                      )}
                    />
                </Grid>

                <Grid item xs={4}>
                <DatePicker
                      views={["year", "month", "day"]}
                      label="Valid upto"
                      value={formik.values.validUpTo}
                      onChange={val => {
                        formik.setFieldValue('validUpTo', val);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          margin="normal"
                        />
                      )}
                    />
                </Grid>
                  </LocalizationProvider>
              {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={4}>
                  <KeyboardDatePicker
                    fullWidth
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="MM/dd/yyyy"
                    id="valid-from"
                    autoOk={true}
                    label="Valid from"
                    name="validFrom"
                    value={formik.values.validFrom}
                    onChange={(val:any) => {
                      formik.setFieldValue('validFrom', val);
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <KeyboardDatePicker
                    fullWidth
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="MM/dd/yyyy"
                    id="valid-upto"
                    autoOk={true}
                    label="Valid upto"
                    name="validUpTo"
                    value={formik.values.validUpTo}
                    onChange={val => {
                      formik.setFieldValue('validUpTo', val);
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider> */}
            </Grid>
            <Grid item xs={12} style={{ paddingTop: '30px' }}>
              <h4>Payment Frequencies</h4>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: '5px', paddingBottom: '20px' }}>
              <Divider variant="fullWidth"></Divider>
            </Grid>

            {state.premiumPaymentFrequencies?.map((item:any , id:any ) => (
              <Grid item xs={12} key={id} container spacing={1}>
                <Grid item xs={5}>
                  <FormControl className={classes.formControl} fullWidth>
                    <TextField
                      name="premiumAmount"
                      type={'number'}
                      label="Premium Amount"
                      value={item.premiumAmount}
                      onChange={e => handlePremiumInfo(id, e)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel id="select-search-by-label">Payment Frequency</InputLabel>
                    <Select
                      name="premiumPaymentFrequncyId"
                      displayEmpty
                      className={classes.selectEmpty}
                      inputProps={{ 'aria-label': 'Without label' }}
                      value={item.premiumPaymentFrequncyId}
                      onChange={e => handlePremiumInfo(id, e)}>
                      {paymentFrequencies?.map((freq:any ) => (
                        <MenuItem key={freq.code} value={freq.id}>
                          {freq.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} >
                  {state.premiumPaymentFrequencies.length > 1 && (
                    <Box>
                      <IconButton color="primary" aria-label="add" onClick={handleRemovePremiumAmt(id)}>
                        <RemoveCircleIcon style={{color:"rgb(255, 50, 67)"}}/>
                      </IconButton>
                    </Box>
                  )}
                  {id === state.premiumPaymentFrequencies.length - 1 && (
                    <Box>
                      <IconButton color="primary" aria-label="add" onClick={handleAddPremiumAmt}>
                        <LibraryAddIcon style={{color:"#D80E51"}}/>
                      </IconButton>
                    </Box>
                  )}
                </Grid>
              </Grid>
            ))}
          </Box>
          {/* <DialogActions> */}
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button type="submit" color="primary">
            {/* <Button onClick={onSubmit} color="primary" variant="contained"> */}
              Add
            </Button>
            <Button onClick={handleClose} color="primary" autoFocus className="p-button-text">
              Exit
            </Button>
          </Box>
          {/* </DialogActions> */}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumRuleDesignModal;

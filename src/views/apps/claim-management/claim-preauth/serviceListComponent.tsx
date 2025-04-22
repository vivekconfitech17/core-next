import React, { useEffect } from 'react'

import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { Autocomplete } from '@mui/lab'
import { Button } from 'primereact/button'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import { BenefitService } from '@/services/remote-api/fettle-remote-api'

const benefitService = new BenefitService()

const ServiceDetails = ({
  x,
  i,
  handleProviderChangeInService,
  providerList,
  handleBenefitChangeInService,
  autocompleteFilterChange,
  benefitOptions,
  handleChangeDiagnosis,
  handleChangeCodeStandard,
  handleChangeIntervention,
  handleEstimateCostInService,
  handleRemoveServicedetails,
  handleAddServicedetails,
  serviceDetailsList,
  classes,
  interventions,
  serviceList
}: {
  x: any
  i: any
  handleProviderChangeInService: any
  providerList: any
  handleBenefitChangeInService: any
  autocompleteFilterChange: any
  benefitOptions: any
  handleChangeDiagnosis: any
  handleChangeCodeStandard: any
  handleChangeIntervention: any
  handleEstimateCostInService: any
  handleRemoveServicedetails: any
  handleAddServicedetails: any
  serviceDetailsList: any
  classes: any
  interventions: any
  serviceList: any
}) => {
  const [benefitId, setBenefitId] = React.useState()

  useEffect(() => {
    if (x.benefitId) {
      setBenefitId(x.benefitId)
    }
  }, [x.benefitId])

  return (
    <Grid container spacing={3} key={i}>
      {/* Provider Dropdown */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label" style={{ marginBottom: "0px" }}>
            Provider
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            label="Provider"
            id="demo-simple-select"
            name="providerId"
            fullWidth
            value={x.providerId}
            onChange={(e) => handleProviderChangeInService(e, i)}
          >
            {providerList.map((ele: any) => (
              <MenuItem key={ele.id} value={ele.id}>
                {ele.providerBasicDetails.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Benefit Autocomplete */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl className={classes.formControl} fullWidth>
          <Autocomplete
            value={
              x.benefitId
                ? benefitOptions.find((item: any) => item.benefitStructureId === x.benefitId) || null
                : null
            }
            onChange={(e, val) => {
              handleBenefitChangeInService(val, i);
              setBenefitId(val?.benefitStructureId || null);
            }}
            id="benefit-autocomplete"
            options={benefitOptions}
            getOptionLabel={(option) => option?.label || ""}
            isOptionEqualToValue={(option, value) => option?.benefitStructureId === value?.benefitStructureId}
            renderInput={(params) => <TextField {...params} label="Benefit Provider" />}
          />
        </FormControl>
      </Grid>

      {/* Intervention Autocomplete */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl className={classes.formControl} fullWidth>
          <Autocomplete
            value={
              x.interventionCode
                ? interventions.find((item: any) => item.value === x.interventionCode) || null
                : null
            }
            onChange={(e, val) => handleChangeIntervention(val, i)}
            id="intervention-autocomplete"
            options={interventions}
            getOptionLabel={(option) => option?.label || ""}
            isOptionEqualToValue={(option, value) => option?.value === value?.value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Intervention"
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: null, // Removes the clear icon
                }}
              />
            )}
          />
        </FormControl>
      </Grid>

      {/* Diagnosis Autocomplete */}
      <Grid item xs={12} sm={3}>
        <FormControl className={classes.formControl} fullWidth>
          <Autocomplete
            value={
              x.diagnosis
                ? serviceList.find((item: any) => item.value === x.diagnosis) || null
                : null
            }
            onChange={(e, val) => handleChangeDiagnosis(val, i)}
            id="diagnosis-autocomplete"
            options={serviceList}
            getOptionLabel={(option) => option?.label || ""}
            isOptionEqualToValue={(option, value) => option?.value === value?.value}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i === 0 ? "Primary Diagnosis" : "Diagnosis"}
                variant="standard"
              />
            )}
          />
        </FormControl>
      </Grid>

      {/* Estimated Cost */}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          id="standard-basic"
          type="number"
          name="estimatedCost"
          value={x?.estimatedCost}
          onChange={(e) => handleEstimateCostInService(e, i)}
          label="Estimated Cost"
        />
      </Grid>

      {/* Add/Remove Buttons */}
      <Grid item xs={12} sm={6} md={4} style={{ display: "flex", alignItems: "center" }}>
        {serviceDetailsList.length !== 1 && (
          <Button
            className={`mr10 p-button-danger ${classes.buttonSecondary}`}
            onClick={() => handleRemoveServicedetails(i)}
            color="secondary"
            style={{ marginLeft: "5px" }}
          >
            <DeleteIcon />
          </Button>
        )}
        {serviceDetailsList.length - 1 === i && (
          <Button
            color="primary"
            className={classes.buttonPrimary}
            style={{ marginLeft: "5px" }}
            onClick={handleAddServicedetails}
          >
            <AddIcon />
          </Button>
        )}
      </Grid>
    </Grid>
  )
}

export default ServiceDetails

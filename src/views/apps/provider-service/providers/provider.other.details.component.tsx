import * as React from 'react'

import { useEffect } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import { makeStyles } from '@mui/styles'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import DeleteIcon from '@mui/icons-material/Delete'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
// import 'date-fns';
import { useFormik } from 'formik'

import { Button } from '@mui/material'

import { ProvidersService } from '@/services/remote-api/api/provider-services/provider.services'
import { StateService } from '@/services/remote-api/api/master-services/state.service'
import { CountryService } from '@/services/remote-api/api/master-services/country.service'

// import { Button } from 'primereact/button';

const useStyles = makeStyles((theme: any) => ({
  input1: {
    width: '50%'
  },
  clientTypeRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row'
    }
  },
  formControl: {
    minWidth: 182
  }
}))

const providerservice = new ProvidersService()
const stateservice = new StateService()
const countryservice = new CountryService()

const cs$ = countryservice.getCountryList()

// function useQuery1() {
//     return new URLSearchParams(useLocation().search);
// }

export default function ProviderOtherDetailsComponent(props: any) {
  const classes = useStyles()
  const query2 = useSearchParams()
  const history = useRouter()
  const params = useParams()
  const id: any = params.id

  const formik = useFormik({
    initialValues: {
      licenseCode: '',
      licenseCountry: '',
      licenseState: '',
      serviceTaxNoOrGstNo: '',
      taxonomyCode: '',
      inaugurationDate: 0,
      inaugurationCountry: '',
      inaugurationState: '',
      websiteUrl: '',
      profilePictureDocBase64: '',
      profilePictureFileFormat: 'image/jpeg',
      enumerationDate: 0,
      npi: '',
      otherNpi: ''
    },

    // validationSchema: validationSchema,
    onSubmit: values => {
      handleSubmitStepThree()
    }
  })

  const [selectedImgLink, setSelectedImgLink] = React.useState(
    'data:image/jpeg;base64,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'
  )

  const [countries, setCountries] = React.useState([])
  const [ingStates, setIngStates]: any = React.useState([])
  const [licStates, setLicStates]: any = React.useState([])

  const [bankList, setBankList] = React.useState([
    {
      bankAccountHolderName: '',
      bankName: '',
      branchCode: '',
      branchName: '',
      accountNo: ''
    }
  ])

  const [selectedInagurationDate, setSelectedInagurationDate] = React.useState(new Date())
  const [selectedEnumerationdate, setSelectedEnumerationdate] = React.useState(new Date())
  const [providerId,setProviderId] = React.useState<any>(null)

  React.useEffect(() => {
    setProviderId(localStorage.getItem("providerId"))
  }, []);

  const handleInagurationDateChange = (date: any) => {
    setSelectedInagurationDate(date)
    const timestamp = new Date(date).getTime()

    formik.setFieldValue('inaugurationDate', timestamp)
  }

  const handleEnumerationDateChange = (date: any) => {
    setSelectedEnumerationdate(date)
    const timestamp = new Date(date).getTime()

    formik.setFieldValue('enumerationDate', timestamp)
  }

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(cs$, setCountries)

  // Bank List functions
  const handleInputChangeBank = (e: any, index: number) => {
    const { name, value } = e.target
    const list: any = [...bankList]

    list[index][name] = value
    setBankList(list)
  }

  const handleRemoveClickBank = (index: number) => {
    const list: any = [...bankList]

    list.splice(index, 1)
    setBankList(list)
  }

  const handleAddClickBank = () => {
    setBankList([
      ...bankList,
      {
        bankAccountHolderName: '',
        bankName: '',
        branchCode: '',
        branchName: '',
        accountNo: ''
      }
    ])
  }

  // Bank List functions

  //converrt to base64
  const handleImgChange = (e: any) => {
    let base64String = ''
    const file = e.target['files'][0]

    const reader: any = new FileReader()

    reader.onload = function () {
      base64String = reader.result.replace('data:', '').replace(/^.+,/, '')

      setSelectedImgLink(reader.result)
      formik.setFieldValue('profilePictureDocBase64', base64String)
    }

    reader.readAsDataURL(file)
  }

  //submit provider other details
  const handleSubmitStepThree = () => {
    const payloadThree: any = {
      providerOtherDetails: {
        licenseCode: formik.values.licenseCode,
        licenseCountry: formik.values.licenseCountry,
        licenseState: formik.values.licenseState,
        serviceTaxNoOrGstNo: formik.values.serviceTaxNoOrGstNo,
        taxonomyCode: formik.values.taxonomyCode,
        inaugurationDate: new Date(selectedInagurationDate).getTime(),
        inaugurationCountry: formik.values.inaugurationCountry,
        inaugurationState: formik.values.inaugurationState,
        websiteUrl: formik.values.websiteUrl,
        npi: formik.values.npi,
        otherNpi: formik.values.otherNpi,
        profilePictureDocBase64: formik.values.profilePictureDocBase64,
        profilePictureFileFormat: 'image/jpeg',
        enumerationDate: new Date(selectedEnumerationdate).getTime(),
        accountDetails: bankList
      }
    }

    if (query2.get('mode') === 'create') {
      providerservice.editProvider(payloadThree, providerId, '3').subscribe(res => {
        history.push(`/provider?mode=viewList`)

        // window.location.reload();
      })
    }

    if (query2.get('mode') === 'edit') {
      providerservice.editProvider(payloadThree, id, '3').subscribe(res => {
        history.push(`/provider?mode=viewList`)

        // window.location.reload();
      })
    }
  }

  const getLicStates = (countryid: any) => {
    //API call to get License states
    countryservice.getStatesList(countryid).subscribe((result: any) => {
      setLicStates(result)
    })

    // let sl$ = stateservice.getStateList(stateparams);
    // useObservable(sl$,setLicStates)
  }

  const getIngStates = (countryid: any) => {
    //API call to get  inaguration states
    // let stateparams = {
    //     page: 0,
    //     size: 100,
    //     summary: true,
    //     active: true,
    //     countryId: countryid.toString()
    // }

    countryservice.getStatesList(countryid).subscribe((result: any) => {
      setIngStates(result)
    })
  }

  const handleLicenseCountryChange = (event: any) => {
    if (formik.values.licenseCountry !== event.target.value) {
      formik.setFieldValue('licenseCountry', event.target.value)
      formik.setFieldValue('licenseState', '')
      getLicStates(event.target.value)
    }
  }

  const handleInaugurationCountryChange = (event: any) => {
    if (formik.values.inaugurationCountry !== event.target.value) {
      formik.setFieldValue('inaugurationCountry', event.target.value)
      formik.setFieldValue('inaugurationState', '')
      getIngStates(event.target.value)
    }
  }

  //edit/view time fillup
  React.useEffect(() => {
    if (id) {
      populateData(id)
    }
  }, [id])

  //populate Form data
  const populateData = (id: any) => {
    if (id) {
      providerservice.getProviderDetails(id).subscribe((val: any) => {
        const bnkList: any = []

        formik.setValues({
          licenseCode: val.providerOtherDetails.licenseCode,
          licenseCountry: val.providerOtherDetails.licenseCountry,
          licenseState: val.providerOtherDetails.licenseState,
          serviceTaxNoOrGstNo: val.providerOtherDetails.serviceTaxNoOrGstNo,
          taxonomyCode: val.providerOtherDetails.taxonomyCode,
          inaugurationDate: val.providerOtherDetails.inaugurationDate,
          inaugurationCountry: val.providerOtherDetails.inaugurationCountry,
          inaugurationState: val.providerOtherDetails.inaugurationState,
          websiteUrl: val.providerOtherDetails.websiteUrl,
          npi: val.providerOtherDetails.npi,
          otherNpi: val.providerOtherDetails.otherNpi,
          profilePictureDocBase64: val.providerOtherDetails.profilePictureDocBase64,
          profilePictureFileFormat: val.providerOtherDetails.profilePictureFileFormat,
          enumerationDate: val.providerOtherDetails.enumerationDate
        })

        val.providerOtherDetails.accountDetails.forEach((ele: any) => {
          bnkList.push({
            bankAccountHolderName: ele.bankAccountHolderName,
            bankName: ele.bankName,
            branchCode: ele.branchCode,
            branchName: ele.branchName,
            accountNo: ele.accountNo
          })
        })

        if (bnkList.length !== 0) {
          setBankList(bnkList)
        }

        getLicStates(val.providerOtherDetails.licenseCountry)
        getIngStates(val.providerOtherDetails.inaugurationCountry)
        setSelectedInagurationDate(new Date(val.providerOtherDetails.inaugurationDate))
        setSelectedEnumerationdate(new Date(val.providerOtherDetails.enumerationDate))

        const lnk = 'data:image/jpeg;base64,' + val.providerOtherDetails.profilePictureDocBase64

        setSelectedImgLink(lnk)
      })
    }
  }

  return (
    <Paper elevation={0}>
      <Box p={3} my={2}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3} style={{ marginBottom: '2px' }}>
            <Grid item xs={6}>
              <span style={{ color: '#4472C4' }}>Account Details</span>
            </Grid>
          </Grid>
          {bankList.map((x, i) => {
            return (
              <Grid key={`grid-${i}`} container spacing={3} style={{ marginBottom: '20px', marginTop: '5px' }}>
                <Grid item xs={2}>
                  <TextField
                    id='standard-basic'
                    name='bankAccountHolderName'
                    value={x.bankAccountHolderName}
                    onChange={e => handleInputChangeBank(e, i)}
                    label='Account Holder Name'
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    id='standard-basic'
                    name='bankName'
                    value={x.bankName}
                    onChange={e => handleInputChangeBank(e, i)}
                    label='Bank Name'
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    id='standard-basic'
                    name='branchCode'
                    type='text'
                    onKeyPress={event => {
                      if (!/[a-zA-Z0-9]/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    value={x.branchCode}
                    onChange={e => handleInputChangeBank(e, i)}
                    label='Branch Code'
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextField
                    id='standard-basic'
                    name='branchName'
                    value={x.branchName}
                    onChange={e => handleInputChangeBank(e, i)}
                    label='Branch Name'
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    id='standard-basic'
                    name='accountNo'
                    type='text'
                    onKeyPress={event => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    value={x.accountNo}
                    onChange={e => handleInputChangeBank(e, i)}
                    label='Account No'
                  />
                </Grid>
                <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                  {bankList.length !== 1 && (
                    <Button
                      className='mr10 p-button-danger'
                      onClick={() => handleRemoveClickBank(i)}
                      variant='contained'
                      style={{ marginRight: '5px', background: '#dc3545' }}
                    >
                      <DeleteIcon style={{ color: '#fff' }} />
                    </Button>
                  )}
                  {bankList.length - 1 === i && (
                    <Button variant='contained' color='primary' onClick={handleAddClickBank}>
                      <AddIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            )
          })}
          <Divider />
          <Grid container spacing={3} style={{ marginBottom: '10px', marginTop: '20px' }}>
            <Grid item xs={6} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#4472C4' }}>Other Details</span>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='licenseCode'
                type='text'
                onKeyPress={event => {
                  if (!/[a-zA-Z0-9]/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                value={formik.values.licenseCode}
                onChange={formik.handleChange}
                label='License Code'
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl className={classes.formControl}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  License Country
                </InputLabel>
                <Select
                  label='License Country'
                  labelId='demo-simple-select-label'
                  name='licenseCountry'
                  id='demo-simple-select'
                  value={formik.values.licenseCountry}
                  onChange={handleLicenseCountryChange}
                >
                  {countries?.map((ele: any) => {
                    return (
                      <MenuItem key={ele.id} value={ele.id}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                  {/* <MenuItem value="Individual">Individual</MenuItem>
                                    <MenuItem value="Organization">Organization</MenuItem> */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl className={classes.formControl}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  License Country
                </InputLabel>
                <Select
                  label='License Country'
                  labelId='demo-simple-select-label'
                  name='licenseState'
                  id='demo-simple-select'
                  value={formik.values.licenseState}
                  onChange={formik.handleChange}
                >
                  {licStates?.content?.map((ele: any) => {
                    return (
                      <MenuItem key={ele.code} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='serviceTaxNoOrGstNo'
                type='text'
                onKeyPress={event => {
                  if (!/[a-zA-Z0-9]/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                value={formik.values.serviceTaxNoOrGstNo}
                onChange={formik.handleChange}
                label='Service Tax No./Gst No'
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='taxonomyCode'
                type='text'
                onKeyPress={event => {
                  if (!/[a-zA-Z0-9]/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                value={formik.values.taxonomyCode}
                onChange={formik.handleChange}
                label='Taxonomy Code'
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    views={["year", "month", "date"]}
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    margin="normal"
                                    autoOk={true}
                                    id="date-picker-inline"
                                    label="Start Date of Contract"
                                    value={selectedInagurationDate}
                                    onChange={handleInagurationDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change ing date',
                                    }}
                                />
                            </MuiPickersUtilsProvider> */}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  views={['year', 'month', 'day']}
                  label='Start Date of Contract'
                  value={selectedInagurationDate}
                  onChange={handleInagurationDateChange}
                  renderInput={params => (
                    <TextField {...params} margin='normal' style={{ margin: 'normal' }} variant='outlined' />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={4}>
              <FormControl className={classes.formControl}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  Inauguration Country
                </InputLabel>
                <Select
                  label='Inauguration Country'
                  labelId='demo-simple-select-label'
                  name='inaugurationCountry'
                  id='demo-simple-select'
                  value={formik.values.inaugurationCountry}
                  onChange={handleInaugurationCountryChange}
                >
                  {countries?.map((ele: any) => {
                    return (
                      <MenuItem key={ele.id} value={ele.id}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                  {/* <MenuItem value="Individual">Individual</MenuItem>
                                    <MenuItem value="Organization">Organization</MenuItem> */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl className={classes.formControl}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  Inauguration County
                </InputLabel>
                <Select
                  label='Inauguration Country'
                  labelId='demo-simple-select-label'
                  name='inaugurationState'
                  id='demo-simple-select'
                  value={formik.values.inaugurationState}
                  onChange={formik.handleChange}
                >
                  {ingStates?.content?.map((ele: any) => {
                    return (
                      <MenuItem key={ele.code} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='websiteUrl'
                value={formik.values.websiteUrl}
                onChange={formik.handleChange}
                label='Website URL'
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='npi'
                value={formik.values.npi}
                onChange={formik.handleChange}
                label='NPI'
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='otherNpi'
                value={formik.values.otherNpi}
                onChange={formik.handleChange}
                label='Other NPI'
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    views={["year", "month", "date"]}
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    margin="normal"
                                    autoOk={true}
                                    id="date-picker-inline"
                                    label="End Date of Contract"
                                    value={selectedEnumerationdate}
                                    onChange={handleEnumerationDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change ing date',
                                    }}
                                />
                            </MuiPickersUtilsProvider> */}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  views={['year', 'month', 'day']}
                  label='End Date of Contract'
                  value={selectedEnumerationdate}
                  onChange={handleEnumerationDateChange}
                  renderInput={params => (
                    <TextField {...params} margin='normal' style={{ margin: 'normal' }} variant='outlined' />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <span>Upload Contract</span>
              <div
                style={{
                  border: '1px solid',
                  marginBottom: '8px',
                  alignItems: 'center',
                  height: '108px',
                  width: '108px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <img src={selectedImgLink} style={{ height: '100px', width: '100px' }} />
              </div>
              <input
                accept='image/*'
                className={classes.input1}
                id='contained-button-file'
                type='file'
                onChange={handleImgChange}
                style={{ display: 'none' }}
              />
              <label htmlFor='contained-button-file'>
                <Button color='primary' type='button'>
                  <AddAPhotoIcon />
                </Button>
              </label>
            </Grid>
          </Grid>
          {query2.get('mode') !== 'viewOnly' && (
            <Grid container spacing={3}>
              <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant='contained' color='primary' style={{ marginRight: '5px' }} type='submit'>
                  Save and Finish
                </Button>
                <Button variant='contained' className='p-button-text' onClick={props.handleClose}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          )}
        </form>
      </Box>
    </Paper>
  )
}

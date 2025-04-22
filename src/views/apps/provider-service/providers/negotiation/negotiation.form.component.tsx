import { useEffect } from 'react'

import * as React from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import type { AlertProps } from '@mui/material'
import { Grid, Paper, InputLabel, Select, MenuItem, Snackbar, TextField, Button } from '@mui/material'

import { useFormik } from 'formik'
import * as yup from 'yup'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import Autocomplete from '@mui/lab/Autocomplete'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import 'date-fns'

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'

import MuiAlert from '@mui/lab/Alert'

import { PlanService } from '@/services/remote-api/api/plan-services'
import {
  ClientTypeService,
  ProviderTypeService,
  GroupTypeService,
  CategoryService,
  ProviderNegotiationService
} from '@/services/remote-api/api/master-services'

import { ProvidersService } from '@/services/remote-api/api/provider-services'

import Asterisk from '@/views/apps/shared-component/components/red-asterisk'

const providerservice = new ProvidersService()
const providertypeservice = new ProviderTypeService()
const clienttypeervice = new ClientTypeService()
const grouptypeService = new GroupTypeService()
const planservice = new PlanService()
const categoryservice = new CategoryService()
const negotitationService = new ProviderNegotiationService()

const pt$ = providertypeservice.getProviderTypes()
const ct$ = clienttypeervice.getCleintTypes()
const ps$ = providerservice.getProviders()
const gt$ = grouptypeService.getGroupTypes()
const pls$ = planservice.getPlans()
const cs$ = categoryservice.getCategories()

const validationSchema = yup.object({
  // name: yup.string('Enter Provider Name').required('Name is required'),
  // type: yup.string('Choose Provider type').required('Provider Type is required'),
  // plan: yup.string('Select Plan').required('Plan is required'),
  // orgTypeCd: yup.string('Choose Parent type').required('Parent Type is required'),
  // contact: yup
  //   .string('Enter your Contact Number')
  //   .required('Contact Number is required')
  // ['min'](10, 'Must be exactly 10 digit')
  // ['max'](10, 'Must be exactly 10 digit'),
  // email: yup.string('Enter your email').email('Enter a valid email'),
  // abbreviation: yup.string('Enter abbreviation').required('Abbreviation is required'),
})

const useStyles = makeStyles((theme: any) => ({
  input: {
    width: '50%'
  },
  root: {
    flexGrow: 1,
    minHeight: 100
  },
  paper: {
    padding: theme?.spacing?theme?.spacing(2):'16px',
    textAlign: 'center',
    color: theme?.palette?.text?.secondary
  },
  formControl: {
    margin: theme?.spacing?theme?.spacing(1):'8px',
    minWidth: 276
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#4472C4'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500
  }
}))

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

const NegotiationFormComponent = () => {
  const query = useSearchParams()
  const history = useRouter()
  const classes = useStyles()
  const [radioValue, setRadioValue] = React.useState('')
  const [selectValue, setSelectValue] = React.useState('')
  const [providerTypes, setProviderTypes] = React.useState([])
  const [clientTypes, setClientTypes] = React.useState([])
  const [groupTypes, setGroupTypes] = React.useState([])
  const [providers, setProviders] = React.useState([])
  const [providerCategories, setProviderCategories] = React.useState([])
  const [validFromDate, setValidFromDate] = React.useState(new Date())
  const [validToDate, setValidToDate] = React.useState(new Date())
  const [planList, setPlanList] = React.useState([])
  const [planCategoryList, setPlanCategoryList] = React.useState([])
  const [selectedFile, setSelectedFile]: any = React.useState(null)
  const [alertMsg, setAlertMsg] = React.useState('')
  const [openSnack, setOpenSnack] = React.useState(false)

  const formik: any = useFormik({
    initialValues: {
      name: '',
      providerId: '',
      providerData: '',
      type: '',
      clientType: '',
      providerCategory: '',
      validFromDate: '',
      validToDate: '',
      groupTypeCd: '',
      plan: '',
      planId: '',
      planCategory: '',
      providerService: ''
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      // console.log('aaaa');
      handleSubmit(values)
    }
  })

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  const useObservable1 = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        const arr: any = []

        result.content.forEach((el: any) => {
          arr.push({
            id: el.id,
            name: el.providerBasicDetails.name
          })
        })
        setter(arr)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(pt$, setProviderTypes)
  useObservable(ct$, setClientTypes)
  useObservable1(ps$, setProviders)
  useObservable(gt$, setGroupTypes)
  useObservable(pls$, setPlanList)
  useObservable(cs$, setProviderCategories)

  const handleChange = (event: any) => {
    const { name, value } = event.target

    setSelectValue(value)
  }

  const handleSubmit = (values: any) => {
    if (!selectedFile) {
      console.error('No file selected')

      return
    }

    const payload: any = {
      providerType: values.type,
      providerId: values.providerId,
      providerCategory: values.providerCategory,
      validFrom: values.validFromDate,
      validTo: values.validToDate,
      industryType: values.clientType,
      corporate: values.groupTypeCd,
      plan: values.planId,
      category: values.planCategory
    }

    negotitationService.saveNegotiation(selectedFile, payload).subscribe(res => {
      setAlertMsg(`Negotiation Created Successfully!`)
      setOpenSnack(true)

      setTimeout(() => {
        history.push('/provider/negotiation?mode=viewList')
      }, 3000)

      // history.push('/provider/negotiation?mode=viewList');
    })
  }

  const handleXcellUpload = () => {}

  const handleValidFromDateChange = (date: any) => {
    setValidFromDate(date)
    const timestamp = new Date(date).getTime()

    formik.setFieldValue('validFromDate', timestamp)
  }

  const handleValidToDateChange = (date: any) => {
    setValidToDate(date)
    const timestamp = new Date(date).getTime()

    formik.setFieldValue('validToDate', timestamp)
  }

  const handlePChange = (e: any, value: { id: any }) => {
    formik.setFieldValue('providerData', value)
    formik.setFieldValue('providerId', value?.id)
  }

  const handlePlanSelect = (e: any) => {
    formik.setFieldValue('plan', e.target.value)
    formik.setFieldValue('planId', e.target.value.id)
    setPlanCategoryList(e.target.value.planCategorys)
  }

  const handleUpload = (e: any) => {
    const file = e.target['files'][0]

    if (!file) {
      console.log('no file')

      return
    }

    setSelectedFile(file)
  }

  const handleClose = (event: any) => {
    history.push(`/provider/negotiation?mode=viewList`)
  }

  const handleMsgErrorClose = () => {
    setOpenSnack(false)
    setAlertMsg('')
  }

  function Alert(props: React.JSX.IntrinsicAttributes & AlertProps) {
    return <MuiAlert elevation={6} variant='filled' {...props} />
  }

  return (
    <div>
      <Snackbar
        open={openSnack}
        autoHideDuration={2800}
        onClose={handleMsgErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleMsgErrorClose} severity='success'>
          {alertMsg}
        </Alert>
      </Snackbar>
      {query.get('mode') === 'create' ? (
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            height: '2em',
            color: '#000',
            fontSize: '18px'
          }}
        >
          <span
            style={{
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '5px'
            }}
          >
            Provider Management- Create Provider Negotiation
          </span>
        </Grid>
      ) : (
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            height: '2em',
            color: '#000',
            fontSize: '18px'
          }}
        >
          <span
            style={{
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '5px'
            }}
          >
            Provider Management- Edit Provider Negotiation
          </span>
        </Grid>
      )}
      <div className={classes.root}>
        <Paper elevation={0} style={{ padding: '20px' }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={4}>
                <FormControl
                  className={classes.formControl}
                  // required
                  error={formik.touched.type && Boolean(formik.errors.type)}

                  // helperText={formik.touched.type && formik.errors.type}
                >
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Provider Type <Asterisk />
                  </InputLabel>
                  <Select
                    label='Provider Type'
                    labelId='demo-simple-select-label'
                    name='type'
                    id='demo-simple-select'
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    {providerTypes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.code} value={ele.code}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
                {formik.touched.type && Boolean(formik.errors.type) && (
                  <FormHelperText>{formik.touched.type && formik.errors.type}</FormHelperText>
                )}
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  id='combo-box-demo'
                  options={providers}
                  getOptionLabel={(option: any) => option.name ?? ''}
                  value={formik.values.providerData}
                  style={{ width: '75%' }}
                  renderInput={(params: any) => <TextField {...params} label='Provider Name' />}
                  onChange={handlePChange}
                />
                {formik.touched.name && Boolean(formik.errors.name) && (
                  <FormHelperText>{formik.touched.name && formik.errors.name}</FormHelperText>
                )}
              </Grid>
              <Grid item xs={4}>
                <FormControl
                  className={classes.formControl}

                  // required
                  //   error={formik.touched.type && Boolean(formik.errors.type)}
                  //   helperText={formik.touched.type && formik.errors.type}
                >
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Provide Category <Asterisk />
                  </InputLabel>
                  <Select
                    label='Provide Category '
                    labelId='demo-simple-select-label'
                    name='providerCategory'
                    id='demo-simple-select'
                    value={formik.values.providerCategory}
                    onChange={formik.handleChange}
                  >
                    {providerCategories.map((ele: any) => {
                      return (
                        <MenuItem key={ele.code} value={ele.code}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    autoOk={true}
                    id="date-picker-inline"
                    label="Valid from"
                    value={validFromDate}
                    onChange={handleValidFromDateChange}
                    style={{ width: '75%' }}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider> */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    label='Valid from'
                    value={validFromDate}
                    onChange={handleValidFromDateChange}
                    renderInput={params => (
                      <TextField {...params} margin='normal' style={{ width: '75%' }} variant='outlined' />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={4}>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    autoOk={true}
                    id="date-picker-inline"
                    label="Valid to"
                    value={validToDate}
                    onChange={handleValidToDateChange}
                    style={{ width: '75%' }}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider> */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    label='Valid to'
                    value={validToDate}
                    onChange={handleValidToDateChange}
                    renderInput={params => (
                      <TextField {...params} margin='normal' style={{ width: '75%' }} variant='outlined' />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={4}>
                <FormControl
                  className={classes.formControl}

                  //   error={formik.touched.type && Boolean(formik.errors.type)}
                  //   helperText={formik.touched.type && formik.errors.type}
                >
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Client Type
                  </InputLabel>
                  <Select
                    label='Client Type'
                    labelId='demo-simple-select-label'
                    name='clientType'
                    id='demo-simple-select'
                    value={formik.values.clientType}
                    onChange={formik.handleChange}
                  >
                    {clientTypes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.code} value={ele.code}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              {formik.values.clientType === 'GROUP' && (
                <Grid item xs={4}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                      Group Type*
                    </InputLabel>
                    <Select
                      label='Group Type'
                      labelId='demo-simple-select-label'
                      name='groupTypeCd'
                      id='demo-simple-select'
                      value={formik.values.groupTypeCd}
                      onChange={formik.handleChange}
                    >
                      {groupTypes.map((ele: any) => {
                        return (
                          <MenuItem key={ele.code} value={ele.code}>
                            {ele.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={4}>
                <FormControl className={classes.formControl}>
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Plan
                  </InputLabel>
                  <Select
                    label='Plan'
                    labelId='demo-simple-select-label'
                    name='plan'
                    id='demo-simple-select'
                    value={formik.values.plan}
                    onChange={handlePlanSelect}
                    error={formik.touched.plan && Boolean(formik.errors.plan)}

                    // helperText={formik.touched.plan && formik.errors.plan}
                  >
                    {planList.map((ele: any) => {
                      return (
                        <MenuItem key={ele.code} value={ele}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
                {formik.touched.plan && Boolean(formik.errors.plan) && (
                  <FormHelperText>{formik.touched.plan && formik.errors.plan}</FormHelperText>
                )}
              </Grid>
              {formik.values.plan && (
                <Grid item xs={4}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                      Plan Category
                    </InputLabel>
                    <Select
                      label=' Plan Category'
                      labelId='demo-simple-select-label'
                      name='planCategory'
                      id='demo-simple-select'
                      value={formik.values.planCategory}
                      onChange={formik.handleChange}
                    >
                      {planCategoryList.map((ele: any) => {
                        return (
                          <MenuItem key={ele.id} value={ele.id}>
                            {ele.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={4}>
                <InputLabel htmlFor='standard-basic'>Document name</InputLabel>
                <TextField
                  id='standard-basic'
                  style={{ width: '300px' }}
                  name='selectedDocName'
                  value={selectedFile?.name}
                  disabled
                />
              </Grid>

              <Grid
                item
                xs={2}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
              >
                <input
                  className={classes.input}
                  id={'contained-button-file'}
                  name='document'
                  type='file'
                  accept='.xlsx, .xls'
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor={'contained-button-file'} style={{ width: '50%', marginBottom: 0 }}>
                  <Button
                    color='primary'
                    type='button'
                    // component="span"
                    style={!!selectedFile?.name ? { backgroundColor: '#C9DEFF' } : {}}
                  >
                    <AddAPhotoIcon />
                  </Button>
                  {!selectedFile?.name && <FormHelperText>Select .xlsx /.xls file only</FormHelperText>}
                </label>
              </Grid>
              <Grid item xs={4}>
                <Button className='p-button-secondary' type='button'>
                  <a href='' style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    Download Sample Excel
                  </a>
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  color='primary'
                  style={{ marginRight: '5px' }}
                  type='submit'

                  // onClick={handleSubmit}
                >
                  Save and Next
                </Button>
                <Button variant='contained' className='p-button-text' onClick={handleClose}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </div>
    </div>
  )
}

export default NegotiationFormComponent

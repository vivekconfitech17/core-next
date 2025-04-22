import React, { useEffect } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { Button } from 'primereact/button'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import { makeStyles } from '@mui/styles'
import TextField from '@mui/material/TextField'
import MuiAlert from '@mui/lab/Alert'
import { useFormik } from 'formik'
import * as yup from 'yup'

import type { AlertProps } from '@mui/material'
import { Paper } from '@mui/material'

import { ProspectService } from '@/services/remote-api/api/client-services'
import {
  ClientTypeService,
  GroupTypeService,
  PrefixTypeService,
  SuffixTypeService
} from '@/services/remote-api/api/master-services'
import Asterisk from '../../shared-component/components/red-asterisk'
import { EmailAvailability } from '@/services/utility'

const prospectService = new ProspectService()
const grouptypeService = new GroupTypeService()
const clienttypeervice = new ClientTypeService()
const prefixservice = new PrefixTypeService()
const suffixservice = new SuffixTypeService()

const gt$ = grouptypeService.getGroupTypes()
const ct$ = clienttypeervice.getCleintTypes()
const prefx$ = prefixservice.getPrefixTypes()
const sufx$ = suffixservice.getSuffixTypes()

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

const useStyles = makeStyles(theme => ({
  formBg: {
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px',
    '& .MuiFormLabel-asterisk.MuiInputLabel-asterisk': {
      color: 'red'
    }
  },
  formControl: {
    minWidth: '90%'
  }
}))

const regex = /^[\w&., \-]*$/
const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const validationSchema = yup.object({
  firstName: yup.string().required('First Name is required') /* 
        .matches(regex, "Special character not allowed") */,
  lastName: yup.string().required('Last Name is required') /* 
        .matches(regex, "Special character not allowed") */,
  middletName: yup.string() /* 
        .matches(regex, "Special character not allowed") */,
  mobileNo: yup
    .string()
    .matches(phoneRegExp, 'Contact number is not valid')
    .max(10, 'Contact no. must be 10 digit')
    .min(10, 'Contact no. must be 10 digit')
    .required('Contact No is required'),
  alternateMobileNo: yup
    .string()
    .matches(phoneRegExp, 'Alternate Contact no is not valid')
    .max(10, 'Alternate Contact no. must be 10 digit')
    .min(10, 'Alternate Contact no. must be 10 digit')
    .nullable(),
  emailId: yup
    .string()
    .email('Invalid email format')
    .matches(/^[\w.%+-]+@gmail\.(com|in)$/, 'Email must be @gmail.com or @gmail.in')
    .required('Email is required'),
  alternateEmailId: yup.string().email('Enter a valid Email ID').nullable()
})

export default function ProspectManagementForm(props: any) {
  const router = useRouter()
  const query = useSearchParams()
  const classes = useStyles()
  const [openEmailMsg, setOpenEmailMsg] = React.useState(false)
  const [clientTypes, setClientTypes] = React.useState([])
  const [groupTypes, setGroupTypes] = React.useState([])
  const [prefixes, setPrefixes] = React.useState([])
  const [suffixes, setSuffixes] = React.useState([])
  const [openRequired, setOpenRequired] = React.useState(false)

  const [state, setState] = React.useState({
    prospectManagementForm: {
      clientTypeName: props.clientTypeName,
      clientType: '',
      groupType: '',
      prefix: '',
      firstName: '',
      middletName: '',
      lastName: '',
      suffix: '',
      displayName: '',
      mobileNo: '',
      alternateMobileNo: '',
      emailId: '',
      alternateEmailId: '',
      addresses: '',
      code: ''
    }
  })

  const params = useParams()
  const id: any = params.id


  function Alert(props: React.JSX.IntrinsicAttributes & AlertProps) {
    return <MuiAlert elevation={6} variant='filled' {...props} />
  }

  const useObservable = (observable: any, setter: any, type = '') => {
    useEffect(() => {
      const subscription = observable.subscribe((result: { content: any[] }) => {
        if (type === 'clientType') {
          const clType = result.content.filter((ct: { name: any }) => ct.name == props.clientTypeName)

          if (clType.length > 0) {
            setState({
              prospectManagementForm: {
                ...state.prospectManagementForm,
                clientType: clType[0].code
              }
            })
          }
        }

        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(gt$, setGroupTypes)
  useObservable(ct$, setClientTypes, 'clientType')
  useObservable(prefx$, setPrefixes)
  useObservable(sufx$, setSuffixes)

  React.useEffect(() => {
    if (id) {
      setTimeout(() => {
        populateDetails(id)
      }, 1000)
    }
  }, [id])

  const populateDetails = (id: string) => {
    prospectService.getProspectDetails(id).subscribe((result: any) => {
      setState({ prospectManagementForm: { ...result, addresses: result.addresses[0].addressDetails.AddressLine1 } })
      formik.setValues({ ...result, addresses: result.addresses[0].addressDetails.AddressLine1 })
    })
  }

  const handleSubmit = async (event?: any) => {
    const isEmailConfirmed = await EmailAvailability(formik.values.emailId)

    if (isEmailConfirmed && !id) {
      setOpenEmailMsg(true)

      return // Stop execution if email is confirmed
    }

    if (state.prospectManagementForm.lastName == '' && state.prospectManagementForm.clientTypeName == 'Retail') {
      setOpenRequired(true)

      return
    }

    const prospectParam: any = {
      ...state.prospectManagementForm,
      addresses: [
        {
          addressDetails: {
            AddressLine1: state.prospectManagementForm.addresses
          },
          addressType: 'CURRENT_ADDRESS'
        }
      ]
    }

    if (state.prospectManagementForm.alternateEmailId == '') {
      prospectParam['alternateEmailId'] = null
    }

    if (state.prospectManagementForm.alternateMobileNo == '') {
      prospectParam['alternateMobileNo'] = null
    }

    if (id) {
      prospectParam['id'] = id
      prospectParam['code'] = ''

      prospectService.editProspect(prospectParam, id).subscribe(ele => {
        handleClose()
      })
    } else {
      prospectService.saveProspect(prospectParam).subscribe((res: any) => {
        if (query.get('navigate') && res.id) {
          router.push(`/${query.get('navigate')}?prospectId=${res.id}`)
        } else {
          handleClose()
        }
      })
    }
  }

  const handleChange = (event: any) => {
    const { name, value } = event.target

    let dname = {}

    if (state.prospectManagementForm.clientTypeName !== 'Group') {
      if (name === 'firstName') {
        dname = {
          displayName:
            value + ' ' + state.prospectManagementForm.middletName + ' ' + state.prospectManagementForm.lastName
        }
      } else if (name === 'middletName') {
        dname = {
          displayName:
            state.prospectManagementForm.firstName + ' ' + value + ' ' + state.prospectManagementForm.lastName
        }
      } else if (name === 'lastName') {
        dname = {
          displayName:
            state.prospectManagementForm.firstName + ' ' + state.prospectManagementForm.middletName + ' ' + value
        }
      }
    } else if (name === 'firstName') {
      dname = { displayName: value }
    }

    let clientTypeName = ''

    if (name === 'clientType') {
      const clType: any = clientTypes.filter((ct: any) => ct.code == value)

      if (clType.length > 0) {
        clientTypeName = clType[0].name
      }
    }

    setState({
      prospectManagementForm: {
        ...state.prospectManagementForm,
        [name]: value,
        ...(name === 'clientType' && { clientTypeName }),
        ...dname
      }
    })
  }

  const handleClose = () => {
    router.push('/client/prospects?mode=viewList')
    window.location.reload()
  }

  const handleEmailSnackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setOpenEmailMsg(false)
  }

  const formik = useFormik({
    initialValues: {
      ...state.prospectManagementForm
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      // alert(JSON.stringify(values, null, 2));
      handleSubmit()
    }
  })

  const handleSnackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setOpenRequired(false)
  }

  if (state.prospectManagementForm.clientTypeName === 'Group') {
    delete formik.errors.lastName
  }

  useEffect(() => {
    const dName = state.prospectManagementForm.displayName.replace(/\s+/g, ' ')

    setState({
      prospectManagementForm: {
        ...state.prospectManagementForm,
        displayName: dName
      }
    })
  }, [state.prospectManagementForm.displayName])

  return (
    <Paper elevation={0} style={{ padding: '16px' }}>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Snackbar open={openRequired} autoHideDuration={6000} onClose={handleSnackClose}>
          <Alert onClose={handleSnackClose} severity='error'>
            Please fill up Last name *
          </Alert>
        </Snackbar>
        <Snackbar open={openEmailMsg} autoHideDuration={6000} onClose={handleEmailSnackClose}>
          <Alert onClose={handleEmailSnackClose} severity='error'>
            Email Id Already Exist, Please use another.
          </Alert>
        </Snackbar>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                Client type <Asterisk />
              </InputLabel>
              <Select
                labelId='demo-simple-select-label'
                label='Client Type'
                id='demo-simple-select'
                name='clientType'
                value={state.prospectManagementForm.clientType ? state.prospectManagementForm.clientType : ''}
                onChange={handleChange}
              >
                {clientTypes.map((ele: any) => {
                  return (
                    <MenuItem key={ele.id} value={ele.code}>
                      {ele.name}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          {state.prospectManagementForm.clientTypeName === 'Group' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  Group type
                </InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  label='Group Type'
                  name='groupType'
                  value={state.prospectManagementForm.groupType}
                  onChange={handleChange}
                >
                  {groupTypes.map((ele: any) => {
                    return (
                      <MenuItem key={ele.id} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
        {state.prospectManagementForm.clientTypeName === 'Group' ? (
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='firstName'
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onKeyUp={handleChange}
                  label='Name'
                  required
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='displayName'
                  value={state.prospectManagementForm.displayName}
                  onChange={handleChange}
                  label='Display Name'
                />
              </FormControl>
            </Grid>
          </Grid>
        ) : (
          <>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl className={classes.formControl}>
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Prefix
                  </InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    label='Prefix'
                    name='prefix'
                    value={state.prospectManagementForm.prefix ?? ''}
                    onChange={handleChange}

                    // onSelect={handleChange}
                  >
                    {prefixes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.id} value={ele.code}>
                          {ele.abbreviation}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id='standard-basic'
                    name='firstName'
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                    }}
                    onKeyUp={handleChange}
                    label={
                      <span>
                        First Name <Asterisk />
                      </span>
                    }
                    // required
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id='standard-basic'
                    name='middletName'
                    value={formik.values.middletName ?? ''}
                    onChange={formik.handleChange}
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                    }}
                    onKeyUp={handleChange}
                    label='Middle Name'
                    // error={formik.touched.middletName && Boolean(formik.errors.middletName)}
                    // helperText={formik.touched.middletName && formik.errors.middletName}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id='standard-basic'
                    name='lastName'
                    value={formik.values.lastName ?? ''}
                    onChange={formik.handleChange}
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                    }}
                    onKeyUp={handleChange}
                    label={
                      <span>
                        Last Name <Asterisk />
                      </span>
                    }
                    // required
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl className={classes.formControl}>
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Suffix
                  </InputLabel>
                  <Select
                    labelId='demo-simple-select-label'
                    name='suffix'
                    label='Suffix'
                    value={state.prospectManagementForm.suffix ?? ''}
                    onChange={handleChange}

                    // onKeyUp={handleChange}
                  >
                    {suffixes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.id} value={ele.id}>
                          {ele.abbreviation}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id='standard-basic'
                    name='displayName'
                    value={state.prospectManagementForm.displayName}
                    onChange={handleChange}
                    label='Display Name'
                    error={formik.touched.displayName && Boolean(formik.errors.displayName)}
                    helperText={formik.touched.displayName && formik.errors.displayName}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </>
        )}

        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <TextField
                id='standard-basic'
                type='text'
                onKeyPress={event => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                name='mobileNo'
                value={formik.values.mobileNo}
                onChange={formik.handleChange}
                onKeyUp={handleChange}
                label={
                  <span>
                    Contact No <Asterisk />
                  </span>
                }
                // required
                error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                helperText={formik.touched.mobileNo && formik.errors.mobileNo}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <TextField
                id='standard-basic'
                name='emailId'
                value={formik.values.emailId}
                onChange={formik.handleChange}
                onKeyUp={handleChange}
                label={
                  <span>
                    Email id <Asterisk />
                  </span>
                }
                // required
                error={formik.touched.emailId && Boolean(formik.errors.emailId)}
                helperText={formik.touched.emailId && formik.errors.emailId}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <TextField
                id='standard-basic'
                name='addresses'
                multiline
                value={formik.values.addresses}
                onChange={formik.handleChange}
                onKeyUp={handleChange}
                label='Address'
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <TextField
                id='standard-basic'
                type='text'
                onKeyPress={event => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                name='alternateMobileNo'
                value={formik.values.alternateMobileNo ?? ''}
                onChange={formik.handleChange}
                onKeyUp={handleChange}
                /* value={state.prospectManagementForm.alternateMobileNo}
                            onChange={handleChange} */
                label='Alt. Contact No'
                error={formik.touched.alternateMobileNo && Boolean(formik.errors.alternateMobileNo)}
                helperText={formik.touched.alternateMobileNo && formik.errors.alternateMobileNo}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <TextField
                id='standard-basic'
                name='alternateEmailId'
                value={formik.values.alternateEmailId ?? ''}
                onChange={formik.handleChange}
                onKeyUp={handleChange}
                /* value={state.prospectManagementForm.alternateEmailId}
                            onChange={handleChange} */
                label='Alt. Email id'
                error={formik.touched.alternateEmailId && Boolean(formik.errors.alternateEmailId)}
                helperText={formik.touched.alternateEmailId && formik.errors.alternateEmailId}
              />
            </FormControl>
          </Grid>
          {query.get('mode') === 'edit' ? (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='code'
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onKeyUp={handleChange}
                  label='Code'
                  disabled
                />
              </FormControl>
            </Grid>
          ) : null}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color='secondary' style={{ marginRight: '5px' }} type='submit'>
              Save
            </Button>
            <Button color='primary' onClick={handleClose} className='p-button-text'>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

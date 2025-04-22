import * as React from 'react'
import { useEffect } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import { makeStyles } from '@mui/styles'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import MuiAlert from '@mui/lab/Alert'
import Autocomplete from '@mui/lab/Autocomplete'
import 'date-fns'
import { useFormik } from 'formik'

import * as yup from 'yup'

import { ProvidersService } from '@/services/remote-api/api/provider-services/provider.services'
import { ProviderTypeService } from '@/services/remote-api/api/master-services/provider.type.service'
import { OrganizationTypeService } from '@/services/remote-api/api/master-services/organization.type.service'
import { SpecializationService } from '@/services/remote-api/api/master-services/specialization.service'

import Asterisk from '../../shared-component/components/red-asterisk'
import { UsersService } from '@/services/remote-api/api/user-management-service/users.service'
import { EmailAvailability } from '@/services/utility'

const providerservice = new ProvidersService()
const providertypeservice = new ProviderTypeService()
const orgtypeservice = new OrganizationTypeService()
const specsservice = new SpecializationService()
const userService = new UsersService()

const pt$ = providertypeservice.getProviderTypes()
const ot$ = orgtypeservice.getOrganizationTypes()
const ss$ = specsservice.getSpecialization()

const panRegExp = /^[a-zA-Z0-9]+$/

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string().required('Provider Type is required'),
  orgTypeCd: yup.string().required('Parent Type is required'),
  contact: yup
    .string()
    .required('Contact Number is required')
  ['min'](10, 'Must be exactly 10 digit')
  ['max'](10, 'Must be exactly 10 digit'),
  email: yup.string().email('Enter a valid email'),
  abbreviation: yup.string().required('Abbreviation is required'),
  taxPinNumber: yup.string().required('TAX ID is required').matches(panRegExp, 'Tax ID/PAN is not valid')
})

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
  },
  formControl1: {
    margin: theme?.spacing ? theme.spacing(1) : '8px',
    minWidth: 120,
    maxWidth: 300
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: 2
  }
}))

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

// function useQuery1() {
//   return new URLSearchParams(useLocation().search);
// }

function Alert(props: any) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

export default function ProviderPersonalDetailsComponent(props: any) {
  const query2 = useSearchParams()
  const params = useParams()
  const id: any = params.id
  const classes = useStyles()

  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      partnerId: '',
      combinationPartnerId: '',
      taxPinNumber: '',
      code: '',
      contact: '',
      email: '',
      pOrgData: '',
      parentProviderId: '',
      orgTypeCd: '',
      abbreviation: '',
      specializations: []
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      setSubmit(true)

      if (!isAltContactError) {
        handleSubmit()
      }
    }
  })

  const [contactList, setContactList] = React.useState([{ altEmail: '', altContact: '' }])
  const [specsList, setSpecsList] = React.useState([])
  const [idErrorMsg, setIdErrorMsg] = React.useState(false)

  const [identificationList, setIdentificationList]: any = React.useState([
    {
      identificationType: '',
      identificationNo: '',
      docFormat: 'image/jpeg',
      document: ''
    }
  ])

  const [identificationTypes, setIdentificationTypes] = React.useState([])
  const [providerTypes, setProviderTypes] = React.useState([])
  const [orgTypes, setOrgTypes] = React.useState([])
  const [parentProviders, setParentProviders] = React.useState([])
  const [open, setOpen] = React.useState(false)
  const [openEmailMsg, setOpenEmailMsg] = React.useState(false)
  const [isAltContactError, setAltContactError] = React.useState(false)
  const [isSubmit, setSubmit] = React.useState(false)

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useEffect(() => {
    setParentProviders(props.parentProviders)

    if (id) {
      populateData(id)
    }
  }, [props.parentProviders])

  useObservable(pt$, setProviderTypes)
  useObservable(ot$, setOrgTypes)
  useObservable(ss$, setSpecsList)

  useEffect(() => {
    setIdentificationTypes(props.identificationTypes)
  }, [props.identificationTypes])

  const handleSubmit = async () => {
    const isCreateMode = query2.get('mode') === 'create';
    const isEmailConfirmed = await EmailAvailability(formik.values.email);

    if (isEmailConfirmed && isCreateMode) {
      setOpenEmailMsg(true);
      return; // Stop execution if email is confirmed
    }

    // Validate Parent Provider ID for specific orgTypeCd
    if (formik.values.orgTypeCd === 'OT117246' && !formik.values.parentProviderId) {
      setOpen(true);
      return;
    }

    // Validate Identification List
    const isInvalidIdentification = identificationList.some(
      (id: any) => (!id.identificationType && id.identificationNo) || (id.identificationType && !id.identificationNo)
    );
    if (isInvalidIdentification) {
      setIdErrorMsg(true);
      return;
    }

    // Construct Contact and Email Lists
    const contacts = [
      { contactNo: formik.values.contact, contactType: 'PRIMARY' },
      ...contactList.map((cnt) => ({ contactNo: cnt.altContact, contactType: 'ALTERNATE' }))
    ];

    const emailsLists = [
      { emailId: formik.values.email, contactType: 'PRIMARY' },
      ...contactList.map((cnt) => ({ emailId: cnt.altEmail, contactType: 'ALTERNATE' }))
    ];

    // Construct Payload
    const providerBasicDetails = {
      name: formik.values.name,
      type: formik.values.type,
      partnerId: formik.values.partnerId,
      combinationPartnerId: formik.values.combinationPartnerId,
      taxPinNumber: formik.values.taxPinNumber,
      contactNos: contacts,
      emails: emailsLists,
      orgTypeCd: formik.values.orgTypeCd,
      abbreviation: formik.values.abbreviation,
      ...(identificationList.length && { identifications: identificationList }),
      ...(formik.values.specializations.length && { specializations: formik.values.specializations }),
      ...(formik.values.orgTypeCd === 'OT117246' && { parentProviderId: formik.values.parentProviderId })
    };

    const payloadOne: any = { providerBasicDetails };

    if (isCreateMode) {
      providerservice.saveProvider(payloadOne).subscribe((res: any) => {
        console.log("asdfgg", res)
        localStorage.setItem("providerId", res.id);
        props.handleNext();
      });
    } else {
      providerservice.editProvider({ ...payloadOne, code: formik.values.code }, id, '1').subscribe(() => {
        props.handleNext();
      });
    }
  };

  const handleSelectedSpecs = (event: any) => {
    formik.setFieldValue('specializations', event.target.value)
  }

  // function getStyles(name, personName, theme) {
  //   return {
  //     fontWeight:
  //       personName.indexOf(name) === -1
  //         ? theme.typography.fontWeightRegular
  //         : theme.typography.fontWeightMedium,
  //   };
  // }

  //Contact list functions
  const handleInputChangeContact = (e: any, index: number) => {
    const { name, value } = e.target
    const list: any = [...contactList]

    list[index][name] = value
    setContactList(list)

    setAltContactError(altContactValidation(value, name))
  }

  const handleAddClickContact = () => {
    setContactList([...contactList, { altEmail: '', altContact: '' }])
  }

  const handleRemoveClickContact = (index: any) => {
    const list = [...contactList]

    list.splice(index, 1)
    setContactList(list)
  }

  //Indentification Type
  const handleInputChangeIndentification = (e: any, index: number) => {
    const { name, value } = e.target
    const list: any = [...identificationList]

    list[index][name] = value
    setIdentificationList(list)
  }

  const handleRemoveClickIndentification = (index: any) => {
    const list = [...identificationList]

    list.splice(index, 1)
    setIdentificationList(list)
  }

  const handleAddClickIndentification = () => {
    setIdentificationList([...identificationList, { identificationType: '', identificationNo: '' }])
  }

  //close and move back to list page
  const handleClose = (e: any) => {
    props.handleClose(e)
  }

  React.useEffect(() => {
    if (id) {
      populateData(id)
    }
  }, [id])

  const populateData = (id: any) => {
    if (id) {
      providerservice.getProviderDetails(id).subscribe((val: any) => {
        let pcontact = ''
        let pemail = ''
        const altList: any = []
        const idlist: any = []
        let pOrg: any = {
          name: '',
          id: ''
        }

        val.providerBasicDetails.contactNos.forEach((ele: any, i: number) => {
          if (ele.contactType === 'PRIMARY') {
            pcontact = ele.contactNo
          }

          if (ele.contactType === 'ALTERNATE') {
            altList.push({
              altEmail: val.providerBasicDetails.emails[i].emailId,
              altContact: ele.contactNo
            })
          }
        })

        val.providerBasicDetails.emails.forEach((ele: any) => {
          if (ele.contactType === 'PRIMARY') {
            pemail = ele.emailId
          }
        })

        if (altList.length !== 0) {
          setContactList(altList)
        }

        val.providerBasicDetails.identifications.forEach((ele: any) => {
          idlist.push({
            identificationType: ele.identificationType,
            identificationNo: ele.identificationNo,
            docFormat: ele.docFormat,
            document: ele.document
          })
        })

        if (idlist.length !== 0) {
          setIdentificationList(idlist)
        }

        props.parentProviders.forEach((ele: any) => {
          if (ele.id === val.providerBasicDetails.parentProviderId) {
            pOrg = ele
          }
        })

        formik.setValues({
          name: val.providerBasicDetails.name,
          type: val.providerBasicDetails.type,
          partnerId: val.providerBasicDetails.partnerId,
          combinationPartnerId: val.providerBasicDetails.combinationPartnerId,
          taxPinNumber: val.providerBasicDetails.taxPinNumber,
          code: val.providerBasicDetails.code,
          contact: pcontact,
          email: pemail,
          pOrgData: pOrg,
          parentProviderId: val.providerBasicDetails.parentProviderId,
          orgTypeCd: val.providerBasicDetails.orgTypeCd,
          abbreviation: val.providerBasicDetails.abbreviation,
          specializations: val.providerBasicDetails.specializations ? val.providerBasicDetails.specializations : []
        })
      })
    }
  }

  const handlePChange = (e: any, value: any) => {
    formik.setFieldValue('pOrgData', value)
    formik.setFieldValue('parentProviderId', value.id)
  }

  const handleSnackClose = (event: any, reason: any) => {
    setOpen(false)
  }

  const handleEmailSnackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setOpenEmailMsg(false)
  }

  const handleIDErrorClose = (event: any, reason: any) => {
    setIdErrorMsg(false)
  }

  const handleImgChange1 = (e: any, i: any) => { }

  const altContactValidation = (value: any, field = '') => {
    if (field === 'altContact') {
      return value && value.length !== 10
    } else if (field === 'altEmail') {
      return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    }
  }

  const getAltContactErrorStatus = (value: any, field = '') => {
    return isSubmit && altContactValidation(value, field)
  }

  const getAltContactHelperTxt = (value: any, field = '') => {
    if (field === 'altContact') {
      return isSubmit && altContactValidation(value, field) ? 'Must be exactly 10 digit' : ''
    } else if (field === 'altEmail') {
      return isSubmit && altContactValidation(value, field) ? 'Enter a valid email' : ''
    }

    return ''
  }

  return (
    <Paper elevation={0}>
      <Box p={3} my={2}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleSnackClose}>
          <Alert onClose={handleSnackClose} severity='error'>
            Please fill up all required fields marked with *
          </Alert>
        </Snackbar>
        <Snackbar open={openEmailMsg} autoHideDuration={6000} onClose={handleEmailSnackClose}>
          <Alert onClose={handleEmailSnackClose} severity='error'>
            Email Id Already Exist, Please use another.
          </Alert>
        </Snackbar>
        <Snackbar open={idErrorMsg} autoHideDuration={6000} onClose={handleIDErrorClose}>
          <Alert onClose={handleIDErrorClose} severity='error'>
            Please provide both Identification Type and Identification Number.
          </Alert>
        </Snackbar>
        <form onSubmit={formik.handleSubmit} noValidate>
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
              {query2.get('mode') === 'edit' ? (
                <FormControl
                  className={classes.formControl}
                  // required
                  error={formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd)}

                // helperText={formik.touched.orgTypeCd && formik.errors.orgTypeCd}
                >
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Parent Provider <Asterisk />
                  </InputLabel>
                  <Select
                    label=' Parent Provider'
                    labelId='demo-simple-select-label'
                    name='orgTypeCd'
                    id='demo-simple-select'
                    readOnly={true}
                    value={formik.values.orgTypeCd}
                    onChange={formik.handleChange}
                  >
                    {orgTypes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.code} value={ele.code}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                  {formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd) && (
                    <FormHelperText>{formik.touched.orgTypeCd && formik.errors.orgTypeCd}</FormHelperText>
                  )}
                </FormControl>
              ) : (
                <FormControl
                  className={classes.formControl}
                  // required
                  error={formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd)}

                // helperText={formik.touched.orgTypeCd && formik.errors.orgTypeCd}
                >
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Parent Provider <Asterisk />
                  </InputLabel>
                  <Select
                    label='Parent Provider'
                    labelId='demo-simple-select-label'
                    name='orgTypeCd'
                    id='demo-simple-select'
                    value={formik.values.orgTypeCd}
                    onChange={formik.handleChange}
                  >
                    {orgTypes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.code} value={ele.code}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                  {formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd) && (
                    <FormHelperText>{formik.touched.orgTypeCd && formik.errors.orgTypeCd}</FormHelperText>
                  )}
                </FormControl>
              )}
            </Grid>
            {formik.values.orgTypeCd === 'OT117246' ? (
              <Grid item xs={4}>
                <Autocomplete
                  id='combo-box-demo'
                  options={parentProviders}
                  getOptionLabel={(option: any) => option.name}
                  value={formik.values.pOrgData}
                  style={{ width: '50%' }}
                  renderInput={params => <TextField {...params} label='' />}
                  onChange={handlePChange}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                size='small'
                id='standard-basic'
                name='name'
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                label={
                  <span>
                    Name <Asterisk />
                  </span>
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                size='small'
                id='standard-basic'
                name='abbreviation'
                value={formik.values.abbreviation}
                onChange={formik.handleChange}
                error={formik.touched.abbreviation && Boolean(formik.errors.abbreviation)}
                helperText={formik.touched.abbreviation && formik.errors.abbreviation}
                label={
                  <span>
                    Abbreviation <Asterisk />
                  </span>
                }
              />
            </Grid>
            <Grid item xs={4}>
              {query2.get('mode') === 'edit' ? (
                <TextField
                  id='standard-basic'
                  name='code'
                  value={formik.values.code}
                  label='Provider Code'

                // readonly={true}
                />
              ) : null}
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='partnerId'
                value={formik.values.partnerId}
                onChange={formik.handleChange}
                label='Partner ID'
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                style={{ minWidth: 220 }}
                name='combinationPartnerId'
                value={formik.values.combinationPartnerId}
                onChange={formik.handleChange}
                label='Combination Partner ID'
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='taxPinNumber'
                value={formik.values.taxPinNumber}
                onChange={formik.handleChange}
                error={formik.touched.taxPinNumber && Boolean(formik.errors.taxPinNumber)}
                helperText={formik.touched.taxPinNumber && formik.errors.taxPinNumber}
                label={
                  <span>
                    Tax ID/PAN <Asterisk />
                  </span>
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                onKeyPress={event => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                name='contact'
                value={formik.values.contact}
                onChange={formik.handleChange}
                error={formik.touched.contact && Boolean(formik.errors.contact)}
                helperText={formik.touched.contact && formik.errors.contact}
                label={
                  <span>
                    Contact No <Asterisk />
                  </span>
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='standard-basic'
                name='email'
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                label='Email id'
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{ width: '70%' }} className={classes.formControl} error={formik.touched.specializations && Boolean(formik.errors.specializations)}>
                <Autocomplete
                  id="specializations-autocomplete"
                  options={specsList}
                  getOptionLabel={(option: any) => option?.name || ""}
                  value={formik.values.specializations}
                  onChange={(event, value) => formik.setFieldValue("specializations", value)}
                  multiple
                  isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Specializations"
                      placeholder="Select Specializations"
                      error={formik.touched.specializations && Boolean(formik.errors.specializations)}
                      helperText={formik.touched.specializations && formik.errors.specializations}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
          {contactList.map((x, i) => {
            return (
              <Grid key={`providerPersonalGridContactList-${i}`} container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={4}>
                  <TextField
                    id='standard-basic'
                    onKeyPress={event => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    name='altContact'
                    value={x.altContact}
                    onChange={e => handleInputChangeContact(e, i)}
                    label='Alt. Contact No'
                    error={getAltContactErrorStatus(x.altContact, 'altContact')}
                    helperText={getAltContactHelperTxt(x.altContact, 'altContact')}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id='standard-basic'
                    name='altEmail'
                    value={x.altEmail}
                    onChange={e => handleInputChangeContact(e, i)}
                    label='Alt. Email id'
                    error={getAltContactErrorStatus(x.altEmail, 'altEmail')}
                    helperText={getAltContactHelperTxt(x.altEmail, 'altEmail')}
                  />
                </Grid>
                <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                  {contactList.length !== 1 && (
                    <Button
                      className='mr10 p-button-danger'
                      onClick={() => handleRemoveClickContact(i)}
                      color='secondary'
                      style={{ marginRight: '5px' }}
                    >
                      <DeleteIcon />
                    </Button>
                  )}
                  {contactList.length - 1 === i && (
                    <Button color='primary' onClick={handleAddClickContact}>
                      <AddIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            )
          })}

          {identificationList.map((x: any, i: number) => {
            return (
              <Grid key={`providerPersonalGridIdentificationList-${i}`} container spacing={3}>
                <Grid item xs={4}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                      Identification Type
                    </InputLabel>
                    <Select
                      label='Identification Type'
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      name='identificationType'
                      value={x.identificationType}
                      onChange={e => handleInputChangeIndentification(e, i)}
                    >
                      {identificationTypes.map((ele: any) => {
                        return (
                          <MenuItem key={ele.code} value={ele.code}>
                            {ele.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id='standard-basic'
                    name='identificationNo'
                    value={x.identificationNo}
                    onChange={e => handleInputChangeIndentification(e, i)}
                    label='Identification No'
                  />
                </Grid>
                <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    accept='image/*'
                    className={classes.input1}
                    id={'contained-button-file' + i.toString()}
                    name='document'
                    type='file'
                    onChange={e => handleImgChange1(e, i)}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor={'contained-button-file' + i.toString()} style={{ width: '50%', marginBottom: 0 }}>
                    <Button color='primary'>
                      <PublishIcon />
                    </Button>
                  </label>

                  {/* </label> */}
                </Grid>

                <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                  {identificationList.length !== 1 && (
                    <Button
                      className='mr10 p-button-danger'
                      onClick={() => handleRemoveClickIndentification(i)}
                      color='secondary'
                      style={{ marginLeft: '5px' }}
                    >
                      <DeleteIcon />
                    </Button>
                  )}
                  {identificationList.length - 1 === i && (
                    <Button color='primary' style={{ marginLeft: '5px' }} onClick={handleAddClickIndentification}>
                      <AddIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            )
          })}
          {query2.get('mode') !== 'viewOnly' && (
            <Grid container spacing={3}>
              <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button color='primary' style={{ marginRight: '5px' }} type='submit'>
                  Save and Next
                </Button>
                <Button className='p-button-text' onClick={handleClose}>
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

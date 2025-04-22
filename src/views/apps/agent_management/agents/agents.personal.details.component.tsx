'use client'
import * as React from 'react'
import { useEffect } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import type { AlertProps } from '@mui/lab/Alert'
import MuiAlert from '@mui/lab/Alert'
import Autocomplete from '@mui/lab/Autocomplete'
import 'date-fns'
import { useFormik } from 'formik'

// import { useLocation, useParams } from 'react-router-dom';
import * as yup from 'yup'

// import { AgentsService } from '../../remote-api/api/agents-services';
// import { AgentNatureService, AgentTypeService, OrganizationTypeService } from '../../remote-api/api/master-services';
// import Asterisk from '../../shared-components/components/red-asterisk';
import type { Observable } from 'rxjs'

import { AgentsService } from '@/services/remote-api/api/agents-services'
import {
  AgentNatureService,
  AgentTypeService,
  OrganizationTypeService
} from '@/services/remote-api/api/master-services'
import Asterisk from '../../shared-component/components/red-asterisk'

import { EmailAvailability } from '@/services/utility'

const agentservice = new AgentsService()
const agenttypeservice = new AgentTypeService()
const orgtypeservice = new OrganizationTypeService()
const agentnatureservice = new AgentNatureService()

const at$ = agenttypeservice.getAgentTypes()
const ot$ = orgtypeservice.getOrganizationTypes()
const an$ = agentnatureservice.getAgentNature()
const panRegExp = /^[a-zA-Z0-9]+$/

const validatePanNumber = (panNumber: string) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

  return panRegex.test(panNumber)
}

const validationSchema = yup.object({
  name: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, 'Only alphabets are allowed for this field')
    .required('Name is required'),
  type: yup.string().required('Agent Type is required'),
  contact: yup
    .string()
    .required('Contact Number is required')
    .min(10, 'Must be exactly 10 digits')
    .max(10, 'Must be exactly 10 digits'),
  email: yup
    .string()
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|in)$/i, 'Email must be a .com or .in domain')
    .email('Enter a valid email')
    .required('Email is required'),
  natureOfAgent: yup.string().required('Agent Nature is required'),
  taxPinNumber: yup
    .string()
    .required('Tax ID/PAN is required')
    .min(10, 'Must be exactly 10 characters')
    .max(10, 'Must be exactly 10 characters')
    .test('is-valid-pan', 'Invalid PAN Number', value => validatePanNumber(value))
})

const useStyles = makeStyles((theme: any) => ({
  input: {
    width: '90%'
  },
  clientTypeRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row'
    }
  },
  formControl: {
    minWidth: '90%'
  }
}))

// function useQuery1() {
//   return new URLSearchParams(useLocation().search);
// }

function Alert(props: React.JSX.IntrinsicAttributes & AlertProps) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

export default function AgentPersonalDetailsComponent(props: any) {
  // const query2 = useQuery1();
  // const { id } = useParams();
  const query2 = useSearchParams()
  const params = useParams()
  const id: any = params.id
  const classes = useStyles()

  const formik: any = useFormik({
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
      parentAgentId: '',
      natureOfAgent: '',
      orgTypeCd: ''
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      const allow = identificationList.every(item => {
        if (item.identificationType.length > 0 && item.identificationNo.length > 0) {
          return true
        } else {
          return false
        }
      })

      console.log(allow)
      setSubmit(true)

      // if (!isAltContactError) {
      handleSubmit()

      // }
    }
  })

  const [contactList, setContactList] = React.useState([{ altEmail: '', altContact: '' }])

  const [identificationList, setIdentificationList] = React.useState([
    {
      identificationType: '',
      identificationNo: '',
      docFormat: 'image/jpeg',
      document: ''
    }
  ])

  const [docTypeIdentity, setDocTypeIdentity] = React.useState([])
  const [allowNext, setAllowNext] = React.useState(false)
  const [identificationTypes, setIdentificationTypes] = React.useState([])
  const [agentTypes, setAgentTypes] = React.useState([])
  const [orgTypes, setOrgTypes] = React.useState([])
  const [parentAgents, setParentAgents] = React.useState([])
  const [agentNatures, setagentNatures] = React.useState([])
  const [open, setOpen] = React.useState(false)
  const [openEmailMsg, setOpenEmailMsg] = React.useState(false)
  const [idErrorMsg, setIdErrorMsg] = React.useState(false)
  const [isAltContactError, setAltContactError] = React.useState(false)
  const [isSubmit, setSubmit] = React.useState(false)
  const [agentsList, setAgentsList] = React.useState([])

  useEffect(() => {
    const allow = identificationList.every(item => {
      if (item.identificationType.length > 0 && item.identificationNo.length > 0) {
        return true
      } else {
        return false
      }
    })

    if (allow) {
      setAllowNext(true)
    } else {
      setAllowNext(false)
    }
  }, [identificationList])

  const useObservable = (observable: Observable<any>, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe(result => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  console.log(props)
  const populateData = (id: string | null) => {
    if (id) {
      agentservice.getAgentDetails(id).subscribe((val: any) => {
        let pcontact = ''
        let pemail = ''
        const altList: any = []
        const idlist: any = []
        let pOrg = {
          name: '',
          id: ''
        }

        val.agentBasicDetails.contactNos.forEach(
          (ele: { contactType: string; contactNo: string }, i: string | number) => {
            if (ele.contactType === 'PRIMARY') {
              pcontact = ele.contactNo
            }

            if (ele.contactType === 'ALTERNATE') {
              altList.push({
                altEmail: val.agentBasicDetails.emails[i].emailId,
                altContact: ele.contactNo
              })
            }
          }
        )

        val.agentBasicDetails.emails.forEach((ele: { contactType: string; emailId: string }) => {
          if (ele.contactType === 'PRIMARY') {
            pemail = ele.emailId
          }
        })

        if (altList.length !== 0) {
          setContactList(altList)
        }

        val.agentBasicDetails.identifications.forEach(
          (ele: { identificationType: any; identificationNo: any; docFormat: any; document: any }) => {
            idlist.push({
              identificationType: ele.identificationType,
              identificationNo: ele.identificationNo,
              docFormat: ele.docFormat,
              document: ele.document
            })
          }
        )

        if (idlist.length !== 0) {
          setIdentificationList(idlist)
        }

        props.parentAgents.forEach((ele: any) => {
          if (ele.id === val.agentBasicDetails.parentAgentId) {
            pOrg = ele
          }
        })

        formik.setValues({
          name: val.agentBasicDetails.name,
          type: val.agentBasicDetails.type,
          partnerId: val.agentBasicDetails.partnerId,
          combinationPartnerId: val.agentBasicDetails.combinationPartnerId,
          taxPinNumber: val.agentBasicDetails.taxPinNumber,
          code: val.agentBasicDetails.code,
          contact: pcontact,
          email: pemail,
          pOrgData: pOrg,
          parentAgentId: val.agentBasicDetails.parentAgentId,
          natureOfAgent: val.agentBasicDetails.natureOfAgent,
          orgTypeCd: val.agentBasicDetails.orgTypeCd
        })
      })
    }
  }

  useEffect(() => {
    setParentAgents(props.parentAgents)

    if (id || localStorage.getItem('agentId')) {
      //   props.parentAgents.forEach((ele) => {
      //     if (ele.id === formik.values.parentAgentId) {
      //       formik.setFieldValue("pOrgData", ele);
      //     }
      //   });
      if (id) {
        localStorage.setItem('agentId', id)
      }

      const agentId = localStorage.getItem('agentId')

      populateData(agentId)
    }
  }, [props.parentAgents])

  useObservable(at$, setAgentTypes)
  useObservable(ot$, setOrgTypes)
  useObservable(an$, setagentNatures)

  useEffect(() => {
    setIdentificationTypes(props.identificationTypes)
  }, [props.identificationTypes])

  const handleSubmit = async () => {
    const agentId = localStorage.getItem('agentId')
    const isEmailConfirmed = await EmailAvailability(formik.values.email)

    if (isEmailConfirmed && !agentId) {
      setOpenEmailMsg(true)

      return // Stop execution if email is confirmed
    }

    const selectedNatureOfAgent: any = agentNatures.filter(
      (na: { code: any }) => na.code === formik.values.natureOfAgent
    )

    // formik.values.natureOfAgent === 'NOA185739'
    //section commented directed by Saugata da
    // if (
    //   selectedNatureOfAgent[0].name.toUpperCase() === 'ORGANIZATION' &&
    //   (formik.values.orgTypeCd === '' || formik.values.orgTypeCd === null)
    // ) {
    //   setOpen(true);
    //   return;
    // }
    // if (
    //   formik.values.orgTypeCd === 'OT117246' &&
    //   (formik.values.parentAgentId === '' || formik.values.parentAgentId === null)
    //   ) {
    //   setOpen(true);
    //   return;
    // }
    if (identificationList.length === 1) {
      if (identificationList[0].identificationType !== '' && identificationList[0].identificationNo === '') {
        setIdErrorMsg(true)

        return
      }

      if (identificationList[0].identificationType === '' && identificationList[0].identificationNo !== '') {
        setIdErrorMsg(true)

        return
      }
    }

    if (identificationList.length > 1) {
      identificationList.forEach(val => {
        if (val.identificationType === '' || val.identificationNo === '') {
          setIdErrorMsg(true)

          return
        }
      })
    }

    const contacts = []
    const emailsLists = []

    contacts.push({ contactNo: formik.values.contact, contactType: 'PRIMARY' })
    emailsLists.push({ emailId: formik.values.email, contactType: 'PRIMARY' })
    contactList.forEach(cnt => {
      contacts.push({ contactNo: cnt.altContact, contactType: 'ALTERNATE' })
      emailsLists.push({ emailId: cnt.altEmail, contactType: 'ALTERNATE' })
    })

    const payloadOne: any = {
      agentBasicDetails: {
        name: formik.values.name,
        type: formik.values.type,
        partnerId: formik.values.partnerId,
        combinationPartnerId: formik.values.combinationPartnerId,
        taxPinNumber: formik.values.taxPinNumber,
        contactNos: contacts,
        emails: emailsLists,
        natureOfAgent: formik.values.natureOfAgent
      }
    }

    if (
      identificationList.length === 1 &&
      identificationList[0].identificationType !== '' &&
      identificationList[0].identificationNo !== ''
    ) {
      payloadOne['agentBasicDetails']['identifications'] = identificationList
    }

    if (identificationList.length > 1) {
      payloadOne['agentBasicDetails']['identifications'] = identificationList
    }

    if (selectedNatureOfAgent[0].name.toUpperCase() === 'ORGANIZATION') {
      payloadOne['agentBasicDetails']['orgTypeCd'] = formik.values.orgTypeCd

      if (formik.values.orgTypeCd === 'OT117246') {
        payloadOne['agentBasicDetails']['parentAgentId'] = formik.values.parentAgentId
      }
    }

    /* if (query2.get('mode') === 'create') {
      agentservice.saveAgent(payloadOne).subscribe(res => {
        props.setAgentID(res.id);
        props.handleNext();
      });
    }
    if (query2.get('mode') === 'edit') {
      payloadOne['agentBasicDetails']['code'] = formik.values.code;
      agentservice.editAgent(payloadOne, id, '1').subscribe(res => {
        props.handleNext();
      });
    } */

    const invAgents: any = []

    agentsList.forEach((ag: { agentId: any; commissionType: any; commissionValue: any; finalValue: any }) => {
      invAgents.push({
        agentId: ag.agentId,
        commissionType: ag.commissionType,
        commissionValue: ag.commissionValue,
        finalValue: ag.finalValue
      })
    })

    payloadOne['invoiceAgents'] = invAgents

    // const agentId = localStorage.getItem('agentId');

    if (agentId) {
      payloadOne['agentBasicDetails']['code'] = formik.values.code
      agentservice.editAgent(payloadOne, agentId, '1').subscribe(res => {
        props.handleNext()
      })
    } else {
      agentservice.saveAgent(payloadOne).subscribe((res: any) => {
        props.setAgentID(res.id)
        localStorage.setItem('agentId', res.id)
        props.handleNext()
      })
    }
  }

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

  const handleRemoveClickContact = (index: number) => {
    const list = [...contactList]

    list.splice(index, 1)
    setContactList(list)
  }

  //Indentification Type
  const handleInputChangeIndentification = (e: any, index: number) => {
    const nameSelect = identificationTypes
      .map((item: any) => {
        if (item.code == e.target.value) {
          return item.name
        }
      })
      .filter(item => item)

    const list2: any = [...docTypeIdentity]

    list2[index] = nameSelect[0]

    // setDocTypeIdentity([ { docTypeIden: nameSelect[0] }])
    setDocTypeIdentity(list2)

    // setDocTypeIdentity(prevState => [...prevState, { docTypeIden: nameSelect[0] }]);
    const { name, value } = e.target
    const list: any = [...identificationList]

    list[index][name] = value
    list[index]['identificationNo'] = ''
    setIdentificationList(list)
  }

  const validatePanNumber = (panNumber: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

    return panRegex.test(panNumber)
  }

  const handleInputChangeIndentificationNo = (e: any, index: number) => {
    const { name, value } = e.target

    console.log(value, name, index)

    if (docTypeIdentity[index] == 'Aadhaar Card') {
      if (value.length < 13) {
        const list: any = [...identificationList]

        list[index][name] = value.toUpperCase()
        setIdentificationList(list)
      }
    } else if (docTypeIdentity[index] == 'Pan Card') {
      if (value.length < 11) {
        if (value.length == 10) {
          const isValidPan = validatePanNumber(value)

          console.log(isValidPan)
        }

        const list: any = [...identificationList]

        list[index][name] = value.toUpperCase()
        setIdentificationList(list)
      }
    } else if (docTypeIdentity[index] == 'Voter Card') {
      if (value.length < 11) {
        const list: any = [...identificationList]

        list[index][name] = value.toUpperCase()
        setIdentificationList(list)
      }
    } else if (docTypeIdentity[index] == 'Passport') {
      if (value.length < 10) {
        const list: any = [...identificationList]

        list[index][name] = value.toUpperCase()
        setIdentificationList(list)
      }
    }

    // const list = [...identificationList];
    // list[index][name] = value.toUpperCase();
    // setIdentificationList(list);
  }

  const handleRemoveClickIndentification = (index: number) => {
    const list = [...identificationList]

    list.splice(index, 1)
    setIdentificationList(list)
  }

  const handleAddClickIndentification = () => {
    setIdentificationList([
      ...identificationList,
      {
        identificationType: '',
        identificationNo: '',
        docFormat: '',
        document: ''
      }
    ])
  }

  //close and move back to list page
  const handleClose = (e: any) => {
    props.handleClose(e)
  }

  React.useEffect(() => {
    if (id || localStorage.getItem('agentId')) {
      if (id) {
        localStorage.setItem('agentId', id)
      }

      const agentId = localStorage.getItem('agentId')

      populateData(agentId)
    }
  }, [id])

  const handlePChange = (e: any, value: { id: any }) => {
    formik.setFieldValue('pOrgData', value)
    formik.setFieldValue('parentAgentId', value.id)
  }

  const handleSnackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setOpen(false)
  }

  const handleEmailSnackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setOpenEmailMsg(false)
  }

  const handleIDErrorClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setIdErrorMsg(false)
  }

  const handleImgChange1 = (e: any, i: any) => {}

  const altContactValidation = (value: any, field = '') => {
    if (field === 'altContact') {
      return value && value.length !== 10
    } else if (field === 'altEmail') {
      return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    }
  }

  const getAltContactErrorStatus = (value: string, field = '') => {
    return isSubmit && altContactValidation(value, field)
  }

  const getAltContactHelperTxt = (value: string, field = '') => {
    if (field === 'altContact') {
      return isSubmit && altContactValidation(value, field) ? 'Must be exactly 10 digit' : ''
    } else if (field === 'altEmail') {
      return isSubmit && altContactValidation(value, field) ? 'Enter a valid email' : ''
    }

    return ''
  }

  const checkEmail = (email: string) => {
    setTimeout(() => {
      if (email === 'md.mujtoba@eoxegen.com') {
        formik.setFieldError('email', 'Email already exists')
      } else {
        formik.setFieldError('')
      }
    }, 1000)

    // masterService.checkEmail(email).subscribe(res => {
    //    if (res.exists) {
    //   formik.setFieldError('emailId', 'Email already exists');
    // } else {
    //   formik.setFieldError('emailId', '');
    // }
    // }, err => {
    //   console.error(err);
    // });
  }

  console.log(docTypeIdentity)

  const handleNameChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value) {
      const regex = /^[A-Za-z\s]+$/

      if (regex.test(e.target.value)) {
        formik.handleChange(e)
      }
    } else {
      formik.handleChange(e)
    }
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
          <Grid container style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl
                className={classes.formControl}
                // required
                error={formik.touched.natureOfAgent && Boolean(formik.errors.natureOfAgent)}

                // helperText={formik.touched.natureOfAgent && formik.errors.natureOfAgent}
              >
                <InputLabel id='demo-simple-select-label1' style={{ marginBottom: '0px' }}>
                  Agent Category <Asterisk />
                </InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  name='natureOfAgent'
                  label='Agent Category'
                  id='demo-simple-select'
                  value={formik.values.natureOfAgent}
                  onChange={formik.handleChange}
                >
                  {agentNatures.map((ele: any) => {
                    return (
                      <MenuItem key={ele.code} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                  {/* <MenuItem value="Individual">Individual</MenuItem>
                                    <MenuItem value="Organization">Organization</MenuItem> */}
                </Select>
                {formik.touched.natureOfAgent && Boolean(formik.errors.natureOfAgent) && (
                  <FormHelperText>{formik.touched.natureOfAgent && formik.errors.natureOfAgent}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {formik.values.natureOfAgent === 'NOA185739' ? (
              <Grid item xs={12} sm={6} md={4}>
                {query2.get('mode') === 'edit' ? (
                  <FormControl className={classes.formControl}>
                    <InputLabel id='demo-simple-select-label2' style={{ marginBottom: '0px' }}>
                      Parent Agent <Asterisk />
                    </InputLabel>
                    <Select
                      labelId='demo-simple-select-label'
                      label='Parent Agent'
                      name='orgTypeCd'
                      id='demo-simple-select'
                      readOnly={true}
                      value={formik.values.orgTypeCd}
                      onChange={formik.handleChange}
                      error={formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd)}

                      // helperText={formik.touched.orgTypeCd && formik.errors.orgTypeCd}
                    >
                      {orgTypes.map((ele: any) => {
                        return (
                          <MenuItem key={ele.code} value={ele.code}>
                            {ele.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl className={classes.formControl}>
                    <InputLabel id='demo-simple-select-label3' style={{ marginBottom: '0px' }}>
                      Parent Agent <Asterisk />
                    </InputLabel>
                    <Select
                      labelId='demo-simple-select-label'
                      label='Parent Agent'
                      name='orgTypeCd'
                      id='demo-simple-select'
                      value={formik.values.orgTypeCd}
                      onChange={formik.handleChange}
                      error={formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd)}

                      // helperText={formik.touched.orgTypeCd && formik.errors.orgTypeCd}
                    >
                      {orgTypes.map((ele: any) => {
                        return (
                          <MenuItem key={ele.code} value={ele.code}>
                            {ele.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            ) : null}

            {formik.values.natureOfAgent === 'NOA185739' && formik.values.orgTypeCd === 'OT117246' ? (
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  id='combo-box-demo'
                  options={parentAgents}
                  getOptionLabel={option => option.name}
                  value={formik.values.pOrgData}
                  style={{ width: '90%' }}
                  renderInput={params => <TextField {...params} label='' />}
                  onChange={handlePChange}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl
                className={classes.formControl}
                // required
                error={formik.touched.type && Boolean(formik.errors.type)}

                // helperText={formik.touched.type && formik.errors.type}
              >
                <InputLabel id='demo-simple-select-label4' style={{ marginBottom: '0px' }}>
                  Agent Type <Asterisk />
                </InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  name='type'
                  label='Agent Type'
                  id='demo-simple-select'
                  value={formik.values.type}
                  onChange={formik.handleChange}
                >
                  {agentTypes.map((ele: any) => {
                    return (
                      <MenuItem key={ele.code} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
                {formik.touched.type && Boolean(formik.errors.type) && (
                  <FormHelperText>{formik.touched.type && formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  size='small'
                  id='standard-basic'
                  name='name'
                  value={formik.values.name}
                  // onChange={formik.handleChange}
                  onChange={e => handleNameChange(e)}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  label={
                    <span>
                      Name <Asterisk />
                    </span>
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {query2.get('mode') === 'edit' ? (
                <FormControl className={classes.formControl}>
                  <TextField
                    id='standard-basic'
                    name='code'
                    value={formik.values.code}
                    label='Agent Code'

                    // readonly={true}
                  />
                </FormControl>
              ) : null}
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='partnerId'
                  value={formik.values.partnerId}
                  onChange={formik.handleChange}
                  label='Partner ID'
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='combinationPartnerId'
                  value={formik.values.combinationPartnerId}
                  onChange={formik.handleChange}
                  label='Combination Partner ID'
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='taxPinNumber'
                  value={formik.values.taxPinNumber}
                  onChange={e => {
                    const upperCaseValue = e.target.value.toUpperCase()

                    formik.setFieldValue('taxPinNumber', upperCaseValue)
                  }}
                  label={
                    <span>
                      Tax ID/PAN <Asterisk />
                    </span>
                  }
                  error={formik.touched.taxPinNumber && Boolean(formik.errors.taxPinNumber)}
                  helperText={formik.touched.taxPinNumber && formik.errors.taxPinNumber}
                  inputProps={{ maxLength: 10 }}
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
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  // onBlur={e => {
                  //   formik.handleBlur(e);
                  //   if (formik.values.email) {
                  //     checkEmail(formik.values.email);
                  //   }
                  // }}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  label={
                    <span>
                      Email id <Asterisk />
                    </span>
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          {contactList.map((x, i) => {
            return (
              <Grid container spacing={3} style={{ marginBottom: '20px' }} key={i}>
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
                      name='altContact'
                      value={x.altContact}
                      onChange={e => handleInputChangeContact(e, i)}
                      label='Alt. Contact No'
                      error={getAltContactErrorStatus(x.altContact, 'altContact')}
                      helperText={getAltContactHelperTxt(x.altContact, 'altContact')}
                    />
                  </FormControl>
                </Grid>
                <Grid item style={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <TextField
                      id='standard-basic'
                      name='altEmail'
                      value={x.altEmail}
                      onChange={e => handleInputChangeContact(e, i)}
                      label='Alt. Email id'
                      error={getAltContactErrorStatus(x.altEmail, 'altEmail')}
                      helperText={getAltContactHelperTxt(x.altEmail, 'altEmail')}
                    />
                  </FormControl>
                </Grid>
                <Grid item style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {contactList.length !== 1 && (
                    <Button
                      // className="mr10"
                      className='p-button-danger'
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

          {identificationList.map((x, i) => {
            return (
              <Grid container spacing={3} key={i}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl
                    className={classes.formControl}
                    error={formik.touched.identificationType && Boolean(formik.errors.identificationType)}

                    // helperText={formik.touched.identificationType && formik.errors.identificationType}
                  >
                    <InputLabel id='demo-simple-select-label5' style={{ marginBottom: '0px' }}>
                      Identification type <Asterisk />
                    </InputLabel>
                    <Select
                      labelId='demo-simple-select-label'
                      label='Identification type'
                      id='demo-simple-select'
                      name='identificationType'
                      value={x.identificationType}
                      onChange={e => {
                        handleInputChangeIndentification(e, i)
                      }}
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

                {docTypeIdentity[i] == 'Pan Card' || docTypeIdentity[i] == 'Passport' ? (
                  <Grid item style={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <TextField
                        id='standard-basic'
                        name='identificationNo'
                        value={x.identificationNo}
                        onChange={e => handleInputChangeIndentificationNo(e, i)}
                        label={
                          <span>
                            Identification No <Asterisk />
                          </span>
                        }
                        error={
                          docTypeIdentity[i] == 'Pan Card'
                            ? !validatePanNumber(x.identificationNo) && x.identificationNo.length > 9
                            : formik.touched.identificationNo && Boolean(formik.errors.identificationNo)
                        }
                        helperText={
                          docTypeIdentity[i] == 'Pan Card'
                            ? !validatePanNumber(x.identificationNo) &&
                              x.identificationNo.length > 9 &&
                              'invalid number'
                            : formik.touched.identificationNo && formik.errors.identificationNo
                        }
                      />
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid item style={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <TextField
                        id='standard-basic'
                        type='number'
                        name='identificationNo'
                        value={x.identificationNo}
                        onChange={e => handleInputChangeIndentificationNo(e, i)}
                        label={
                          <span>
                            Identification No <Asterisk />
                          </span>
                        }
                        error={formik.touched.identificationNo && Boolean(formik.errors.identificationNo)}
                        helperText={formik.touched.identificationNo && formik.errors.identificationNo}
                      />
                    </FormControl>
                  </Grid>
                )}

                <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    accept='image/*'
                    className={classes.input}
                    id={'contained-button-file' + i.toString()}
                    name='document'
                    type='file'
                    // onChange={e => handleImgChange1(e, i)}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor={'contained-button-file' + i.toString()} style={{ width: '90%', marginBottom: 0 }}>
                    <Button color='secondary' className='p-button-secondary'>
                      <PublishIcon />
                    </Button>
                  </label>
                </Grid>

                <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                  {identificationList.length !== 1 && (
                    <Button
                      onClick={() => handleRemoveClickIndentification(i)}
                      className='p-button-danger'
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
          <Grid container spacing={3} justifyContent='flex-end'>
            <Grid
              item
              container
              spacing={3}
              justifyContent='flex-end'
              xs={12}
              sm={6}
              style={{ padding: '16px', paddingTop: '45px' }}
            >
              <Button color='secondary' style={{ marginRight: '5px' }} type='submit' disabled={!allowNext && true}>
                Save and Next
              </Button>
              <Button color='primary' onClick={handleClose} className='p-button-text'>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Paper>
  )
}

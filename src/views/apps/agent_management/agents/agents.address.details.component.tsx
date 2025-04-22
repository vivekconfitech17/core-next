'use client'
import * as React from 'react'

import { useEffect } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MuiAlert from '@mui/lab/Alert'
import { Formik } from 'formik'

// import { useHistory, useLocation, useParams } from 'react-router-dom';

import * as yup from 'yup'

// import { AgentsService } from '../../remote-api/api/agents-services';
// import { AddressService } from '../../remote-api/api/master-services/address.service';
import { makeStyles } from '@mui/styles'

import { AgentsService } from '@/services/remote-api/api/agents-services'
import { AddressService } from '@/services/remote-api/api/master-services'
import Asterisk from '../../shared-component/components/red-asterisk'

const schemaObject = {
  mobileNo: yup.string()['min'](10, 'Must be exactly 10 digit')['max'](10, 'Must be exactly 10 digit').nullable(),

  // .matches(new RegExp('[0-9]{10}'),'Contact number is not valid'),
  alternateMobileNo: yup
    .string()
    ['min'](10, 'Must be exactly 10 digit')
    ['max'](10, 'Must be exactly 10 digit')
    .nullable(),
  emailId: yup
    .string()
    .email('Enter a valid email')
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|in)$/i, 'Email must be a .com or .in domain')
    .nullable(),
  alternateEmailId: yup
    .string()
    .email('Enter a valid email')
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|in)$/i, 'Email must be a .com or .in domain')
    .nullable()

  // alternateMobileNo: yup
  //   .string("Enter your Contact Number")
  //   .test('len', 'Must be exactly 10 digit', val => val.length === 10),
  // .matches(new RegExp('[0-9]{10}'),'Contact number is not valid'),
  // alternateEmailId: yup
  //   .string('Enter your email')
  //   .email('Enter a valid email'),
}

let validationSchema: any = yup.object(schemaObject)

type InitialValues = {
  name: string
  emailId: string
  alternateEmailId: string
  mobileNo: string
  alternateMobileNo: string
  openingTimeHH: string
  openingTimeMM: string
  closeingTimeHH: string
  closeingTimeMM: string
  breakStartTimeHH: string
  breakStartTimeMM: string
  breakEndTimeHH: string
  breakEndTimeMM: string
  agentWeeklyHolidays: any[] // assuming this is an array of strings, adjust as needed
  addressData: any // assuming addressData can have dynamic keys, adjust as needed
}

const initialValues: InitialValues = {
  name: '',
  emailId: '',
  alternateEmailId: '',
  mobileNo: '',
  alternateMobileNo: '',
  openingTimeHH: '',
  openingTimeMM: '',
  closeingTimeHH: '',
  closeingTimeMM: '',
  breakStartTimeHH: '',
  breakStartTimeMM: '',
  breakEndTimeHH: '',
  breakEndTimeMM: '',
  agentWeeklyHolidays: [],
  addressData: {}
}

const useStyles: any = makeStyles((theme: any) => ({
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
    margin: theme?.spacing ? theme?.spacing(1) : '8px',
    minWidth: '90%'
  },
  formControl1: {
    margin: theme?.spacing ? theme?.spacing(1) : '8px',
    minWidth: 120,
    maxWidth: 300
  },
  formControl3: {
    width: '45%'
  }
}))

// const useStyles:any = styled('div')(({ theme }) => ({
//   input1: {
//     width: '50%',
//   },
//   clientTypeRadioGroup: {
//     flexWrap: 'nowrap',
//     '& label': {
//       flexDirection: 'row',
//     },
//   },
//   formControl: {
//     margin: theme?.spacing ? theme?.spacing(1) : '8px',
//     minWidth: '90%',
//   },
//   formControl1: {
//     margin: theme?.spacing ? theme?.spacing(1) : '8px',
//     minWidth: 120,
//     maxWidth: 300,
//   },
//   formControl3: {
//     width: '45%',
//   },
// }));

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

const agentservice = new AgentsService()
const addressservice = new AddressService()

// function useQuery1() {
//   return new URLSearchParams(useLocation().search);
// }

export default function AgentAddressDetailsComponent(props: any) {
  const classes = useStyles()
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const hours = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23'
  ]

  const mins = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59'
  ]

  // const query2 = useQuery1();
  // const history = useHistory();
  // const { id } = useParams();
  const searchParams = useSearchParams()
  const params = useParams()
  const id: any = params.id
  const [formObj, setFormObj]: any = React.useState({})
  const [agentAddressForm, setAgentAddressForm] = React.useState({ ...initialValues })
  const [open, setOpen] = React.useState(false)

  const [addressConfig, setAddressConfig] = React.useState([])

  type FormikProps = {
    errors: any
    touched: any
    handleSubmit: (event: any) => void
    values: any
    handleChange: (e: any) => void
    setValues: (values: any) => void
    setFieldValue: (field: string, value: any) => void
  }
  useEffect(() => {
    if (props.addressConfig && props.addressConfig.length !== 0) {
      setAddressConfig(props.addressConfig)
      const frmObj: any = {}

      // let frmLst = {};
      props.addressConfig.forEach((prop: { addressConfigurationFieldMappings: any[] }, i: string | number) => {
        prop.addressConfigurationFieldMappings.map((field, j) => {
          let additionalDetails

          if (field.modifyApiURL === '/states') {
            const x = props.addressConfig.find((el: { levelName: string }) => el.levelName === 'Country')

            additionalDetails = x.addressConfigurationFieldMappings[0].sourceList.find(
              (el: { code: any }) => el.code === x.addressConfigurationFieldMappings[0]?.value
            )
          }

          const z = `${field.modifyApiURL}?countryId=${additionalDetails?.id}`

          frmObj[field.fieldName] = field.defaultValue

          if (field.dependsOn == '' && field.type == 'dropdown' && field.modifyApiURL) {
            addressservice.getSourceList(additionalDetails?.id ? z : field.modifyApiURL).subscribe((res: any) => {
              const list: any = [...props.addressConfig]

              list[i].addressConfigurationFieldMappings[j].sourceList = res.content
              setAddressConfig(list)

              // frmLst[field.fieldName] = res.content;
            })
          }
        })
      })
      setFormObj(frmObj)

      /* formik.setValues({
      ...formik.values,
      addressData: frmObj
    }) */

      setAgentAddressForm({
        ...agentAddressForm,
        addressData: frmObj
      })

      // setFieldOptionList(frmLst);

      // const validationsArr = [
      //   {type: "required", params: ["Enter name"]},
      //   {type: "min", params: [3, "Enter name"]},
      //   {type: "max", params: [3, "Enter name"]},
      // ]

      let newSchema: any = {
        ...schemaObject
      }
      let addressDataSchemaObject = {}
      const regex = /^[\w&., \-]*$/

      props.addressConfig.forEach((prop: { addressConfigurationFieldMappings: any[] }) => {
        prop.addressConfigurationFieldMappings.map(field => {
          const validationsArr = []

          if (field.required === 'true') {
            validationsArr.push({ type: 'required', params: ['This field is required'] })
          }

          if (
            field.lengthValidation === 'true' &&
            field.size !== '' &&
            field.size !== null &&
            field.dataType !== 'numeric'
          ) {
            const msg = 'length must be' + ' ' + field.size + ' ' + 'digits'

            validationsArr.push({ type: 'min', params: [Number(field.size), msg] })
            validationsArr.push({ type: 'max', params: [Number(field.size), msg] })
          }

          if (
            field.lengthValidation === 'true' &&
            field.size !== '' &&
            field.size !== null &&
            field.dataType === 'numeric'
          ) {
            const msg = 'length must be' + ' ' + field.size + ' ' + 'digits'

            validationsArr.push({
              type: 'test',
              params: [
                'len',
                msg,
                (val: { toString: () => { (): any; new (): any; length: number } }) =>
                  val && val.toString().length === Number(field.size)
              ]
            })
          }

          if (field.spacialCharacterValidation === 'true' && field.dataType !== 'numeric') {
            const msg = 'No special character allowed'

            validationsArr.push({ type: 'matches', params: [regex, msg] })
          }

          if (validationsArr.length > 0) {
            let v: any

            if (field.dataType === 'numeric') {
              v = yup.number()
            } else {
              v = yup.string()
            }

            validationsArr.forEach(item => {
              v = v[item.type](...item.params)
            })
            addressDataSchemaObject = { ...addressDataSchemaObject, [field.fieldName]: v }
          }
        })
      })

      const addressDataSchema = yup.object(addressDataSchemaObject)

      newSchema = { ...newSchema, addressData: addressDataSchema }
      validationSchema = yup.object(newSchema)

      /* props.addressConfig.forEach((prop, i) => {
      prop.addressConfigurationFieldMappings.map((field, j) => {
    
        
        v = {}
        validationsArr.forEach(item => {
          v= yup[item.type](...item.params)
        });

        newSchema = {
          ...newSchema,
          [field.fieldName]: v
        }
      });
    }); */
    }

    populateData()
  }, [props.addressConfig])

  //handle second step submit
  const handleFinalSubmit = (values: {
    name: any
    emailId: any
    alternateEmailId: any
    mobileNo: any
    alternateMobileNo: any
    openingTimeHH: any
    openingTimeMM: any
    closeingTimeHH: any
    closeingTimeMM: any
    breakStartTimeHH: any
    breakStartTimeMM: any
    breakEndTimeHH: any
    breakEndTimeMM: any
    agentWeeklyHolidays: any
    addressData: any
  }) => {
    const addrArr: any = []

    for (const [key, value] of Object.entries(values.addressData)) {
      const objAddr = {
        addressDetails: {
          [key]: value
        },
        addressType: 'CURRENT_ADDRESS'
      }

      addrArr.push(objAddr)
    }

    const payloadTwo: any = {
      agentAddresses: {
        // addresses: [
        //   {
        //     addressDetails: {
        //       AddressLine1: "Kolkata",
        //     },
        //     addressType: "CURRENT_ADDRESS",
        //   },
        // ],
        addresses: addrArr,
        agentContactPersonDetails: {
          name: values.name,
          emailId: values.emailId,
          alternateEmailId: values.alternateEmailId,
          mobileNo: values.mobileNo,
          alternateMobileNo: values.alternateMobileNo,
          openingTime: values.openingTimeHH + ':' + values.openingTimeMM,
          closeingTime: values.closeingTimeHH + ':' + values.closeingTimeMM,
          breakStartTime: values.breakStartTimeHH + ':' + values.breakStartTimeMM,
          breakEndTime: values.breakEndTimeHH + ':' + values.breakEndTimeMM
        },
        agentWeeklyHolidays: values.agentWeeklyHolidays
      }
    }

    /* if (query2.get("mode") === "create") {
      agentservice
        .editAgent(payloadTwo, props.agentID, "2")
        .subscribe((res) => {
          props.handleNext();
        });
    }
    if (query2.get("mode") === "edit") {
      agentservice.editAgent(payloadTwo, id, "2").subscribe((res) => {
        props.handleNext();
      });
    } */

    const agentId: any = localStorage.getItem('agentId')

    agentservice.editAgent(payloadTwo, agentId, '2').subscribe(() => {
      props.handleNext()
    })
  }

  const getMinutes = (str: string) => {
    return str ? str.split(':')[1] : ''
  }

  const getHours = (str: string) => {
    return str ? str.split(':')[0] : ''
  }

  // React.useEffect(() => {
  //   if (id) {
  //     populateData(id);
  //   }
  // }, [id]);

  const populateData = () => {
    const agentId = localStorage.getItem('agentId')

    if (agentId) {
      let frmOb = {}

      agentservice.getAgentDetails(agentId).subscribe(val => {
        if (props.addressConfig && props.addressConfig.length !== 0) {
          val.agentAddresses.addresses.forEach(addr => {
            frmOb = { ...frmOb, ...addr.addressDetails }
          })
          setFormObj(frmOb)

          val.agentAddresses.addresses.forEach((item: any) => {
            props.addressConfig.forEach((prop: { addressConfigurationFieldMappings: any[] }) => {
              prop.addressConfigurationFieldMappings.forEach((field: any) => {
                if (Object.keys(item.addressDetails)[0] === field.fieldName) {
                  field['value'] = item.addressDetails[field.fieldName]
                }
              })
            })
          })

          props.addressConfig.forEach(
            (prop: { addressConfigurationFieldMappings: any[]; dependOnfields: null }, i: string | number) => {
              prop.addressConfigurationFieldMappings.map((field, j) => {
                if (field.type == 'dropdown' && prop.dependOnfields !== null) {
                  // let dArr = callAPiFunc(field, prop, arr);
                  const apiURL = field.modifyApiURL

                  // dArr.forEach(cd => {
                  //   apiURL =
                  //     apiURL.slice(0, apiURL.lastIndexOf(word)) + apiURL.slice(apiURL.lastIndexOf(word)).replace(word, cd);
                  // });
                  let additionalDetails

                  if (field.modifyApiURL === '/states') {
                    const x = props.addressConfig.find((el: { levelName: string }) => el.levelName === 'Country')

                    additionalDetails = x.addressConfigurationFieldMappings[0].sourceList.find(
                      (el: { code: any }) => el.code === x.addressConfigurationFieldMappings[0].value
                    )
                  }

                  const z = `${apiURL}?countryId=${additionalDetails?.id}`

                  addressservice.getSourceList(z).subscribe((res: any) => {
                    const list: any = [...props.addressConfig]

                    list[i].addressConfigurationFieldMappings[j].sourceList = res.content
                    setAddressConfig(list)
                  })
                }
              })
            }
          )
        }

        setAgentAddressForm({
          ...agentAddressForm,
          name: val.agentAddresses.agentContactPersonDetails.name,
          emailId: val.agentAddresses.agentContactPersonDetails.emailId,
          alternateEmailId: val.agentAddresses.agentContactPersonDetails.alternateEmailId,
          mobileNo: val.agentAddresses.agentContactPersonDetails.mobileNo,
          alternateMobileNo: val.agentAddresses.agentContactPersonDetails.alternateMobileNo,
          openingTimeHH: getHours(val.agentAddresses.agentContactPersonDetails.openingTime),
          openingTimeMM: getMinutes(val.agentAddresses.agentContactPersonDetails.openingTime),
          closeingTimeHH: getHours(val.agentAddresses.agentContactPersonDetails.closeingTime),
          closeingTimeMM: getMinutes(val.agentAddresses.agentContactPersonDetails.closeingTime),
          breakStartTimeHH: getHours(val.agentAddresses.agentContactPersonDetails.breakStartTime),
          breakStartTimeMM: getMinutes(val.agentAddresses.agentContactPersonDetails.breakStartTime),
          breakEndTimeHH: getHours(val.agentAddresses.agentContactPersonDetails.breakEndTime),
          breakEndTimeMM: getMinutes(val.agentAddresses.agentContactPersonDetails.breakEndTime),
          agentWeeklyHolidays: val.agentAddresses.agentWeeklyHolidays ? val.agentAddresses.agentWeeklyHolidays : [],
          addressData: frmOb
        })
      })
    }
  }

  // const callAPiFunc = (field, prop, resultarr) => {
  //   if (props.addressConfig && props.addressConfig.length !== 0) {
  //     props.addressConfig.forEach((pr, i) => {
  //       pr.addressConfigurationFieldMappings.forEach((fi, j) => {
  //         if (fi.fieldName === prop.dependOnfields[0]) {
  //           // let p = prop.dependOnfields[0];
  //           // let fb = formObj[p];
  //           resultarr.push(fi.value);
  //           if (pr.dependOnfields !== null) {
  //             callAPiFunc(fi, pr, resultarr);
  //           }
  //         }
  //       });
  //     });
  //   }
  //   return resultarr;
  // };

  const handleSnackClose = () => {
    setOpen(false)
  }

  return (
    <Paper elevation={0}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleSnackClose}>
        <MuiAlert onClose={handleSnackClose} severity='error' elevation={6} variant='filled'>
          Break time range is not valid
        </MuiAlert>
      </Snackbar>

      <Box p={3} my={2}>
        <Formik
          enableReinitialize={true}
          initialValues={{
            ...agentAddressForm
          }}
          validationSchema={validationSchema}
          onSubmit={(values: any) => {
            if (values.openingTimeHH || values.closeingTimeHH || values.breakStartTimeHH || values.breakEndTimeHH) {
              const openingTime = values.openingTimeHH * 60 + values.openingTimeMM
              const closingTime = values.closeingTimeHH * 60 + values.closeingTimeMM
              const breakStartTime = values.breakStartTimeHH * 60 + values.breakStartTimeMM
              const breakEndTime = values.breakEndTimeHH * 60 + values.breakEndTimeMM

              if (
                Number(breakStartTime) > Number(openingTime) &&
                Number(breakStartTime) < Number(closingTime) &&
                Number(breakEndTime) > Number(openingTime) &&
                Number(breakEndTime) < Number(closingTime) &&
                Number(breakStartTime) < Number(breakEndTime)
              ) {
                handleFinalSubmit(values)
              } else {
                setOpen(true)
              }
            } else {
              handleFinalSubmit(values)
            }
          }}
        >
          {({ errors, touched, handleSubmit, values, handleChange, setValues, setFieldValue }: FormikProps) => {
            const handleDynamicAddressChange: any = (
              e:
                | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                | (Event & { target: { value: any; name: string } }),
              field: { type: string; fieldName: any }
            ) => {
              const { name, value } = e.target

              if (props.addressConfig && props.addressConfig.length !== 0) {
                if (name) {
                  setFormObj({
                    ...formObj,
                    [name]: value
                  })

                  setValues({
                    ...values,
                    addressData: {
                      ...values.addressData,
                      [name]: value
                    }
                  })
                }

                props.addressConfig.forEach((p: { addressConfigurationFieldMappings: any[] }) => {
                  p.addressConfigurationFieldMappings.map(f => {
                    if (f.fieldName === name) {
                      f['value'] = value
                    }
                  })
                })

                props.addressConfig.forEach(
                  (
                    p: { addressConfigurationFieldMappings: any[]; dependOnfields: any[] | null },
                    i: string | number
                  ) => {
                    p.addressConfigurationFieldMappings.map((f, j) => {
                      if (field.type == 'dropdown' && p.dependOnfields !== null) {
                        if (p.dependOnfields[0] === field.fieldName) {
                          // let dArr = callAPiFunc(f, p, arr);
                          const apiURL = f.modifyApiURL

                          // dArr.forEach(cd => {
                          //   apiURL =
                          //     apiURL.slice(0, apiURL.lastIndexOf(word)) +
                          //     apiURL.slice(apiURL.lastIndexOf(word)).replace(word, cd);
                          // });
                          let additionalDetails

                          if (f.modifyApiURL === '/states') {
                            const x = props.addressConfig.find(
                              (el: { levelName: string }) => el.levelName === 'Country'
                            )

                            additionalDetails = x.addressConfigurationFieldMappings[0].sourceList.find(
                              (el: { code: any }) => el.code === x.addressConfigurationFieldMappings[0]?.value
                            )
                          }

                          const z = `${f.modifyApiURL}?countryId=${additionalDetails?.id}`

                          addressservice.getSourceList(additionalDetails?.id ? z : apiURL).subscribe((res: any) => {
                            const list: any = [...addressConfig]

                            list[i].addressConfigurationFieldMappings[j].sourceList = res.content
                            setAddressConfig(list)
                          })
                        }
                      }
                    })
                  }
                )
              }
            }

            const handleChangeHolidays = (event: { target: { value: any } }) => {
              setFieldValue('agentWeeklyHolidays', event.target.value)
            }

            const errorTxtFnc = (parentField: PropertyKey, field: string | number) => {
              return (
                touched.hasOwnProperty(parentField) &&
                touched[parentField][field] &&
                Boolean(errors.hasOwnProperty(parentField) && errors[parentField][field])
              )
            }

            const helperTextFnc = (parentField: PropertyKey, field: string | number) => {
              return (
                touched.hasOwnProperty(parentField) &&
                touched[parentField][field] &&
                errors.hasOwnProperty(parentField) &&
                errors[parentField][field]
              )
            }

            const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              if (e.target.value) {
                const regex = /^[A-Za-z\s]+$/

                if (regex.test(e.target.value)) {
                  handleChange(e)
                }
              } else {
                handleChange(e)
              }
            }

            return (
              <form onSubmit={handleSubmit} noValidate>
                {props.addressConfig && props.addressConfig.length !== 0 && (
                  <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                    {addressConfig.map((prop: any, i: number) => {
                      return prop.addressConfigurationFieldMappings.length !== 1 ? (
                        <Grid item xs={6} key={i}>
                          <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                              {prop.levelName}
                            </InputLabel>
                            {prop.iButtonRequired === 'true' && (
                              <Tooltip title={prop.iButtonMessage} placement='top'>
                                <InfoOutlinedIcon style={{ fontSize: 'medium' }} />
                              </Tooltip>
                            )}
                          </div>
                          {prop.addressConfigurationFieldMappings.map((field: any, i: number) => {
                            return (
                              <div key={i}>
                                {field.type === 'dropdown' && !field.readOnly && (
                                  <FormControl className={classes.formControl}>
                                    <Select
                                      labelId='demo-simple-select-label'
                                      label={field.fieldName}
                                      name={field.fieldName}
                                      id='demo-simple-select'
                                      required={field.required === 'true' ? true : false}
                                      error={errorTxtFnc('addressData', field.fieldName)}
                                      value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                      onChange={e => {
                                        handleDynamicAddressChange(e, field, prop)
                                      }}
                                      style={{ marginRight: '8px' }}
                                    >
                                      {field.sourceList.map((ele: any) => {
                                        return (
                                          <MenuItem key={ele.code} value={ele.code}>
                                            {ele.name}
                                          </MenuItem>
                                        )
                                      })}
                                    </Select>
                                    {touched.hasOwnProperty('addressData') &&
                                      touched?.addressData[field.fieldName] &&
                                      errors.hasOwnProperty('addressData') &&
                                      errors.addressData[field.fieldName] && (
                                        <FormHelperText style={{ color: 'red' }}>
                                          {touched.hasOwnProperty('addressData') &&
                                            touched?.addressData[field.fieldName] &&
                                            errors.hasOwnProperty('addressData') &&
                                            errors.addressData[field.fieldName]}
                                        </FormHelperText>
                                      )}
                                  </FormControl>
                                )}
                                {field.type === 'textbox' && !field.readOnly && (
                                  <TextField
                                    id='standard-basic'
                                    name={field.fieldName}
                                    type={field.dataType === 'numeric' ? 'number' : 'text'}
                                    required={field.required === 'true' ? true : false}
                                    error={errorTxtFnc('addressData', field.fieldName)}
                                    helperText={helperTextFnc('addressData', field.fieldName)}
                                    value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                    onChange={e => {
                                      handleDynamicAddressChange(e, field)
                                    }}
                                    style={{ marginTop: '8px' }}
                                  />
                                )}

                                {field.type === 'textarea' && !field.readOnly && (
                                  <TextField
                                    required={field.required === 'true' ? true : false}
                                    id='standard-multiline-flexible'
                                    multiline
                                    name={field.fieldName}
                                    maxRows={field?.lengthValidation ? Number(prop.size) : 5}
                                    value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                    onChange={e => {
                                      handleDynamicAddressChange(e, field)
                                    }}
                                    error={errorTxtFnc('addressData', field.fieldName)}
                                    helperText={helperTextFnc('addressData', field.fieldName)}
                                  />
                                )}
                                {field.readOnly && (
                                  <TextField
                                    id='standard-basic'
                                    name={field.fieldName}
                                    value={field.defaultValue}
                                    defaultValue={field.defaultValue}
                                    InputProps={{
                                      readOnly: true
                                    }}
                                    style={{ marginTop: '10px', marginRight: '8px', width: '15%' }}
                                    size='small'
                                  />
                                )}
                              </div>
                            )
                          })}
                        </Grid>
                      ) : (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          {prop.addressConfigurationFieldMappings.map((field: any, i: number) => {
                            return (
                              <div key={i}>
                                {field.type === 'dropdown' && !field.readOnly && (
                                  <FormControl className={classes.formControl}>
                                    <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                                      {prop.levelName}
                                    </InputLabel>
                                    <Select
                                      labelId='demo-simple-select-label'
                                      name={field.fieldName}
                                      label={field.fieldName}
                                      required={field.required === 'true' ? true : false}
                                      id='demo-simple-select'
                                      value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                      error={errorTxtFnc('addressData', field.fieldName)}
                                      onChange={e => {
                                        handleDynamicAddressChange(e, field, prop)
                                      }}
                                    >
                                      {field.customValuePresent === 'CUSTOM' &&
                                        field.sourceList.map((ele: any) => {
                                          return (
                                            <MenuItem key={ele.id} value={ele.id}>
                                              {ele.value}
                                            </MenuItem>
                                          )
                                        })}
                                      {field.customValuePresent === 'DYNAMIC' &&
                                        field.sourceList.map((ele: any) => {
                                          return (
                                            <MenuItem key={ele.code} value={ele.code}>
                                              {ele.name}
                                            </MenuItem>
                                          )
                                        })}
                                    </Select>
                                    {touched.hasOwnProperty('addressData') &&
                                      touched?.addressData[field.fieldName] &&
                                      errors.hasOwnProperty('addressData') &&
                                      errors.addressData[field.fieldName] && (
                                        <FormHelperText style={{ color: 'red' }}>
                                          {touched.hasOwnProperty('addressData') &&
                                            touched?.addressData[field.fieldName] &&
                                            errors.hasOwnProperty('addressData') &&
                                            errors.addressData[field.fieldName]}
                                        </FormHelperText>
                                      )}
                                  </FormControl>
                                )}

                                {field.type === 'textbox' && !field.readOnly && (
                                  <FormControl className={classes.formControl}>
                                    <TextField
                                      required={field.required === 'true' ? true : false}
                                      id='standard-basic'
                                      name={field.fieldName}
                                      type={field.dataType === 'numeric' ? 'number' : 'text'}
                                      value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                      onChange={e => {
                                        handleDynamicAddressChange(e, field)
                                      }}
                                      error={errorTxtFnc('addressData', field.fieldName)}
                                      helperText={helperTextFnc('addressData', field.fieldName)}
                                      label={prop.levelName}
                                    />
                                  </FormControl>
                                )}

                                {field.type === 'textarea' && !field.readOnly && (
                                  <FormControl className={classes.formControl}>
                                    <TextField
                                      id='standard-multiline-flexible'
                                      // required={field.required === 'true' ? true : false}
                                      multiline
                                      name={field.fieldName}
                                      maxRows={field.lengthValidation ? Number(prop.size) : 5}
                                      value={
                                        values.addressData[field.fieldName] ? values.addressData[field.fieldName] : ''
                                      }
                                      onChange={e => {
                                        handleDynamicAddressChange(e, field)
                                      }}
                                      error={errorTxtFnc('addressData', field.fieldName)}
                                      helperText={helperTextFnc('addressData', field.fieldName)}
                                      // label={prop.levelName}
                                      label={
                                        field.required === 'true' ? (
                                          <span>
                                            {prop.levelName} <Asterisk />
                                          </span>
                                        ) : (
                                          prop.levelName
                                        )
                                      }
                                    />
                                  </FormControl>
                                )}
                                {field.readOnly && (
                                  <FormControl className={classes.formControl}>
                                    <TextField
                                      id='standard-basic'
                                      name={field.fieldName}
                                      value={field.defaultValue}
                                      label={prop.levelName}
                                      defaultValue={field.defaultValue}
                                      disabled={true}
                                    />
                                  </FormControl>
                                )}
                                {prop.iButtonRequired === 'true' && (
                                  <Tooltip title={prop.iButtonMessage} placement='top'>
                                    <InfoOutlinedIcon style={{ fontSize: 'medium', marginTop: '23px' }} />
                                  </Tooltip>
                                )}
                              </div>
                            )
                          })}
                        </Grid>
                      )
                    })}
                    <Divider />
                  </Grid>
                )}

                <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id='standard-basic'
                        name='name'
                        value={values.name}
                        // onChange={handleChange}
                        onChange={e => handleNameChange(e)}
                        label='Name'
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id='standard-basic'
                        name='emailId'
                        value={values.emailId}
                        onChange={handleChange}
                        error={touched.emailId && Boolean(errors.emailId)}
                        helperText={touched.emailId && typeof errors.emailId === 'string' ? errors.emailId : ''}
                        label='Email'
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id='standard-basic'
                        name='alternateEmailId'
                        value={values.alternateEmailId}
                        onChange={handleChange}
                        error={touched.alternateEmailId && Boolean(errors.alternateEmailId)}
                        helperText={
                          touched.alternateEmailId && typeof errors.alternateEmailId === 'string'
                            ? errors.alternateEmailId
                            : ''
                        }
                        label='Alt. Email'
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginBottom: '30px' }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id='standard-basic'
                        name='mobileNo'
                        type='text'
                        onKeyPress={event => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault()
                          }
                        }}
                        value={values.mobileNo}
                        onChange={handleChange}
                        error={touched.mobileNo && Boolean(errors.mobileNo)}
                        helperText={touched.mobileNo && typeof errors.mobileNo === 'string' ? errors.mobileNo : ''}
                        label='Mobile No.'
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id='standard-basic'
                        name='alternateMobileNo'
                        type='text'
                        onKeyPress={event => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault()
                          }
                        }}
                        value={values.alternateMobileNo}
                        onChange={handleChange}
                        error={touched.alternateMobileNo && Boolean(errors.alternateMobileNo)}
                        helperText={
                          touched.alternateMobileNo && typeof errors.alternateMobileNo === 'string'
                            ? errors.alternateMobileNo
                            : ''
                        }
                        label='Alternate Mobile No.'
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginBottom: '30px' }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <div>
                      <span style={{ color: '#7c858a' }}>Opening Time: </span>
                    </div>
                    <FormControl className={classes.formControl3} style={{ marginRight: '10px' }}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        hours
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        label='hours'
                        name='openingTimeHH'
                        id='demo-simple-select'
                        value={values.openingTimeHH}
                        onChange={handleChange}
                      >
                        {hours.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl3}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        minutes
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        name='openingTimeMM'
                        label='minutes'
                        id='demo-simple-select'
                        value={values.openingTimeMM}
                        onChange={handleChange}
                      >
                        {mins.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <div>
                      <span style={{ marginLeft: '10px', color: '#7c858a' }}>Closing Time: </span>
                    </div>
                    <FormControl className={classes.formControl3} style={{ marginRight: '10px' }}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        hours
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        name='closeingTimeHH'
                        label='hours'
                        id='demo-simple-select'
                        value={values.closeingTimeHH}
                        onChange={handleChange}
                      >
                        {hours.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl3}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        minutes
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        name='closeingTimeMM'
                        label='minutes'
                        id='demo-simple-select'
                        value={values.closeingTimeMM}
                        onChange={handleChange}
                      >
                        {mins.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <div>
                      <span style={{ color: '#7c858a' }}>Break Start Time: </span>
                    </div>
                    <FormControl className={classes.formControl3} style={{ marginRight: '10px' }}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        hours
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        label='hours'
                        name='breakStartTimeHH'
                        id='demo-simple-select'
                        value={values.breakStartTimeHH}
                        onChange={handleChange}
                      >
                        {hours.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl3}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        minutes
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        name='breakStartTimeMM'
                        label='minutes'
                        id='demo-simple-select'
                        value={values.breakStartTimeMM}
                        onChange={handleChange}
                      >
                        {mins.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={3} style={{ marginBottom: '30px' }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <div>
                      <span style={{ color: '#7c858a' }}>Break End Time: </span>
                    </div>
                    <FormControl className={classes.formControl3} style={{ marginRight: '10px' }}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        hours
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        label='hours'
                        name='breakEndTimeHH'
                        id='demo-simple-select'
                        value={values.breakEndTimeHH}
                        onChange={handleChange}
                      >
                        {hours.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl3}>
                      <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                        minutes
                      </InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        name='breakEndTimeMM'
                        label='minutes'
                        id='demo-simple-select'
                        value={values.breakEndTimeMM}
                        onChange={handleChange}
                      >
                        {mins.map((ele: any) => {
                          return (
                            <MenuItem key={ele} value={ele}>
                              {ele}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} container alignItems='flex-end'>
                    <FormControl className={classes.formControl}>
                      <InputLabel id='demo-mutiple-checkbox-label'>Weekly Holiday</InputLabel>
                      <Select
                        labelId='demo-mutiple-checkbox-label'
                        id='demo-mutiple-checkbox'
                        label='Weekly Holiday'
                        multiple
                        name='agentWeeklyHolidays'
                        value={values.agentWeeklyHolidays ?? []}
                        onChange={handleChangeHolidays}
                        input={<Input />}
                        renderValue={selected => selected.join(', ')}
                        MenuProps={MenuProps}
                      >
                        {weekDays.map(name => (
                          <MenuItem key={name} value={name}>
                            <Checkbox
                              checked={values.agentWeeklyHolidays && values.agentWeeklyHolidays.indexOf(name) > -1}
                            />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button color='secondary' style={{ marginRight: '5px' }} type='submit'>
                      Save and Next
                    </Button>
                    <Button color='primary' onClick={props.handleClose} className='p-button-text'>
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )
          }}
        </Formik>
      </Box>
    </Paper>
  )
}

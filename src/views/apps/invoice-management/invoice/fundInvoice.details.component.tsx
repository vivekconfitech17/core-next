// import * as React from "react";
// import * as yup from "yup";

import * as React from 'react'
import { useEffect } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import { makeStyles } from '@mui/styles'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import 'date-fns'
import { useFormik } from 'formik'

import type { Observable } from 'rxjs'
import * as yup from 'yup'

import { AgentsService } from '@/services/remote-api/api/agents-services'
import { ClientService, ProspectService } from '@/services/remote-api/api/client-services'
import { InvoiceService } from '@/services/remote-api/api/invoice-services'
import { AddressService } from '@/services/remote-api/api/master-services'
import { PlanService } from '@/services/remote-api/api/plan-services'
import { ProductService } from '@/services/remote-api/api/product-services'
import { QuotationService } from '@/services/remote-api/api/quotation-services'
import { TaxService } from '@/services/remote-api/api/tax-services'
import InvoiceClientModal from './modals/invoice.client.modal.component'

import type { Client } from '@/services/remote-api/models/client'
import Asterisk from '../../shared-component/components/red-asterisk'
import { defaultPageRequest } from '@/services/remote-api/models/page.request'

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string().required('Agent Type is required'),
  contact: yup
    .string()
    .required('Contact number is required')
    .test('len', 'Must be exactly 10 digit', val => val?.length === 10),

  // .matches(new RegExp('[0-9]{10}'),'Contact number is not valid'),
  email: yup.string().email('Enter a valid email'),
  natureOfAgent: yup.string().required('Agent Nature is required')
})

const invoiceTypeOptions = [
  {
    value: 'SELF_FUND',
    label: 'Self Fund'
  },
  {
    value: 'INDEMNITY',
    label: 'Indemnity'
  },
  {
    value: 'CORPORATE_BUFFER',
    label: 'Corporate Buffer/SBP'
  }
]

const TypographyStyle2: any = {
  fontSize: '13px',
  fontWeight: '500',
  alignItems: 'end',
  display: 'flex',
  textTransform: 'capitalize',
  width: '150px',
  marginLeft: '10px',
  opacity: '0.65'
}

const TypographyStyle1: any = {
  fontSize: '16px',
  fontWeight: '700',
  textTransform: 'capitalize',
  opacity: '0.75'
}

const invoiceservice = new InvoiceService()
const taxservice = new TaxService()
const productservice = new ProductService()
const planservice = new PlanService()
const agentservice = new AgentsService()
const clientservice = new ClientService()
const prospectservice = new ProspectService()
const addressservice = new AddressService()
const quotationservice = new QuotationService()
const reqParam: any = { pageRequest: defaultPageRequest }
const pdt$ = productservice.getProducts(reqParam)
const ts$ = taxservice.getTaxes(reqParam)
const addr$ = addressservice.getAddressConfig()

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
  heading: {
    fontSize: theme?.typography?.pxToRem(15),
    fontWeight: theme?.typography?.fontWeightBold
  },
  inputRoot: {
    '&$disabled': {
      color: 'black'
    }
  },
  disabled: {}
}))

export default function FundInvoiceDetails(props: any) {
  const query2 = useSearchParams()
  const invoiceNumber = localStorage.getItem('InvoiceNumber')
  const params = useParams()
  const id: any = params.id
  const history = useRouter()
  const classes = useStyles()
  const [productList, setProductList] = React.useState([])
  const [planList, setPlanList] = React.useState([])
  const [categoryList, setCategoryList] = React.useState([])
  const [openClientModal, setOpenClientModal] = React.useState(false)
  const [openAgentModal, setOpenAgentModal] = React.useState(false)
  const [agentsList, setAgentsList] = React.useState([])
  const [taxList, setTaxList] = React.useState([])

  const [clientData, setClientData] = React.useState({
    clientName: '',
    clientMobile: '',
    clientEmail: '',
    clientId: '',
    clientType: ''
  })

  const [addressConfig, setAddressConfig] = React.useState([])
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [revertedMessage, setRevertedMessage] = React.useState(false)
  const [headerTitle, setHeaderTitle] = React.useState('Fund Invoice Management- Create Invoice')
  const [invoiceType, setInvoiceType] = React.useState('SELF_FUND')
  const [formObj, setFormObj]: any = React.useState({})
  const [clientType, setClientType] = React.useState()
  const [sourceList, setSourceList] = React.useState({})

  const [fundDetailsData, setFundDetailsData] = React.useState({
    availableFundBalanceAsOn: 0,
    adminFees: 0,
    careFees: 0,
    topupAmount: 0,
    depositAmount: 0,
    totalInvoiceAmount: 0
  })

  const [quotation, setQuotation]: any = React.useState({})

  const handleInvoiceDate = (date: any) => {
    setSelectedDate(date)
    const timestamp = new Date(date).getTime()

    formik.setFieldValue('invoiceDate', timestamp)
  }

  const formik: any = useFormik({
    initialValues: {
      invoiceDate: new Date().getTime(),
      invoiceType: 'SELF_FUND',
      quotationNumber: '',
      clientOrProspectId: '',
      clientOrProspectType: '',
      product: '',
      plan: '',
      description: '',
      planData: '',
      productData: '',
      categorydata: [],
      discountType: 'PERCENTAGE',
      discountValue: 0,
      loadingType: 'PERCENTAGE',
      loadingValue: 0,
      discountAmount: 0,
      loadingAmount: 0,
      totalPremiumAmount: 0,
      totalTaxAmount: 0,
      totalAmountWithoutTax: 0,
      totalAmountWithTax: 0,
      availableFundBalanceAsOn: 0,
      adminFees: 0,
      careFees: 0,
      topupAmount: 0,
      depositAmount: 0,
      totalInvoiceAmount: 0
    },

    // validationSchema: validationSchema,
    onSubmit: values => {
      handleSubmit()
    }
  })

  useEffect(() => {
    const subscription = addr$.subscribe((result: any) => {
      if (result && result?.length !== 0) {
        result.forEach((prop: { addressConfigurationFieldMappings: any[] }, i: any) => {
          prop.addressConfigurationFieldMappings.forEach((field, j) => {
            // let fname = "field"+i+j;
            field['value'] = ''

            if (field.sourceId !== null && field.sourceId !== '') {
              field['sourceList'] = []
            }

            if (field.type === 'dropdown' && field.sourceId === null) {
              if (field.addressConfigurationFieldCustomValueMappings?.length !== 0) {
                field['sourceList'] = field.addressConfigurationFieldCustomValueMappings
              }

              // if(field.addressConfigurationFieldCustomValueMappings?.length === 0 || field.addressConfigurationFieldCustomValueMappings === null){
              //   field['sourceList'] = [];
              // }
            }
          })
        })

        setAddressConfig(result)

        result.forEach((prop: { addressConfigurationFieldMappings: any[] }, i: string | number) => {
          prop.addressConfigurationFieldMappings.map((field, j) => {
            //   frmObj[field.fieldName] = field.defaultValue;
            if (field.dependsOn == '' && field.type == 'dropdown' && field.modifyApiURL) {
              addressservice.getSourceList(field.modifyApiURL).subscribe((res: any) => {
                // field.sourceList =res.content;
                const list: any = [...result]

                list[i].addressConfigurationFieldMappings[j].sourceList = res.content
                setAddressConfig(list)

                // frmLst[field.fieldName] = res.content;
              })
            }
          })
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [addr$, setAddressConfig])

  const handleopenClientModal = () => {
    setOpenClientModal(true)
  }

  const handleCloseClientModal = () => {
    setOpenClientModal(false)
  }

  const handleSubmitClientModal = (item: any) => {
    setClientData({
      ...setClientData,
      clientName: item.name,
      clientMobile: item.contactNo,
      clientEmail: item.email,
      clientId: item.id,
      clientType: item.clientType
    })
    setClientType(item.clientBasicDetails.clientTypeCd)
    populateDynamicAddress(item, addressConfig)
    setOpenClientModal(false)
  }

  const callAPiFunc: any = (field: any, prop: any, resultarr: any[], addrrList: any[]) => {
    addrrList.forEach((pr, i) => {
      pr.addressConfigurationFieldMappings.forEach((fi: { fieldName: any; value: any }, j: any) => {
        if (fi.fieldName === prop.dependOnfields[0]) {
          resultarr.push(fi.value)

          if (pr.dependOnfields !== null) {
            callAPiFunc(fi, pr, resultarr, addrrList)
          }
        }
      })
    })

    return resultarr
  }

  const populateDynamicAddress = (item: Client, addressConfigList: any[]) => {
    if (addressConfigList && addressConfigList?.length != 0) {
      const addrrList: any = [...addressConfigList]

      if (item.clientAddress) {
        item.clientAddress.addresses.forEach((val: any) => {
          addrrList.forEach((prop: { addressConfigurationFieldMappings: any[] }, i: any) => {
            prop.addressConfigurationFieldMappings.forEach((field: any, j: any) => {
              if (Object.keys(val.addressDetails)[0] === field.fieldName) {
                field['value'] = val.addressDetails[field.fieldName]
              }
            })
          })
        })

        // setAddressConfig(addrrList);

        addrrList.forEach((prop: { addressConfigurationFieldMappings?: any; dependOnfields: any }, i: number) => {
          prop.addressConfigurationFieldMappings.forEach(
            (field: { type: string; dependsOn: string; modifyApiURL: any }, j: any) => {
              if (field.type === 'dropdown' && field.dependsOn !== '' && prop.dependOnfields !== null) {
                const arr: any = []
                const dArr = callAPiFunc(field, prop, arr, addrrList)

                const word = '{code}'
                let apiURL = field.modifyApiURL

                dArr.forEach((cd: any) => {
                  apiURL =
                    apiURL.slice(0, apiURL.lastIndexOf(word)) + apiURL.slice(apiURL.lastIndexOf(word)).replace(word, cd)
                })
                addressservice.getSourceList(apiURL).subscribe((res: any) => {
                  addrrList[i].addressConfigurationFieldMappings[j].sourceList = res.content

                  setAddressConfig(addrrList)
                })
              } else {
                // setAddressConfig(addrrList);
              }
            }
          )
        })
      }

      // setAddressConfig(addrrList);
    }
  }

  const calculateAgentValues = (totalAmountWithoutTax: number) => {
    const list = [...agentsList]

    list.forEach((ele: any) => {
      ele['finalValue'] = (Number(ele.commissionValue) * Number(totalAmountWithoutTax)) / 100
    })
    setAgentsList(list)
  }

  const handleSubmit = () => {
    const payload: any = {
      invoiceType: formik.values.invoiceType,
      invoiceDate: new Date(selectedDate).getTime(),
      clientOrProspectId: clientData.clientId,
      clientOrProspectType: clientData.clientType,
      productId: formik.values.product,
      planId: formik.values.plan,
      totalBeforeDiscountAndLoadingAmount: Number(formik.values.totalPremiumAmount),
      discountType: formik.values.discountType,
      discountEnterValue: formik.values.discountValue,
      totalDiscount: Number(formik.values.discountAmount),
      loadingType: formik.values.loadingType,
      loadingEnterValue: formik.values.loadingValue,
      totalLoading: Number(formik.values.loadingAmount),
      totalAfterDiscountAndLoadingAmount: Number(formik.values.totalAmountWithoutTax),
      totalTaxAmount: Number(formik.values.totalTaxAmount),
      totalAmountWithTax: Number(formik.values.totalAmountWithTax),
      quotationId: formik.values.invoiceType === 'invoiceFromQuotation' ? quotation.id : null
    }

    const invArr: any = []

    formik.values.categorydata.forEach((ele: any) => {
      invArr.push({ categoryId: ele.id, noOfMenber: ele.noOfMembers, premiumAmount: Number(ele.premiumAmount) })
    })
    payload['invoiceCategories'] = invArr

    const invAgents: any = []

    agentsList.forEach((ag: any) => {
      invAgents.push({
        agentId: ag.agentId,
        commissionType: ag.commissionType,
        commissionValue: ag.commissionValue,
        finalValue: ag.finalValue
      })
    })

    payload['invoiceAgents'] = invAgents

    const invTaxes: any = []

    taxList.forEach((tx: any) => {
      if (tx.checked) {
        invTaxes.push({
          taxAmount: tx.taxVal,
          taxId: tx.id
        })
      }
    })
    payload['invoiceTaxes'] = invTaxes

    invoiceservice.saveInvoice(payload).subscribe(res => {
      history.push(`/invoices?mode=viewList`)

      // window.location.reload();
    })
  }

  //tax API
  const useObservable2 = (observable: Observable<any>, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe(result => {
        if (result.content && result.content?.length > 0) {
          result.content.forEach((ele: any) => {
            ele['checked'] = false
            ele['taxVal'] = 0
          })
        }

        result.content.sort((a: { sortOrder: number }, b: { sortOrder: number }) => {
          return a.sortOrder - b.sortOrder
        })
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  //product API
  const useObservable3 = (observable: Observable<any>, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        const tableArr: any = []

        if (result.content && result.content?.length > 0) {
          result.content.forEach((ele: any) => {
            tableArr.push({
              name: ele.productBasicDetails.name,
              id: ele.id
            })
          })
        }

        setter(tableArr)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable2(ts$, setTaxList)
  useObservable3(pdt$, setProductList)

  const populateProductFund = () => {
    if (invoiceNumber) {
      const pagerequestquery2: any = {
        page: 0,
        size: 10,
        summary: false
      }

      pagerequestquery2.sort = ['rowCreatedDate dsc']
      pagerequestquery2.invoiceNumber = invoiceNumber
      invoiceservice.getFundInvoice(pagerequestquery2).subscribe((res: any) => {
        formik.setFieldValue('invoiceDate', res.content[0].invoiceDate)
        formik.setFieldValue('invoiceType', res.content[0].invoiceType)
        formik.setFieldValue('clientOrProspectId', res.content[0].clientOrProspectId)
        formik.setFieldValue('clientOrProspectType', res.content[0].clientOrProspectType)
        formik.setFieldValue('adminFees', res.content[0].adminFee)
        formik.setFieldValue('availableFundBalance', res.content[0].availableFundBalance)
        formik.setFieldValue('careFees', res.content[0].careFee)
        formik.setFieldValue('topupAmount', res.content[0].topupAmount)
        formik.setFieldValue('totalInvoiceAmount', res.content[0].totalInvoiceAmount)
        formik.setFieldValue('depositAmount', res.content[0].depositAmount)
        setRevertedMessage(res.content[0].reverted)

        if (res.content[0].clientOrProspectType === 'Client') {
          let frmOb: any = {}
          const temp: any = []

          clientservice.getClientDetails(res.content[0].clientOrProspectId).subscribe((cdata: any) => {
            setClientData({
              clientName: cdata.clientBasicDetails.displayName,
              clientEmail: cdata.clientBasicDetails.contactNos[0].contactNo,
              clientMobile: cdata.clientBasicDetails.emails[0].emailId,
              clientId: cdata.id,
              clientType: 'Client'
            })
            addr$.subscribe(result => {
              temp.push(result)

              if (result && result?.length !== 0) {
                result.forEach((prop: { addressConfigurationFieldMappings: any[] }, i: any) => {
                  prop.addressConfigurationFieldMappings.forEach((field, j) => {
                    // let fname = "field"+i+j;
                    field['value'] = ''

                    if (field.sourceId !== null && field.sourceId !== '') {
                      field['sourceList'] = []
                    }

                    if (field.type === 'dropdown' && field.sourceId === null) {
                      if (field.addressConfigurationFieldCustomValueMappings?.length !== 0) {
                        field['sourceList'] = field.addressConfigurationFieldCustomValueMappings
                      }

                      if (
                        field.addressConfigurationFieldCustomValueMappings?.length === 0 ||
                        field.addressConfigurationFieldCustomValueMappings === null
                      ) {
                        field['sourceList'] = []
                      }
                    }
                  })
                })

                setAddressConfig(result)

                result.forEach((prop: { addressConfigurationFieldMappings: any[] }, i: string | number) => {
                  prop.addressConfigurationFieldMappings.map((field, j) => {
                    //   frmObj[field.fieldName] = field.defaultValue;
                    if (field.dependsOn == '' && field.type == 'dropdown' && field.modifyApiURL) {
                      addressservice.getSourceList(field.modifyApiURL).subscribe((res: any) => {
                        field.sourceList = res.content
                        const list = [...result]

                        result[i].addressConfigurationFieldMappings[j].sourceList = res.content

                        // frmLst[field.fieldName] = res.content;
                        populateDynamicAddress(cdata, result)
                      })
                    }
                  })
                })

                // setAddressConfig(result);
              }

              // populateDynamicAddress(cdata,result)

              if (temp && temp?.length !== 0) {
                cdata.clientAddress.addresses.forEach((addr: { addressDetails: any }) => {
                  frmOb = { ...frmOb, ...addr.addressDetails }
                })
                setFormObj(frmOb)

                cdata.clientAddress.addresses.forEach((item: any) => {
                  addressConfig.forEach((prop: any, i: number) => {
                    prop.addressConfigurationFieldMappings.forEach((field: any, j: number) => {
                      if (Object.keys(item.addressDetails)[0] === field.fieldName) {
                        field['value'] = item.addressDetails[field.fieldName]
                      }
                    })
                  })
                })

                const abc = result.forEach((prop: any, i: number) => {
                  prop.addressConfigurationFieldMappings.map((field: any, j: number) => {
                    if (field.type == 'dropdown') {
                      const arr: any = []
                      const dArr: any = callAPiFunc(field, prop, arr)

                      const word = '{code}'
                      let apiURL = field.modifyApiURL

                      dArr.forEach((cd: any) => {
                        apiURL =
                          apiURL.slice(0, apiURL.lastIndexOf(word)) +
                          apiURL.slice(apiURL.lastIndexOf(word)).replace(word, cd)
                      })

                      addressservice.getSourceList(apiURL).subscribe((res: any) => {
                        const list: any = [...props.addressConfig]

                        list[i].addressConfigurationFieldMappings[j].sourceList = res.content
                        setAddressConfig(list)
                      })
                    }
                  })
                })
              }
            })
          })
        }

        if (res.content[0].clientOrProspectType === 'Prospect') {
          prospectservice.getProspectDetails(res.content[0].clientOrProspectId).subscribe((cdata: any) => {
            setClientData({
              clientName: cdata.displayName,
              clientEmail: cdata.emailId,
              clientMobile: cdata.mobileNo,
              clientId: cdata.id,
              clientType: 'Prospect'
            })
          })
        }
      })
    }
  }

  useEffect(() => {
    populateProductFund()
  }, [])

  const calculateTotalAmoutWithoutTax = (loadingVal: any, discountVal: any, premiumTotal: number) => {
    let la = (Number(loadingVal) / 100) * premiumTotal
    let da = (Number(discountVal) / 100) * premiumTotal

    if (formik.values.loadingType === 'PERCENTAGE') {
      formik.setFieldValue('loadingAmount', la)
    }

    if (formik.values.loadingType === 'FIXED') {
      la = Number(loadingVal)
      formik.setFieldValue('loadingAmount', la)
    }

    if (formik.values.discountType === 'PERCENTAGE') {
      formik.setFieldValue('discountAmount', da)
    }

    if (formik.values.discountType === 'FIXED') {
      da = Number(discountVal)
      formik.setFieldValue('discountAmount', da)
    }

    const at = premiumTotal + la - da

    formik.setFieldValue('totalAmountWithoutTax', at)
    calculateAgentValues(at)
    calculateTax(taxList, at)
  }

  const calculateTax = (txlist: any, totalAmountWithoutTax: number) => {
    txlist.forEach((ele: any) => {
      if (ele.checked) {
        if (ele.type === 'PERCENTAGE') {
          ele.taxVal = (Number(ele.value) * Number(totalAmountWithoutTax)) / 100
        }

        if (ele.type === 'FIXED') {
          ele.taxVal = Number(ele.value)
        }
      }
    })
    setTaxList(txlist)
    let grandTotal = Number(totalAmountWithoutTax)
    let tt = 0

    txlist.forEach((v: any) => {
      if (v.checked) {
        grandTotal = grandTotal + Number(v.taxVal)
        tt = tt + Number(v.taxVal)
      }
    })

    formik.setFieldValue('totalAmountWithTax', grandTotal)

    formik.setFieldValue('totalTaxAmount', tt)
  }

  const getCategories = (planid: string) => {
    planservice.getCategoriesFromPlan(planid).subscribe(res => {
      if (res?.length > 0) {
        const arr: any = []

        res.forEach((ele: any) => {
          ele['noOfMembers'] = 0
          ele['premiumAmount'] = 0
          arr.push(ele)
        })
        setCategoryList(arr)
      }
    })
  }

  const handleClose = () => {
    history.push(`/invoices?mode=viewList`)

    // window.location.reload();
  }

  const handleFundDetailsChanges = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target

    setFundDetailsData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  useEffect(() => {
    // Calculate totalInvoiceAmount based on other fields
    const adminFees = parseFloat(formik.values.adminFees || 0)
    const careFees = parseFloat(formik.values.careFees || 0)
    const topupAmount = parseFloat(formik.values.topupAmount || 0)
    const depositAmount = parseFloat(formik.values.depositAmount || 0)
    const totalInvoiceAmount = (adminFees + careFees + topupAmount + depositAmount).toFixed(2)

    formik.setFieldValue('totalInvoiceAmount', totalInvoiceAmount)
  }, [formik.values.adminFees, formik.values.careFees, formik.values.topupAmount, formik.values.depositAmount])

  const generateFundInvoice = () => {
    const currDate = new Date()

    const payload = {
      invoiceType: formik.values.invoiceType,
      invoiceDate: currDate.getTime(),
      clientOrProspectId: clientData.clientId,
      clientOrProspectType: clientData.clientType,
      generateInvoiceBy: 'F',
      availableFundBalance: parseFloat(formik.values.availableFundBalanceAsOn),
      adminFee: parseFloat(formik.values.adminFees),
      careFee: parseFloat(formik.values.careFees),
      topupAmount: parseFloat(formik.values.topupAmount),
      depositAmount: parseFloat(formik.values.depositAmount),
      totalInvoiceAmount: parseFloat(formik.values.totalInvoiceAmount)
    }

    invoiceservice.generateFundInvoice(payload).subscribe((res: any) => {
      if (res.id) {
        history.push('/invoices?mode=viewList')
      }
    })
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      {query2.get('mode') === 'create' && (
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            height: '2em',
            color: '#000',
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          <span
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {headerTitle}
          </span>
        </Grid>
      )}
      <Paper elevation={0}>
        <Box p={3} my={2}>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  views={['year', 'month', 'date']}
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Invoice Date"
                  value={selectedDate}
                  disabled={query2.get('mode') === 'view' ? true : false}
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                  onChange={handleInvoiceDate}
                  KeyboardButtonProps={{
                    'aria-label': 'change ing date',
                  }}
                />
              </MuiPickersUtilsProvider> */}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  views={['year', 'month', 'day']}
                  label='Invoice Date'
                  value={selectedDate}
                  onChange={handleInvoiceDate}
                  disabled={query2.get('mode') === 'view' ? true : false}
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled
                    }
                  }}
                  renderInput={params => (
                    <TextField {...params} margin='normal' style={{ marginBottom: '0px' }} variant='outlined' />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              {query2.get('mode') !== 'view' && (
                <Button color='primary' onClick={handleopenClientModal}>
                  Search Client
                </Button>
              )}
              {query2.get('mode') === 'view' && revertedMessage && (
                <span style={{ color: 'red', fontWeight: 'bold' }}>REVERTED</span>
              )}
              <InvoiceClientModal
                openClientModal={openClientModal}
                handleCloseClientModal={handleCloseClientModal}
                handleSubmitClientModal={handleSubmitClientModal}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Paper elevation={0}>
        <Box p={3} my={2}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
              <Typography className={classes.heading}>Client Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={4}>
                  <TextField
                    size='small'
                    id='standard-basic'
                    name='clientName'
                    label='Name'
                    value={clientData.clientName}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size='small'
                    id='standard-basic'
                    name='clientEmail'
                    label='Email'
                    value={clientData.clientEmail}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    size='small'
                    id='standard-basic'
                    name='clientMobile'
                    label='Contact'
                    InputProps={{
                      readOnly: true
                    }}
                    value={clientData.clientMobile}
                  />
                </Grid>

                {addressConfig && addressConfig?.length !== 0 && (
                  <Grid container spacing={3} style={{ marginBottom: '10px' }}>
                    {addressConfig.map((prop: any, i: number) => {
                      return prop.addressConfigurationFieldMappings?.length !== 1 ? (
                        <Grid item xs={6}>
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
                          {prop.addressConfigurationFieldMappings.map((field: any, j: number) => {
                            return (
                              <div key={j}>
                                {field.type === 'dropdown' && !field.readOnly && (
                                  <FormControl className={classes.formControl}>
                                    <Select
                                      labelId='demo-simple-select-label'
                                      name={field.fieldName}
                                      id='demo-simple-select'
                                      required={field.required === 'true' ? true : false}
                                      // error={errorTxtFnc('addressData', field.fieldName)}
                                      value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                      // onChange={e => {
                                      //   handleDynamicAddressChange(e, field, prop);
                                      // }}
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
                                  </FormControl>
                                )}
                                {field.type === 'textbox' && !field.readOnly && (
                                  <TextField
                                    id='standard-basic'
                                    name={field.fieldName}
                                    type={field.dataType === 'numeric' ? 'number' : 'text'}
                                    required={field.required === 'true' ? true : false}
                                    value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                    style={{ marginTop: '8px' }}
                                  />
                                )}

                                {field.type === 'textarea' && !field.readOnly && (
                                  <TextField
                                    required={field.required === 'true' ? true : false}
                                    id='standard-multiline-flexible'
                                    multiline
                                    name={field.fieldName}
                                    maxRows={field.lengthValidation ? Number(prop.size) : 5}
                                    value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                  />
                                )}
                                {field.readOnly && (
                                  <TextField
                                    id='standard-basic'
                                    name={field.fieldName}
                                    value={field.defaultValue}
                                    defaultValue={field.defaultValue}
                                    style={{ marginTop: '10px', marginRight: '8px', width: '15%' }}
                                    size='small'
                                    InputProps={{
                                      readOnly: true
                                    }}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </Grid>
                      ) : (
                        <Grid item xs={4}>
                          {prop.addressConfigurationFieldMappings.map((field: any, j: any) => {
                            return (
                              <div style={{ marginTop: '15px', marginLeft: '5px' }} key={`field-${j}`}>
                                {field.type === 'textarea' ? (
                                  !field.readOnly && (
                                    <TextField
                                      id='standard-multiline-flexible'
                                      // required={field.required === 'true' ? true : false}
                                      multiline
                                      name={field.fieldName}
                                      maxRows={field.lengthValidation ? Number(prop.size) : 5}
                                      style={{ marginRight: '8px' }}
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
                                  )
                                ) : (
                                  <TextField
                                    // required={field.required === 'true' ? true : false}
                                    id='standard-basic'
                                    name={field.fieldName}
                                    type={field.dataType === 'numeric' ? 'number' : 'text'}
                                    value={formObj[field.fieldName] ? formObj[field.fieldName] : ''}
                                    style={{ marginRight: '8px' }}
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
                                )}
                                {field.readOnly && (
                                  <TextField
                                    id='standard-basic'
                                    name={field.fieldName}
                                    value={field.defaultValue}
                                    label={prop.levelName}
                                    defaultValue={field.defaultValue}
                                    disabled={true}
                                    style={{ marginRight: '8px' }}
                                  />
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
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
              <Typography className={classes.heading}>Fund Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box style={{ display: 'block' }}>
                <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                  <Grid container item xs={12}>
                    <Grid item xs={6}>
                      <Box display={'flex'} marginY={'10px'}>
                        <Typography style={TypographyStyle1}>Invoice Type</Typography>&nbsp;
                        <span>:</span>&nbsp;
                        <Select
                          name='invoiceType'
                          value={formik.values.invoiceType}
                          label='Invoice Type'
                          // onChange={(e) => { setInvoiceType(e.target.value) }}
                          onChange={formik.handleChange}
                          inputProps={{ 'aria-label': 'Without label' }}
                          style={TypographyStyle2}
                        >
                          {invoiceTypeOptions.map(ele => {
                            return (
                              <MenuItem key={ele.value} value={ele.value}>
                                {ele.label}
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      {/* <Box style={{ display: "inline-grid" }}> */}
                      <TextField
                        size='medium'
                        id='standard-basic'
                        name='availableFundBalanceAsOn'
                        label='Available Fund Balance'
                        value={formik.values.availableFundBalanceAsOn}
                        InputProps={{
                          readOnly: true
                        }}

                        // style={{ margin: "3%" }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      id='standard-basic'
                      name='adminFees'
                      label='Admin Fees'
                      style={{ margin: '0 0 3% 0' }}
                      // onChange={handleFundDetailsChanges}
                      onChange={formik.handleChange}
                      value={formik.values.adminFees}
                    />
                    <TextField
                      size='small'
                      id='standard-basic'
                      name='careFees'
                      label='Care Fees'
                      style={{ margin: '0 3%' }}
                      // onChange={handleFundDetailsChanges}
                      onChange={formik.handleChange}
                      value={formik.values.careFees}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size='small'
                      id='standard-basic'
                      name='topupAmount'
                      label='Topup Amount'
                      style={{ margin: '0 0 3% 0' }}
                      // onChange={handleFundDetailsChanges}
                      onChange={formik.handleChange}
                      value={formik.values.topupAmount}
                    />
                    <TextField
                      size='small'
                      id='standard-basic'
                      name='depositAmount'
                      label='Deposit Amount'
                      style={{ margin: '0 3%' }}
                      // onChange={handleFundDetailsChanges}
                      value={formik.values.depositAmount}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      size='small'
                      id='standard-basic'
                      name='totalInvoiceAmount'
                      label='Total Invoice Amount'
                      // style={{ margin: "3%" }}
                      value={formik.values.totalInvoiceAmount}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </Grid>
                </Grid>
                <Button color='primary' style={{ marginRight: '5px' }} onClick={generateFundInvoice}>
                  Generate Invoice
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>
    </form>
  )
}

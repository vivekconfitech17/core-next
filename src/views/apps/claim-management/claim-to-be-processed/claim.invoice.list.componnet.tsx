'use client'
import React, { useEffect } from 'react'

import { useParams } from 'next/navigation'

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import { withStyles, makeStyles } from '@mui/styles'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes'
import { useFormik } from 'formik'
import PropTypes from 'prop-types'
import { forkJoin, of } from 'rxjs'
import { map } from 'rxjs/operators'
import * as yup from 'yup'

import moment from 'moment'

import { Autocomplete } from '@mui/lab'

import CheckBoxIcon from '@mui/icons-material/CheckBox'

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

import Checkbox from '@mui/material/Checkbox'

import { Button } from 'primereact/button'

import { PreAuthService, ReimbursementService } from '@/services/remote-api/api/claims-services'
import { ProductService } from '@/services/remote-api/api/product-services'
import { MemberService } from '@/services/remote-api/api/member-services'
import {
  BenefitService,
  ProvidersService,
  ServiceTypeService,
  defaultPageRequest
} from '@/services/remote-api/fettle-remote-api'
import reimReviewModel from '../claim-reimbursement/reim.shared'

import BreakUpComponents from '../claim-audit/components/audit.breakup.view.component'

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    }
  },
  expanded: {}
})(MuiAccordion)

const productservice = new ProductService()
const reimService = new ReimbursementService()
const memberservice = new MemberService()
const benefitService = new BenefitService()
const providerService = new ProvidersService()
const serviceDiagnosis = new ServiceTypeService()
const preAuthService = new PreAuthService()

const ad$ = serviceDiagnosis.getServicesbyId('867854874246590464', {
  page: 0,
  size: 1000,
  summary: true,
  active: true,
  nonGroupedServices: false
})

// let ps$ = productservice.getProducts();

const productDataSourceCallback$ = (params = {}, action: any, pageRequest = defaultPageRequest) => {
  let reqParam: any = { ...pageRequest, ...params }

  if (action.searchText && action.searchText.length > 2) {
    reqParam = {
      ...reqParam,
      name: action.searchText
    }
    delete reqParam.active
  }

  return productservice.getProducts(reqParam)
}

const useStyles = makeStyles((theme: any) => ({
  header: {
    // border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '10px 10px 0px 0px',
    background: '#D80E51',
    padding: 8,
    color: '#fff',
    borderBottom: 'none',
    paddingTop: 'none'
  },
  opinionHeader: {
    // border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '0px 0px 0px 0px',
    background: '#F1F1F1',
    padding: 14,
    borderTop: 'none'
  },
  customStyle: {
    // border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '0px 0px 10px 10px',
    background: '#ffffff',
    padding: 20,
    borderTop: 'none'
  },
  opinionBody: {
    // border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '0px 0px 10px 10px',
    background: '#ffffff',
    borderTop: 'none'

    // padding: '16px',
  },
  headerTextHead: {
    fontSize: '16px',
    fontWeight: 'Bold',
    color: '#primaay',
    paddingLeft: '8px',
    aligh: 'center'
  },
  headerText: {
    fontSize: '16px',

    // fontWeight: 'Bold',
    color: '#A1A1A1',
    paddingLeft: '8px'
  },
  headerTextAlign: {
    display: 'flex'

    // direction: 'row',
  },
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
    minWidth: 282,
    padding: 4
  },
  root: {
    flexGrow: 1,
    maxWidth: 500
  },
  infoText: {
    // border: '1px solid rgba(0, 0, 0, 0.1)',
    color: '#404040',
    padding: '4px'
  },
  heading: {
    fontSize: '14px',
    flexBasis: '33.33%',
    flexShrink: 0
  },
  primaryHeading: {
    fontSize: '14px'
  },
  secondaryHeading: {
    fontSize: '12px',
    color: theme?.palette?.text?.secondary
  },
  accordianBody: {
    paddingLeft: '20%',
    paddingRight: '20%'
  },
  accordianBodyHeader: {
    display: 'flex',
    justifyContent: 'space-between'

    // paddingLeft: '20%',
    // paddingRight: '20%'
  },
  benifitAutoComplete: {},
  AccordionSummary: {}
}))

const keyMappings = {
  'CLAIM NO': 'CLAIM_NO',
  'CLAIM DATE': 'CLAIM_DATE',
  'MEMBER NAME': 'MEMBER_NAME',
  'MEMBERSHIP NO': 'MEMBERSHIP_NO',
  'POLICY NO': 'POLICY_NO',
  VALIDITY: 'VALIDITY',
  'PLAN NAME': 'PLAN_NAME',
  'SCHEME/CATEGORY': 'SCHEME_CATEGORY',
  'CLAIM TYPE': 'CLAIM_TYPE',
  SUBTYPE: 'SUBTYPE',
  'CHECKIN TIME': 'CHECKIN_TIME',
  'CHECKOUT TIME': 'CHECKOUT_TIME',
  'CLAIMED AMOUNT': 'CLAIMED_AMOUNT',
  BARCODE: 'BARCODE'
}

const AccordionSummary = withStyles({
  root: {
    backgroundColor: '#F1F1F1',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56
    },
    color: '#A1A1A1'
  },
  content: {
    '&$expanded': {
      margin: '12px 0'
    }
  },
  expanded: {}
})(MuiAccordionSummary)

const AccordionDetails = withStyles((theme: any) => ({
  root: {
    padding: theme?.spacing ? theme.spacing(2) : '8px'
  }
}))(MuiAccordionDetails)

const StyledTableCellHeaderAI1 = withStyles((theme: any) => ({
  head: {
    backgroundColor: '#D80E51',
    color: '#f1f1f1',
    padding: '8px'
  },
  body: {
    fontSize: 14
  }
}))(TableCell)

const StyledTableCellHeaderAI2 = withStyles((theme: any) => ({
  head: {
    backgroundColor: '#01de74',
    color: '#f1f1f1',
    padding: '8px'
  },
  body: {
    fontSize: 14
  }
}))(TableCell)

const StyledTableCellRow = withStyles(theme => ({
  head: {
    padding: '8px'
  },
  body: {
    padding: '8px',
    backgroundColor: '#FFF',
    color: '#3C3C3C !important',
    fontSize: 12
  }
}))(TableCell)

const StyledTableRow = withStyles((theme: any) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme?.palette?.action?.hover
    }
  }
}))(TableRow)

const validationSchema = yup.object({
  productId: yup.string().required('Product Name is required')
})

function TabPanel(props: any) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}
const options = ['PAYABLE', 'CONSULT', 'ADD DOC', 'REJECT']

const ClaimInvoiceList = () => {
  const classes = useStyles()
  const [value, setValue] = React.useState(0)
  const [isClaimDetailsEdit, setIsClaimDetailsEdit] = React.useState(false)
  const [claimReimDetails, setclaimReimDetails] = React.useState<any>(reimReviewModel())

  // const [editedClaimData, setEditedClaimData] = React.useState({ ...claimData });
  const [claimStatus, setClaimStatus] = React.useState()
  const [rejectReason, setRejectReason] = React.useState('')
  const [remarks, setRemarks] = React.useState('')
  const [internalRemarks, setInternalRemarks] = React.useState('')
  const [benefitData, setBenefitData] = React.useState([])
  const [providerData, setProviderData] = React.useState([])
  const [memberData, setMemberData] = React.useState<any>([])
  const [invoiceData, setInvoiceData] = React.useState([])
  const [providerWithApprovedCost, setProviderWithApprovedCost] = React.useState([])
  const [showApprovableDetails, setShowApprovableDetails] = React.useState(false)
  const [diagnosisList, setDiagnosisList] = React.useState([])
  const [diagnosisValues, setDiagnosisValues] = React.useState([])
  const [diagnosisIds, setDiagnosisIds] = React.useState<any>([])
  const [status, setStatus] = React.useState()
  const [calculationStatus, setCalculationStatus] = React.useState()
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState([])
  const [initalDiagnosis, setInitialDiagnosis] = React.useState<any>()
  const [doctorsOpinion, setDoctorsOpinion] = React.useState<any>()
  const [providerList, setProviderList] = React.useState([])

  const id: any = useParams().id

  useEffect(() => {
    if (id) {
      populateReimbursement()
    }
  }, [id])

  const populateReimbursement = () => {
    const serviceAll$ = forkJoin(
      serviceDiagnosis.getServicesbyId('867854950947827712', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false
      }),
      serviceDiagnosis.getServicesbyId('867855014529282048', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false
      }),
      serviceDiagnosis.getServicesbyId('867855088575524864', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false
      }),
      serviceDiagnosis.getServicesbyId('867855148155613184', {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false
      })
    )

    const ad$ = serviceDiagnosis.getServicesbyId('867854874246590464', {
      page: 0,
      size: 1000,
      summary: true,
      active: true,
      nonGroupedServices: false
    })

    const frk$ = forkJoin({
      providers: providerService.getProviders(),
      bts: benefitService.getAllBenefit({ page: 0, size: 1000, summary: true }),
      reimDetails: reimService.getReimbursementById(id),
      services: serviceAll$
    })

    frk$.subscribe((data: any) => {
      setDoctorsOpinion(data?.reimDetails?.opinions[0])
      setDiagnosisValues(
        data?.reimDetails?.doctorsDiagnosis?.length ? data?.reimDetails?.doctorsDiagnosis : data?.reimDetails?.diagnosis
      )
      setInitialDiagnosis(data?.reimDetails?.diagnosis)
      setBenefitData(data?.reimDetails?.benefitsWithCost)
      setInvoiceData(data?.reimDetails?.invoices)
      setStatus(data?.reimDetails?.reimbursementStatus)
      setCalculationStatus(data?.reimDetails?.calculationStatus)
      setProviderList(data.providers.content)

      if (data.reimDetails.invoices && data.reimDetails.invoices.length !== 0) {
        data.providers.content.forEach((proAll: any) => {
          data.reimDetails.invoices.forEach((pr: any) => {
            if (proAll.id === pr.provideId) {
              pr['providerName'] = proAll.providerBasicDetails?.name
              setProviderData(pr)
            }
          })
        })
      }

      data.bts.content.forEach((benall: any) => {
        data.reimDetails.benefitsWithCost.forEach((benefit: any) => {
          if (benefit.benefitId === benall.id) {
            benefit['benefitName'] = benall.name
          }
        })
      })
      const serviceList = []

      data.services.forEach((ser: any) => {
        ser.content.forEach((sr: any) => {
          serviceList.push(sr)
        })
      })

      // serviceList.forEach(ser => {
      //   data.preAuth.services.forEach(service => {
      //     if(service.serviceId === ser.id){
      //       service['serviceName'] = ser.name;
      //     }
      //   })
      // })
      const pageRequest = {
        page: 0,
        size: 10,
        summary: true,
        active: true,
        key: 'MEMBERSHIP_NO',
        value: data.reimDetails.memberShipNo,
        key1: 'policyNumber',
        value1: data.reimDetails.policyNumber
      }

      memberservice.getMember(pageRequest).subscribe((res: any) => {
        setMemberData(res.content[0])

        if (res.content?.length > 0) {
          const member = res.content[0]

          const obj = {
            member: member,
            reim: data.reimDetails
          }

          setclaimReimDetails(obj)
        }
      })
    })

    // preAuthService.getPreAuthById(id).subscribe(preAuth => {
    //     let pageRequest = {
    //         page: 0,
    //         size: 10,
    //         summary: true,
    //         active: true,
    //         key:'MEMBERSHIP_NO',
    //         value:preAuth.memberShipNo,
    //         key1:'policyNumber',
    //         value1:preAuth.policyNumber
    //       }
    //       memberservice.getMember(pageRequest).subscribe(res=>{
    //         if(res.content?.length > 0){
    //           const member= res.content[0];
    //           setclaimReimDetails({member,preAuth});
    //         }
    //       });

    // });
  }

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue)
  }

  const handleChangeClaimStatus = (event: any) => {
    const selectedValue = event.target.value

    setClaimStatus(selectedValue)

    if (selectedValue === 'REJECT') {
      setRejectReason('')
    }
  }

  const handleRejectReasonChange = (event: any) => {
    setRejectReason(event.target.value)
  }

  const [expanded, setExpanded] = React.useState('panel1')

  const handleChangeAccordian = (panel: any) => (event: any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false)
  }

  const formik = useFormik({
    initialValues: {
      productId: '',
      productData: '',
      diagnosis: ''
    },
    validationSchema: validationSchema,
    onSubmit: values => { }
  })

  // const data$ = new Observable(subscriber => {
  //   // subscriber.next(sampleData);
  //   subscriber.next(claimReimDetails?.reim?.invoices);
  // });

  const dataSource$ = () => {
    if (claimReimDetails.reim.invoices) {
      return of(claimReimDetails.reim.invoices).pipe(
        map((data: any) => {
          data.content = data

          return data
        })
      )
    } else {
      return
    }
  }

  // const dataSource$ = (
  // ) => {

  //   return reimService.getReimbursementById(id?.id).pipe(
  //     map((data:any) => {
  //       let content = data.invoices;

  //       return content;
  //     }),
  //   );
  // };

  const handleSelectedRows = (selectedClaim: any) => { }

  const configuration: any = {
    enableSelection: true,
    singleSelectionMode: true,
    scrollHeight: '300px',
    pageSize: 10,
    header: {
      enable: true,
      enableDownload: true,

      // downloadbleColumns: xlsColumns,
      text: 'INVOICES',
      onSelectionChange: handleSelectedRows
    }
  }

  const handlePChange = (e: any, value: any) => {
    if (!value) {
      formik.setFieldValue('productData', '')
      formik.setFieldValue('productId', '')
    }

    if (value) {
      formik.setFieldValue('productData', value)
      formik.setFieldValue('productId', value.id)

      // populateProductValues(value.id);
    }
  }

  const handleInputChange = (key: any, value: any) => {
    // setEditedClaimData((prevData) => ({ ...prevData, [key]: value }));
  }

  const handleSubmit = () => { }

  const handleRemarksChange = (event: any) => {
    setRemarks(event.target.value)
  }

  const handleInternalRemarksChange = (event: any) => {
    setInternalRemarks(event.target.value)
  }

  const handleSubmitOpinion = (event: any) => {
    event.preventDefault()

    const payload = {
      opinion: {
        claimStatus: claimStatus,
        remarks: remarks,
        internalRemarks: internalRemarks
      },
      diagnosis: selectedDiagnosis
    }

    if (claimStatus === 'PAYABLE') {
      if (calculationStatus === 'COMPLETED') {
        // if (providerWithApprovedCost?.length) {
        reimService.editDoctorsOpinion(id, payload).subscribe((res: any) => {
          alert("Doctor's opinion submitted successFully! Ready for Claim")
          setShowApprovableDetails(true)
          handleApprove('APPROVED')
        })

        // } else {
        //   alert('Please enter final approve amount!');
        // }
      } else {
        alert('Please calculate first!')
      }
    } else {
      reimService.editDoctorsOpinion(id, payload).subscribe((res: any) => {
        alert(res)
        setShowApprovableDetails(true)
        handleApprove('REJECTED')
      })
    }

    // reimService.editDoctorsOpinion(id?.id, payload).subscribe((res:any) => {
    //   alert(res)
    //   setShowApprovableDetails(true)
    //   handleApprove(claimStatus === "PAYABLE" ? "APPROVED" : "REJECTED")
    // })
  }

  const handleStartReview = () => {
    reimService.editReimbursement({}, id, 'evs').subscribe(r => {
      populateReimbursement()
    })
  }

  const handleCalculate = () => {
    reimService.editReimbursement({}, id, 'calculate').subscribe(r => {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    })
  }

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        const arr: any = []

        result.content.forEach((ele: any) => {
          arr.push({ id: ele.id, diagnosisName: ele.name })
        })
        setter(arr)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(ad$, setDiagnosisList)

  const claimData: any = {
    CLAIM_NO: id,
    CLAIM_DATE: memberData?.claim_date,
    MEMBER_NAME: memberData?.name,
    MEMBERSHIP_NO: memberData?.membershipNo,
    POLICY_NO: memberData?.policyNumber,
    VALIDITY: moment(memberData?.policyEndDate).format('DD/MMM/YYYY'),
    PLAN_NAME: memberData?.PLAN_NAME,
    SCHEME_CATEGORY: memberData?.planScheme,
    CLAIM_TYPE: memberData?.claim_type,
    SUBTYPE: memberData?.claim_subtype,
    CHECKIN_TIME: memberData?.checkinTime,
    CHECKOUT_TIME: memberData?.checkoutTime,
    CLAIMED_AMOUNT: memberData?.claim_amount,
    BARCODE: memberData?.barcode
  }

  const handleApprove = (decission: any) => {
    let comment

    if (decission === 'APPROVED') {
      comment = 'Approve'
    }

    if (decission === 'REJECTED') {
      comment = 'Reject'
    }

    reimService
      .editReimbursement(
        { decission: decission, comment: comment, providersWithApprovedCost: providerWithApprovedCost },
        id,
        'decission'
      )
      .subscribe(r => {
        window.location.reload()
      })
  }

  useEffect(() => {
    const data = initalDiagnosis || diagnosisValues

    const preFilledDiagnosis: any = data?.map((diagnosisId: any) => {
      if (!diagnosisIds.includes(diagnosisId)) {
        return diagnosisList.find((option: any) => option.id === diagnosisId)
      }

      return null
    })

    setDiagnosisIds(preFilledDiagnosis)
    const selectedDiagnosisIds: any = preFilledDiagnosis.map((option: any) => option?.id)

    setSelectedDiagnosis(selectedDiagnosisIds)
  }, [diagnosisValues, diagnosisList])

  const handleDiagnosisChange = (event: any, newValue: any) => {
    setDiagnosisIds(newValue)
    const selectedDiagnosisIds = newValue.map((option: any) => option?.id)

    setSelectedDiagnosis(selectedDiagnosisIds)
  }

  const allSelected =
    diagnosisList &&
    diagnosisList.length > 0 &&
    formik.values.diagnosis &&
    formik.values.diagnosis.length === diagnosisList.length

  const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
  const checkedIcon = <CheckBoxIcon fontSize='small' />

  return (
    <Box>
      <Box className={classes.header}>
        <Typography className={classes.headerTextHead}>Claim to be processed / Doctor&apos;s Opinion</Typography>
      </Box>
      <Box style={{ padding: '20px', background: '#fff' }}>
        <Accordion square expanded={expanded === 'panel1'} onChange={handleChangeAccordian('panel1')}>
          <AccordionSummary className={classes.AccordionSummary} aria-controls='panel1d-content' id='panel1d-header'>
            <Grid container className={classes.accordianBodyHeader}>
              <Typography className={classes.heading}>Claim Details </Typography>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Button className='p-button-text' onClick={() => setIsClaimDetailsEdit(prev => !prev)}>
              {isClaimDetailsEdit ? 'Cancel' : 'Edit'}
            </Button>
            <Grid container className={classes.accordianBody}>
              {Object.entries(keyMappings).map(([displayName, key], index) => (
                <Grid key={index} item xs={6} className={classes.infoText}>
                  <Grid container spacing={2} direction='row'>
                    <Grid item>
                      <Typography className={classes.secondaryHeading}>{displayName} :</Typography>
                    </Grid>
                    <Grid item>
                      {isClaimDetailsEdit ? (
                        <TextField
                          InputProps={{
                            style: { fontSize: '12px', padding: 'none' }
                          }}
                          value={claimData[key]}
                          onChange={e => handleInputChange(key, e.target.value)}
                        />
                      ) : (
                        <Typography className={classes.secondaryHeading}>{claimData[key]}</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              ))}
              {isClaimDetailsEdit && (
                <Grid item xs={12}>
                  <Button onClick={handleSubmit}>Submit</Button>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Grid container>
          <Grid item xs={12} style={{ margin: '16px 0' }}>
            <BreakUpComponents rowData={{ invoices: invoiceData }} providerList={providerList} data={undefined} />
            {/* <FettleDataGrid
            $datasource={dataSource$}
            columnsdefination={columnsDefinations}
            // onEdit={openEditSection}
            config={configuration}
          /> */}
          </Grid>
          <Grid item xs={12} style={{ margin: '16px 0' }}>
            <Box>
              <Box className={classes.opinionBody}>
                <Box style={{ margin: '16px 0' }}>
                  <Box className={classes.opinionHeader} marginTop={'10px'}>
                    <Grid container>
                      <Grid item xs={6} className={classes.headerTextAlign}>
                        <SpeakerNotesIcon color='primary' style={{ color: '#a1a1a1' }} />
                        <Typography className={classes.headerText}>Benefit & Provider Details</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Grid item xs={12} style={{ marginTop: '1em' }}>
                    <span>Benefit: </span>
                  </Grid>

                  <Box>
                    <Grid container>
                      <Grid item xs={4}>
                        <strong>Name</strong>
                      </Grid>
                      <Grid item xs={2}>
                        <strong>Estimated cost</strong>
                      </Grid>
                      <Grid item xs={2}>
                        <strong>System Approved Amount</strong>
                      </Grid>
                      <Grid item xs={2}>
                        <strong>Copay</strong>
                      </Grid>
                      <Grid item xs={2}>
                        <strong>Comment</strong>
                      </Grid>
                    </Grid>

                    {benefitData?.map((bwc: any, index: number) => {
                      return (
                        <Grid container style={{ marginTop: '5px' }} key={index}>
                          <Grid item xs={4}>
                            {bwc.benefitName}
                          </Grid>
                          <Grid item xs={2}>
                            {bwc.estimatedCost}
                          </Grid>
                          <Grid item xs={2}>
                            {bwc.maxApprovedCost}
                          </Grid>
                          <Grid item xs={2}>
                            {bwc.copayAmount}
                          </Grid>
                          <Grid item xs={2}>
                            {bwc.comment}
                          </Grid>
                        </Grid>
                      )
                    })}
                  </Box>

                  <Grid item xs={12} style={{ marginTop: '1em' }}>
                    <span>Invoices: </span>
                  </Grid>

                  <Grid container>
                    <Grid item xs={2}>
                      <strong>Provider Name</strong>
                    </Grid>
                    <Grid item xs={3}>
                      <strong>Invoice Number</strong>
                    </Grid>
                    <Grid item xs={2}>
                      <strong>Total Amount</strong>
                    </Grid>
                    <Grid item xs={3}>
                      <strong>Final Approve Amount</strong>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    {claimReimDetails.reim.invoices &&
                      claimReimDetails.reim.invoices.length !== 0 &&
                      claimReimDetails.reim.invoices.map((provider: any, index: number) => {
                        console.log('provider', provider)

                        return (
                          <Grid container key={index}>
                            <Grid item xs={2}>
                              {provider.providerName}
                            </Grid>
                            <Grid item xs={3}>
                              {provider.invoiceNo}
                            </Grid>
                            <Grid item xs={2}>
                              {provider.invoiceAmount}
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                type='number'
                                id={`approveProviderAmount-${index}`}
                                name={`approveProviderAmount-${index}`}
                                // defaultValue={provider?.approvedCost ? provider?.approvedCost : provider?.maxApprovedCost}
                                // defaultValue={provider?.invoiceAmount}
                                value={provider?.invoiceAmount}
                                disabled
                                // disabled={preAuthDetails.preAuth.preAuthStatus == 'APPROVED'}
                                onChange={e => {
                                  const enteredAmount = parseFloat(e.target.value) // Parse the input as a float

                                  if (enteredAmount > provider.invoiceAmount) {
                                    alert('Entered amount cannot be greater than the invoice amount.')

                                    return // Exit the function to prevent further processing
                                  }

                                  const updatedProviders: any = [...providerWithApprovedCost] // Create a copy of the array

                                  const obj = {
                                    providerId: provider.provideId,
                                    approvedCost: isNaN(enteredAmount) ? 0 : enteredAmount
                                  }

                                  updatedProviders[index] = obj // Update the object at the specified index
                                  setProviderWithApprovedCost(updatedProviders)
                                }}
                              />
                            </Grid>
                          </Grid>
                        )
                      })}
                  </Grid>
                  <Box display={'flex'} justifyContent={'end'}>
                    <Box style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px' }}>
                      <Button
                        color='secondary'
                        disabled={claimReimDetails.reim.reimbursementStatus != 'REQUESTED'}
                        onClick={handleStartReview}
                      >
                        Start Review
                      </Button>
                    </Box>
                    {status === 'EVALUATION_INPROGRESS' && (
                      <Box style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px' }}>
                        <Button
                          className='p-button-secondary'
                          color='secondary'
                          disabled={claimStatus === 'REJECT'}
                          onClick={handleCalculate}
                        >
                          Calculate
                        </Button>
                      </Box>
                    )}
                  </Box>
                  {calculationStatus === 'COMPLETED' && (
                    <p style={{ fontSize: '12px', color: 'grey', textAlign: 'end' }}>
                      Please add final approve amount and claim status to PAYABLE to Approve
                    </p>
                  )}
                </Box>
                <Grid container spacing={2} style={{ margin: '16px 0' }}>
                  <Grid item xs={12} sm={6}>
                    <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
                      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                        <TableHead>
                          <StyledTableRow>
                            <StyledTableCellHeaderAI1>AI Claim Decission</StyledTableCellHeaderAI1>
                            <StyledTableCellHeaderAI1>Confidence(%)</StyledTableCellHeaderAI1>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          <StyledTableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <StyledTableCellRow component='th' scope='row'>
                              Approve
                            </StyledTableCellRow>
                            <StyledTableCellRow>90%</StyledTableCellRow>
                          </StyledTableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
                      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                        <TableHead>
                          <StyledTableRow>
                            <StyledTableCellHeaderAI2>AI Fraud Prediction</StyledTableCellHeaderAI2>
                            <StyledTableCellHeaderAI2>Confidence(%)</StyledTableCellHeaderAI2>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          <StyledTableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <StyledTableCellRow component='th' scope='row'>
                              Not Fraudulent
                            </StyledTableCellRow>
                            <StyledTableCellRow>90%</StyledTableCellRow>
                          </StyledTableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
                {status === 'EVALUATION_INPROGRESS' && (
                  <Box style={{ margin: '16px 0' }}>
                    <Box className={classes.opinionHeader}>
                      <Grid container>
                        <Grid item xs={8} className={classes.headerTextAlign}>
                          <SpeakerNotesIcon color='primary' style={{ color: '#a1a1a1' }} />
                          <Typography className={classes.headerText}>Doctor&apos;s Diagnosis</Typography>
                        </Grid>

                        <Grid item xs={4} className={classes.headerTextAlign}>
                          <LocalHospitalIcon color='primary' style={{ color: '#a1a1a1' }} />
                          <Typography className={classes.headerText}>Doctor&apos;s Opinion</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <form onSubmit={handleSubmitOpinion}>
                      <Grid container>
                        <Grid item xs={8}>
                          <Box marginBottom={'10px'}>
                            <Typography component='h3'>Diagnosis at time of Registration</Typography>
                            {diagnosisList.map((item: any, index: any) => {
                              return (
                                <p key={`diagnosisListData-${index}`} style={{ fontSize: '14px', color: 'grey' }}>
                                  {initalDiagnosis.includes(item?.id) && `-> ${item?.diagnosisName}`}
                                </p>
                              )
                            })}
                          </Box>

                          <FormControl className={classes.formControl}>
                            <Autocomplete
                              className={classes.benifitAutoComplete}
                              multiple
                              value={diagnosisIds}
                              onChange={handleDiagnosisChange}
                              id="diagnosis-autocomplete"
                              options={diagnosisList}
                              disableCloseOnSelect
                              getOptionLabel={(option: any) => option?.diagnosisName || ""}
                              isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                              renderOption={(props: any, option: any, { selected }: { selected: any }) => (
                                <li {...props}>
                                  <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8, color: "#626bda" }}
                                    checked={selected}
                                  />
                                  {option.diagnosisName}
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField {...params} label="Provisional Diagnosis" placeholder="Select Diagnosis" />
                              )}
                            />
                          </FormControl>
                        </Grid>
                        {/* <Divider orientation="vertical" flexItem /><Divider orientation="vertical" flexItem /> */}
                        <Grid item xs={4}>
                          <FormControl className={classes.formControl}>
                            <InputLabel id='demo-simple-select-helper-label'>Claim Status</InputLabel>
                            <Select
                              value={doctorsOpinion?.claimStatus || claimStatus} // Set the initial value here if needed
                              onChange={handleChangeClaimStatus}
                              labelId='demo-simple-select-helper-label'
                              label='Claim Status'
                              id='demo-simple-select-helper'
                            >
                              {options.map((option: any) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                            {claimStatus === 'REJECT' && (
                              <TextField
                                label='Reject Reason'
                                value={doctorsOpinion?.rejectReason || rejectReason}
                                onChange={handleRejectReasonChange}
                                multiline
                                rows={2}
                                variant='outlined'
                                style={{ marginTop: '16px', marginBottom: '16px' }}
                              />
                            )}
                            <TextField
                              label='Remarks'
                              value={doctorsOpinion?.remarks || remarks}
                              onChange={handleRemarksChange}
                              multiline
                              rows={2}
                              variant='outlined'
                              style={{ marginTop: '16px', marginBottom: '16px' }}
                            />
                            <TextField
                              label='Internal Remarks'
                              value={doctorsOpinion?.internalRemarks || internalRemarks}
                              onChange={handleInternalRemarksChange}
                              multiline
                              rows={2}
                              variant='outlined'
                              style={{ marginTop: '16px', marginBottom: '16px' }}
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                      {/* <Box display={"flex"}> */}
                      <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <Button type='submit' color='secondary' disabled={!claimStatus || !remarks}>
                          Save Doctor&apos;s opinion
                        </Button>
                      </Box>
                      {/* {calculationStatus === 'COMPLETED' &&
                  <Box style={{ display: "flex", justifyContent: "flex-end", margin: "10px" }}>
                    <Button variant="contained" color="secondary" disabled={claimStatus !== "PAYABLE" || providerWithApprovedCost?.length === 0} onClick={() => handleApprove('APPROVED')}>Approve</Button>
                  </Box>
                } */}
                      {/* {(calculationStatus === 'FAILED' || claimStatus === "REJECT") &&
                  <Box style={{ display: "flex", justifyContent: "flex-end", margin: "10px" }}>
                    <Button variant="contained" color="secondary" onClick={() => handleApprove('REJECTED')}>Reject</Button>
                  </Box>
                } */}
                      {/* </Box> */}
                    </form>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default ClaimInvoiceList

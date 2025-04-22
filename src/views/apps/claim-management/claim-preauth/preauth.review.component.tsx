import * as React from 'react'
import { useEffect } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import { withStyles } from '@mui/styles'

import 'date-fns'

import { forkJoin } from 'rxjs'

import { InputText } from 'primereact/inputtext'

import { TabPanel, TabView } from 'primereact/tabview'

import { PreAuthService } from '@/services/remote-api/api/claims-services'
import { MemberService } from '@/services/remote-api/api/member-services'
import preAuthReviewModel, { PRE_AUTH_STATUS_MSG_MAP } from './preauth.shared'
import DocumentPreview from './component/preview.thumbnail'

import DialogTable from './component/decision.diagonal'

import { BenefitService, ProvidersService, ServiceTypeService } from '@/services/remote-api/fettle-remote-api'

// import { CheckCircle } from '@mui/icons-material';
// import {CancelIcon} from "@mui/icons-material";

const style: any = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4
}

const keyStyle: any = {
  fontWeight: '800',
  fontSize: '13px',
  color: '#3C3C3C'
}

const valueStyle: any = {
  fontWeight: '500',
  fontSize: '13px',
  color: '#A1A1A1'
}

const commentModalStyle: any = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4
}

const StyledTableCellHeader = withStyles(theme => ({
  head: {
    backgroundColor: '#F1F1F1',
    color: '#A1A1A1',
    padding: '8px'
  },
  body: {
    fontSize: 14
  }
}))(TableCell)

const StyledTableCellHeaderAI2 = withStyles(theme => ({
  head: {
    backgroundColor: '#01de74',
    color: '#f1ff1',
    padding: '8px'
  },
  body: {
    fontSize: 14
  }
}))(TableCell)

const StyledTableCellHeaderAI1 = withStyles(theme => ({
  head: {
    backgroundColor: '#D80E51',
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

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover
    }
  }
}))(TableRow)

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }
const decionData = null

export default function PreAuthReview(props: any) {
  const [preAuthDetails, setPreAuthDetails] = React.useState<any>(preAuthReviewModel())
  const id: any = useParams().id
  const [comment, setComment] = React.useState(null)
  const [cnfText, setCnfText] = React.useState(null)
  const [revertModal, setRevertModal] = React.useState(false)
  const [addDocModal, setAddDocModal] = React.useState(false)
  const [commentModal, setCommentModal] = React.useState(false)
  const [diagnosisList, setDiagnosisList] = React.useState([])
  const [revertReason, setRevertReason] = React.useState()
  const [addDocComment, setAddDocComment] = React.useState()
  const [providerData, setProviderData] = React.useState<any>([])
  const [serviceData, setServiceData] = React.useState<any>([])
  const [benefit, setBenefit] = React.useState([])
  const [reviewDecision, setReviewDecision] = React.useState('')
  const [maxApprovableAmount, setMaxApprovableAmount] = React.useState(0)
  const [providerDetails, setProviderDetails] = React.useState([])
  const [serviceDetails, setServiceDetails] = React.useState<any>([])
  const [memberData, setMemberData] = React.useState<any>()
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [indexD, setIndexD] = React.useState(0)
  const [buttonLoader, setButtonLoader] = React.useState(false);
  const [decionData, setDecionData] = React.useState([])
  const query = useSearchParams()
  const history = useRouter()
  const type = query.get('auth')
  const [open, setOpen] = React.useState(false)
  const preAuthService = new PreAuthService()
  const memberservice = new MemberService()
  const benefitService = new BenefitService()
  const providerService = new ProvidersService()
  const serviceDiagnosis = new ServiceTypeService()

  useEffect(() => {
    if (preAuthDetails.preAuth.calculationStatus === 'COMPLETED') setActiveIndex(2)
  }, [])

  const ad$ = serviceDiagnosis.getServicesbyId('867854874246590464', {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false
  })

  const getDiagnosisData = () => {
    ad$.subscribe(result => {
      const arr: any = []

      result.content.forEach(ele => {
        arr.push({ id: ele.id, diagnosisName: ele.name })
      })
      setDiagnosisList(arr)
    })
  }

  useEffect(() => {
    getDiagnosisData()
  }, [])

  useEffect(() => {
    let sum = 0

    preAuthDetails.preAuth.benefitsWithCost.forEach((item: any) => {
      sum = sum + item?.copayAmount + item?.maxApprovedCost
    })
    setMaxApprovableAmount(sum)
  }, [preAuthDetails])
  console.log(preAuthDetails)
  useEffect(() => {
    if (id) {
      populatePreAuth()
    }
  }, [id])

  useEffect(() => {
    if (preAuthDetails.preAuth.calculationStatus == 'INPROGRESS') {
      setTimeout(() => {
        populatePreAuth()
      }, 500)
    }
  }, [preAuthDetails])

  const populatePreAuth = () => {
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

    const frk$ = forkJoin({
      providers: providerService.getProviders(),
      bts: benefitService.getAllBenefit({ page: 0, size: 1000, summary: true }),
      preAuth: preAuthService.getPreAuthById(id),
      serviceType: serviceDiagnosis.getServiceTypes(),
      services: serviceAll$
    })

    frk$.subscribe((data: any) => {
      // data.providers?.content.forEach(proAll => {
      //   data.preAuth?.providers.forEach(pr => {
      //     if (proAll.id === pr.providerId) {
      //       pr['providerName'] = proAll.providerBasicDetails?.name;
      //     }
      //   });
      //   data.preAuth?.services.forEach(service => {
      //     if (service?.providerId === proAll.id) {
      //       service['provider'] = proAll.providerBasicDetails?.name;
      //     }
      //   });
      // });
      // data.serviceType?.content.forEach(serAll => {
      //   data.preAuth?.services.forEach(service => {
      //     if (service.serviceId === serAll.id) {
      //       service['service'] = serAll?.name;
      //     }
      //   });
      // });
      // data.bts.content.forEach(benall => {
      // data.preAuth.benefitsWithCost.forEach(benefit => {
      //   if (benefit.benefitId === benall.id) {
      //     console.log('asdfghjkl', benefit, benall);
      //     benefit['benefitName'] = benall.name;
      //   }
      // });
      data.providers.content.forEach((proAll: any) => {
        data.preAuth.benefitsWithCost.forEach((benefit: any) => {
          if (proAll.id === benefit.providerId) {
            benefit['providerName'] = proAll.providerBasicDetails?.name
          }
        })
      })

      // data?.preAuth?.services.forEach(service => {
      //   if (service.benifitId === benall.id) {
      //     service['benefitName'] = benall?.name;
      //   }
      // });
      // });
      data.preAuth.benefitsWithCost.forEach((benefit: any) => {
        const bts$ = benefitService.getBenefitInterventions(benefit.benefitId)

        bts$.subscribe((result: any) => {
          result.forEach((el: any) => {
            if (el.interventionId === benefit.interventionCode) {
              benefit.interventionName = el.name
            }
          })
        })
      })

      data.preAuth.benefitsWithCost.forEach((benefit: any) => {
        const bts$ = benefitService.getServicesfromInterventions(benefit.interventionCode, benefit.benefitId)

        bts$.subscribe((result: any) => {
          result.forEach((el: any) => {
            if (el.code === benefit.diagnosis) {
              benefit['diagnosisName'] = el?.name
            }
          })
        })
      })

      // let serviceList = [];
      // data?.services.forEach(ser => {
      //   ser?.content.forEach(sr => {
      //     serviceList.push(sr);
      //   });
      // });
      // serviceList?.forEach(ser => {
      //   data?.preAuth?.services.forEach(service => {
      //     if (service.expenseHead === ser.id) {
      //       service['expense'] = ser.name;
      //     }
      //   });
      // });
      // console.log("data",data)
      const pageRequest = {
        page: 0,
        size: 10,
        summary: true,
        active: true,
        key: 'MEMBERSHIP_NO',
        value: data.preAuth.memberShipNo,
        key1: 'policyNumber',
        value1: data.preAuth.policyNumber
      }

      const obj: any = { preAuth: data.preAuth }

      memberservice.getMember(pageRequest).subscribe((res: any) => {
        if (res.content?.length > 0) {
          setMemberData(res?.content[0])
          const member = res?.content[0]

          obj.member = member
        }
      })
      console.log(obj)
      setPreAuthDetails(obj)
      setProviderDetails(obj.preAuth.providers)
      setBenefit(data.bts.content)
    })
  }

  const handleApproveProviderAmount = (e: any, provider: any, benefitId: any) => {
    const { id, value } = e.target

    // Ensure that the value is a valid number
    const newValue = parseFloat(value)

    if (isNaN(newValue)) {
      return // Do nothing if the input is not a valid number
    }

    if (provider && provider.benefit) {
      const exceedsEstimatedCost = provider.benefit.some((el: any) => {
        if (el?.benefitId === benefitId) {
          if (newValue > el.estimatedCost) {
            alert('Approved amount cannot exceed estimated amount!')
            const providerIndex = providerData.findIndex((item: any) => item.providerId === provider.providerId)

            if (providerIndex !== -1) {
              const updatedProviderData: any = [...providerData]

              const benefitIndex = updatedProviderData[providerIndex]?.benefit?.findIndex(
                (item: any) => item.benefitId === benefitId
              )

              updatedProviderData[providerIndex].benefit[benefitIndex].approvedCost = newValue
              setProviderData(updatedProviderData)
            } else {
              // If the provider is not in the array, add it
              const newProvider = {
                providerId: provider.providerId,
                benefit: provider.benefit
              }

              provider.benefit.some((el: any) => {
                if (el?.benefitId === benefitId) {
                  el.approvedCost = newValue
                }
              })
              setProviderData([...providerData, newProvider])
            }

            return true // Stop iteration and return true if the condition is met
          } else {
            const providerIndex = providerData.findIndex((item: any) => item.providerId === provider.providerId)

            if (providerIndex !== -1) {
              const updatedProviderData: any = [...providerData]

              const benefitIndex = updatedProviderData[providerIndex]?.benefit?.findIndex(
                (item: any) => item.benefitId === benefitId
              )

              updatedProviderData[providerIndex].benefit[benefitIndex].approvedCost = newValue
              setProviderData(updatedProviderData)
            } else {
              // If the provider is not in the array, add it
              const newProvider = {
                providerId: provider.providerId,
                benefit: provider.benefit
              }

              provider.benefit.some((el: any) => {
                if (el?.benefitId === benefitId) {
                  el.approvedCost = newValue
                }
              })
              setProviderData([...providerData, newProvider])
            }
          }
        }

        return false // Continue iteration if the condition is not met
      })

      if (exceedsEstimatedCost) {
        return // Do nothing if the approvedCost exceeds the estimatedCost
      }
    }
  }

  const handleApproveServiceAmount = (e: any, service: any) => {
    const { id, value } = e.target

    // Ensure that the value is a valid number
    const newValue = parseFloat(value)

    if (isNaN(newValue)) {
      return // Do nothing if the input is not a valid number
    }

    // Ensure that the approvedCost is not greater than the estimatedCost
    if (newValue > service.estimatedCost) {
      alert('Approved amount cannot exceed estimated amount!')

      return // Do nothing if the approvedCost exceeds the estimatedCost
    }

    const serviceIndex = serviceData.findIndex((item: any) => item.serviceId === service.serviceId)

    if (serviceIndex !== -1) {
      // If the provider is already in the array, update its approvedCost
      const updatedServiceData: any = [...serviceData]

      updatedServiceData[serviceIndex].approvedCost = newValue
      setServiceData(updatedServiceData)
    } else {
      // If the provider is not in the array, add it
      const newService = {
        ...service,
        approvedCost: newValue
      }

      setServiceData([...serviceData, newService])
    }
  }

  const requestForCalculate = () => {
    setButtonLoader(true);
    preAuthService.editPreAuth({}, id, 'calculate').subscribe(r => {
      // window.location.reload();
      setTimeout(() => {
        populatePreAuth()
        setButtonLoader(false);
      }, 2500);
    })
  }

  const requestForStartReview = () => {
    setButtonLoader(true);
    preAuthService.editPreAuth({}, id, 'evs').subscribe(r => {
      setTimeout(() => {
        populatePreAuth()
        setButtonLoader(false);
      }, 2500);
    })
  }

  const showCalculateButton = () => {
    return (
      (preAuthDetails.preAuth.preAuthStatus == 'EVALUATION_INPROGRESS' ||
        preAuthDetails.preAuth.preAuthStatus == 'ENHANCEMENT_REQUESTED' ||
        preAuthDetails.preAuth.preAuthStatus == 'SURVEILANCE_NOT_NEEDED' ||
        preAuthDetails.preAuth.preAuthStatus == 'GATEKEPING_DOCTOR_APPROVED') &&
      preAuthDetails.preAuth.calculationStatus != 'COMPLETED' && (
        <Button
        onClick={requestForCalculate}
        disabled={preAuthDetails.preAuth.calculationStatus == 'INPROGRESS'}
        variant="contained"
        color="primary"
        style={{ border: 'none' }}>
        {buttonLoader ? <CircularProgress style={{ width: "20px", height: "20px" }} color="secondary" /> : preAuthDetails.preAuth.calculationStatus == 'INPROGRESS' ? 'Calculating...' : 'Calculate'}
      </Button>
      )
    )
  }

  const showReviewStartButton = () => {
    return (
      (preAuthDetails.preAuth.preAuthStatus == 'PRE_AUTH_REQUESTED' ||
        preAuthDetails.preAuth.preAuthStatus == 'ADD_DOC_SUBMITTED' ||
        preAuthDetails.preAuth.preAuthStatus == 'REQUESTED' ||
        preAuthDetails.preAuth.preAuthStatus == 'SURVEILANCE_NOT_NEEDED') && (
        <Button variant="contained" color="primary" onClick={requestForStartReview} style={{ border: 'none' }}>
          {buttonLoader ? <CircularProgress style={{ width: "20px", height: "20px" }} color="secondary" /> : "Start Review"}
        </Button>
      )
    )
  }

  const onDecission = (decission: any) => {
    if ((decission == 'APPROVED' && cnfText === 'approve') || (decission == 'REJECTED' && cnfText === 'reject')) {
      let isEveryAmountIsRight = true

      preAuthDetails.preAuth.benefitsWithCost.forEach((ele: any) => {
        let sum = 0

        providerData.forEach((item: any) => {
          if (item && item.benefit) {
            item.benefit.forEach((el: any) => {
              if (el.benefitId === ele.benefitId) {
                sum += el.approvedCost || 0 // Add the approvedCost to sum, defaulting to 0 if it's undefined

                if (sum > ele.maxApprovedCost) {
                  isEveryAmountIsRight = false
                  alert(`${ele?.benefitName}'s approved amount is less than your provider's benefit total`) // Display an alert if sum exceeds maxApprovedCost
                }
              }
            })
          }
        })
      })

      const temp = preAuthDetails?.preAuth?.benefitsWithCost.map((el: any) => ({
        ...el,
        approvedCost: el.maxApprovedCost
      }))

      if (isEveryAmountIsRight) {
        const payload: any = {
          decission: decission,
          comment: comment
        }

        if (decission == 'APPROVED') {
          payload.providersWithApprovedCost = providerData

          // payload.approveAmounts = serviceData;    // temp removed
          payload.approveAmounts = temp
        }

        // console.log('abcd', payload, temp, serviceData);
        preAuthService.editPreAuth(payload, id, 'decission').subscribe(r => {
          setCommentModal(false)
          alert(decission == 'APPROVED' ? 'Approved!' : 'Rejected!')
          setTimeout(() => {
            populatePreAuth()
          }, 500)
        })
      } else {
        setCommentModal(false)
      }
    }
  }

  const showApprovedAndRejectButtons = () => {
    if (
      preAuthDetails.preAuth.preAuthStatus == 'PRE_AUTH_REQUESTED' ||
      preAuthDetails.preAuth.preAuthStatus == 'REQUESTED' ||
      preAuthDetails.preAuth.preAuthStatus == 'APPROVED_FAILED' ||
      preAuthDetails.preAuth.preAuthStatus == 'EVALUATION_INPROGRESS' ||
      preAuthDetails.preAuth.preAuthStatus == 'ENHANCEMENT_REQUESTED' ||
      preAuthDetails.preAuth.preAuthStatus == 'SURVEILANCE_NOT_NEEDED' ||
      preAuthDetails.preAuth.preAuthStatus == 'GATEKEPING_DOCTOR_APPROVED'
    ) {
      const approveCostSum: any = () => {
        return (
          preAuthDetails?.preAuth?.benefitsWithCost?.reduce(
            (total: any, benefit: any) => total + (benefit.maxApprovedCost || 0),
            0
          ) > 0
        )
      }

      return (
        <React.Fragment>
          <Box
            style={{
              cursor:
                preAuthDetails.preAuth.calculationStatus != 'COMPLETED' || !(approveCostSum() > 0)
                  ? 'not-allowed'
                  : 'pointer'
            }}
          >
            <Button
              style={{
                color: '#FAFAFA',
                background: '#01de74',
                margin: '0 10px',
                opacity: preAuthDetails.preAuth.calculationStatus != 'COMPLETED' ? '0.3' : '1',
                border: 'none'
              }}
              variant='contained'
              color='primary'
              disabled={preAuthDetails.preAuth.calculationStatus != 'COMPLETED' || !(approveCostSum() > 0)}
              onClick={() => {
                setCommentModal(true)
                setReviewDecision('APPROVED')
              }}
            >
              Approve
            </Button>
          </Box>
          <Button
            variant='contained'
            color='secondary'
            style={{ background: '#ff3243', color: '#fafafa', border: 'none' }}
            onClick={() => {
              setCommentModal(true)
              setReviewDecision('REJECTED')
            }}
          >
            Reject
          </Button>
        </React.Fragment>
      )
    } else {
      return null
    }
  }

  const onConfirmRevert = () => {
    const payload = {
      remark: revertReason
    }

    preAuthService.revertPreAuth(payload, id).subscribe(res => {
      setButtonLoader(true);
      setTimeout(() => {
        // window.location.reload();
        populatePreAuth()
        setButtonLoader(false);
      }, 2500);
    })
  }

  const onAddDoc = () => {
    const payload = {
      remark: addDocComment
    }

    alert('Add More Docs')
    preAuthService.requestMoreDocsPreAuth(payload, id).subscribe(res => {
      history.push(`/claims/claims-preauth?mode=viewList`)
    })
  }

  const showRevertedButton = () => {
    if (
      preAuthDetails.preAuth.calculationStatus == 'REQUESTED' ||
      preAuthDetails.preAuth.calculationStatus == 'IN REVIEW' ||
      preAuthDetails.preAuth.preAuthStatus == 'EVALUATION_INPROGRESS' ||
      preAuthDetails.preAuth.preAuthStatus == 'SURVEILANCE_NOT_NEEDED' ||
      preAuthDetails.preAuth.preAuthStatus == 'GATEKEPING_DOCTOR_APPROVED'
    ) {
      return (
        <React.Fragment>
          <Button
            onClick={() => {
              setRevertModal(true)
            }}
            variant='contained'
            style={{ background: '', color: '#f1f1f1', marginLeft: '10px', border: 'none' }}
          >
            Revert
          </Button>
        </React.Fragment>
      )
    } else {
      return null
    }
  }

  const showAddMoreDoucmentsButton = () => {
    if (
      preAuthDetails.preAuth.calculationStatus == 'REQUESTED' ||
      preAuthDetails.preAuth.calculationStatus == 'IN REVIEW' ||
      preAuthDetails.preAuth.preAuthStatus == 'EVALUATION_INPROGRESS' ||
      preAuthDetails.preAuth.preAuthStatus == 'SURVEILANCE_NOT_NEEDED' ||
      preAuthDetails.preAuth.preAuthStatus == 'GATEKEPING_DOCTOR_APPROVED'
    ) {
      return (
        <React.Fragment>
          <Button
            onClick={() => {
              setAddDocModal(true)
            }}
            variant='contained'
            style={{ background: '#5D5D5D', color: '#f1f1f1', marginLeft: '10px', border: 'none' }}
          >
            Add More Docs
          </Button>
        </React.Fragment>
      )
    } else {
      return null
    }
  }

  const showReviewerComment = () => {
    if (preAuthDetails.preAuth.preAuthStatus == 'APPROVED' || preAuthDetails.preAuth.preAuthStatus == 'REJECTED') {
      return (
        <div style={{ padding: '5px' }}>
          <strong>Reviewer comment</strong>
          <Divider />
          <Grid container>
            <Grid item xs={12}>
              <p>{preAuthDetails.preAuth.comment}</p>
            </Grid>
          </Grid>
        </div>
      )
    } else {
      return null
    }
  }

  const handleDecision = (id: any) => {
    // let id = preAuthDetails?.preAuth?.benefitsWithCost[0]?.decisionId;
    memberservice.getDecsion(id).subscribe((res: any) => {
      const arr: any = decionData

      arr.push([res.benefitResponseDTO[0]])
      setDecionData(arr)
    })

    // setOpen(true);
  }

  // useEffect(() => {
  //   if (preAuthDetails?.preAuth?.benefitsWithCost[0]?.benefitId != '') {
  //     preAuthDetails.preAuth.benefitsWithCost.forEach( (item:any) => {
  //       handleDecision(item?.decisionId);
  //     });
  //   }
  // }, [preAuthDetails]);

  const handleChangeOfDecitionText = (event: any) => {
    setCnfText(event.target.value)
  }

  const handleChangeOfCommentText = (event: any) => {
    setComment(event.target.value)
  }

  const showCommentBox = () => {
    if (
      preAuthDetails.preAuth.preAuthStatus == 'EVALUATION_INPROGRESS' ||
      preAuthDetails.preAuth.preAuthStatus == 'APPROVED_FAILED' ||
      preAuthDetails.preAuth.preAuthStatus == 'ENHANCEMENT_REQUESTED' ||
      preAuthDetails.preAuth.preAuthStatus == 'SURVEILANCE_NOT_NEEDED' ||
      preAuthDetails.preAuth.preAuthStatus == 'GATEKEPING_DOCTOR_APPROVED'
    ) {
      return (
        <Modal
          open={commentModal}
          onClose={() => {
            setCommentModal(false)
          }}
        >
          <Box sx={commentModalStyle}>
            <div>
              <h2>Reviewer input</h2>
              <Divider />
              <Grid container rowSpacing={5}>
                <Grid item xs={12} style={{ marginBottom: '5px' }}>
                  <TextField
                    required
                    fullWidth
                    label='Type approve or reject for respective operation'
                    id='fullWidth'
                    onChange={handleChangeOfDecitionText}
                  />
                </Grid>

                <Grid item xs={12} style={{ marginTop: '5px' }}>
                  <TextField
                    required
                    id='filled-multiline-static'
                    label='Add comment'
                    multiline
                    fullWidth
                    minRows={4}
                    variant='filled'
                    onChange={handleChangeOfCommentText}
                  />
                </Grid>
              </Grid>
            </div>
            <Button
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', border: 'none' }}
              color='primary'
              variant='contained'
              onClick={() => {
                onDecission(reviewDecision)
              }}
            >
              Submit
            </Button>
          </Box>
        </Modal>
      )
    }
  }

  const BasicDetails = () => {
    return (
      <div>
        <div style={{ padding: '5px' }}>
          <strong style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Member details</strong>
          <Divider />

          <Grid container spacing={0.5} style={{ gap: '8px 0' }}>
            <Grid item xs={12} sm={6} style={{ marginTop: '10px' }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Membership No: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.membershipNo}</span>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6} style={{ marginTop: '10px' }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Name: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.name}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Age: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.age}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Gender: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.gender}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Relations: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.relations}</span>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div style={{ padding: '5px', marginTop: '10px' }}>
          <strong style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Policy details</strong>
          <Divider />

          <Grid container spacing={0.5} style={{ gap: '8px 0' }}>
            <Grid item xs={12} sm={6} style={{ marginTop: '10px' }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Policy No: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.policyNumber}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5} style={{ marginTop: '10px' }}>
                <Grid item xs={4} style={keyStyle}></Grid>
                <Grid item xs={8} style={valueStyle}></Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Policy start date: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{new Date(memberData?.policyStartDate).toLocaleDateString()}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Policy end date: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{new Date(memberData?.policyEndDate).toLocaleDateString()}</span>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    )
  }

  const OtherDetails = () => {
    return (
      <>
        <div style={{ padding: '5px' }}>
          <strong style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Other details</strong>
          <Divider />

          <Grid container spacing={0.5} rowSpacing={1} style={{ gap: '8px 0' }}>
            <Grid item xs={12} sm={6} style={{ marginTop: '10px' }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Date of admission: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{new Date(preAuthDetails?.preAuth?.expectedDOA).toLocaleDateString()}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5} style={{ marginTop: '10px' }}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Date of discharge: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{new Date(preAuthDetails?.preAuth?.expectedDOD).toLocaleDateString()}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Contact No1: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{preAuthDetails?.preAuth?.contactNoOne}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Contact No2: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{preAuthDetails?.preAuth?.contactNoTwo || 'NA'}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Diagnosis: </span>
                </Grid>

                <Grid item xs={8} style={valueStyle}>
                  <ul>
                    {diagnosisList?.map((item: any) => {
                      const matchingDiagnoses = preAuthDetails.preAuth.diagnosis?.filter((d: any) => item.id === d)

                      if (matchingDiagnoses?.length) {
                        return matchingDiagnoses.map((matchingDiagnosis: any) => (
                          <li key={matchingDiagnosis}>{item.diagnosisName}</li>
                        ))
                      } else {
                        return null
                      }
                    })}
                  </ul>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </>
    )
  }

  const ClaimDetails = () => {
    return (
      <>
        <div style={{ padding: '5px' }}>
          {/* <Grid item xs={12} style={{ marginTop: '1em' }}>
            <span style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Benefits: </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
            <Table aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated cost</StyledTableCellHeader>
                  <StyledTableCellHeader>Approved</StyledTableCellHeader>
                  <StyledTableCellHeader>Copay</StyledTableCellHeader>
                  <StyledTableCellHeader>Comment</StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth?.benefitsWithCost[0].benefitId ? (
                  preAuthDetails?.preAuth?.benefitsWithCost?.map(row => (
                    <StyledTableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <StyledTableCellRow component="th" scope="row">
                        {row.benefitName}
                      </StyledTableCellRow>
                      <StyledTableCellRow>{row.estimatedCost}</StyledTableCellRow>
                      <StyledTableCellRow>{row.maxApprovedCost}</StyledTableCellRow>
                      <StyledTableCellRow>{row.copayAmount}</StyledTableCellRow>
                      <StyledTableCellRow>{row.comment || 'NA'}</StyledTableCellRow>
                    </StyledTableRow>
                  ))
                ) : (
                  <p style={{ color: '#3c3c3c', padding: '1%' }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid item xs={12} style={{ marginTop: '1em' }}>
            <span style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Providers: </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
            <Table aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated cost</StyledTableCellHeader>
                  {type == 'IPD' && <StyledTableCellHeader>Benefit Details</StyledTableCellHeader>}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {providerDetails?.length ? (
                  providerDetails?.map(row => {
                    return (
                      <StyledTableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <StyledTableCellRow component="th" scope="row">
                          {row.providerName}
                        </StyledTableCellRow>
                        <StyledTableCellRow>{row.estimatedCost}</StyledTableCellRow>
                        <StyledTableCellRow>
                          <Grid container>
                            <Grid item xs={6} style={keyStyle}>
                              Benefit
                            </Grid>
                            <Grid item xs={3} style={keyStyle}>
                              Estimated Cost
                            </Grid>
                            <Grid item xs={3} style={keyStyle}>
                              Approved Amount
                            </Grid>
                          </Grid>
                          {row?.benefit.map((ele, idx) => {
                            let p = benefit.find(itm => itm?.id == ele?.benefitId);
                            // const [value, setValue] = React.useState(
                            //   preAuthDetails.preAuth.preAuthStatus != 'ENHANCEMENT_REQUESTED' && ele?.approvedCost,
                            // );
                            const handleInputChange = e => {
                              // const updatedProviders = providerDetails.map( (item:any) => {
                              //   return {
                              //     ...item,
                              //     benefit: item.benefit.map(el => {
                              //       if (item.providerId === row.providerId) {
                              //         if (el.benefitId === ele.benefitId)
                              //           if (ele.estimatedCost >= e.target.value) {
                              //             return {
                              //               ...el,
                              //               approvedCost: e.target.value,
                              //             };
                              //           } else {
                              //             return {
                              //               ...el,
                              //               approvedCost: 0,
                              //             };
                              //           }
                              //       }
                              //       return el;
                              //     }),
                              //   };
                              // });
                              // setProviderDetails(updatedProviders);
                              handleApproveProviderAmount(e, row, ele.benefitId);
                            };
                            return (
                              <Grid container>
                                <Grid item xs={6} style={valueStyle}>
                                  <p>{p?.name}</p>
                                </Grid>
                                <Grid item xs={3} style={valueStyle}>
                                  {ele.estimatedCost}
                                </Grid>
                                <Grid item xs={3} style={valueStyle}>
                                  <input
                                    className="p-inputtext-xs"
                                    type="number"
                                    // value={value}
                                    defaultValue={
                                      preAuthDetails.preAuth.preAuthStatus != 'ENHANCEMENT_REQUESTED' && ele?.approvedCost
                                    }
                                    id={`approveProviderAmount-${ele.benefitId}`}
                                    name={`approveProviderAmount-${ele.benefitId}`}
                                    disabled={preAuthDetails.preAuth.preAuthStatus != 'EVALUATION_INPROGRESS'}
                                    // onChange={e => handleApproveProviderAmount(e, row, ele.benefitId)}
                                    // onChange={e => setValue(e.target.value)}
                                    onBlur={e => handleApproveProviderAmount(e, row, ele.benefitId)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      borderBottom: '1px solid',
                                      height: '15px',
                                      width: '100%',
                                      borderRadius: '0',
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            );
                          })}
                        </StyledTableCellRow>
                      </StyledTableRow>
                    );
                  })
                ) : (
                  <p style={{ color: '#3c3c3c', padding: '1%' }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer> */}
          <Grid item xs={12} style={{ marginTop: '1em' }}>
            <span style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Service Details: </span>
          </Grid>
          <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
            <Table aria-label='simple table'>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Provider Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Benefit Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Intervention</StyledTableCellHeader>
                  <StyledTableCellHeader>Diagnosis</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated Cost</StyledTableCellHeader>
                  <StyledTableCellHeader>System Approved Amount</StyledTableCellHeader>
                  <StyledTableCellRow>Comment</StyledTableCellRow>
                  <StyledTableCellHeader>Approved Amount</StyledTableCellHeader>
                  {/* <StyledTableCellHeader>Tarrif Amount</StyledTableCellHeader> */}
                  {/* <StyledTableCellHeader>Decision</StyledTableCellHeader> */}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth?.benefitsWithCost[0]?.benefitId ? (
                  preAuthDetails?.preAuth?.benefitsWithCost?.map((row: any, i: number) => {
                    const value = row?.approvedCost

                    return (
                      <StyledTableRow key={row?.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <StyledTableCellRow component='th' scope='row' style={valueStyle}>
                          {row?.providerName}
                        </StyledTableCellRow>
                        <StyledTableCellRow component='th' scope='row' style={valueStyle}>
                          {row?.benefitName}
                        </StyledTableCellRow>
                        <StyledTableCellRow component='th' scope='row' style={valueStyle}>
                          {row?.interventionName || '-'}
                        </StyledTableCellRow>
                        <StyledTableCellRow component='th' scope='row' style={valueStyle}>
                          {row?.diagnosisName || '-'}
                        </StyledTableCellRow>
                        <StyledTableCellRow style={valueStyle}>{row?.estimatedCost}</StyledTableCellRow>
                        <StyledTableCellRow style={valueStyle}>{row?.maxApprovedCost}</StyledTableCellRow>
                        <StyledTableCellRow>{row?.comment || 'NA'}</StyledTableCellRow>
                        <StyledTableCellRow style={valueStyle}>
                          <InputText
                            className='p-inputtext-sm'
                            type='number'
                            defaultValue={
                              row?.approvedCost
                                ? row?.approvedCost
                                : serviceData[i]?.approvedCost
                                  ? serviceData[i]?.approvedCost
                                  : row?.maxApprovedCost
                            }
                            // defaultValue={value}
                            readOnly={true}
                            id={`approveServiceAmount-${row?.benefitId}`}
                            name={`approveServiceAmount-${row?.benefitId}`}
                            disabled={preAuthDetails?.preAuth?.preAuthStatus == 'APPROVED'}
                            onBlur={e => {
                              const updatedService = serviceDetails?.map((item: any) => {
                                if (item?.serviceId == row?.serviceId) {
                                  item.approvedCost = e.target.value
                                }

                                return item
                              })

                              setServiceDetails(updatedService)
                              handleApproveServiceAmount(e, row)
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              borderBottom: '1px solid',
                              height: '15px',
                              borderRadius: '0'
                            }}
                          />
                        </StyledTableCellRow>

                        {/* <StyledTableCellRow>
                          {decionData?.benefitResponseDTO?.length ? decionData?.benefitResponseDTO[0]?.tariffs : 'NA'}
                        </StyledTableCellRow> */}
                        {/* {decionData?.length ? (
                          <StyledTableCellRow style={valueStyle}>
                            {decionData[i][0]?.finalApproval === 'APPROVED' ? (
                              <CheckCircle
                                style={{ color: 'green', cursor: 'pointer' }}
                                onClick={() => {
                                  setIndexD(i);
                                  setOpen(true);
                                }}
                              />
                            ) : decionData[i][0]?.finalApproval === 'REJECTED' ? (
                              <CancelOutlined
                                style={{ color: 'red', cursor: 'pointer' }}
                                onClick={() => {
                                  setIndexD(i);
                                  setOpen(true);
                                }}
                              />
                            ) : (
                              <WatchLater style={{ color: 'orange', cursor: 'pointer' }} />
                            )}
                          </StyledTableCellRow>
                        ) : null} */}
                      </StyledTableRow>
                    )
                  })
                ) : (
                  <p style={{ color: '#3c3c3c', padding: '1%' }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogTable open={open} setOpen={setOpen} data={decionData[indexD]} finalApproval={decionData[indexD]} />

          <Grid item xs={12} style={{ marginTop: '1em' }}>
            <span style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>AI Model Prediction</span>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
                <Table style={{ minWidth: '350px !important', overflow: 'hidden' }} aria-label='simple table'>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCellHeaderAI1>AI Claim Decission</StyledTableCellHeaderAI1>
                      <StyledTableCellHeaderAI1>Confidence(%)</StyledTableCellHeaderAI1>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <StyledTableCellRow component='th' scope='row'>
                        --
                      </StyledTableCellRow>
                      <StyledTableCellRow>--</StyledTableCellRow>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper} style={{ borderRadius: '8px' }}>
                <Table aria-label='simple table'>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCellHeaderAI2>AI Fraud Prediction</StyledTableCellHeaderAI2>
                      <StyledTableCellHeaderAI2>Confidence(%)</StyledTableCellHeaderAI2>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <StyledTableCellRow component='th' scope='row'>
                        --
                      </StyledTableCellRow>
                      <StyledTableCellRow>--</StyledTableCellRow>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Grid item xs={12}></Grid>
        </div>
      </>
    )
  }

  const DocumentDetails = () => {
    return (
      <>
        <Grid item xs={12} style={{ marginTop: '1em' }}>
          <span style={{ color: '#D80E51', fontWeight: 'bold', fontSize: '13px' }}>Docs: </span>
        </Grid>
        <Grid item xs={12}>
          <DocumentPreview documents={preAuthDetails.preAuth.documents} preAuthId={preAuthDetails.preAuth.id} />
        </Grid>
      </>
    )
  }

  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Grid item xs={6} style={{ marginLeft: '10px' }}>
          <span style={{ color: '#D80E51', fontWeight: 'bold' }}>Preauth</span>: {id}
        </Grid>
        <Grid item xs={6} style={{ marginRight: '10px' }}>
          <span style={{ color: '#D80E51', fontWeight: 'bold' }}>Status</span>:{' '}
          {PRE_AUTH_STATUS_MSG_MAP[preAuthDetails.preAuth.preAuthStatus as keyof typeof PRE_AUTH_STATUS_MSG_MAP]}
        </Grid>
      </Box>

      <TabView
        scrollable
        style={{ fontSize: '14px', marginTop: '10px', borderRadius: '8px 8px 0 0' }}
        activeIndex={activeIndex}
        onTabChange={e => setActiveIndex(e.index)}
      >
        <TabPanel leftIcon='pi pi-user mr-2' header='Basic details'>
          <BasicDetails />
        </TabPanel>
        <TabPanel leftIcon='pi pi-user-minus mr-2' header='Other Details'>
          <OtherDetails />
        </TabPanel>
        <TabPanel leftIcon='pi pi-money-bill mr-2' header='Claim Details'>
          <ClaimDetails />
        </TabPanel>
        <TabPanel leftIcon='pi pi-file-pdf mr-2' header='Documents'>
          <DocumentDetails />
        </TabPanel>
      </TabView>

      {type == 'IPD' && query.get('mode') !== 'viewOnly' && (
        <Grid container style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          {showReviewStartButton()}
          {showCalculateButton()}
          {showRevertedButton()}
          {showAddMoreDoucmentsButton()}
          {showApprovedAndRejectButtons()}
        </Grid>
      )}

      <Grid container>
        {showCommentBox()}

        {showReviewerComment()}
      </Grid>

      <Modal
        open={revertModal}
        onClose={() => {
          setRevertModal(false)
        }}
      >
        <Box sx={style}>
          <div style={{ padding: '5px' }}>
            <strong>Revert Reason</strong>
            <Grid container rowSpacing={5} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <TextField
                  required
                  id='filled-multiline-static'
                  label='Add comment'
                  multiline
                  fullWidth
                  minRows={4}
                  variant='filled'
                  onChange={(e: any) => {
                    setRevertReason(e.target.value)
                  }}
                />
              </Grid>
            </Grid>
          </div>
          <Box display={'flex'} justifyContent={'end'} marginTop={'15px'}>
          <Button variant="contained" color="primary" onClick={onConfirmRevert}>
              {buttonLoader ? <CircularProgress style={{ width: "20px", height: "20px" }} color="secondary" /> : "Submit"}
            </Button>
            <Button
              variant='text'
              className='p-button-text'
              onClick={() => {
                setRevertModal(false)
              }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={addDocModal}
        onClose={() => {
          setAddDocModal(false)
        }}
      >
        <Box sx={style}>
          <div style={{ padding: '5px' }}>
            <strong>Requirement</strong>
            <Grid container rowSpacing={5} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <TextField
                  required
                  id='filled-multiline-static'
                  label='Add comment'
                  multiline
                  fullWidth
                  minRows={4}
                  variant='filled'
                  onChange={(e: any) => {
                    setAddDocComment(e.target.value)
                  }}
                />
              </Grid>
            </Grid>
          </div>
          <Box display={'flex'} justifyContent={'end'} marginTop={'15px'}>
            <Button variant='contained' color='primary' onClick={onAddDoc}>
              Submit
            </Button>
            <Button
              variant='text'
              className='p-button-text'
              onClick={() => {
                setAddDocModal(false)
              }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

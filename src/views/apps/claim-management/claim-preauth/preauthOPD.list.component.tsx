

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import { forkJoin } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { Box, Grid, Modal, TextField, Tooltip, Typography, useTheme } from '@mui/material'

import { CloseOutlined } from '@mui/icons-material'

import { Button } from 'primereact/button'

import { TreeItem, TreeView } from '@mui/lab'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { PreAuthService } from '@/services/remote-api/api/claims-services'
import { MemberService } from '@/services/remote-api/api/member-services'
import PreAuthTimeLineModal from './modals/preauth.timeline.modal.component'
import preAuthReviewModel, { PRE_AUTH_STATUS_MSG_MAP } from './preauth.shared'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { PoliticalDot, VIPDot } from '../common/dot.comnponent'

import { BenefitService, ProvidersService, ServiceTypeService } from '@/services/remote-api/fettle-remote-api'
import RoleService from '@/services/utility/role'
import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

// localStorage.removeItem('preauthid')
const roleService = new RoleService()

const PAGE_NAME = 'PRE_AUTH'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const modalStyle: any = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  background: '#fff',

  // border: '2px solid #000',
  boxShadow: '24',
  padding: '2% 3%'
}

const useStyles = makeStyles(theme => ({
  tableBg: {
    height: 505,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  agentListButton: {
    marginLeft: '5px'
  },
  categoryButton: {
    marginLeft: '5px',
    marginBottom: '5px'
  },
  root: {}
}))

const memberservice = new MemberService()
const preAuthService = new PreAuthService()
const benefitService = new BenefitService()
const providerService = new ProvidersService()
const serviceDiagnosis = new ServiceTypeService()

const getColor = (status: any) => {
  switch (status) {
    case 'Pending Evaluation':
      return { background: 'rgba(149,48,55,0.5)', border: 'rgba(149,48,55,1)' }
    case 'Evaluation in progress':
      return {
        background: 'rgba(255, 252, 127, 0.5)'
      }
    case 'Requested for evaluation':
      return {
        background: '#002776',
        border: 'rgba(4, 59, 92, 1)',
        color: '#f1f1f1'
      }
    case 'Approved':
      return {
        background: 'rgba(1, 222, 116, 0.5)',
        border: 'rgba(1, 222, 116, 1)'
      }
    case 'Rejected':
      return { background: 'rgba(255,50,67,0.5)', border: 'rgba(255,50,67,1)' }
    case 'Document Requested':
      return {
        background: '#ffc107',
        color: '#212529'
      }
    case 'Approved failed':
      return { background: 'rgb(139, 0, 0,0.5)', border: 'rgb(139, 0, 0)' }
    case 'Draft':
      return {
        background: '#17a2b8',
        color: '#f1f1f1'
      }
    case 'Waiting for Claim':
      return {
        background: '#ffc107',
        color: '#212529'
      }
    case 'Cancelled':
      return { background: '#c70000', color: '#f1f1f1' }
    case 'Reverted':
      return {
        background: '#808000',
        color: '#f1f1f1'
      }
    case 'Claim Initiated':
      return {
        background: 'rgba(38,194, 129, 0.5)',
        border: 'rgba(38, 194, 129, 1)'
      }
    case 'Document Submited':
      return {
        background: '#D80E51',
        color: '#f1f1f1'
      }
    default:
      return {
        background: 'rgba(227, 61, 148, 0.5)',
        border: 'rgba(227, 61, 148, 1)'
      }
  }
}

export default function PreAuthOPDListComponent(props: any) {
  const router = useRouter()
  const [rows, setRows] = React.useState(props.rows)
  const [openReviewModal, setOpenReviewModal] = React.useState(false)
  const [cancelModal, setCancelModal] = React.useState(false)
  const [cancelReason, setCancelReason] = React.useState()
  const [openTimeLineModal, setOpenTimeLineModal] = React.useState(false)
  const [cancelPreAuthId, setCancelPreAuthId] = React.useState<any>()
  const [selectedPreAuthForReview, setSelectedPreAuthForReview] = React.useState(preAuthReviewModel())
  const [selectedPreAuth, setSelectedPreAuth] = React.useState({})
  const [searchType, setSearchType] = React.useState(0)
  const [searchModal, setSearchModal] = React.useState(false)
  const [fromExpectedDOA, setFromExpectedDOA] = React.useState(null)
  const [toExpectedDOA, setToExpectedDOA] = React.useState(null)
  const [fromExpectedDOD, setFromExpectedDOD] = React.useState(null)
  const [toExpectedDOD, setToExpectedDOD] = React.useState(null)
  const [fromDate, setFromDate] = React.useState(null)
  const [toDate, setToDate] = React.useState(null)
  const [reloadTable, setReloadTable] = React.useState<boolean>(false)
  const [state, setState] = React.useState()
  const [benefits, setBenefits] = useState<any>()
  const [providers, setProviders] = useState<any>()
  const classes = useStyles()
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    localStorage.removeItem('preauthid')
  }, [])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const utclongDate = (date: any) => {
    if (!date) return undefined

    return date.getTime()
  }

  useEffect(() => {
    const subscription = benefitService
      .getAllBenefit({ page: 0, size: 1000, summary: true, active: true, sort: ['rowCreatedDate dsc'] })
      .subscribe((result: any) => {
        setBenefits(result.content)
      })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const subscription = providerService
      .getProviders({ page: 0, size: 1000, summary: true, active: true, sort: ['rowCreatedDate dsc'] })
      .subscribe((result: any) => {
        setProviders(result.content)
      })

    return () => subscription.unsubscribe()
  }, [])

  const handleProvider = (rowData: any) => {
    const length = rowData?.providers?.length

    const invoiceProviders = rowData?.providers?.map((prov: any, i: number) => {
      const provider = providers?.find((p: any) => p.id === prov.providerId)

      if (provider) {
        if (prov.benefit.length) {
          return (
            <TreeItem
              itemID={prov.providerId}
              key={`TreeItem1-${i}`}
              nodeId='999'
              label={
                <Typography
                  sx={{ fontSize: '12px' }}
                >{`${provider?.providerBasicDetails?.name}: ${prov.estimatedCost}`}</Typography>
              }
            >
              {renderBenefitWithCost({ benefitsWithCost: prov.benefit })}
            </TreeItem>
          )
        } else {
          return (
            <TreeItem
              key={`TreeItem2-${i}`}
              itemID={prov.providerId}
              label={
                <Typography
                  sx={{ fontSize: '12px' }}
                >{`${provider?.providerBasicDetails?.name}: ${prov.estimatedCost}`}</Typography>
              }
            ></TreeItem>
          )
        }
      } else {
        return (
          <TreeItem
            key={`TreeItem3-${i}`}
            itemID={prov.providerId}
            label={<Typography sx={{ fontSize: '12px' }}>{`Unknown: ${prov.estimatedCost || null}`}</Typography>}
          ></TreeItem>
        )
      }
    })

    const totalAmount = rowData.providers.reduce((acc: any, curr: any) => acc + curr.estimatedCost, 0)

    return (
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <TreeItem
          itemID='grid'
          nodeId='1'
          label={
            <Typography sx={{ fontSize: '12px' }}>{`${length} ${
              length === 1 ? 'Provider: ' : 'Providers: '
            } ${totalAmount}`}</Typography>
          }
        >
          {invoiceProviders}
        </TreeItem>
      </TreeView>
    )
  }

  const renderBenefitWithCost = (rowData: any) => {
    const benefitsWithCost = rowData?.benefitsWithCost?.map((ben: any) => {
      const benefitName = benefits?.find((item: any) => item.id === ben?.benefitId)?.name

      return benefitName ? (
        <TreeItem
          itemID={ben?.benefitId}
          label={<Typography sx={{ fontSize: '12px' }}>{`${benefitName}: ${ben?.estimatedCost}`}</Typography>}
        ></TreeItem>
      ) : (
        <TreeItem
          itemID={ben?.benefitId}
          label={<Typography sx={{ fontSize: '12px' }}>{`Unknown: ${ben?.estimatedCost || null}`}</Typography>}
        ></TreeItem>
      )
    })

    const totalAmount = rowData.benefitsWithCost.reduce((acc: any, curr: any) => acc + curr.estimatedCost, 0)

    return (
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <TreeItem
          nodeId='1'
          itemID='grid'
          label={<Typography sx={{ fontSize: '12px' }}>{`Benifits: ${totalAmount}`}</Typography>}
        >
          {benefitsWithCost}
        </TreeItem>
      </TreeView>
    )
  }

  const columnsDefinations = [
    {
      field: 'id',
      headerName: 'Pre-Auth No.',
      body: (rowData: any) => (
        <span
          style={{ lineBreak: 'anywhere', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => {
            router.push(`/claims/claims-preauth/review/${rowData.id}?mode=viewOnly&auth=OPD`)

            // router.push(`/claims/claims-preauth/${rowData?.id}?mode=viewOnly&auth=OPD`);
          }}
        >
          {rowData.id}
        </span>
      )
    },
    { field: 'memberShipNo', headerName: 'Membership No.' },
    {
      field: 'memberName',
      headerName: 'Name',
      body: (rowData: any) => (
        <div>
          <span>{rowData?.memberName}</span>
          <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {rowData.vip && <VIPDot />}
          </span>
          {/* {isHovered && <span style={{ marginLeft: '10px' }}>Additional text displayed on hover</span>} */}
          <span>
            {rowData.political && (
              // <Tooltip title="Political">
              <PoliticalDot />

              // </Tooltip>
            )}
          </span>
          {/* </Tooltip> */}
        </div>
      )
    },
    { field: 'policyNumber', headerName: 'Policy No.', expand: true },
    { field: 'admissionDate', headerName: 'Admission Date', expand: true },
    { field: 'dischargeDate', headerName: 'Discharge Date', expand: true },
    {
      field: 'benefitWithCost',
      headerName: 'Benefit & Cost',
      body: renderBenefitWithCost
    },
    {
      field: 'provider',
      headerName: 'Providers & Cost',
      body: handleProvider
    },

    // {
    //   field: 'estimatedCose',
    //   headerName: 'Estimated Cost',
    //   body:  (rowData:any) =>  (
    //     <span>
    //       {rowData.providers?.map(el => {
    //         let pName = providers.find(i => i.id === el?.providerId).providerBasicDetails;
    //         return (
    //           <>
    //             <div>
    //               <strong>{pName?.name}</strong>&nbsp; :&nbsp;
    //               {el?.benefit?.map( ( item:any) =>  {
    //                 let name = benefits.find(i => i.id === item?.benefitId).name;
    //                 return (
    //                   <div>
    //                     <span>{name}</span>&nbsp; :&nbsp;
    //                     <span>{item?.estimatedCost}</span>
    //                   </div>
    //                 );
    //               })}
    //             </div>
    //           </>
    //         );
    //       })}
    //     </span>
    //   ),
    // },
    // {
    //   field: 'vip',
    //   headerName: 'Is Vip ?',
    //   body:  (rowData:any) =>  <span>{rowData.vip ? 'Yes' : 'No'}</span>,
    // },
    // {
    //   field: 'political',
    //   headerName: 'Is Political ?',
    //   body:  (rowData:any) =>  <span>{rowData.political ? 'Yes' : 'No'}</span>,
    // },
    {
      field: 'status',
      headerName: 'Status',
      body: (rowData: any) =>
        rowData.status == 'Document Requested' ? (
          <Tooltip title={rowData?.addDocRemark}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  backgroundColor: getColor(rowData.status).background,

                  // opacity: '0.9',
                  color: getColor(rowData.status).color ? getColor(rowData.status).color : '#3c3c3c',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '6px'
                }}
              >
                {rowData.status}
              </span>
            </div>
          </Tooltip>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                backgroundColor: getColor(rowData.status).background,

                // opacity: '0.9',
                color: getColor(rowData.status).color ? getColor(rowData.status).color : '#3c3c3c',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '6px'
              }}
            >
              {rowData.status}
            </span>
          </div>
        )
    }
  ]

  const dataSource$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      preAuthType: 'OPD'

      // fromExpectedDOA: fromExpectedDOA,
      // toExpectedDOA: fromExpectedDOA,
      // fromExpectedDOD: fromExpectedDOD,
      // toExpectedDOD: toExpectedDOD,
      // fromDate: fromDate,
      // toDate: toDate,
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['memberShipNo'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['preAuthStatus'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['policyNumber'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['id'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['memberName'] = pageRequest.searchKey.toUpperCase().trim()
      delete pageRequest.searchKey
    }

    const querytype = {
      1: {
        fromExpectedDOA: utclongDate(fromExpectedDOA),
        toExpectedDOA: toExpectedDOA ? utclongDate(toExpectedDOA) : utclongDate(fromExpectedDOA)
      },
      2: {
        fromExpectedDOD: utclongDate(fromExpectedDOD),
        toExpectedDOD: toExpectedDOD ? utclongDate(toExpectedDOD) : utclongDate(fromExpectedDOD)
      },
      3: {
        fromDate: utclongDate(fromDate),
        toDate: toDate ? utclongDate(toDate) : utclongDate(fromDate)
      }
    }

    const pagerequestquery = {
      page: pageRequest.page,
      size: pageRequest.size,
      summary: true,
      active: true,
      ...(searchType && querytype[searchType as keyof typeof querytype])
    }

    return preAuthService.getAllPreAuths(searchType ? pagerequestquery : pageRequest).pipe(
      tap(data => {
        setState(data?.data)
      }),
      map(data => {
        const content = data?.data?.content

        const records = content.map((item: any) => {
          item['admissionDate'] = new Date(item.expectedDOA).toLocaleDateString()
          item['dischargeDate'] = new Date(item.expectedDOD).toLocaleDateString()
          item['status'] = PRE_AUTH_STATUS_MSG_MAP[item.preAuthStatus as keyof typeof PRE_AUTH_STATUS_MSG_MAP]

          return item
        })

        data.content = records

        return data?.data
      })
    )
  }

  const handleOpen = () => {
    router.push('/claims/claims-preauth?mode=create&auth=OPD')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection = (preAuth: any) => {
    router.push(`/claims/claims-preauth/${preAuth.id}?mode=edit&auth=OPD`)
  }

  const openReviewSection = (preAuth: any) => {
    router.push(`/claims/claims-preauth/review/${preAuth.id}?auth=OPD`)
  }

  const cancelPreAuth = (preAuth: any) => {
    setCancelModal(true)
    setCancelPreAuthId(preAuth.id)
  }

  const onConfirmCancel = () => {
    const payload = {
      reasonForCancellation: cancelReason
    }

    preAuthService.cancelPreAuth(payload, cancelPreAuthId).subscribe(res => {
      setTimeout(() => {
        window.location.reload()
      }, 300)
    })
  }

  const onConfirmCancels = () => {
    setCancelModal(false)
  }

  const openForReview = (preAuth: any) => {
    const pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      key: 'MEMBERSHIP_NO',
      value: preAuth.memberShipNo,
      key1: 'policyNumber',
      value1: preAuth.policyNumber
    }

    const bts$ = benefitService.getAllBenefit({ page: 0, size: 1000, summary: true })
    const ps$ = providerService.getProviders()

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

    memberservice.getMember(pageRequest).subscribe(res => {
      if (res.content?.length > 0) {
        const member = res.content[0]

        setSelectedPreAuthForReview({ member, preAuth })
        setOpenReviewModal(true)
      }
    })
  }

  const openTimeLine = (preAuth: any) => {
    setSelectedPreAuth(preAuth)
    setOpenTimeLineModal(true)
  }

  const openReimbursement = (preAuth: any) => {
    router.push(`/claims/claims?mode=create&type=preauth&preId=` + preAuth.id)
  }

  const openDocumentsSection = (preAuth: any) => {
    router.push(`/claims/claims-preauth/${preAuth.id}?mode=edit&auth=OPD&addDoc=true`)
  }

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false)
  }

  const handleCloseTimeLineModal = () => {
    setOpenTimeLineModal(false)
  }

  const disableEnhance = (item: any) => {
    return (
      item.preAuthStatus != 'DRAFT' &&
      item.preAuthStatus != 'REVERTED' &&
      item.preAuthStatus != 'APPROVED' &&
      item.preAuthStatus != 'REJECTED'
    )
  }

  const disableClaimReimburse = (item: any) => {
    return item.preAuthStatus != 'WAITING_FOR_CLAIM'
  }

  const disableAddDocs = (item: any) => {
    return item.preAuthStatus != 'ADD_DOC_REQUESTED'
  }

  const disableReviewButton = (item: any) => {
    return (
      item.preAuthStatus != 'IN REVIEW' &&
      item.preAuthStatus != 'REQUESTED' &&
      item.preAuthStatus != 'EVALUATION_INPROGRESS' &&
      item.preAuthStatus != 'PENDING_EVALUATION' &&
      item.preAuthStatus != 'ADD_DOC_SUBMITTED'
    )
  }

  const disableCancelButton = (item: any) => {
    return item.preAuthStatus == 'CANCELLED'
  }

  const onSearch = () => {
    setSearchModal(false)
    setReloadTable(true)
    setTimeout(() => {
      setReloadTable(false)

      // setSearchDischargeDate('');
      // setSearchAdmissionDate('');
      setFromExpectedDOA(null)
      setToExpectedDOA(null)
      setFromExpectedDOD(null)
      setToExpectedDOD(null)
      setFromDate(null)
      setToDate(null)
    }, 1000)
  }

  const preAuthDOASearch = (type: any) => {
    setSearchModal(true)
    setSearchType(1)
  }

  const preAuthDODSearch = (type: any) => {
    setSearchModal(true)
    setSearchType(2)
  }

  const preAuthCreationSearch = (type: any) => {
    setSearchModal(true)
    setSearchType(3)
  }

  const clearAllClick = () => {
    setFromExpectedDOA(null)
    setToExpectedDOA(null)
    setFromExpectedDOD(null)
    setToExpectedDOD(null)
    setFromDate(null)
    setToDate(null)
    setSearchType(0)
    setReloadTable(true)
  }

  const xlsColumns = [
    'id',
    'memberShipNo',
    'memberName',
    'policyNumber',
    'admissionDate',
    'dischargeDate',
    'benefitWithCost',
    'provider',
    'status'
  ]

  const userType = localStorage.getItem('userType')

  const configuration: any = {
    enableSelection: false,
    rowExpand: true,
    scrollHeight: '285px',
    pageSize: 10,
    actionButtons:
      userType === 'TPA'
        ? ''
        : [
            {
              key: 'update_preauth',
              icon: 'pi pi-pencil',
              disabled: disableEnhance,
              className: classes.categoryButton,
              onClick: openEditSection,
              tooltip: 'Enhance'
            },

            {
              key: 'review_preauth',
              icon: 'pi pi-book',
              disabled: disableReviewButton,
              className: classes.categoryButton,
              onClick: openReviewSection,
              tooltip: 'Review'
            },
            {
              key: 'review_cancel',
              icon: 'pi pi-times',
              className: classes.categoryButton,
              disabled: disableCancelButton,
              onClick: cancelPreAuth,
              tooltip: 'Cancel'
            },
            {
              key: 'timeleine_preauth',
              icon: 'pi pi-calendar-times',
              className: classes.categoryButton,
              onClick: openTimeLine,
              tooltip: 'Timeleine'
            },
            {
              key: 'claim_preauth',
              icon: 'pi pi-money-bill',
              className: classes.categoryButton,
              disabled: disableClaimReimburse,
              onClick: openReimbursement,
              tooltip: 'Claim'
            },
            {
              key: 'claim_preauth',
              icon: 'pi pi-paperclip',
              className: classes.categoryButton,
              disabled: disableAddDocs,
              onClick: openDocumentsSection,
              tooltip: 'Add Documents'
            }
          ],

    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: userType !== 'TPA' && roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Pre-Auth - OPD',
      enableGlobalSearch: true,
      searchText: 'Search by Claim No, Membership No, Name, Policy id or Status',
      selectionMenus: [
        { icon: '', label: 'Admission Date', onClick: preAuthDOASearch },
        { icon: '', label: 'Discharge Date', onClick: preAuthDODSearch },
        { icon: '', label: 'Creation Date', onClick: preAuthCreationSearch },
        { icon: '', label: 'Clear All', onClick: clearAllClick }
      ],
      selectionMenuButtonText: 'Search'

      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    }
  }

  return (
    <div>
      {/* <DataGrid rows={rows} columns={props.columns} pageSize={10} /> */}
      <FettleDataGrid
        $datasource={dataSource$}
        config={configuration}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
        reloadtable={reloadTable}
      />

      {/* <PreAuthReviewModal preAuthReviewModel={selectedPreAuthForReview} open={openReviewModal} onClose={handleCloseReviewModal} setState={setSelectedPreAuthForReview}></PreAuthReviewModal> */}
      <PreAuthTimeLineModal preAuth={selectedPreAuth} open={openTimeLineModal} onClose={handleCloseTimeLineModal} />

      <Modal
        open={cancelModal}
        onClose={() => {
          setCancelModal(false)
        }}
      >
        <Box sx={style}>
          <div style={{ padding: '5px' }}>
            <strong>Cancel Reason</strong>
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
                    setCancelReason(e.target.value)
                  }}
                />
              </Grid>
            </Grid>
          </div>
          <Box display={'flex'} justifyContent={'end'} marginTop={'15px'}>
            <Button color='primary' onClick={onConfirmCancel}>
              Cancel PreAuth
            </Button>
            <Button className='p-button-text' onClick={onConfirmCancels}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={searchModal} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box style={modalStyle}>
          <Box>
            <Box id='alert-dialog-slide-description'>
              {searchType == 1 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Search By Date of Admission
                    </Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <Box display={'flex'} marginBottom={'10px'}>
                    <Box display={'flex'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize'
                        }}
                      >
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromExpectedDOA}
                            onChange={date => setFromExpectedDOA(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={fromExpectedDOA}
                            onChange={date => setFromExpectedDOA(date)}
                            renderInput={params => <TextField {...params} margin='normal' variant='outlined' />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                    <Box display={'flex'} marginLeft={'3%'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize'
                        }}
                      >
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toExpectedDOA}
                            onChange={date => setToExpectedDOA(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={toExpectedDOA}
                            onChange={date => setToExpectedDOA(date)}
                            renderInput={params => <TextField {...params} margin='normal' variant='outlined' />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {searchType == 2 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Seach by Date of Discharge
                    </Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <Box display={'flex'} marginBottom={'10px'}>
                    <Box display={'flex'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize'
                        }}
                      >
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromExpectedDOD}
                            onChange={date => setFromExpectedDOD(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={fromExpectedDOD}
                            onChange={date => setFromExpectedDOD(date)}
                            renderInput={params => <TextField {...params} margin='normal' variant='outlined' />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                    <Box display={'flex'} marginLeft={'3%'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize'
                        }}
                      >
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toExpectedDOD}
                            onChange={date => setToExpectedDOD(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={toExpectedDOD}
                            onChange={date => setToExpectedDOD(date)}
                            renderInput={params => <TextField {...params} margin='normal' variant='outlined' />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {searchType == 3 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Search By Creation Date
                    </Box>
                    <CloseOutlined onClick={() => setSearchModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <Box display={'flex'} marginBottom={'10px'}>
                    <Box display={'flex'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize'
                        }}
                      >
                        From
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={fromDate}
                            onChange={date => setFromDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={fromDate}
                            onChange={date => setFromDate(date)}
                            renderInput={params => <TextField {...params} margin='normal' variant='outlined' />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                    <Box display={'flex'} marginLeft={'3%'}>
                      <Typography
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          textTransform: 'capitalize'
                        }}
                      >
                        To
                      </Typography>
                      &nbsp;
                      <span style={{ display: 'flex', alignItems: 'center' }}>:</span>&nbsp;
                      <Box style={{ marginBottom: '10px' }}>
                        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            views={['year', 'month', 'date']}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            autoOk={true}
                            id="date-picker-inline"
                            value={toDate}
                            onChange={date => setToDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={toDate}
                            onChange={date => setToDate(date)}
                            renderInput={params => <TextField {...params} margin='normal' variant='outlined' />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          <Box marginTop={'10%'}>
            <Button
              style={{ backgroundColor: theme?.palette?.primary?.main || '#D80E51', color: '#fff' }}
              onClick={onSearch}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}

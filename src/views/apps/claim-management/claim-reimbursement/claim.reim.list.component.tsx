
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import { map } from 'rxjs/operators'

import { TabView, TabPanel } from 'primereact/tabview'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { CloseOutlined } from '@mui/icons-material'
import { Button } from 'primereact/button'

import { Box, Modal, TextField, Typography, useTheme } from '@mui/material'

import { TreeItem, TreeView } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { PoliticalDot, VIPDot } from '../common/dot.comnponent'
import { REIM_STATUS_MSG_MAP } from './reim.shared'
import ClaimReimIntimationListComponent from './claim.reim.intimation.component'
import { ReimbursementService } from '@/services/remote-api/api/claims-services/claim.reimbursement.services'

import { BenefitService, ProvidersService } from '@/services/remote-api/fettle-remote-api'

import RoleService from '@/services/utility/role'
import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'



const roleService = new RoleService()

const PAGE_NAME = 'AGENT'

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

const useStyles = makeStyles(theme => ({
  tableBg: {
    height: 400,
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

const modalStyle: any = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  background: '#fff',
  boxShadow: 24,
  padding: '2% 3%',
  borderRadius: '20px'
}

const reimbursementService = new ReimbursementService()
const benefitService = new BenefitService()
const providerService = new ProvidersService()

export default function ClaimReimListComponent(props: any) {
  const history = useRouter()
  const [rows, setRows] = React.useState(props.rows)
  const [reloadTable, setReloadTable] = React.useState(false)
  const [tabvalue, setTabValue] = React.useState(0)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [searchType, setSearchType] = React.useState(0)
  const [invoiceModal, setInvoiceModal] = React.useState(false)
  const [policyStartDate, setPolicyStartDate] = React.useState<any>(null)
  const [policyEndDate, setPolicyEndDate] = React.useState(null)
  const [toPolicyStartDate, setToPolicyStartDate] = React.useState<any>(null)
  const [toPolicyEndDate, setToPolicyEndDate] = React.useState(null)
  const [benefits, setBenefits] = useState()
  const [providers, setProviders] = useState<any>()
  const theme = useTheme()
  const classes = useStyles()

  const handleTabChange = (event: any, newValue: any) => {
    setTabValue(newValue)
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
    const length = rowData?.invoices?.length

    const invoiceProviders = rowData.invoices.map((inv: any) => {
      const provider = providers?.find((p: any) => p.id === inv.provideId)

      return provider ? (
        <TreeItem
          itemID={inv.invoiceNo}
          label={
            <Typography
              sx={{ fontSize: '12px' }}
            >{`${provider?.providerBasicDetails?.name}: ${inv.invoiceAmount}`}</Typography>
          }
        ></TreeItem>
      ) : (
        <TreeItem
          itemID={inv.invoiceNo}
          label={<Typography sx={{ fontSize: '12px' }}>{`Unknown: ${inv.invoiceAmount || null}`}</Typography>}
        ></TreeItem>
      )
    })

    const totalAmount = rowData.invoices.reduce((acc: any, curr: any) => acc + curr.invoiceAmount, 0)

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
              length === 1 ? 'Provider: ' : 'Providers'
            } ${totalAmount}`}</Typography>
          }
        >
          {invoiceProviders}
        </TreeItem>
      </TreeView>
    )
  }

  const renderBenefitWithCost = (rowData: any) => {
    const benefitsWithCost = rowData.benefitsWithCost?.map((ben: any, index: number) => {
      const provider = providers?.find((p: any) => p?.id === ben?.providerId)

      console.log(providers, ben, 'lkjhgfdsa')

      return (
        <li key={`${ben?.providerId}-${ben?.benefitId}-${index}`}>
          {provider?.providerBasicDetails?.name} | {ben.benefitName} | {ben.iname} | {ben.diagnosisName} :
          <b>{ben.estimatedCost}</b>
        </li>
      )
    })

    return <span>{benefitsWithCost}</span>
  }

  const columnsDefinations = [
    {
      field: 'id',
      headerName: 'Claim No.',
      body: (rowData: any) => (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => handleMembershipClick(rowData, 'membershipNo')}
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
        <span>
          {rowData?.memberName}
          {rowData.vip && <VIPDot />}
          {rowData.political && <PoliticalDot />}
        </span>
      )
    },

    { field: 'policyNumber', headerName: 'Policy', expand: true },
    { field: 'admissionDate', headerName: 'Admission Date', expand: true },
    { field: 'dischargeDate', headerName: 'Discharge Date', expand: true },

    // {
    //   field: 'provider',
    //   headerName: 'Providers & Cost',
    //   body: handleProvider,
    // },
    {
      field: 'benefitWithCost',
      headerName: 'Estimated Cost',
      body: (rowData: any) => (
        <p style={{ width: '250px', whiteSpace: 'break-spaces' }}>{renderBenefitWithCost(rowData)}</p>
      )
    },

    // {
    //   field: 'vip',
    //   headerName: 'Is Vip ?',
    //   body: (rowData:any) =>  <span>{rowData.vip ? 'Yes' : 'No'}</span>,
    // },
    // {
    //   field: 'political',
    //   headerName: 'Is Political ?',
    //   body: (rowData:any) =>  <span>{rowData.political ? 'Yes' : 'No'}</span>,
    // },
    {
      field: 'status',
      headerName: 'Status',
      body: (rowData: any) => (
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

  const handleMembershipClick = (rowData: any, field: any) => {
    // if (field === 'membershipNo' || 'claimNo') {
    //   const membershipNo = rowData.memberShipNo;
    history.push(`/claims/claims-reimbursement/${rowData.id}?mode=viewOnly`)

    // }
  }

  const handleOpen = () => {
    history.push('/claims/claims-reimbursement?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection = (reim: any) => {
    history.push(`/claims/claims-reimbursement/${reim.id}?mode=view`)
  }

  const openReviewSection = (reim: any) => {
    history.push(`/claims/claims-reimbursement/review/${reim.id}`)
  }

  const onRequestForReview = (reim: any) => {
    reimbursementService.editReimbursement({}, reim.id, 'requested').subscribe(res => {
      history.push('/claims/claims-reimbursement?mode=viewList')
      setReloadTable(true)
    })
  }

  //Change needed
  const disableEnhance = (item: any) => {
    return item.reimbursementStatus != 'PENDING_EVALUATION' && item.reimbursementStatus != 'DRAFT'
  }

  const disableReviewButton = (item: any) => {
    return item.reimbursementStatus == 'PENDING_EVALUATION'
  }

  const disableRequestButton = (item: any) => {
    return item.reimbursementStatus != 'PENDING_EVALUATION'
  }

  const onSearch = () => {
    setInvoiceModal(false)
    setReloadTable(true)
    setTimeout(() => {
      setReloadTable(false)
      setPolicyStartDate(null)
      setToPolicyStartDate(null)
      setPolicyEndDate(null)
      setToPolicyEndDate(null)
    }, 1000)
  }

  // dateOfAdmission
  const dateofAdmission = () => {
    setInvoiceModal(true)
    setSearchType(1)
  }

  // dateoFdISCHARGE
  const dateofDischarge = () => {
    setInvoiceModal(true)
    setSearchType(2)
  }

  const xlsColumns = [
    'id',
    'memberShipNo',
    'memberName',
    'policyNumber',
    'admissionDate',
    'dischargeDate',
    'provider',
    'benefitWithCost',
    'status'
  ]

  const [userType,setUserType] = React.useState<any>(null)

  const [configuration, setConfiguration] = React.useState<any>({
    enableSelection: false,
    rowExpand: true,
    scrollHeight: '300px',
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
            }
          ],

    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: false,
      onCreateButtonClick: handleOpen,
      text: 'Claim Reimbursement',
      enableGlobalSearch: true,
      searchText: 'Search by Claim No, Membership No, Name, Policy id or Status',
      selectionMenuButtonText: 'Search',
      selectionMenus: [
        { icon: '', label: 'Date Of Admission', onClick: dateofAdmission },
        { icon: '', label: 'Date Of Discharge', onClick: dateofDischarge }
      ]

      // selectionMenuButtonText: 'Action',
    }
  })
  React.useEffect(() => {
    localStorage.removeItem('claimreimid')
    setUserType(localStorage.getItem('userType'));
    setConfiguration((prevConfig:any) => ({
      ...prevConfig,
      header: {
        ...prevConfig.header,
        addCreateButton: userType !== 'TPA' && roleService.checkActionPermission(PAGE_NAME, 'CREATE')
      }
    }))
  }, [])
  // const configuration: any = {
  //   enableSelection: false,
  //   rowExpand: true,
  //   scrollHeight: '300px',
  //   pageSize: 10,
  //   actionButtons:
  //     userType === 'TPA'
  //       ? ''
  //       : [
  //           {
  //             key: 'update_preauth',
  //             icon: 'pi pi-pencil',
  //             disabled: disableEnhance,
  //             className: classes.categoryButton,
  //             onClick: openEditSection,
  //             tooltip: 'Enhance'
  //           }
  //         ],

  //   header: {
  //     enable: true,
  //     enableDownload: true,
  //     downloadbleColumns: xlsColumns,
  //     addCreateButton: userType !== 'TPA' && roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
  //     onCreateButtonClick: handleOpen,
  //     text: 'Claim Reimbursement',
  //     enableGlobalSearch: true,
  //     searchText: 'Search by Claim No, Membership No, Name, Policy id or Status',
  //     selectionMenuButtonText: 'Search',
  //     selectionMenus: [
  //       { icon: '', text: 'Date Of Admission', onClick: dateofAdmission },
  //       { icon: '', text: 'Date Of Discharge', onClick: dateofDischarge }
  //     ]

  //     // selectionMenuButtonText: 'Action',
  //   }
  // }

  const dataSource$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      claimCategory: 'REIMBURSEMENT_CLAIM',
      claimSource: 'NONE'
    },
    dateOfAdmission = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      fromExpectedDOA: policyStartDate === '' ? 0 : policyStartDate - 5.5 * 60 * 60 * 1000,
      toExpectedDOA:
        policyEndDate === ''
          ? policyStartDate === ''
            ? 0
            : Number(policyStartDate) - 5.5 * 60 * 60 * 1000
          : !policyEndDate
            ? Number(policyStartDate) - 5.5 * 60 * 60 * 1000
            : Number(policyEndDate) - 5.5 * 60 * 60 * 1000
    },
    dateofDischarge = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      fromExpectedDOD: toPolicyStartDate === '' ? 0 : toPolicyStartDate - 5.5 * 60 * 60 * 1000,
      toExpectedDOD:
        toPolicyEndDate === ''
          ? toPolicyStartDate === ''
            ? 0
            : toPolicyStartDate - 5.5 * 60 * 60 * 1000
          : !toPolicyEndDate
            ? toPolicyStartDate - 5.5 * 60 * 60 * 1000
            : toPolicyEndDate - 5.5 * 60 * 60 * 1000
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']
    pageRequest.claimType = ['REIMBURSEMENT_CLAIM']

    if (pageRequest.searchKey) {
      pageRequest['memberShipNo'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['claimStatus'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['policyNo'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['id'] = pageRequest.searchKey.toUpperCase().trim()
      pageRequest['memberName'] = pageRequest.searchKey.toUpperCase().trim()
      delete pageRequest.searchKey
    }

    return reimbursementService
      .getAllReimbursements(policyStartDate ? dateOfAdmission : toPolicyStartDate ? dateofDischarge : pageRequest)
      .pipe(
        map(data => {
          const content = data.content

          const records = content.map((item: any) => {
            item['admissionDate'] = new Date(item.expectedDOA).toLocaleDateString()
            item['dischargeDate'] = new Date(item.expectedDOD).toLocaleDateString()
            item['status'] = item.reimbursementStatus
              ? REIM_STATUS_MSG_MAP[item.reimbursementStatus as keyof typeof REIM_STATUS_MSG_MAP]
              : null

            return item
          })

          data.content = records

          return data
        })
      )
  }

  return (
    <>
      <TabView
        scrollable
        style={{ fontSize: '14px' }}
        activeIndex={activeIndex}
        onTabChange={e => setActiveIndex(e.index)}
      >
        <TabPanel leftIcon='pi pi-user mr-2' header='Reimbursement List'>
          <FettleDataGrid
            $datasource={dataSource$}
            config={configuration}
            columnsdefination={columnsDefinations}
            onEdit={openEditSection}
            reloadtable={reloadTable}
          />
        </TabPanel>
        <TabPanel leftIcon='pi pi-user-minus mr-2' header='Intimation List'>
          <ClaimReimIntimationListComponent />
        </TabPanel>
      </TabView>
      <Modal open={invoiceModal} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box style={modalStyle}>
          <Box>
            <Box id='alert-dialog-slide-description'>
              {searchType == 1 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Date Of Admission
                    </Box>
                    <CloseOutlined onClick={() => setInvoiceModal(false)} style={{ cursor: 'pointer' }} />
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
                            value={policyStartDate}
                            onChange={date => setPolicyStartDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={policyStartDate}
                            onChange={date => setPolicyStartDate(date)}
                            renderInput={(params: any) => <TextField {...params} margin='normal' variant='outlined' />}
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
                            value={policyEndDate}
                            onChange={date => setPolicyEndDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={policyEndDate}
                            onChange={date => setPolicyEndDate(date)}
                            renderInput={(params: any) => <TextField {...params} margin='normal' variant='outlined' />}
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
                      Date Of Discharge
                    </Box>
                    <CloseOutlined onClick={() => setInvoiceModal(false)} style={{ cursor: 'pointer' }} />
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
                            value={toPolicyStartDate}
                            onChange={date => setToPolicyStartDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={toPolicyStartDate}
                            onChange={date => setToPolicyStartDate(date)}
                            renderInput={(params: any) => <TextField {...params} margin='normal' variant='outlined' />}
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
                            value={toPolicyEndDate}
                            onChange={date => setToPolicyEndDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={toPolicyEndDate}
                            onChange={date => setToPolicyEndDate(date)}
                            renderInput={(params: any) => <TextField {...params} margin='normal' variant='outlined' />}
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
    </>
  )
}

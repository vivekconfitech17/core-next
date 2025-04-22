import React from 'react'

import { useRouter } from 'next/navigation'

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Slide,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { CloseOutlined } from '@mui/icons-material'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { TabView, TabPanel } from 'primereact/tabview'

import { Button } from 'primereact/button'

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { QuotationService } from '@/services/remote-api/api/quotation-services'

import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '@/views/apps/shared-component/components/fettle.data.grid'
import QuotationDashboard from './QuotationDashboard'

const PAGE_NAME = 'QUOTATION'
const roleService = new RoleService()
const quotationService = new QuotationService()

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const columnsDefinationsNew = [
  { field: 'prospectName', headerName: 'Prospect Name' },
  {
    field: 'policyStartDate',
    headerName: 'Policy Period',
    body: (rowData: any) => (
      <span style={{ width: '100px' }}>
        {new Date(rowData.policyStartDate).toLocaleDateString()} -{' '}
        {new Date(rowData.policyEndDate).toLocaleDateString()}
      </span>
    ),
    expand: true
  },
  {
    field: 'quotationNo',
    headerName: 'Quotation No.',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere', width: '100px' }}>{rowData.quotationNo}</span>
  },
  { field: 'tag', headerName: 'Tag' },
  {
    field: 'productId',
    headerName: 'Product',
    expand: true,
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere', width: '100px' }}>{rowData.productId}</span>
  }, //fetch by product ID replace by product name
  {
    field: 'planId',
    headerName: 'Plan',
    expand: true,
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere', width: '100px' }}>{rowData.planId}</span>
  }, //fetch by plan ID replace by plan name
  {
    field: 'quoteDate',
    headerName: 'Quote Date',
    body: (rowData: any) => <span style={{ width: '100px' }}>{new Date(rowData.quoteDate).toLocaleDateString()}</span>
  }, //fetch by plan ID replace by plan name
  { field: 'quotationStatus', headerName: 'Status' },
  { field: 'createdBy', headerName: 'Created By' }
]

const xlsColumns = ['prospectName', 'policyStartDate', 'quotationNo', 'productId', 'quoteDate']

const columnsDefinationsRenewal = [
  { field: 'prospectName', headerName: 'Prospect Name' },
  {
    field: 'policyStartDate',
    headerName: 'Policy Period',
    body: (rowData: any) => (
      <span>
        {new Date(rowData.policyStartDate).toLocaleDateString()} -{' '}
        {new Date(rowData.policyEndDate).toLocaleDateString()}
      </span>
    )
  },
  {
    field: 'quotationNo',
    headerName: 'Quotation No.',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere' }}>{rowData.quotationNo}</span>
  },
  { field: 'tag', headerName: 'Tag' },
  {
    field: 'productId',
    headerName: 'Product',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere' }}>{rowData.productId}</span>
  }, //fetch by product ID replace by product name
  {
    field: 'planId',
    headerName: 'Plan',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere' }}>{rowData.planId}</span>
  }, //fetch by plan ID replace by plan name
  {
    field: 'quoteDate',
    headerName: 'Quote Date',
    body: (rowData: any) => <span>{new Date(rowData.quoteDate).toLocaleDateString()}</span>
  }, //fetch by plan ID replace by plan name
  { field: 'forRenewal', headerName: 'For Renewal ?' }, //fetch by plan ID replace by plan name
  { field: 'quotationStatus', headerName: 'Status' },
  { field: 'createdBy', headerName: 'Created By' }
]

const QuotationListComponent = (props: any) => {
  const history = useRouter()

  const useStyles = makeStyles((theme: any) => ({
    approvedButton: {
      marginLeft: '5px'
    },
    tableBg: {
      height: 505,
      width: '100%',
      backgroundColor: '#fff',
      boxShadow:
        '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
      borderRadius: '4px'
    },
    categoryButton: {
      marginLeft: '5px',
      marginBottom: '5px',
      color: 'white'
    }
  }))

  const modalStyle: any = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    background: '#fff',

    // border: '2px solid #000',
    boxShadow: 24,
    padding: '2% 3%'
  }

  const [open, setOpen] = React.useState(false)
  const [quotationID, setQuotationID] = React.useState('')
  const [quotationNo, setQuotationNo] = React.useState('')
  const [quotationTag, setQuotationTag] = React.useState('')
  const [reloadTable, setReloadTable] = React.useState(false)
  const [quotationDateModal, setQuotationDateModal] = React.useState(false)
  const [quotationNumber, setQuotationNumber] = React.useState('')
  const [searchQuotationFromDate, setSearchQuotationFromDate] = React.useState(0)
  const [searchQuotationToDate, setSearchQuotationToDate] = React.useState(0)
  const [prospectName, setProspectName] = React.useState('')
  const [searchType, setSearchType] = React.useState(0)
  const [value, setValue] = React.useState(0)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const theme = useTheme()

  // const logoUrl = '/images/excel.jpg';
  const classes = useStyles()

  const dataSource$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      quotationNo: quotationNumber,
      startDate: new Date(searchQuotationFromDate).getTime() || 0,
      endDate: new Date(searchQuotationToDate).getTime() || 0
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['tag'] = pageRequest.searchKey.trim()
      pageRequest['quotationNo'] = pageRequest.searchKey.trim()
      pageRequest['displayName'] = pageRequest.searchKey.trim()
      pageRequest['status'] = pageRequest.searchKey.trim()
      pageRequest['productId'] = pageRequest.searchKey.trim()
      pageRequest['planId'] = pageRequest.searchKey.trim()
    }

    return quotationService.getQuoationDetails(pageRequest)
  }

  const dataSource1$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['name'] = pageRequest.searchKey.trim()
    }

    return quotationService.getQuoationByProspect(prospectName)
  }

  const handleOpen = () => {
    history.push('/quotations?mode=create')
  }

  const openEditSection = (quotation: any) => {
    history.push(`/quotations/${quotation.id}?mode=edit`)
  }

  const downloadQuotation = (item: any) => {
    quotationService.getQuoationDownload(item?.id).subscribe(blob => {
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create a temporary anchor element
      const a = document.createElement('a')

      a.href = downloadUrl
      a.download = `Quotation_${item.id}.pdf` // Set the default file name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a) // Clean up the DOM

      // Release the object URL
      window.URL.revokeObjectURL(downloadUrl)
    })
  }

  const Transition = React.forwardRef(function Transition(props: any, ref: any) {
    return <Slide children={undefined} direction='up' ref={ref} {...props} />
  })

  const handleApproveAction = () => {
    const pageRequest: any = {
      action: 'approve'
    }

    quotationService.approveQuotation(quotationID, pageRequest).subscribe(res => {
      setOpen(false)
      setReloadTable(true)
    })
  }

  const handleClickForAppoveOpen = (quotation: any) => {
    setQuotationID(quotation.id)
    setQuotationNo(quotation.quotationNo)
    setQuotationTag(quotation.tag)
    setOpen(true)
  }

  const actionBtnList = [
    {
      key: 'update_quotation',
      icon: 'pi pi-download', // Changed icon to download
      className: 'ui-button-warning',
      tooltip: 'Download',
      onClick: downloadQuotation
    },
    {
      key: 'update_quotation',
      icon: 'pi pi-user-edit',

      // className: 'ui-button-warning',
      onClick: openEditSection,
      tooltip: 'Edit',
      className: classes.categoryButton
    },
    {
      key: 'update_quotation',
      icon: 'pi pi-check',

      // className: classes.approvedButton,
      className: classes.categoryButton,
      onClick: handleClickForAppoveOpen,
      tooltip: 'Approve',
      disabled: (q: any) =>
        q.quotationStatus == 'APPROVED' ||
        !(
          q.premiumCalculationStatus == 'COMPLETED' &&
          q.memberUploadStatus == 'COMPLETED' &&
          q.quotationStatus != 'APPROVED'
        )
    }
  ]

  const handleClose = () => {
    setOpen(false)
    setQuotationID('')
    setQuotationNo('')
    setQuotationTag('')
  }

  const QuotationDateClick = (type: any) => {
    setQuotationDateModal(true)
    setSearchType(1)
  }

  const QuotationNumberClick = (type: any) => {
    // setQuotationNumberModal(true);
    setQuotationDateModal(true)
    setSearchType(2)
  }

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index: any) => {
    setValue(index)
  }

  const ProspectNameClick = (type: any) => {
    // setProspectNameModal(true);
    setQuotationDateModal(true)
    setSearchType(3)
  }

  const IntermediaryNameClick = (type: any) => {
    // setIntermediarNameModal(true);
    setQuotationDateModal(true)
    setSearchType(4)
  }

  const clearAllClick = () => {
    setQuotationNumber('')
    setProspectName('')
    setSearchQuotationFromDate(0)
    setSearchQuotationToDate(0)
    onSearch()
  }

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    rowExpand: true,
    actionButtons: roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList),
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: value == 0 && roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Quotation',
      enableGlobalSearch: true,
      searchText: 'Search by Id, Tag, Quotation No., Plan, Status',

      // onSelectionChange: selectionChanges,
      selectionMenus: [
        { icon: '', label: 'Quotation Date', onClick: QuotationDateClick },
        { icon: '', label: 'Quotation Number', onClick: QuotationNumberClick },
        { icon: '', label: 'Prospect Name', onClick: ProspectNameClick },
        { icon: '', label: 'Intermediary Name', onClick: IntermediaryNameClick },
        { icon: '', label: 'Clear All', onClick: clearAllClick }
      ],
      selectionMenuButtonText: 'Advance Search'
    }
  }

  const onSearch = () => {
    setQuotationDateModal(false)
    setReloadTable(true)
    setTimeout(() => {
      setReloadTable(false)
      setQuotationNumber('')
      setProspectName('')
      setSearchQuotationFromDate(0)
      setSearchQuotationToDate(0)
    }, 5000)
  }

  return (
    <>
      <TabView
        scrollable
        style={{ fontSize: '14px' }}
        activeIndex={activeIndex}
        onTabChange={(e: any) => setActiveIndex(e.index)}
      >
         <TabPanel leftIcon="pi pi-bolt mr-2" header="Overview">
          <QuotationDashboard />
        </TabPanel>
        <TabPanel leftIcon='pi pi-bolt mr-2' header='New'>
          <FettleDataGrid
            $datasource={prospectName ? dataSource1$ : dataSource$}
            config={configuration}
            columnsdefination={columnsDefinationsNew}
            reloadtable={reloadTable}
          />
        </TabPanel>
        <TabPanel leftIcon='pi pi-history mr-2' header='Renewal'>
          <FettleDataGrid
            $datasource={prospectName ? dataSource1$ : dataSource$}
            config={configuration}
            columnsdefination={columnsDefinationsRenewal}
            reloadtable={reloadTable}

            // onEdit={openEditSection}
          />
        </TabPanel>
      </TabView>

      {/* <FettleDataGrid
        $datasource={dataSource$}
        config={configuration}
        columnsdefination={columnsDefinations}
        reloadtable={reloadTable}
      // onEdit={openEditSection}
      /> */}

      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title' fullWidth maxWidth='xs'>
        <DialogTitle id='form-dialog-title'>Approve Quotation</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontSize: 12 }}>
            Are you sure to approve the quotation {quotationNo}, {quotationTag}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className='p-button-text' onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleApproveAction} className='p-button-secondary' color='primary'>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={quotationDateModal} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box style={modalStyle}>
          <Box>
            <Box id='alert-dialog-slide-description'>
              {searchType == 1 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Quotation Date
                    </Box>
                    <CloseOutlined onClick={() => setQuotationDateModal(false)} style={{ cursor: 'pointer' }} />
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
                            value={searchQuotationFromDate || new Date()}
                            onChange={(e:any) =>  setSearchQuotationFromDate(e)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={searchQuotationFromDate || new Date()}
                            onChange={(e: any) => setSearchQuotationFromDate(e)}
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
                            value={searchQuotationToDate || new Date()}
                            onChange={(e:any) =>  setSearchQuotationToDate(e)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={searchQuotationToDate || new Date()}
                            onChange={(e: any) => setSearchQuotationToDate(e)}
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
                      Quotation Number
                    </Box>
                    <CloseOutlined onClick={() => setQuotationDateModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <TextField
                    id='quotationNumber'
                    name='quotationNumber'
                    onChange={(e: any) => {
                      setQuotationNumber(e.target.value)
                    }}
                    label='Quotation Number'
                  />
                </>
              )}
              {searchType == 3 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Prospect Name
                    </Box>
                    <CloseOutlined onClick={() => setQuotationDateModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <TextField
                    id='prospectName'
                    name='prospectName'
                    onChange={(e: any) => {
                      setProspectName(e.target.value)
                    }}
                    label='Prospect Name'
                  />
                </>
              )}
              {searchType == 4 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Intermediary Name
                    </Box>
                    <CloseOutlined onClick={() => setQuotationDateModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <TextField
                    id='intermediaryName'
                    name='intermediaryName'
                    onChange={() => {}}
                    label='Intermediary Name'
                  />
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

export default QuotationListComponent

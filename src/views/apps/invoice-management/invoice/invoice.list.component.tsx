import React from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import { map } from 'rxjs/operators'

import { Box, Modal, TextField, Typography, useTheme } from '@mui/material'

import { CloseOutlined } from '@mui/icons-material'

import { Button } from 'primereact/button'

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import InvoiceAgentListModal from './modals/invoice.agent.list.modal.component'
import InvoiceReversalModal from './modals/invoice.reversal.modal.component'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { InvoiceService } from '@/services/remote-api/api/invoice-services'
import { AgentsService } from '@/services/remote-api/api/agents-services'
import { ClientService } from '@/services/remote-api/api/client-services'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

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

const invoiceService = new InvoiceService()
const agentsService = new AgentsService()
const clientservice = new ClientService()

const columnsDefinations = [
  { field: 'clientName', headerName: 'Client Name' },
  { field: 'invoiceNumber', headerName: 'Invoice Number' },
  { field: 'dateOfInvoice', headerName: 'Invoice date' },
  { field: 'isReverted', headerName: 'Is Reverted' },
  { field: 'totalAmountWithTax', headerName: 'Total Amount' }
]

export default function InvoiceListComponent(props: any) {
  const router = useRouter()
  const [rows, setRows] = React.useState(props.rows)
  const [openAgentListModal, setOpenAgentListModal] = React.useState(false)
  const [reversalModal, setReversalModal] = React.useState(false)
  const [selectedAgentsList, setSelectedAgentsList] = React.useState([])
  const [selectedInvoiceForReversal, setSelectedInvoiceForReversal] = React.useState('')
  const [invoiceModal, setInvoiceModal] = React.useState(false)
  const [invoiceNumber, setInvoiceNumber] = React.useState('')
  const [quotationNumber, setquotationNumber] = React.useState('')
  const [invoiceStartDate, setInvoiceStartDate]: any = React.useState(null)
  const [invoiceEndDate, setInvoiceEndDate] = React.useState(null)
  const [searchType, setSearchType] = React.useState(0)
  const [reloadTable, setReloadTable] = React.useState(false)

  const classes = useStyles()
  const theme = useTheme()

  // api response rendering for table

  const dataSource$: any = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true,

      // invoiceNumber: invoiceNumber,
      dateFrom: invoiceStartDate,
      dateUpto: invoiceEndDate
    }
  ) => {
    pageRequest.sort = ['rowLastUpdatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['name'] = pageRequest.searchKey.trim()
    }

    const pagerequestquery1: any = {
      page: pageRequest.page,
      size: pageRequest.size,
      summary: false,
      invoiceNumber: invoiceNumber
    }

    const pagerequestquery2: any = {
      page: pageRequest.page,
      size: pageRequest.size,
      summary: false

      // invoiceNumber: invoiceNumber,
    }

    const pagerequestquery3: any = {
      page: pageRequest.page,
      size: pageRequest.size,
      summary: false,
      dateFrom: invoiceStartDate - 5.5 * 60 * 60 * 1000,
      dateUpto: !invoiceEndDate ? invoiceStartDate - 5.5 * 60 * 60 * 1000 : invoiceEndDate - 5.5 * 60 * 60 * 1000
    }

    pagerequestquery2.sort = ['rowLastUpdatedDate dsc']

    if (pageRequest.searchKey) {
      pagerequestquery2['invoiceNumber'] = pageRequest.searchKey
      pagerequestquery2['clientName'] = pageRequest.searchKey
    }

    return invoiceService
      .getInvoice(invoiceStartDate ? pagerequestquery3 : invoiceNumber ? pagerequestquery1 : pagerequestquery2)
      .pipe(
        map(data2 => {
          const content = data2.content

          const records = content.map((item: any) => {
            item['dateOfInvoice'] = new Date(item.invoiceDate).toLocaleDateString()
            item['isReverted'] = item.reverted ? 'Yes' + ' ' + '(' + item.type + ')' : 'No'
            item['clientName'] = item.clientName

            return item
          })

          data2.content = records

          return data2
        })
      )
  }

  const handleOpen = () => {
    router.push('/invoices?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection = (invoice: { id: any }) => {
    router.push(`/invoices/${invoice.id}?mode=view`)
  }

  const downloadInvoice = (item: { id: string }) => {
    invoiceService.downloadInvoice(item?.id).subscribe((blob: any) => {
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create a temporary anchor element
      const a = document.createElement('a')

      a.href = downloadUrl
      a.download = `Invoice_${item.id}.pdf` // Set the default file name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a) // Clean up the DOM

      // Release the object URL
      window.URL.revokeObjectURL(downloadUrl)
    })
  }

  const openAgentModal = (invoice: any) => {
    const arr: any = []

    invoice.invoiceAgents.forEach((ag: any) => {
      arr.push(ag.agentId)
    })

    const pageRequest = {
      page: 0,
      size: 100,
      agentIds: arr
    }

    agentsService.getAgents(pageRequest).subscribe(res => {
      if (res.content.length > 0) {
        invoice.invoiceAgents.forEach((ag: any) => {
          res.content.forEach(item => {
            if (ag.agentId === item.id) {
              ag['name'] = item.agentBasicDetails.name
            }
          })
        })
        setSelectedAgentsList(invoice.invoiceAgents)
      }

      setOpenAgentListModal(true)
    })
  }

  const handleCloseAgentListModal = () => {
    setOpenAgentListModal(false)
    setSelectedAgentsList([])
  }

  const handleCloseReversalModal = () => {
    setReversalModal(false)
  }

  const submitReversalModal = (remarks: any) => {
    invoiceService.revertInvoice(remarks, selectedInvoiceForReversal).subscribe(ele => {
      handleCloseReversalModal()

      // window.location.reload();
    })
  }

  const openReversalModal = (item: { id: React.SetStateAction<string> }) => {
    setSelectedInvoiceForReversal(item.id)
    setReversalModal(true)
  }

  const disableMenu = (item: { reverted: any }) => {
    return item.reverted
  }

  // All menu onClick function for handling a Model
  const InvoiceDateClick = (type: any) => {
    setInvoiceModal(true)
    setSearchType(1)
  }

  // const InvoiceNumberClick = type => {
  //   setInvoiceModal(true);
  //   setSearchType(2);
  // };
  const QuotationNumberClick = (type: any) => {
    setInvoiceModal(true)
    setSearchType(3)
  }

  const xlsColumns = ['clientName', 'invoiceNumber', 'dateOfInvoice', 'isReverted', 'totalAmountWithTax']

  const configuration = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    actionButtons: [
      {
        key: 'update_invoice',
        icon: 'pi pi-download', // Changed icon to download
        className: 'ui-button-warning',
        tooltip: 'Download',
        onClick: downloadInvoice
      },
      {
        icon: 'pi pi-eye',
        className: 'ui-button-warning',
        onClick: openEditSection
      },
      {
        icon: 'pi pi-users',
        className: classes.agentListButton,
        onClick: openAgentModal
      },
      {
        icon: 'pi pi-replay',
        disabled: disableMenu,
        className: classes.agentListButton,
        onClick: openReversalModal
      }
    ],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: true,
      onCreateButtonClick: handleOpen,
      text: 'Invoice Management',
      enableGlobalSearch: true,
      selectionMenus: [
        { icon: '', label: 'Invoice Date', onClick: InvoiceDateClick },

        // { icon: '', text: 'Invoice Number', onClick: InvoiceNumberClick },
        { icon: '', label: 'Quotation Number', onClick: QuotationNumberClick }
      ],
      selectionMenuButtonText: 'Advance Search'
    }
  }

  const handleClosed = () => {
    setInvoiceModal(false)
  }

  const onSearch = () => {
    setInvoiceModal(false)
    setReloadTable(true)
    setTimeout(() => {
      setReloadTable(false)
      setInvoiceNumber('')
      setquotationNumber('')
      setInvoiceStartDate(null)
      setInvoiceEndDate(null)
    }, 1000)
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
      <InvoiceAgentListModal
        openAgentListModal={openAgentListModal}
        handleCloseAgentListModal={handleCloseAgentListModal}
        selectedAgentsList={selectedAgentsList}
      />
      <InvoiceReversalModal
        reversalModal={reversalModal}
        handleCloseReversalModal={handleCloseReversalModal}
        selectedInvoiceForReversal={selectedInvoiceForReversal}
        submitReversalModal={submitReversalModal}
      />

      <Modal open={invoiceModal} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box style={modalStyle}>
          <Box>
            <Box id='alert-dialog-slide-description'>
              {searchType == 1 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Invoice Date
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
                            value={invoiceStartDate}
                            onChange={date => setInvoiceStartDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={invoiceStartDate}
                            onChange={date => setInvoiceStartDate(date)}
                            renderInput={params => (
                              <TextField
                                {...params}
                                margin='normal'
                                style={{ marginBottom: '0px' }}
                                variant='outlined'
                              />
                            )}
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
                            value={invoiceEndDate}
                            onChange={date => setInvoiceEndDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={invoiceEndDate}
                            onChange={date => setInvoiceEndDate(date)}
                            renderInput={params => (
                              <TextField
                                {...params}
                                margin='normal'
                                style={{ marginBottom: '0px' }}
                                variant='outlined'
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {/* {searchType == 2 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component="h3" marginBottom={'10px'}>
                      Invoice Number
                    </Box>
                    <CloseOutlined onClick={() => setInvoiceModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <TextField
                    id="invoiceNumber"
                    name="invoiceNumber"
                    onChange={e => {
                      setInvoiceNumber(e.target.value);
                    }}
                    label="Invoice Number"
                  />
                </>
              )} */}
              {searchType == 3 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Quotation Number
                    </Box>
                    <CloseOutlined onClick={() => setInvoiceModal(false)} style={{ cursor: 'pointer' }} />
                  </Box>
                  <TextField
                    id='quotationNumber'
                    name='quotationNumber'
                    onChange={e => {
                      setquotationNumber(e.target.value)
                    }}
                    label='Quotation Number'
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
    </div>
  )
}

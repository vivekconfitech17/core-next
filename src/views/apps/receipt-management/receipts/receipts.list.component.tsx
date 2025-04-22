import React from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import { map, switchMap } from 'rxjs/operators'

import { Box, Button, Modal, TextField, Typography, useTheme } from '@mui/material'
import { CloseOutlined } from '@mui/icons-material'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import ReceiptReversalModal from './modals/receipts.revert.modal.component'
import { ClientService } from '@/services/remote-api/api/client-services'
import { ReceiptService } from '@/services/remote-api/api/receipts-services'

import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'RECEIPT'
const roleService = new RoleService()

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
  padding: '2% 3%',
  borderRadius: '20px'
}

const receiptService = new ReceiptService()
const clientservice = new ClientService()

const columnsDefinations = [
  { field: 'receiptNumber', headerName: 'Receipt Number' },
  { field: 'dateOfReceipt', headerName: 'Receipt date' },
  { field: 'clientOrProspectId', headerName: 'Client id' },
  { field: 'isReverted', headerName: 'Is Reverted' }
]

export default function ReceiptListComponent(props: any) {
  const router = useRouter()
  const classes = useStyles()
  const theme = useTheme()
  const [searchType, setSearchType] = React.useState(0)
  const [reversalModal, setReversalModal] = React.useState(false)
  const [reloadTable, setReloadTable] = React.useState(false)
  const [receiptStartDate, setReciptStartDate]: any = React.useState(null)
  const [receiptEndDate, setReciptEndDate]: any = React.useState(null)
  const [selectedReceiptForReversal, setSelectedReceiptForReversal] = React.useState('')

  const handleOpen = () => {
    router.push('/receipts?mode=create')
  }

  const openEditSection = (receipt: any) => {
    router.push(`/receipts/${receipt.id}?mode=view`)
  }

  const handleCloseReversalModal = () => {
    setReversalModal(false)
  }

  const submitReversalModal = (remarks: any) => {
    receiptService.revertReceipt(remarks, selectedReceiptForReversal).subscribe(ele => {
      handleCloseReversalModal()
      setReloadTable(true)
    })
  }

  const openReversalModal = (item: any) => {
    setSelectedReceiptForReversal(item.id)
    setReversalModal(true)
  }

  const downloadReceipt = (item: { id: string }) => {
    receiptService.getReceiptDownload(item?.id).subscribe((blob: any) => {
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create a temporary anchor element
      const a = document.createElement('a')

      a.href = downloadUrl
      a.download = `Receipt_${item.id}.pdf` // Set the default file name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a) // Clean up the DOM

      // Release the object URL
      window.URL.revokeObjectURL(downloadUrl)
    })
  }

  const disableMenu = (item: { reverted: any }) => {
    return item.reverted
  }

  const dataSource$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true
    },
    page = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      receiptDateStart: receiptStartDate === '' ? 0 : receiptStartDate - 5.5 * 60 * 60 * 1000,
      receiptDateEnd:
        receiptEndDate === ''
          ? receiptStartDate === ''
            ? 0
            : Number(receiptStartDate) - 5.5 * 60 * 60 * 1000
          : !receiptEndDate
            ? Number(receiptStartDate) - 5.5 * 60 * 60 * 1000
            : Number(receiptEndDate) - 5.5 * 60 * 60 * 1000
    }
  ) => {
    pageRequest.sort = ['rowLastUpdatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['name'] = pageRequest.searchKey.trim()
    }

    return clientservice
      .getClients(pageRequest)
      .pipe(
        map(data => {
          const content = data.content
          const clientIds = content.map(item => item.id)

          return clientIds
        })
      )
      .pipe(
        switchMap(clientIds => {
          const pagerequestquery2: any = {
            page: pageRequest.page,
            size: pageRequest.size,
            summary: false
          }

          pagerequestquery2.sort = ['rowLastUpdatedDate dsc']

          if (pageRequest.searchKey) {
            pagerequestquery2['receiptNumber'] = pageRequest.searchKey
            pagerequestquery2['clientIds'] = pageRequest.searchKey
          }

          delete pageRequest.searchKey

          return receiptService.getReceipts(searchType === 1 ? page : pagerequestquery2).pipe(
            map(data2 => {
              const content = data2.content

              const records = content.map((item: any) => {
                item['dateOfReceipt'] = new Date(item.receiptDate).toLocaleDateString()
                item['isReverted'] = item.reverted ? 'Yes' + ' ' + '(' + item.type + ')' : 'No'

                return item
              })

              data2.content = records

              return data2
            })
          )
        })
      )
  }

  // Receipt Start Date
  const openReciptDate = () => {
    setReversalModal(true)
    setSearchType(1)
  }

  const actionBtnList = [
    {
      key: 'update_receipt',
      icon: 'pi pi-download', // Changed icon to download
      className: 'ui-button-warning',
      tooltip: 'Download',
      onClick: downloadReceipt
    },
    {
      key: 'update_receipt',
      icon: 'pi pi-eye',
      className: 'ui-button-warning',
      onClick: openEditSection
    },
    {
      key: 'view_agent',
      icon: 'pi pi-replay',
      disabled: disableMenu,
      className: classes.agentListButton,
      onClick: openReversalModal
    }
  ]

  const xlsColumns = ['receiptNumber', 'dateOfReceipt', 'clientOrProspectId', 'isReverted']

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList),
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Receipt Management',
      enableGlobalSearch: true,

      // searchText:"Search by code,name,type,contact"
      //   onSelectionChange: handleSelectedRows,
      selectionMenus: [{ icon: '', label: 'Receipt Date', onClick: openReciptDate }]

      //   selectionMenuButtonText: "Action"
    }
  }

  const onSearch = () => {
    setReversalModal(false)
    setReloadTable(true)
    setTimeout(() => {
      setReloadTable(false)
      setReciptStartDate('')
      setReciptEndDate('')
    }, 1000)
  }

  return (
    <div>
      <ReceiptReversalModal
        reversalModal={reversalModal}
        handleCloseReversalModal={handleCloseReversalModal}
        selectedReceiptForReversal={selectedReceiptForReversal}
        submitReversalModal={submitReversalModal}
      />
      {/* <DataGrid rows={rows} columns={props.columns} pageSize={10} /> */}
      <FettleDataGrid
        $datasource={dataSource$}
        config={configuration}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
        reloadtable={reloadTable}
      />

      <Modal open={reversalModal} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box style={modalStyle}>
          <Box>
            <Box id='alert-dialog-slide-description'>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Box component='h3' marginBottom={'10px'}>
                  Recipt Date
                </Box>
                <CloseOutlined onClick={() => setReversalModal(false)} style={{ cursor: 'pointer' }} />
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
                        value={receiptStartDate}
                        onChange={(date: any) => setReciptStartDate(date)}
                        KeyboardButtonProps={{
                          'aria-label': 'change ing date',
                        }}
                      />
                    </MuiPickersUtilsProvider> */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        views={['year', 'month', 'day']}
                        value={receiptStartDate}
                        onChange={(date: any) => setReciptStartDate(date)}
                        renderInput={params => (
                          <TextField {...params} margin='normal' style={{ marginBottom: '0px' }} variant='outlined' />
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
                        value={receiptEndDate}
                        onChange={(date: any) => setReciptEndDate(date)}
                        KeyboardButtonProps={{
                          'aria-label': 'change ing date',
                        }}
                      />
                    </MuiPickersUtilsProvider> */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        views={['year', 'month', 'day']}
                        value={receiptEndDate}
                        onChange={(date: any) => setReciptEndDate(date)}
                        renderInput={params => (
                          <TextField {...params} margin='normal' style={{ marginBottom: '0px' }} variant='outlined' />
                        )}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box marginTop={'10%'}>
            <Button
              variant='contained'
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

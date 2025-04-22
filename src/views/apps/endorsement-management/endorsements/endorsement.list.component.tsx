import 'date-fns'
import React, { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'

import { map } from 'rxjs/operators'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
// import DateFnsUtils from '@date-io/date-fns';
import { Button } from 'primereact/button'

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { Box, Modal, TextField, Typography, useTheme } from '@mui/material'

import { CloseOutlined } from '@mui/icons-material'

import { EndorsementService } from '@/services/remote-api/api/endorsement-services'
import { CategoryService } from '@/services/remote-api/api/master-services'
import { PlanService } from '@/services/remote-api/api/plan-services'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const useStyles = makeStyles((theme: any) => ({
  tableBg: {
    height: 400,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  formControl: {
    margin: theme.spacing ? theme.spacing(1) : '8px',
    minWidth: 120
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

const endorsementservice = new EndorsementService()
const planservice = new PlanService()
const categoryservice = new CategoryService()

const pls$ = planservice.getPlans()
const ct$ = categoryservice.getCategories()

const columnsDefinations = [
  { field: 'id', headerName: 'Endorsement Number' },
  { field: 'endorsementDateVal', headerName: 'Endorsement Date' },
  { field: 'policyId', headerName: 'Policy Id' },
  { field: 'totalPremium', headerName: 'Premium Amount' },
  { field: 'status', headerName: 'Status' }
]

export default function EndorsementListComponent(props: any) {
  const history = useRouter()
  const [rows, setRows] = React.useState(props.rows)
  const [planList, setPlanList] = React.useState([])
  const [categoryList, setCategoryList] = React.useState([])
  const [generateInvoiceMenuDisabled, setGenerateInvoiceMenuDisabled] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [searchType, setSearchType] = React.useState()
  const [endorsementStartDate, setEndorsementStartDate] = React.useState<any>()
  const [endorsementEndDate, setEndorsementEndDate] = React.useState<any>()
  const [reloadTable, setReloadTable] = React.useState(false)
  const [selectedEndorsements, setSelectedEndorsements] = React.useState<any>([])
  const [selectedPolicyId, setSelectedPolicyId] = React.useState(null)
  const theme = useTheme()

  const dataSource$: any = (
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
      endorsementStartDate: endorsementStartDate === '' ? 0 : endorsementStartDate - 5.5 * 60 * 60 * 1000,
      endorsementEndDate:
        endorsementEndDate === ''
          ? endorsementStartDate === ''
            ? 0
            : Number(endorsementStartDate) - 5.5 * 60 * 60 * 1000
          : !endorsementEndDate
            ? Number(endorsementStartDate) - 5.5 * 60 * 60 * 1000
            : Number(endorsementEndDate) - 5.5 * 60 * 60 * 1000
    }
  ) => {
    pageRequest.sort = ['rowLastUpdatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['id'] = pageRequest.searchKey.trim()
    }

    delete pageRequest.searchKey

    return endorsementservice.getEndorsements(searchType === 1 ? page : pageRequest).pipe(
      map(data => {
        const content = data.content

        const records = content.map(item => {
          item['endorsementDateVal'] = new Date(item.endorsementDate).toLocaleDateString()

          return item
        })

        data.content = records

        return data
      })
    )
  }

  const useObservable2 = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        const tableArr: any = []

        if (result.content && result.content.length > 0) {
          result.content.forEach((ele: any) => {
            tableArr.push({
              name: ele.name,
              id: ele.id
            })
          })
        }

        setter(tableArr)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable2(pls$, setPlanList)
  useObservable(ct$, setCategoryList)

  const classes = useStyles()

  const handleOpen = () => {
    history.push('/endorsements?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection = (provider: any) => {
    history.push(`/endorsements/${provider.id}?mode=edit`)
  }

  const isSelectable = (rowData: any) => {
    if (!selectedPolicyId) {
      if (rowData.status !== 'APPROVED') {
        alert('Only APPROVED endorsements can be selected')

        return false
      }

      return true
    }

    const isSelectableRow = rowData.policyId === selectedPolicyId

    if (rowData.status !== 'APPROVED') {
      alert('Only APPROVED endorsements can be selected')

      return false
    }

    if (!isSelectableRow) {
      alert('You cannot select endorsements of different policies')

      return false
    }

    return isSelectableRow
  }

  const handleSelectedRows = (selectedEndorsements: any) => {
    if (selectedEndorsements.length === 0) {
      setGenerateInvoiceMenuDisabled(true)
      setSelectedPolicyId(null)
    } else {
      setGenerateInvoiceMenuDisabled(false)
      setSelectedEndorsements(selectedEndorsements)

      if (!selectedPolicyId) {
        setSelectedPolicyId(selectedEndorsements[0].policyId)
      }
    }
  }

  const generateInvoice = (e: any) => {
    if (selectedEndorsements.length > 0) {
      const EndorsementIds: any = []

      selectedEndorsements.forEach((el: any) => {
        EndorsementIds.push(el.id)
      })
      history.push(
        `/invoices?mode=create&policy=${selectedEndorsements[0]?.policyId}&client=${selectedEndorsements[0]?.clientId}&id=${EndorsementIds}`
      )
    } else {
      alert('Please select Endorsement!!!')
    }
  }

  const xlsColumns = ['id', 'endorsementDateVal', 'policyId', 'adjustPremiumAmt']

  const handleAppove = (endorsement: any) => {
    endorsementservice.approveEndorsement(endorsement.id).subscribe(res => {
      setReloadTable(true)
      setTimeout(() => {
        setReloadTable(false)
      }, 1000)
    })
  }

  const configuration: any = {
    enableSelection: true,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: [
      {
        icon: 'pi pi-user-edit',
        className: 'ui-button-warning',
        onClick: openEditSection,
        disabled: (q: any) => q.status === 'APPROVED'
      },
      {
        key: 'update_quotation',
        icon: 'pi pi-check',
        onClick: handleAppove,
        tooltip: 'Approve',
        disabled: (q: any) => q.status !== 'PREMIUM_CALCULATION_COMPLETED'
      }
    ],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: true,
      onCreateButtonClick: handleOpen,
      text: 'Endorsement Management',
      enableGlobalSearch: true,
      searchText: 'Search by Endorsement number',
      onSelectionChange: handleSelectedRows,
      selectionMenus: [{ icon: '', label: 'Generate Invoice', onClick: generateInvoice }],
      selectionMenuButtonText: 'Action'
    }
  }

  const onSearch = () => {
    setOpen(false)
    setReloadTable(true)
    setTimeout(() => {
      setReloadTable(false)
      setEndorsementStartDate(null)
      setEndorsementEndDate(null)
    }, 1000)
  }

  return (
    <div>
      <FettleDataGrid
        $datasource={dataSource$}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
        config={configuration}
        isRowSelectable={isSelectable}
        reloadtable={reloadTable}
      />

      <Modal open={open} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box style={modalStyle}>
          <Box>
            <Box id='alert-dialog-slide-description'>
              {searchType == 1 && (
                <>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box component='h3' marginBottom={'10px'}>
                      Endorsement Date
                    </Box>
                    <CloseOutlined onClick={() => setOpen(false)} style={{ cursor: 'pointer' }} />
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
                            value={endorsementStartDate}
                            onChange={date => setEndorsementStartDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={endorsementStartDate}
                            onChange={(date: any) => setEndorsementStartDate(date)}
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
                            value={endorsementEndDate}
                            onChange={date => setEndorsementEndDate(date)}
                            KeyboardButtonProps={{
                              'aria-label': 'change ing date',
                            }}
                          />
                        </MuiPickersUtilsProvider> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year', 'month', 'day']}
                            value={endorsementEndDate}
                            onChange={(date: any) => setEndorsementEndDate(date)}
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

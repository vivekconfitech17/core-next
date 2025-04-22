
import React from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import { map, switchMap } from 'rxjs/operators'

import { AgentsService } from '@/services/remote-api/api/agents-services'
import { ClientService } from '@/services/remote-api/api/client-services'
import { InvoiceService } from '@/services/remote-api/api/invoice-services'
import { ClientTypeService } from '@/services/remote-api/fettle-remote-api'
import InvoiceAgentListModal from './modals/invoice.agent.list.modal.component'
import InvoiceReversalModal from './modals/invoice.reversal.modal.component'

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

const invoiceService = new InvoiceService()
const agentsService = new AgentsService()
const clientservice = new ClientService()
const clienttypeervice = new ClientTypeService()

const dataSource$ = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  let clientData: any[]

  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (pageRequest.searchKey) {
    pageRequest['name'] = pageRequest.searchKey.trim()
  }

  return clientservice
    .getClients(pageRequest)
    .pipe(
      map(data => {
        const content = data.content

        clientData = content
        const clientIds = content.map(item => item.id)

        return clientIds
      })
    )
    .pipe(
      switchMap((clientIds: any) => {
        const pagerequestquery2: any = {
          page: pageRequest.page,
          size: pageRequest.size,
          summary: false
        }

        pagerequestquery2.sort = ['rowCreatedDate dsc']

        // pagerequestquery2.clientOrProspectId= "1143540719000559616";
        if (pageRequest.searchKey) {
          // pagerequestquery2["invoiceDate"] = pageRequest.searchKey;
          pagerequestquery2['invoiceNumber'] = pageRequest.searchKey.trim()
          pagerequestquery2['clientIds'] = clientIds.trim()
        }

        delete pageRequest.searchKey

        return invoiceService
          .getFundInvoice(pagerequestquery2)
          .pipe(
            map((data2: any) => {
              const content = data2.content

              const records = content.map((item: any) => {
                const clientName = clientData?.find(ele => ele?.id == item?.clientOrProspectId)

                item['dateOfInvoice'] = new Date(item.invoiceDate).toLocaleDateString()
                item['isReverted'] = item.reverted ? 'Yes' + ' ' + '(' + item.type + ')' : 'No'
                item['clientName'] = clientName?.clientBasicDetails?.displayName

                return item
              })

              data2.content = records

              return data2
            })
          )
          .pipe(
            switchMap(data => {
              return clienttypeervice.getCleintTypes().pipe(
                map(ct => {
                  data.content.forEach((cl: any) => {
                    ct.content.forEach(clienttype => {
                      if (cl.clientOrProspectType === clienttype.code || cl.clientOrProspectType === clienttype.id) {
                        cl['clientOrProspectType'] = clienttype.name
                      }
                    })
                  })

                  return data
                })
              )
            })
          )
      })
    )
}

// const dataSource$ = (pageRequest = {
//   page: 0,
//   size: 5,
//   summary: true,
//   active: true
// }) => {
//   agentsService.getAgents(pageRequest).
//     map(val => {
//     val.content.forEach(ele => {
//       ele['primaryContact'] = ele.agentBasicDetails.contactNos[0].contactNo
//     })
//     return val
//   })
// };
const columnsDefinations = [
  {
    field: 'invoiceNumber',
    headerName: 'Invoice Number',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere' }}>{rowData.invoiceNumber}</span>
  },
  { field: 'clientName', headerName: 'Client Name' },
  { field: 'invoiceType', headerName: 'Invoice Type' },
  { field: 'clientOrProspectType', headerName: 'Client Type' },
  { field: 'dateOfInvoice', headerName: 'Invoice date' },
  { field: 'totalInvoiceAmount', headerName: 'Total Amount' }
]

export default function FundInvoiceListComponent(props: any) {
  const router = useRouter()
  const [rows, setRows] = React.useState(props.rows)
  const [openAgentListModal, setOpenAgentListModal] = React.useState(false)
  const [reversalModal, setReversalModal] = React.useState(false)
  const [selectedAgentsList, setSelectedAgentsList] = React.useState([])
  const [selectedInvoiceForReversal, setSelectedInvoiceForReversal] = React.useState('')
  const [reloadTable, setReloadTable] = React.useState(false)

  const classes = useStyles()

  const handleOpen = () => {
    router.push('/invoices?mode=create&type=fund')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection = (invoice: any) => {
    localStorage.setItem('InvoiceNumber', invoice.invoiceNumber)
    router.push(`/invoices/${invoice.id}?mode=view&type=fund`)
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
    invoiceService.revertFundInvoice(remarks, selectedInvoiceForReversal).subscribe(ele => {
      handleCloseReversalModal()
      setReloadTable(true)
      setTimeout(() => {
        setReloadTable(false)
      }, 3000)
    })
  }

  const openReversalModal = (item: any) => {
    setSelectedInvoiceForReversal(item.id)
    setReversalModal(true)
  }

  const disableMenu = (item: { reverted: any }) => {
    return item.reverted
  }

  const xlsColumns = [
    'invoiceNumber',
    'clientName',
    'invoiceType',
    'clientOrProspectType',
    'dateOfInvoice',
    'totalInvoiceAmount'
  ]

  const configuration = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    actionButtons: [
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
      text: 'Fund Invoice Management',
      enableGlobalSearch: true

      // searchText:"Search by code,name,type,contact"
      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    }
  }

  const style = {
    fontSize: '14px'
  }

  return (
    <div>
      {/* <DataGrid rows={rows} columns={props.columns} pageSize={10} /> */}
      <FettleDataGrid
        $datasource={dataSource$}
        config={configuration}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
        // style={style}
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
    </div>
  )
}

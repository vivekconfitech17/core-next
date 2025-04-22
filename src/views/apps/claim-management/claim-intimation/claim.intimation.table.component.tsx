import React from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'
import { map, switchMap } from 'rxjs/operators'

import { AgentsService } from '@/services/remote-api/api/agents-services'
import { ClaimsIntimationService } from '@/services/remote-api/api/claims-services'
import { InvoiceService } from '@/services/remote-api/api/invoice-services'
import { ProvidersService } from '@/services/remote-api/api/provider-services'
import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const roleService = new RoleService()

const PAGE_NAME = 'PRE_AUTH'

const useStyles = makeStyles((theme: any) => ({
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
  }
}))

const invoiceService = new InvoiceService()
const agentsService = new AgentsService()
const claimintimationservice = new ClaimsIntimationService()
const providerservice = new ProvidersService()

const dataSource$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowCreatedDate dsc']

  // if (pageRequest.searchKey) {
  //   pageRequest['name'] = pageRequest.searchKey;
  // }
  return claimintimationservice
    .getClaimsIntimation(pageRequest)
    .pipe(
      map(data => {
        const content = data.content

        const records = content.map(item => {
          item['lossDateVal'] = new Date(item.lossDate).toLocaleDateString()

          return item
        })

        data.content = records

        return data
      })
    )
    .pipe(
      switchMap(data => {
        return providerservice
          .getProviders({
            page: 0,
            size: 100,
            summary: true,
            active: true
          })
          .pipe(
            map(data2 => {
              data.content.forEach(cldata => {
                data2.content.forEach(proData => {
                  if (cldata.providerId === proData.id) {
                    cldata['providerName'] = proData.providerBasicDetails.name
                  }
                })
              })

              return data
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
  { field: 'providerName', headerName: 'Provider Name' },
  { field: 'membershipNo', headerName: 'Membership No.' },
  { field: 'providerInvoiceNo', headerName: 'Provider Invoice No.' },
  { field: 'lossDateVal', headerName: 'Loss Date' }
]

export default function ClaimIntimationListComponent(props: any) {
  const history = useRouter()
  const [rows, setRows] = React.useState(props.rows)
  const [openAgentListModal, setOpenAgentListModal] = React.useState(false)
  const [reversalModal, setReversalModal] = React.useState(false)
  const [selectedAgentsList, setSelectedAgentsList] = React.useState([])
  const [selectedInvoiceForReversal, setSelectedInvoiceForReversal] = React.useState('')

  const classes = useStyles()

  const handleOpen = () => {
    history.push('/claims/claims-intimation?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection = (item: any) => {
    history.push(`/claims/claims-intimation/${item.id}?mode=view`)
  }

  const openReimbursement = (item: any) => {
    if (item.preAuthId) {
      history.push(`/claims/claims?mode=create&type=intimation&isPreAuth=true&membershipNo=` + item.membershipNo)
    } else {
      if (item.documentReceiveFrom == 'Insured') {
        history.push(`/claims/claims-reimbursement?mode=create&type=intimation&membershipNo=` + item.membershipNo)
      } else {
        history.push(`/claims/claims?mode=create&type=intimation&membershipNo=` + item.membershipNo)
      }
    }
  }

  const xlsColumns = ['providerName', 'membershipNo', 'providerInvoiceNo', 'lossDateVal']

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,

    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    actionButtons: [
      {
        key: 'update_intimation',
        icon: 'pi pi-pencil',
        className: classes.categoryButton,
        onClick: openEditSection,
        tooltip: 'Edit'
      },
      {
        key: 'update_intimation',
        icon: 'pi pi-book',
        className: classes.categoryButton,
        onClick: openReimbursement,
        tooltip: 'Claim'
      }
    ],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Claim Intimation Management',
      enableGlobalSearch: false,
      searchText: 'Search by code, name, type, contact'

      // onSelectionChange: handleSelectedRows,
      // selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
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
      />
    </div>
  )
}

// import { makeStyles } from '@material-ui/core/styles';
'use client'
import React from 'react'

import { useRouter } from 'next/navigation'

import moment from 'moment'

import { map } from 'rxjs/operators'

import { AgentsService } from '@/services/remote-api/api/agents-services'
import { AgentTypeService } from '@/services/remote-api/api/master-services'

// import makeStyles from '@mui/styles';

// import { useHistory } from 'react-router-dom';

import RoleService from '../../../../services/utility/role/index'
import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

// import { AgentsService } from '../../remote-api/api/agents-services';
// import { AgentTypeService } from '../../remote-api/api/master-services';
// import { FettleDataGrid } from '../../shared-components';

const agenttypeservice = new AgentTypeService()

const roleService = new RoleService()

const PAGE_NAME = 'AGENT'

// const useStyles = makeStyles(() => ({
//   tableBg: {
//     height: 400,
//     width: '100%',
//     backgroundColor: '#fff',
//     boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
//     borderRadius: '4px',
//   },
// }));

const agentsService = new AgentsService()

const dataSource$ = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (pageRequest.searchKey) {
    pageRequest['code'] = pageRequest.searchKey.trim()
    pageRequest['type'] = pageRequest.searchKey.trim()
    pageRequest['name'] = pageRequest.searchKey.trim()
    pageRequest['contactNo'] = pageRequest.searchKey.trim()
  }

  delete pageRequest.searchKey

  return agentsService.getAgentCommissionList(pageRequest).pipe(
    map((data: any) => {
      const content = data.content

      const records = content.map((item: any) => {
        item['validFrom'] = moment(item.validFrom).format('DD/MM/YYYY')

        return item
      })

      data.content = records

      return data
    })
  )
}

// const getData =()=>{
//     let subscription = acl$?.subscribe((result) => {
//         // return result;
//     })
// }

// useEffect(()=>{
//     getData();
// },[])

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
  { field: 'clientType', headerName: 'Client Type' },
  { field: 'agentType', headerName: 'Agent Type' },
  { field: 'validFrom', headerName: 'Valid From' }

  //   { field: 'agentBasicDetails.primaryContact', headerName: 'Contact Number' },
]

function CommissionListComponent(props: any) {
  // const history = useHistory();
  const router = useRouter()
  const [rows, setRows] = React.useState(props.rows)



  const handleOpen = () => {
    router.push('/agents/commission?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])
React.useEffect(()=>{
  if (localStorage.getItem('agentId')) {
    localStorage.removeItem('agentId')
  }
},[])
  const openEditSection = (agent: any) => {
    router.push(`/agents/commission/${agent?.id}?mode=edit`)
  }

  const xlsColumns = ['clientType', 'agentType', 'validFrom']

  const [configuration, setConfiguration] = React.useState({
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: [],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: false,
      onCreateButtonClick: handleOpen,
      text: 'Agent Commision',
      enableGlobalSearch: true,
      searchText: 'Search by code, name, type, contact'
    }
  })

  React.useEffect(() => {
    setConfiguration(prevConfig => ({
      ...prevConfig,
      actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE'),
      header: {
        ...prevConfig.header,
        addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE')
      }
    }))
  }, [])

  // const configuration = {
  //   enableSelection: false,
  //   scrollHeight: '300px',
  //   pageSize: 10,
  //   actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE'),
  //   header: {
  //     enable: true,
  //     enableDownload: true,
  //     downloadbleColumns: xlsColumns,
  //     addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
  //     onCreateButtonClick: handleOpen,
  //     text: 'Agent Commision',
  //     enableGlobalSearch: true,
  //     searchText: 'Search by code, name, type, contact'
  //   }
  // }

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

export default CommissionListComponent

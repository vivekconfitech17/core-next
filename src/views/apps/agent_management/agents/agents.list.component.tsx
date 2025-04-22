'use client'
import React, { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { map, switchMap } from 'rxjs/operators'

import { TabView, TabPanel } from 'primereact/tabview'

import { Toast } from 'primereact/toast'

import RoleService from '@/services/utility/role/index'
import { AgentsService } from '@/services/remote-api/api/agents-services'
import { AgentTypeService } from '@/services/remote-api/api/master-services'
import CommissionListComponent from '../commission/commission.list.component'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const agenttypeservice = new AgentTypeService()

const PAGE_NAME = 'AGENT'

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

  return agentsService
    .getAgents(pageRequest)
    .pipe(
      map(data => {
        const content = data.content

        const records = content.map((item: any) => {
          item['agentBasicDetails']['primaryContact'] = item.agentBasicDetails.contactNos[0].contactNo

          return item
        })

        data.content = records

        return data
      })
    )
    .pipe(
      switchMap(data => {
        return agenttypeservice.getAgentTypes().pipe(
          map(at => {
            data.content.forEach((ag: any) => {
              at.content.forEach(agenttype => {
                if (ag.agentBasicDetails.type === agenttype.code) {
                  ag['agentType'] = agenttype.name
                }
              })
            })

            return data
          })
        )
      })
    )
}

const dataSourcePending$ = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true,
    isApproved: false
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

  return agentsService
    .getAgents(pageRequest)
    .pipe(
      map(data => {
        const content = data.content

        const records = content.map((item: any) => {
          item['agentBasicDetails']['primaryContact'] = item.agentBasicDetails.contactNos[0].contactNo

          return item
        })

        data.content = records

        return data
      })
    )
    .pipe(
      switchMap(data => {
        return agenttypeservice.getAgentTypes().pipe(
          map(at => {
            data.content.forEach((ag: any) => {
              at.content.forEach(agenttype => {
                if (ag.agentBasicDetails.type === agenttype.code) {
                  ag['agentType'] = agenttype.name
                }
              })
            })

            return data
          })
        )
      })
    )
}

export default function AgentsListComponent(props: any) {
  const router = useRouter()
  const [value, setValue] = React.useState(0)
  const [reloadTable, setReloadTable] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [rows, setRows] = React.useState(props.rows)
  const toast: any = React.useRef(null)
  const roleService = new RoleService()

  useEffect(() => {
    if (localStorage.getItem('agentId')) {
      localStorage.removeItem('agentId')
    }
  })

  const handleOpen = () => {
    router.push('/agents/management?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection: any = (agent: any) => {
    router.push(`/agents/management/${agent.id}?mode=edit`)
  }

  const handleClickForAppoveOpen = (agent: any) => {
    agentsService.approveAgent(agent.id).subscribe(res => {
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Agent Approved',
        life: 3000
      })
      setTimeout(() => {
        setReloadTable(true)
      }, 1500)
    })
  }

  const columnsDefinationsActive = [
    { field: 'agentBasicDetails.name', headerName: 'Agent Name' },
    { field: 'agentBasicDetails.code', headerName: 'Agent Code' },
    { field: 'agentType', headerName: 'Agent Type' },
    { field: 'agentBasicDetails.primaryContact', headerName: 'Contact Number' },
    {
      field: 'agentBasicDetails.status',
      headerName: 'Status',
      body: (rowData: any) => <span>{rowData.agentBasicDetails.status ? 'Active' : 'Inactive'}</span>
    },
    {
      field: 'agentBasicDetails.joiningDate',
      headerName: 'Joining Date',
      body: (rowData: any) => <span>{new Date(rowData.agentBasicDetails.joiningDate).toLocaleDateString()}</span>
    }
  ]

  const columnsDefinationsTerminated = [
    { field: 'agentBasicDetails.name', headerName: 'Agent Name' },
    { field: 'agentBasicDetails.code', headerName: 'Agent Code' },
    { field: 'agentType', headerName: 'Agent Type' },
    { field: 'agentBasicDetails.primaryContact', headerName: 'Contact Number' },
    {
      field: 'agentBasicDetails.status',
      headerName: 'Status',
      body: (rowData: any) => <span>{rowData.agentBasicDetails.status ? 'Active' : 'Inactive'}</span>
    },
    {
      field: 'agentBasicDetails.joiningDate',
      headerName: 'Joining Date',
      body: (rowData: any) => <span>{new Date(rowData.agentBasicDetails.joiningDate).toLocaleDateString()}</span>
    },
    {
      field: 'agentBasicDetails.terminationDate',
      headerName: 'Termination Date',
      body: (rowData: any) => <span>{new Date(rowData.agentBasicDetails.terminationDate).toLocaleDateString()}</span>
    }
  ]

  const actionBtnList = [
    {
      key: 'update_provider',
      icon: 'pi pi-check',
      onClick: handleClickForAppoveOpen,
      tooltip: 'Approve'
    },
    {
      key: 'update_provider',
      icon: 'pi pi-user-edit',
      className: 'ui-button-warning',
      onClick: openEditSection
    }
  ]

  const [configuration, setConfiguration] = React.useState({
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: [],
    header: {
      enable: true,
      enableDownload: true,
      addCreateButton: false,
      onCreateButtonClick: handleOpen,
      text: 'Agent Management',
      enableGlobalSearch: true,
      searchText: 'Search by code, name, type, contact'
    }
  })

  const [configurationPending, setConfigurationPending] = React.useState({
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,

    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    actionButtons: [],
    header: {
      enable: true,
      enableDownload: true,
      text: 'Pending Agents',
      enableGlobalSearch: true,
      searchText: 'Search by code, name, type, contact'
    }
  })

  const [configurationTerminated, setConfigurationTerminated] = React.useState({
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: [],
    header: {
      enable: true,
      enableDownload: true,
      text: 'Terminated Agents',
      enableGlobalSearch: true,
      searchText: 'Search by code, name, type, contact'
    }
  })

  // const configuration = {
  //   enableSelection: false,
  //   scrollHeight: '300px',
  //   pageSize: 10,
  //   actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
  //   header: {
  //     enable: true,
  //     enableDownload: true,
  //     addCreateButton: value == 0 && roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
  //     onCreateButtonClick: handleOpen,
  //     text: 'Agent Management',
  //     enableGlobalSearch: true,
  //     searchText: 'Search by code, name, type, contact'
  //   }
  // }
  useEffect(() => {
    setConfiguration(prevConfig => ({
      ...prevConfig,
      actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
      header: {
        ...prevConfig.header,
        addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE')
      }
    }))
    setConfigurationPending(prevConfig => ({
      ...prevConfig,
      actionButtons: roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList)
    }))
    setConfigurationTerminated(prevConfig => ({
      ...prevConfig,
      actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection)
    }))
  }, [])

  // const configurationPending = {
  //   enableSelection: false,
  //   scrollHeight: '300px',
  //   pageSize: 10,
  //   // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
  //   actionButtons: roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList),
  //   header: {
  //     enable: true,
  //     enableDownload: true,
  //     text: 'Pending Agents',
  //     enableGlobalSearch: true,
  //     searchText: 'Search by code, name, type, contact'
  //   }
  // }

  // const configurationTerminated = {
  //   enableSelection: false,
  //   scrollHeight: '300px',
  //   pageSize: 10,
  //   actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
  //   header: {
  //     enable: true,
  //     enableDownload: true,
  //     text: 'Terminated Agents',
  //     enableGlobalSearch: true,
  //     searchText: 'Search by code, name, type, contact'
  //   }
  // }

  return (
    <>
      <Toast ref={toast} />
      <TabView
        scrollable
        style={{ fontSize: '14px' }}
        activeIndex={activeIndex}
        onTabChange={e => setActiveIndex(e.index)}
      >
        <TabPanel leftIcon='pi pi-user mr-2' header='Active Agent'>
          <FettleDataGrid
            $datasource={dataSource$}
            config={configuration}
            columnsdefination={columnsDefinationsActive}
            onEdit={openEditSection}
          />
        </TabPanel>
        <TabPanel leftIcon='pi pi-user mr-2' header='Pending Approval Agent'>
          <FettleDataGrid
            $datasource={dataSourcePending$}
            config={configurationPending}
            columnsdefination={columnsDefinationsActive}
            onEdit={openEditSection}
            reloadtable={reloadTable}
          />
        </TabPanel>
        <TabPanel leftIcon='pi pi-user-minus mr-2' header='Terminated Agent'>
          <FettleDataGrid
            $datasource={dataSource$}
            config={configurationTerminated}
            columnsdefination={columnsDefinationsTerminated}
            onEdit={openEditSection}
          />
          {/* </div> */}
        </TabPanel>
        <TabPanel leftIcon='pi pi-percentage mr-2' header='Agent Commission'>
          <CommissionListComponent />
        </TabPanel>
      </TabView>
    </>
  )
}

import React from 'react'

import { useRouter } from 'next/navigation'

import { map } from 'rxjs/operators'

import { HierarchyService } from '@/services/remote-api/api/hierarchy-services/hierarchy.services'
import { ClientTypeService } from '@/services/remote-api/api/master-services/cleint.type.service'
import { PlanService } from '@/services/remote-api/api/plan-services/plan.service'
import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'PLAN'
const roleService = new RoleService()
const clienttypeervice = new ClientTypeService()
const branchService = new HierarchyService()

const planservice = new PlanService()

const dataSource$: any = (
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
    pageRequest['clientType'] = pageRequest.searchKey.trim()
    pageRequest['name'] = pageRequest.searchKey.trim()
  }

  delete pageRequest.searchKey

  return branchService.getBranches(pageRequest).pipe(
    map(data => {
      // let content = data.content;
      // // data.content = [];
      return data
    })
  )
}

const columnsDefinations = [
  { field: 'centerName', headerName: 'Branch Name' },
  { field: 'centerPhoneNo', headerName: 'Contact No' },
  { field: 'centerMailId', headerName: 'Email' },
  { field: 'contactPerson', headerName: 'Contact Person' }
]

export default function BranchListComponent(props: any) {
  const router = useRouter()

  const handleOpen = () => {
    router.push('/branch?mode=create')
  }

  const openEditSection = (branch: any) => {
    router.push(`/branch/${branch.id}?mode=edit`)
  }

  const actionBtnList = [
    {
      key: 'update_plan',
      icon: 'pi pi-user-edit',
      className: 'ui-button-warning',
      onClick: openEditSection
    }
  ]

  const xlsColumns = ['name', 'code']

  const configuration = {
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
      text: 'Branch Management',
      enableGlobalSearch: true,
      searchText: 'Search by code, name'

      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    }
  }

  return (
    <div>
      <FettleDataGrid
        $datasource={dataSource$}
        config={configuration}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
      />
    </div>
  )
}

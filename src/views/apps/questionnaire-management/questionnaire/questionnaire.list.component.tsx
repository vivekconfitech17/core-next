import React from 'react'

import { useRouter } from 'next/navigation'

import { map } from 'rxjs/operators'

import { QuestionnaireService } from '@/services/remote-api/api/master-services/questionnaire.service'
import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'Questionnaire'
const roleService = new RoleService()

const questionnaireService = new QuestionnaireService()

const columnsDefinations = [
  { field: 'question', headerName: 'Question' },
  { field: 'gender', headerName: 'Gender' },
  { field: 'minimumAge', headerName: 'Age From' },
  { field: 'maximumAge', headerName: 'Age To' }
]

export default function QuestionnaireListComponent(props: any) {
  const history = useRouter()

  const dataSource$: any = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true
    }
  ) => {
    pageRequest.sort = ['rowLastUpdatedDate dsc']

    if (!pageRequest.searchKey) {
      return questionnaireService.getQuestionnaireList(pageRequest).pipe(
        map(data => {
          return data
        })
      )
    }
  }

  const handleOpen = () => {
    history.push('/questionnaire?mode=create')
  }

  const openEditSection = (data: any) => {
    history.push(`/questionnaire/${data.id}?mode=edit`)
  }

  const actionBtnList = [
    {
      key: 'update_policy',
      icon: 'pi pi-user-edit',
      className: 'ui-button-warning',
      onClick: openEditSection
    }
  ]

  const xlsColumns = ['clientName', 'policyNumber', 'policyStartDate', 'policyInitDate', 'policyStatus']

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList),
    header: {
      enable: true,

      // enableDownload: true,
      // downloadbleColumns: xlsColumns,
      addCreateButton: 'CREATE',

      // addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Questionnaire Management'

      // enableGlobalSearch: true,
      // searchText: 'Search by Name,Policy Number',
      // selectionMenuButtonText: 'Advance Search',
    }
  }

  return (
    <div>
      <FettleDataGrid
        $datasource={dataSource$}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
        config={configuration}
      />
    </div>
  )
}

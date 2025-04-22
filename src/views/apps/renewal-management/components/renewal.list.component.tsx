import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'

// import { FundService } from '../@/app/api/remote-api/api/fund-services';
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { RenewalService } from '@/services/remote-api/api/renewal-services'

import { ClientService, PolicyService } from '@/services/remote-api/fettle-remote-api'
import { QuotationService } from '@/services/remote-api/api/quotation-services'
import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'PLAN'
const roleService = new RoleService()
const renewalService = new RenewalService()
const policyService = new PolicyService()
const quotationService = new QuotationService()
const clientService = new ClientService()

// const fundService = new FundService();
const sampleData = [
  {
    id: '1001',
    policyNo: '001203100012',
    corporateName: 'TCS',
    accounHandler: 'Unknown',
    startDtate: '28/12/2020',
    endDate: '28/12/2022',
    transactionCurrency: '$'
  },
  {
    id: '1002',
    policyNo: '001231004587',
    corporateName: 'IBM',
    accounHandler: 'Unknown',
    startDtate: '28/12/2020',
    endDate: '28/12/2021',
    transactionCurrency: '$'
  },
  {
    id: '1003',
    policyNo: '001231001894',
    corporateName: 'retail_1',
    accounHandler: 'Unknown',
    startDtate: '28/12/2020',
    endDate: '28/12/2021',
    transactionCurrency: '$'
  },
  {
    id: '1004',
    policyNo: '000101233247',
    corporateName: 'retail_2',
    accounHandler: 'Unknown',
    startDtate: '28/12/2020',
    endDate: '28/12/2021',
    transactionCurrency: '$'
  },
  {
    id: '1005',
    policyNo: '001231085497',
    corporateName: 'HCL',
    accounHandler: 'Unknown',
    startDtate: '28/12/2020',
    endDate: '28/12/2021',
    transactionCurrency: '$'
  }
]

const data$ = new Observable(subscriber => {
  subscriber.next(sampleData)
})

const useStyles = makeStyles(theme => ({
  tableBg: {
    height: 400,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  renewalListButton: {
    marginLeft: '5px'
  }
}))

const dataSource$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true,
    availableForRenewal: true
  }
) => {
  pageRequest.sort = ['rowCreatedDate dsc']

  // pageRequest.isAvailableForRenewal = [true];

  if (pageRequest.searchKey) {
    pageRequest['code'] = pageRequest.searchKey.trim()
    pageRequest['name'] = pageRequest.searchKey.trim()

    delete pageRequest.active
  } else {
    pageRequest.summary = true
    pageRequest.active = true
  }

  delete pageRequest.searchKey

  return renewalService.getRenewalPolicy(pageRequest).pipe(
    map(data => {
      const content = data.content

      const records = content.map((item: any) => {
        item['policyStartDate'] = new Date(item.policyStartDate).toLocaleDateString()
        item['policyEndDate'] = new Date(item.policyEndDate).toLocaleDateString()

        return item
      })

      data.content = records

      return data
    })
  )
}

const columnsDefinations = [
  { field: 'policyNumber', headerName: 'Policy No' },
  { field: 'clientName', headerName: 'Client' },
  { field: 'accounHandler', headerName: 'Account handler' },
  { field: 'policyStartDate', headerName: 'Start date' },
  { field: 'policyEndDate', headerName: 'End date' },
  { field: 'transactionCurrency', headerName: 'Transaction Currency' }
]

const RenewalListComponent = () => {
  const classes = useStyles()
  const router = useRouter()
  const [selectedItems, setSelectedItems]: any = useState([])
  const [disableRenew, setDisableRenew] = useState(true)

  const handleOpen = () => {
    router.push('/renewals/pending?mode=create')
  }

  const openEditSection = (policy: any) => {
    checkQuotationByPolicy(policy.id)

    // checkQuotationByPolicy(`/renewals/pending/${policy.id}?mode=edit`);
  }

  const handleSelectedRows = (selectedRows: any) => {
    if (selectedRows.length !== 0) {
      setSelectedItems(selectedRows)

      if (selectedRows.length == 1) {
        setDisableRenew(false)
      } else {
        setDisableRenew(true)
      }
    } else {
      setSelectedItems([])
      setDisableRenew(true)
    }
  }

  const checkQuotationByPolicy = (policyId: any) => {
    const pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      renewalPolicyId: policyId
    }

    quotationService.getQuoationDetails(pageRequest).subscribe(data => {
      if (data.content && data.content.length != 0) {
        const quotationDta = data.content[0]

        if (quotationDta.renewalPolicyId) {
          router.push(`/quotations/${quotationDta.id}?mode=edit&type=renewal`)
        }

        if (!quotationDta.renewalPolicyId) {
          router.push(`/quotations/?mode=create&type=renewal&policyId=` + policyId)
        }
      }

      if (data.content && data.content.length == 0) {
        router.push(`/quotations/?mode=create&type=renewal&policyId=` + policyId)
      }
    })
  }

  const handleRenew = () => {
    if (selectedItems.length !== 0) {
      const policyId = selectedItems[0].id

      checkQuotationByPolicy(policyId)
    }
  }

  const selectableRow = (e: any) => {
    return true
  }

  const xlsColumns = [
    'policyNumber',
    'corporateName',
    'accounHandler',
    'policyStartDate',
    'policyEndDate',
    'transactionCurrency'
  ]

  const configuration: any = {
    enableSelection: true,
    scrollHeight: '300px',
    isRowSelectable: selectableRow,
    pageSize: 10,
    actionButtons: [
      {
        label: 'RENEW',
        variant: 'text',
        className: 'ui-button-warning',
        onClick: openEditSection
      }
    ],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Renewal',
      enableGlobalSearch: true,
      searchText: 'Search by code, name, type, contact',
      onSelectionChange: handleSelectedRows,
      selectionMenus: [{ icon: '', label: 'Renew', onClick: handleRenew, disabled: disableRenew }],
      selectionMenuButtonText: 'Action'
    }
  }

  return (
    <>
      <FettleDataGrid
        $datasource={dataSource$}
        config={configuration}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
      />
    </>
  )
}

export default RenewalListComponent

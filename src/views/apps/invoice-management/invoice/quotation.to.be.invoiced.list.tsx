import React from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'

import RoleService from '@/services/utility/role'
import { QuotationService } from '@/services/remote-api/api/quotation-services/quotation.service'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'INVOICE'
const roleService = new RoleService()
const quotationService = new QuotationService()

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const useStyles = makeStyles(theme => ({
  approvedButton: {
    marginLeft: '5px'
  },
  tableBg: {
    height: 505,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  categoryButton: {
    marginLeft: '5px',
    marginBottom: '5px',
    color: 'white'
  }
}))

const columnsDefinationsNew = [
  { field: 'prospectName', headerName: 'Prospect Name' },
  {
    field: 'policyStartDate',
    headerName: 'Policy Period',
    body: (rowData: any) => (
      <span style={{ width: '100px' }}>
        {new Date(rowData.policyStartDate).toLocaleDateString()} -{' '}
        {new Date(rowData.policyEndDate).toLocaleDateString()}
      </span>
    ),
    expand: true
  },
  {
    field: 'quotationNo',
    headerName: 'Quotation No.',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere', width: '100px' }}>{rowData.quotationNo}</span>
  },
  { field: 'tag', headerName: 'Tag' },
  {
    field: 'productId',
    headerName: 'Product',
    expand: true,
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere', width: '100px' }}>{rowData.productId}</span>
  }, //fetch by product ID replace by product name
  {
    field: 'planId',
    headerName: 'Plan',
    expand: true,
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere', width: '100px' }}>{rowData.planId}</span>
  }, //fetch by plan ID replace by plan name
  {
    field: 'quoteDate',
    headerName: 'Quote Date',
    body: (rowData: any) => <span style={{ width: '100px' }}>{new Date(rowData.quoteDate).toLocaleDateString()}</span>
  }, //fetch by plan ID replace by plan name
  { field: 'quotationStatus', headerName: 'Status' },
  { field: 'createdBy', headerName: 'Created By' }
]

const xlsColumns = ['prospectName', 'policyStartDate', 'quotationNo', 'productId', 'quoteDate']

const QuotationToBeInvoicedListComponent = () => {
  const [reloadTable, setReloadTable] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const classes = useStyles()
  const router = useRouter()

  const dataSource$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      isInvoiceGenerated: false
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']

    if (pageRequest.searchKey) {
      pageRequest['tag'] = pageRequest.searchKey.trim()
      pageRequest['quotationNo'] = pageRequest.searchKey.trim()
      pageRequest['displayName'] = pageRequest.searchKey.trim()
      pageRequest['status'] = pageRequest.searchKey.trim()
      pageRequest['productId'] = pageRequest.searchKey.trim()
      pageRequest['planId'] = pageRequest.searchKey.trim()
    }

    return quotationService.getQuoationDetails(pageRequest)
  }

  const openEditSection = (quotation: any) => {
    console.log('invoice ', quotation)
    router.push(`/invoices/${quotation.quotationNo}?mode=edit`)
  }

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    rowExpand: true,
    actionButtons: [
      {
        // key: 'update_invoice',
        icon: 'pi pi-user-edit',
        onClick: openEditSection,
        tooltip: 'Create Invoice',
        className: 'ui-button-warning'
      }
    ], //roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList) ||
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      text: 'Quotation',
      enableGlobalSearch: true,
      searchText: 'Search by Id, Tag, Quotation No., Plan, Status',

      // onSelectionChange: selectionChanges,
      selectionMenuButtonText: 'Advance Search'
    }
  }

  return (
    <FettleDataGrid
      $datasource={dataSource$}
      config={configuration}
      columnsdefination={columnsDefinationsNew}
      reloadtable={reloadTable}
    />
  )
}

export default QuotationToBeInvoicedListComponent

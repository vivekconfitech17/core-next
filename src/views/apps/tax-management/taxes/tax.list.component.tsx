import React from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'

import { map } from 'rxjs/operators'

import { TaxService } from '@/services/remote-api/api/tax-services/tax.services'
import RoleService from '@/services/utility/role'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'TAX'
const roleService = new RoleService()

const useStyles = makeStyles(theme => ({
  tableBg: {
    height: 400,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  }
}))

const taxservices = new TaxService()

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
    pageRequest['name'] = pageRequest.searchKey.trim()
    pageRequest['type'] = pageRequest.searchKey.trim()
    pageRequest['value'] = pageRequest.searchKey.trim()

    // pageRequest["currency"] = pageRequest.searchKey;
    // pageRequest["cardType"] = pageRequest.searchKey;
    // pageRequest["validFrom"] = pageRequest.searchKey;
  }

  delete pageRequest.searchKey

  return taxservices.getTaxes(pageRequest).pipe(
    map(data => {
      const content = data.content

      const records = content.map((item: any) => {
        item['effectiveFrom'] = new Date(item.effectiveFrom).toLocaleDateString()
        item['effectiveUpto'] = new Date(item.effectiveUpto).toLocaleDateString()

        return item
      })

      data.content = records

      return data
    })
  )
}

const columnsDefinations = [
  { field: 'name', headerName: 'Name' },
  { field: 'type', headerName: 'Type' },
  { field: 'value', headerName: 'Value' },
  { field: 'effectiveFrom', headerName: 'Effective from' },
  { field: 'effectiveUpto', headerName: 'Effective upto' }
]

export default function TaxListComponent(props: any) {
  const router = useRouter()
  const [rows, setRows] = React.useState(props.rows)

  const classes = useStyles()

  const handleOpen = () => {
    router.push('/taxes?mode=create')
  }

  React.useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  const openEditSection: any = (tax: any) => {
    router.push(`/taxes/${tax.id}?mode=edit`)
  }

  const xlsColumns = ['name', 'type', 'value', 'effectiveFrom', 'effectiveUpto']

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Tax Management',
      enableGlobalSearch: true,
      searchText: 'Search by name, type'

      //   onSelectionChange: handleSelectedRows,
      //   selectionMenus: [{ icon: "", text: "Blacklist", disabled: selectionBlacklistMenuDisabled, onClick: openBlacklist }],
      //   selectionMenuButtonText: "Action"
    }
  }

  return (
    //   <span>Banklist</span>
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

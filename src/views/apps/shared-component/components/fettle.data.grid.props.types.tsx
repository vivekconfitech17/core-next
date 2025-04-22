import type { Observable } from 'rxjs'

type ActionButtonPropTypes = {
  label?: string
  icon?: string
  tooltip?: string
  disabled?: boolean | ((params?: any) => any)
  onClick: (params?: any) => any
}

type HeaderPropTypes = {
  text: string
  enable?: boolean
  enableDownload?: boolean
  downloadbleColumns?: string[]
  searchText?: string
  enableGlobalSearch?: boolean
  selectionMenus?: {
    label: string
    icon: string
    onClick: (params?: any) => any
  }[]
  onSelectionChange?: (params?: any) => any
  selectionMenuButtonText?: string
  onCreateButtonClick?: () => any
  addCreateButton?: boolean
  createButtonText?: string
  createButtonIcon?: string
}

type FettleDataGridPropTypes = {
  isRowSelectable?: any
  rowExpansionTemplate?: any
  expandedRows?: any
  onRowToggle?: any
  style?: any
  config: {
    paginator?: any
    progressColumn?: any
    rowExpand?: any
    singleSelectionMode?: any
    editCell?: any
    disableConfirm?: any
    onLoadedData?: any
    onRowEditComplete?: any
    editRows?: boolean
    actionButtons?: ActionButtonPropTypes[]
    pageSize: number
    enableSelection?: boolean
    header?: HeaderPropTypes
  }
  $datasource: Observable<any> | ((params?: any) => Observable<any>)
  columnsdefination: {
    field: string
    headerName: string
    body?: (...params: any) => any
    style?: object
    expand?:boolean
    headerStyle?: object
    bodyStyle?: object
    editor?: () => any
  }[]
  onEdit?: (params?: any) => any
  selectedId?: string
  reloadtable?: boolean
  isCopy?: boolean
  width?: string
}

export default FettleDataGridPropTypes

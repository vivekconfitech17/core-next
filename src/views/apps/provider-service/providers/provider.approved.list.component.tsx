import React, { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { makeStyles } from '@mui/styles'

import 'date-fns'

import { map, switchMap } from 'rxjs/operators'

import { Toast } from 'primereact/toast'

import ProviderBlacklistModal from './modals/provider.blackist.modal'
import ProviderCategoryHistoryModal from './modals/provider.category.history.modal'
import ProviderCategoryListModal from './modals/provider.category.list.modal'
import ProviderCategorizeModal from './modals/provider.category.modal'
import ProviderUnBlacklistModal from './modals/provider.unblacklist.modal'
import ProviderContractDetailsModal from './modals/providercontractDetails.modal'
import ProviderSendNotificationModal from './modals/provider.notification.modal'
import RoleService from '@/services/utility/role'
import { ProviderTypeService } from '@/services/remote-api/api/master-services/provider.type.service'
import { ProvidersService } from '@/services/remote-api/api/provider-services/provider.services'
import { PlanService } from '@/services/remote-api/api/plan-services/plan.service'
import { CategoryService } from '@/services/remote-api/api/master-services/category.service'

import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const PAGE_NAME = 'PROVIDER'
const roleService = new RoleService()
const providertypeservice = new ProviderTypeService()

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: '#FFF',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const useStyles = makeStyles((theme: any) => ({
  tableBg: {
    height: 400,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  formControl: {
    margin: theme?.spacing ? theme.spacing(1) : '8px',
    minWidth: 120
  },
  categoryButton: {
    marginLeft: '5px',
    marginBottom: '5px'
  }
}))

const providerService = new ProvidersService()
const planservice = new PlanService()
const categoryservice = new CategoryService()

const pls$ = planservice.getPlans()
const ct$ = categoryservice.getCategories()

export default function ProviderApprovedListComponent() {
  const history = useRouter()
  const [rows, setRows] = React.useState()
  const [planList, setPlanList] = React.useState([])
  const [categoryList, setCategoryList] = React.useState([])
  const [data, setData] = React.useState([])
  const [selectionBlacklistMenuDisabled, setSelectionBlacklistMenuDisabled] = React.useState(true)
  const [selectionUnBlacklistMenuDisabled, setSelectionUnBlacklistMenuDisabled] = React.useState(true)
  const [reloadTable, setReloadTable] = React.useState(false)
  const [categoryModal, setCategoryModal] = React.useState(false)
  const [categoryData, setCategoryData] = React.useState([])
  const toast: any = React.useRef(null)

  const [state, setState] = React.useState({
    action: '',
    openBlacklistModal: false,
    openUnBlacklistModal: false,
    openContractDetailsModal: false,
    openProviderNotificationModal: false,
    openCategoryModal: false,
    openCategoryListModal: false,
    providerCategoryHistorys: [],
    providerIds: [],
    blackListedProviderids: []
  })

  const [provider, setProvider] = React.useState('')

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
      pageRequest['type'] = pageRequest.searchKey.trim()
      pageRequest['name'] = pageRequest.searchKey.trim()
      pageRequest['contactNo'] = pageRequest.searchKey.trim()
    }

    delete pageRequest.searchKey

    return providerService
      .getProviders(pageRequest)
      .pipe(
        map(data => {
          const content: any = data.content

          setData(content)

          const records = content.map((item: any) => {
            item['providerBasicDetails']['primaryContact'] = item.providerBasicDetails.contactNos[0].contactNo
            item['blacklist'] = item.blackListed ? 'Yes' : 'No'
            item['category'] = item?.providerCategoryHistorys[0]?.categoryName

            return item
          })

          data.content = records

          return data
        })
      )
      .pipe(
        switchMap(data => {
          return providertypeservice.getProviderTypes().pipe(
            map(pt => {
              data.content.forEach((pr: any) => {
                pt.content.forEach(providertype => {
                  if (pr.providerBasicDetails.type === providertype.code) {
                    pr['providerTypeName'] = providertype.name
                  }
                })
              })

              return data
            })
          )
        })
      )
  }

  const useObservable2 = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        const tableArr: any = []

        if (result.content && result.content.length > 0) {
          result.content.forEach((ele: any) => {
            tableArr.push({
              name: ele.name,
              id: ele.id
            })
          })
        }

        setter(tableArr)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable2(pls$, setPlanList)
  useObservable(ct$, setCategoryList)

  const classes = useStyles()

  const handleOpen = () => {
    history.push('/provider?mode=create')
  }

  const closeBlacklistModal = () => {
    setState({
      ...state,
      openBlacklistModal: false
    })
  }

  const closeUnBlacklistModal = () => {
    setState({
      ...state,
      openUnBlacklistModal: false
    })
  }

  const closeContractDetailsModal = () => {
    setState({
      ...state,
      openContractDetailsModal: false
    })
  }

  const closeProviderNotificationModal = () => {
    setState({
      ...state,
      openProviderNotificationModal: false
    })
  }

  const closeCategorizeModal = () => {
    setState({
      ...state,
      openCategoryModal: false
    })
  }

  const closeCategoryListModal = () => {
    setState({
      ...state,
      openCategoryListModal: false
    })
  }

  const closeCategoryHistoryModal = () => {
    setCategoryModal(false)
  }

  const openEditSection = (provider: any) => {
    history.push(`/provider/${provider.id}?mode=edit`)
  }

  const handleSelectedRows = (selectedProviders: any) => {
    if (selectedProviders.length == 0) {
      setSelectionBlacklistMenuDisabled(true)
      setSelectionUnBlacklistMenuDisabled(true)
    } else {
      let sp = []
      let blp = []
      const filteredLength = selectedProviders.filter((p: any) => !p.blackListed).length
      const blFilterdLength = selectedProviders.filter((p: any) => p.blackListed).length

      setSelectionBlacklistMenuDisabled(filteredLength != selectedProviders.length)
      setSelectionUnBlacklistMenuDisabled(blFilterdLength != selectedProviders.length)
      sp = selectedProviders.filter((p: any) => !p.blackListed).map((ele: any) => ele.id)
      blp = selectedProviders.filter((p: any) => p.blackListed).map((ele: any) => ele.id)
      setState({
        ...state,
        providerIds: sp,
        blackListedProviderids: blp
      })
      setProvider(blp.toString())
    }
  }

  const handleBlacklistSubmit = (payload: any) => {
    payload['providerIds'] = state.providerIds
    providerService.blacklistProvider(payload).subscribe(res => {
      closeBlacklistModal()
      setReloadTable(true)
    })
  }

  const handleUnBlacklistSubmit = (payload: any) => {
    payload['providerIds'] = state.blackListedProviderids
    providerService.unblacklistProvider(payload).subscribe(res => {
      closeBlacklistModal()
      setReloadTable(true)
    })
  }

  const handleContractDetails = (payload: any) => {
    providerService.getProviderAllDetails(payload, state?.providerIds.toString() || provider).subscribe(res => {
      closeContractDetailsModal()
      toast?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'SuccessFully Added',
        life: 3000
      })
      setReloadTable(true)
    })
  }

  const handleNotificationDetails = (payload: any) => {
    // providerService.getProviderAllDetails(payload, state?.providerIds.toString() || provider).subscribe(res => {
    //   closeContractDetailsModal();
    //   toast.current.show({
    //     severity: 'success',
    //     summary: 'Success',
    //     detail: 'SuccessFully Added',
    //     life: 3000,
    //   });
    //   setReloadTable(true);
    // });
  }

  const handleCategorizeSubmit = (payload: any) => {
    closeCategorizeModal()
    payload['providerIds'] = state.providerIds
    providerService.categorizeProvider(payload).subscribe(res => {
      closeCategorizeModal()
      setReloadTable(true)
    })
  }

  const openBlacklist = (e: any) => {
    setState({
      ...state,
      openBlacklistModal: true
    })
  }

  const openUnBlacklist = (e: any) => {
    setState({
      ...state,
      openUnBlacklistModal: true
    })
  }

  const openContractDetails = (e: any) => {
    setState({
      ...state,
      openContractDetailsModal: true
    })
  }

  const openProviderNotificationModal = () => {
    setState({
      ...state,
      openProviderNotificationModal: true
    })
  }

  const openCategorize = (provider: any) => {
    setState({
      ...state,

      // providerIds: provider?.id,
      openCategoryModal: true
    })
  }

  const showCategoryList = (val: any) => {
    val.providerCategoryHistorys.forEach((value: any, i: number) => {
      value['startDate'] = new Date(value.startDate)
      value['id'] = i
      planList.forEach((pln: any) => {
        if (value.planId === pln.id) {
          value['planName'] = pln.name
        }
      })
      categoryList.forEach((cat: any) => {
        if (value.categoryId === cat.id) {
          value['catName'] = cat.name
        }
      })
    })
    setState({
      ...state,
      openCategoryListModal: true,
      providerCategoryHistorys: val.providerCategoryHistorys
    })
  }

  const actionBtnList = [
    {
      key: 'update_provider',
      icon: 'pi pi-user-edit',
      className: `ui-button-warning ${classes.categoryButton}`,
      onClick: openEditSection
    }

    // {
    //   key: 'update_quotation',
    //   icon: 'pi pi-book',
    //   className: 'ui-button-warning',
    //   onClick: openCategorize,
    //   className: classes.categoryButton,
    // },
  ]

  const xlsColumns = [
    'providerBasicDetails.name',
    'providerBasicDetails.code',
    'providerTypeName',
    'providerBasicDetails.primaryContact',
    'category',
    'blacklist'
  ]

  const configuration: any = {
    enableSelection: true,
    scrollHeight: '300px',
    pageSize: 10,

    // actionButtons: roleService.checkActionPermission(PAGE_NAME, 'UPDATE', openEditSection),
    actionButtons: roleService.checkActionPermission(PAGE_NAME, '', () => {}, actionBtnList),
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      onCreateButtonClick: handleOpen,
      text: 'Provider Management',
      enableGlobalSearch: true,
      searchText: 'Search by code, name, type',
      onSelectionChange: handleSelectedRows,
      selectionMenus: [
        {
          icon: '',
          label: 'Blacklist',
          disabled: selectionBlacklistMenuDisabled,
          onClick: openBlacklist
        },
        {
          icon: '',
          label: 'Categorize',
          disabled: selectionBlacklistMenuDisabled,
          onClick: openCategorize
        },
        {
          icon: '',
          label: 'Un-Blacklist',
          disabled: selectionUnBlacklistMenuDisabled,
          onClick: openUnBlacklist
        },
        ,
        {
          icon: '',
          label: 'Add Contract Details',
          disabled: selectionUnBlacklistMenuDisabled,
          onClick: openContractDetails
        },
        {
          icon: '',
          label: 'Send Notification',
          disabled: selectionUnBlacklistMenuDisabled,
          onClick: openProviderNotificationModal
        }
      ],
      selectionMenuButtonText: 'Action'
    }
  }

  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const onCategoryClick = (e: any) => {
    setCategoryModal(true)

    const temp: any = data.filter((item: any) => {
      return item.id === e.target.title
    })

    setCategoryData(temp[0]?.providerCategoryHistorys)
  }

  const columnsDefinations = [
    { field: 'providerBasicDetails.name', headerName: 'Provider Name' },
    { field: 'providerBasicDetails.code', headerName: 'Provider Code' },
    { field: 'providerTypeName', headerName: 'Provider Type' },
    { field: 'providerBasicDetails.primaryContact', headerName: 'Contact Number' },
    {
      field: 'category',
      headerName: 'Category',
      body: (rowData: any) => (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          title={rowData.id}
          onClick={e => onCategoryClick(e)}
        >
          {rowData.category}
        </span>
      )
    },
    { field: 'blacklist', headerName: 'Blacklisted' }
  ]

  // const OpenModal = () => {};

  return (
    <div>
      <Toast ref={toast} />
      <FettleDataGrid
        $datasource={dataSource$}
        columnsdefination={columnsDefinations}
        onEdit={openEditSection}
        config={configuration}
        reloadtable={reloadTable}
      />

      {state.openBlacklistModal ? (
        <ProviderBlacklistModal
          closeBlacklistModal={closeBlacklistModal}
          openBlacklistModal={state.openBlacklistModal}
          handleBlacklistSubmit={handleBlacklistSubmit}
        />
      ) : null}

      {state.openUnBlacklistModal ? (
        <ProviderUnBlacklistModal
          closeUnBlacklistModal={closeUnBlacklistModal}
          openUnBlacklistModal={state.openUnBlacklistModal}
          handleUnBlacklistSubmit={handleUnBlacklistSubmit}
        />
      ) : null}

      {state.openContractDetailsModal ? (
        <ProviderContractDetailsModal
          closeContractDetailsModal={closeContractDetailsModal}
          openContractDetailsModal={state.openContractDetailsModal}
          handleContractDetails={handleContractDetails}
        />
      ) : null}

      {state.openProviderNotificationModal ? (
        <ProviderSendNotificationModal
          closeContractDetailsModal={closeProviderNotificationModal}
          openContractDetailsModal={state.openProviderNotificationModal}
          handleContractDetails={handleNotificationDetails}
        />
      ) : null}

      {state.openCategoryModal ? (
        <ProviderCategorizeModal
          closeCategorizeModal={closeCategorizeModal}
          openCategoryModal={state.openCategoryModal}
          handleCategorizeSubmit={handleCategorizeSubmit}
          providerIds={state.providerIds}
          planList={planList}
          categoryList={categoryList}
        />
      ) : null}

      {state.openCategoryListModal ? (
        <ProviderCategoryListModal
          openCategoryListModal={state.openCategoryListModal}
          closeCategoryListModal={closeCategoryListModal}
          planList={planList}
          categoryList={categoryList}
          providerCategoryHistorys={state.providerCategoryHistorys}
        />
      ) : null}

      {categoryModal ? (
        <ProviderCategoryHistoryModal
          openCategoryListModal={categoryModal}
          closeCategoryListModal={closeCategoryHistoryModal}
          categoryList={categoryData}
        />
      ) : null}
      {/* {
        < Modal
          open={categoryModal}
      onClose={() => { setCategoryModal(false) }}
        >
      <Box style={ModalStyle}>
        <FettleDataGrid
          $datasource={dataSource$}
          columnsdefination={columnsDefinations}
          // onEdit={openEditSection}
          config={configuration}
        // reloadtable={reloadTable}
        />
      </Box>
    </Modal>
      } */}
    </div>
  )
}

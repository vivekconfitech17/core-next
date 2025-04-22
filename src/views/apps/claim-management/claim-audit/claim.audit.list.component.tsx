import React, { useEffect, useState } from 'react'

import { map } from 'rxjs'

import { ProvidersService } from '@/services/remote-api/api/provider-services'
import { ReimbursementService } from '@/services/remote-api/api/claims-services/claim.reimbursement.services'
import BreakUpComponents from './components/audit.breakup.view.component'
import { getDateElements } from '@/utils/@jambo-utils/dateHelper'
import { FettleDataGrid } from '../../shared-component/components/fettle.data.grid'

const providerService = new ProvidersService()
const reimbursementService = new ReimbursementService()

const ClaimAudit = (props: any) => {
  const ps$ = providerService.getProviders()
  const [providerList, setProviderList] = useState<any>([])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    const subscription = ps$.subscribe((result: any) => {
      const filteredProviders = result.content.filter((ele: any) => !ele.blackListed)

      setProviderList(filteredProviders)

      return () => subscription.unsubscribe()
    })
  }, [])

  const handleClaimApprove = (rowData: any) => {
    const claimId = rowData.id

    const payload = {
      auditDecision: 'APPROVED',
      comment: 'APPROVED test'
    }

    reimbursementService.auditDecision(claimId, payload).subscribe(res => {
      setReload(true)
      setReload(false)
    })
    setTimeout(() => setReload(true), 500)
    setTimeout(() => setReload(false), 500)
  }

  const handleClaimReject = (rowData: any) => {
    const claimId = rowData.id

    const payload = {
      auditDecision: 'REJECTED',
      comment: 'REJECT test'
    }

    reimbursementService.auditDecision(claimId, payload).subscribe(res => {
      setReload(true)
      setReload(false)
    })
  }

  const handleClaimRevert = (rowData: any) => {
    const claimId = rowData.id

    const payload = {
      auditDecision: 'REVERTED',
      comment: 'REVERT test',
      revertedBy: 'AUDITOR'
    }

    reimbursementService.auditDecision(claimId, payload).subscribe(res => {
      setReload(true)
      setReload(false)
    })
  }

  const parentcolumnsDefinations: any = [
    // {
    //   field: 'serial',
    //   headerName: 'SL#',
    //   body: (rowData, data) => data.rowIndex + 1,
    //   style: { width: '4rem', display:"flex", flexGrow:"0", flexBsis:"50px" },
    // },
    // {
    //   field: 'claimDetails',
    //   headerName: 'Claim Details',
    //   // style: { width: '20rem' },

    //   body: rowData => <ClaimDetails claimId={rowData.id} key={rowData.id} memberShipNo={rowData.memberShipNo} data={rowData} />,
    // },
    {
      field: 'id',
      headerName: 'Claim No.'
    },
    { field: 'memberShipNo', headerName: 'Membership No.' },
    {
      field: 'memberName',
      headerName: 'Name'
    },
    {
      field: 'claimSubType',
      headerName: 'Claim sub-type'
    },
    {
      field: 'barcode',
      headerName: 'Bar code'
    },
    {
      field: 'breakUpDetails',
      headerName: 'Breakup Details',
      expand: true,
      body: (rowData: any, data: any) => (
        <BreakUpComponents key={rowData.id} rowData={rowData} data={data} providerList={providerList} />
      )
    }
  ]

  const xlsColumns = ['claimDetails', 'breakUpDetails']

  const parentConfiguration = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    rowExpand: true,
    actionButtons: [
      {
        icon: 'pi pi-check-circle',
        tooltip: 'Approve',
        severity: 'primary',
        onClick: handleClaimApprove,
        refreshTable: true
      },
      {
        icon: 'pi pi-times-circle',
        tooltip: 'Reject',
        severity: 'danger',
        onClick: handleClaimReject,
        refreshTable: true
      },
      {
        icon: 'pi pi-replay',
        tooltip: 'Revert',
        severity: 'info',
        onClick: handleClaimRevert
      }
    ],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      text: 'Claims Audit Details',
      enableGlobalSearch: true,
      searchText: 'Search by Claim number'
    }
  }

  const { startDate, endDate } = props?.searchDate

  useEffect(() => {
    if (props.searchDate.startDate && props.searchDate.endDate) {
      setReload(true)

      setTimeout(() => setReload(false), 500)
    }
  }, [props.searchDate])

  const parentdataSource$ = (
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']

    // pageRequest.claimStatus = ['APPROVED'];
    if (startDate && endDate) {
      pageRequest.startDate = startDate.getTime()
      pageRequest.endDate = endDate.getTime()
    }

    return reimbursementService.getAllAuditReimbursements(pageRequest).pipe(
      map(data => {
        const content = data.content

        const records = content.map((item: any) => {
          const providerNames = item.providers
            ?.map((providerId: any) => providerList.find((provider: any) => provider.id === providerId)?.name)
            .filter((name: any) => name !== undefined || name !== '')

          const totalEstimatedCost = item.benefitsWithCost.reduce((accumulator: any, currentValue: any) => {
            return accumulator + currentValue.estimatedCost
          }, 0)

          const invoicesAmount = item.invoices.reduce((accumulator: any, currentValue: any) => {
            return accumulator + currentValue.invoiceAmount
          }, 0)

          item['createdDate'] = `${getDateElements(item.createdDate).date.numerical}`
          item['expectedDOA'] = `${getDateElements(item.expectedDOA).date.numerical}`
          item['expectedDOD'] = `${getDateElements(item.expectedDOD).date.numerical}`
          item['providerName'] = providerNames
          item['claimedAmount'] = totalEstimatedCost
          item['billAmount'] = invoicesAmount

          return item
        })

        data.content = records

        return data
      })
    )
  }

  return (
    <FettleDataGrid
      $datasource={parentdataSource$}
      columnsdefination={parentcolumnsDefinations}
      config={parentConfiguration}
      reloadtable={reload}
    />
  )
}

export default ClaimAudit

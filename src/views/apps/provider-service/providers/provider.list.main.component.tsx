import React, { useEffect } from 'react'

import { TabView, TabPanel } from 'primereact/tabview'

import { PreAuthService } from '@/services/remote-api/api/claims-services'
import ProviderPendingListComponent from './provider.pending.list.component copy'
import ProviderApprovedListComponent from './provider.approved.list.component'

export default function ProviderTabComponent() {
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0
  })

  const [activeIndex, setActiveIndex] = React.useState(0)
  const preAuthService = new PreAuthService()
  const pas$ = preAuthService.getDashboardCount()

  useEffect(() => {
    localStorage.removeItem("providerId") 
    pas$.subscribe(result => {
      setCount(result?.data)
    })
  }, [])

  return (
    <div className='card'>
      <TabView
        scrollable
        style={{ fontSize: '14px' }}
        activeIndex={activeIndex}
        onTabChange={e => setActiveIndex(e.index)}
      >
        <TabPanel leftIcon='pi pi-user mr-2' header='Approved'>
          <ProviderApprovedListComponent />
        </TabPanel>
        <TabPanel leftIcon='pi pi-user-minus mr-2' header='Pending Approval'>
          <ProviderPendingListComponent />
        </TabPanel>
      </TabView>
    </div>
  )
}

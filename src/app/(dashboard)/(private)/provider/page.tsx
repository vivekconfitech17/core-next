import { Suspense } from "react"

import Provider from "@/views/apps/provider-service/providers"

const ProviderRoot = () => {
  return (
    <Suspense fallback={null}>
      <Provider/>
    </Suspense>
  )
}

export default ProviderRoot

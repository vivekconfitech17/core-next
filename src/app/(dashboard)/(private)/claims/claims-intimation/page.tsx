import { Suspense } from "react"

import Intimation from "@/views/apps/claim-management/claim-intimation/claim.intimation.component"

const ClaimsIntimation = () => {
  return (
    <Suspense fallback={null}>
      <Intimation/>
    </Suspense>
  )
}

export default ClaimsIntimation

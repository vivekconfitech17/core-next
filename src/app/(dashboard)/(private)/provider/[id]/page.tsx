"use client"

import ProviderDetails from "@/views/apps/provider-service/providers/provider.details.component";

const ProviderId = ({params}:{params:any})=>{
    console.log(params);
    
    return <ProviderDetails  />;
    
}

export default ProviderId;

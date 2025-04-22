import { Suspense } from "react";

import Client from "@/views/apps/client-management/client";


const Client_Management = ()=>{
    return(
        <Suspense fallback={null}>
           <Client/>
        </Suspense>
    )
}

export default Client_Management;

'use client'
import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Grid from "@mui/material/Grid";

import BranchListComponent from "./branch.list.component";
import BasicDetails from "./branch.details.component";


// function useQuery() {
//     return new URLSearchParams(useLocation().search);
//   }
  
export default function Branch() {
    const router = useRouter();
    const query = useSearchParams();
  
    React.useEffect(() => {
      if (!query.get('mode')) {
        router.replace("/branch?mode=viewList");
      }
    }, [query, router]); 

    return (
        <div>
           {query.get("mode") === "create" ? (
          <Grid
            item
            xs={12}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "20px",
              height: "2em",
              color: "inherit",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
           
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Branch Management- Create Branch
              </span>
            
          </Grid>
          ) : null}
    
          {(() => {
            switch (query.get("mode")) {
              case "viewList":
                return <BranchListComponent />;
              case "create":
                return <BasicDetails />;
              default:
                return null;
            }
          })()}
        </div>
      );
}

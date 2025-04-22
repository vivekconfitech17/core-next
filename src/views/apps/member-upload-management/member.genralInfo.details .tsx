import React from "react";

import { Box, Grid, Typography } from "@mui/material";

const TypographyStyle2:any = {
  fontSize:"13px", alignItems:"center", display:"flex", textTransform:"capitalize",color:"#3C3C3C",
}

const TypographyStyle1:any = {
  fontSize:"13px", alignItems:"center", display:"flex", textTransform:"capitalize",color:"#A1A1A1",
}

const MemberGenralInfoDetails = () => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel:any) => (event:any, isExpanded:any) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box padding={"0 0 5% 0"}>
      <Grid container >
        <Grid xs={6} margin={"5% 2%"}>
          <Box  height={"100%"} width={"95%"}>
          <Box border={"1px solid lightgray"} display={"flex"} justifyContent={"center"} alignItems={"center"}  height={"100%"}>
            No Photo
          </Box>
          <Box display={"flex"} justifyContent={"center"}>
            <Typography style={TypographyStyle1} >family ID / employee code</Typography>&nbsp;
            <span>:</span>&nbsp;
            <Typography style={TypographyStyle2} >SC999</Typography>
          </Box>
          </Box>
        </Grid>
        <Grid xs={6} >
          <Box  height={"100%"} width={"95%"}>
            <Box border={"1px solid lightgray"} display={"flex"} justifyContent={"center"} alignItems={"center"}  height={"30%"} marginY={"1px"}>
              No Signature
            </Box>
            <Box border={"1px solid lightgray"} display={"flex"} justifyContent={"center"} alignItems={"center"}  height={"70%"} marginY={"1px"}>
              No Age Proof Doc
            </Box>
            <Box display={"flex"} justifyContent={"space-between"}>
              <Box display={"flex"}>
                <Typography style={TypographyStyle1} >Institution</Typography>&nbsp;
                <span style={TypographyStyle1}>:</span>&nbsp;
                <Typography style={TypographyStyle2} >Subham LTD</Typography>
              </Box>
              <Box display={"flex"}>
                <Typography style={TypographyStyle1} >Insurance</Typography>&nbsp;
                <span style={TypographyStyle1}>:</span>&nbsp;
                <Typography style={TypographyStyle2} >Demo Insurance company</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

    </Box>
  )
}

export default MemberGenralInfoDetails;
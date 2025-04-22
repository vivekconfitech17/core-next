import React from "react";

import { Box, Typography } from "@mui/material";

const TypographyStyle2:any = {
  fontSize:"14px", padding:"5px 2px", textTransform:"capitalize",color:"#3C3C3C",
}

const TypographyStyle1:any = {
  fontSize:"14px", display:"flex", alignItems:"center", textTransform:"capitalize",color:"#A1A1A1",
}

const MemberDocumentsDetails = () => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel:any) => (event:any, isExpanded:any) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
    <Box>
      <Box display={"flex"} marginY={"1%"}>
        <Typography style={TypographyStyle1}>is this an employee?</Typography>&nbsp;
        <span>:</span>&nbsp;
        <select style={TypographyStyle2} disabled>
          <option>No</option>
          <option>Yes</option>
        </select>
      </Box>
      <Box display={"flex"} marginY={"1%"}>
        <Typography style={TypographyStyle1}>hardcopy of proposal form(y/n)</Typography>&nbsp;
        <span>:</span>&nbsp;
        <select style={TypographyStyle2} disabled>
          <option>No</option>
          <option>Yes</option>
        </select>&nbsp;
        <input type="file" disabled/>
      </Box>
    </Box>
    </>
  )
}

export default MemberDocumentsDetails;
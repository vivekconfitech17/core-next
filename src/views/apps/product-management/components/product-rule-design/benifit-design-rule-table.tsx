import React from "react";

import { Box, IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import { makeStyles, withStyles } from "@mui/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledTableCell = withStyles((theme:any) => ({
  head: {
    backgroundColor: 'rgba(90, 99, 171, 0.5)',
    color: theme?.palette?.common?.white,
  },
  body: {
    fontSize: 12,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme:any) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme?.palette?.action?.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  actionBlock: {
    display: "flex",
    justifyContent: "space-evenly",
  },
});

type BenefitDesignRuleTableProps = {
  onRuleEdit: (rule: any,idx:number) => void; // Function to handle rule editing
  ruleList: any[]; // Array of rules (Replace `any[]` with the actual type if known)
  onRequestForChildRule: (ruleId: string) => void; // Function to fetch child rules
  onRuleDelete: (ruleId: string,idx:number) => void; // Function to delete a rule
  hasChild?: boolean; // Optional boolean flag (defaults to `true`)
};

export default function BenifitDesignRuleTable({onRuleEdit, ruleList, onRequestForChildRule, onRuleDelete ,hasChild=true}:BenefitDesignRuleTableProps ) {
  const classes = useStyles();
  const preventDefault = (event:any) => event.preventDefault();
  const [selectedRow, setSelectedRow] = React.useState(0);
  const isSelected = (idx:number) => selectedRow === idx;

  const handleChange = (row:any, idx:number) => (e:any) => {
    setSelectedRow(idx);
  };

  const deleteTableRuleEvent = (row:any, idx:number) => (e:any) => {
    if(onRuleDelete){
      onRuleDelete(row, idx);
    } 
  }

  let response = null;

  if (ruleList && ruleList.length > 0) {
    response = (<TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">Benefit Name</StyledTableCell>
            <StyledTableCell align="center">Coverage</StyledTableCell>
            <StyledTableCell align="center">Cover Type</StyledTableCell>
            <StyledTableCell align="center">Rule Definition</StyledTableCell>
            <StyledTableCell align="center">Action</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {ruleList.map((row:any, idx:any) => {

            return (
              <StyledTableRow key={idx}>
                <StyledTableCell align="center" component="th" scope="row">
                  {row?.name}
                </StyledTableCell>
                <StyledTableCell align="center">{row?.coverageAmount}</StyledTableCell>
                <StyledTableCell align="center">{row?.coverType}</StyledTableCell>
                <StyledTableCell align="center">{row?.expression}</StyledTableCell>
                <StyledTableCell align="center" className={classes.actionBlock}>

                  <IconButton  onClick={() => onRuleEdit(row, idx)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton  onClick={() => { onRequestForChildRule(row)}} disabled={!hasChild}>
                    <ExpandMoreIcon />
                  </IconButton>
                  <IconButton onClick={deleteTableRuleEvent(row, idx)}>
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>)
  }
  else {
    response = <Box alignItems="center"
      justifyContent="center" display="flex" width="100%" height="100%">
      <span>No records are available</span>
    </Box>
  }

  
return response;
}


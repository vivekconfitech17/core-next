import React, { useEffect } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';
import { makeStyles } from '@mui/styles';

const TypographyStyle2:any = {
  fontSize: '13px',
  color:"#3C3C3C",
  alignItems: 'end',
  display: 'flex',
  textTransform: 'capitalize',
};

const TypographyStyle1:any = {
  fontSize: '14px',
  color:"#A1A1A1",
  alignItems: 'end',
  display: 'flex',
  textTransform: 'capitalize',
};

const useStyles = makeStyles((theme:any) => ({
  AccordionSummary: {
    backgroundColor: theme?.palette?.background?.default,
  },
}));

const MemberPolicyDetails = ({ memberData }:{memberData:any}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState('panel1');
  const [data, setData]:any = React.useState();
  const classes = useStyles();

  useEffect(() => {
    setData(memberData);
  }, [memberData]);

  const handleChange = (panel:any) => (event:any, isExpanded:any) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Accordion
        style={{ margin: '10px 0', borderRadius: '8px' }}
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}>
        <AccordionSummary
          className={classes.AccordionSummary}
          expandIcon={<ExpandMoreIcon style={{ color: '#A1A1A1' }} />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          style={{ backgroundColor: "#F1F1F1", color: '#A1A1A1', borderRadius: '8px 8px 0 0' }}>
          {/* style={{ backgroundColor: theme.palette.secondary.main, color: 'white' }}> */}
          <Typography>Policy Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid xs={6} margin={'5%'}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>policy code</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>agency location</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.agencyLocation}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>BDM location</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.BDMLocation}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>policy from</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{moment(data?.policyStartDate).format('DD/MM/YYYY')}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>first enrollment date</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{moment(data?.firstEnrollmentDate).format('DD/MM/YYYY')}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>premium</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.premium}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>card type</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.cardType}</Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>agency code</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.agencyCode}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>agency name</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.agency}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>BDM name</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.BDMName}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>policy to</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{moment(data?.policyEndDate).format('DD/MM/YYYY')}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>continiuity from</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{moment(data?.continiuityFrom).format('DD/MM/YYYY')}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>renewal date</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{moment(data?.renewalDate).format('DD/MM/YYYY')}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>proposer name</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.prosperDate}</Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion style={{ margin: '10px 0', borderRadius: '8px' }} expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary
          className={classes.AccordionSummary}
          expandIcon={<ExpandMoreIcon style={{ color: 'A1A1A1' }} />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
          style={{ backgroundColor: "#F1F1F1", color: '#A1A1A1', borderRadius: '8px 8px 0 0' }}>
          {/* style={{ backgroundColor: '#0EDB8A', color: 'white' }}> */}
          <Typography>Other Policies</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid xs={6} margin={'5%'}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>name of the insurance company</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>sum insured</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>policy code</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>product name</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>policy period</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>policy status</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policyNumber}</Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default MemberPolicyDetails;

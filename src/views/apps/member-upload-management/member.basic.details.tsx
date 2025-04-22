import React, { useEffect } from 'react'

import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, Typography, useTheme } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import moment from 'moment'
import { makeStyles } from '@mui/styles'

import type { Subscription } from 'rxjs'

import { MemberService } from '@/services/remote-api/api/member-services'
import BioModal from './bio-modal'

const memberService = new MemberService()

const useStyles = makeStyles((theme: any) => ({
  AccordionSummary: {
    backgroundColor: theme?.palette?.background?.default
  },
  pictureContainer: {
    width: 200,
    height: 238,
    border: '1px solid #002776'
  }
}))

const TypographyStyle2: any = {
  fontSize: '13px',
  color: '#3C3C3C',

  // fontWeight: '500',
  alignItems: 'end',
  display: 'flex',
  textTransform: 'capitalize'
}

const TypographyStyle1: any = {
  fontSize: '14px',
  color: '#A1A1A1',

  // fontWeight: '900',
  alignItems: 'end',
  display: 'flex',
  textTransform: 'capitalize'
}

const MemberPolicyDetails = ({ memberData }: { memberData: any }) => {
  const theme = useTheme()
  const [expanded, setExpanded] = React.useState('panel1')
  const [data, setData]: any = React.useState()

  const [imageData, setImageData]: any = React.useState(null)
  const [selectedDocument, setSelectedDocument]: any = React.useState(null)
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    setData(memberData)
  }, [memberData])

  React.useEffect(() => {
    if (data?.memberId) {
      memberService.getMemberImage(data?.memberId).subscribe(res => {
        setImageData(res)
      })
    }
  }, [data])

  React.useEffect(() => {
    let subscription: Subscription

    if (data?.memberId && imageData?.documentName) {
      subscription = memberService.getMemberImageType(data?.memberId, imageData?.documentName).subscribe({
        next: res => {
          const blob = new Blob([res])
          const url: any = URL.createObjectURL(blob)

          setSelectedDocument(url)
        },
        error: error => {
          console.error('Error fetching image data:', error)
        }
      })
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [data?.memberId, imageData?.documentName])

  const handleChange = (panel: any) => (event: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleBiometric = () => {
    setOpen(true)
  }

  return (
    <>
      <BioModal open={open} memberId={data?.memberId} setOpen={setOpen} />
      <Accordion
        style={{ margin: '10px 0', borderRadius: '8px' }}
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
      >
        <AccordionSummary
          className={classes.AccordionSummary}
          expandIcon={<ExpandMoreIcon style={{ color: '#A1A1A1' }} />}
          aria-controls='panel1bh-content'
          id='panel1bh-header'
          style={{ backgroundColor: '#F1F1F1', color: '#A1A1A1', borderRadius: '8px 8px 0 0' }}
        >
          {/* style={{ backgroundColor: theme.palette.secondary.main, color: 'white' }}> */}
          <Typography>Personal Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid item xs={4} sm={3} container justifyContent='center' alignItems='center'>
            <Box className={classes.pictureContainer} style={{ overflow: 'hidden' }}>
              {imageData && <img src={selectedDocument} />}{' '}
            </Box>
            <Button variant='outlined' onClick={() => handleBiometric()}>
              Update Biometric
            </Button>
          </Grid>
          {/* <Grid item xs={4} sm={3} container justifyContent="center" alignItems="center">
          </Grid> */}
          <Grid container spacing={2}>
            <Grid xs={4} margin={'5%'}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Name</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.name}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Plan</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.planName}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>age</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.age}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Birth Place</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.birthPlace}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>VIP?</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.vip}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>relationship</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.relations}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Identification Doc. type</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.identificationDocType}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>marital status</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.maritalStatus}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>yearly income</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.yealyIncome}</Typography>
              </Box>
            </Grid>
            <Grid xs={4}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Plan category (scheme) type</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.planScheme}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>DOB</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{moment(data?.dateOfBirth).format('DD/MM/YYYY')}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Gender</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.gender}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>blood group</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.bloodGroup}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>education</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.education}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Identification Doc. no</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.identificationDocNumber}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>AML Risk category</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.amlRiskCategory}</Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        style={{ margin: '10px 0', borderRadius: '8px' }}
        expanded={expanded === 'panel2'}
        onChange={handleChange('panel2')}
      >
        <AccordionSummary
          className={classes.AccordionSummary}
          expandIcon={<ExpandMoreIcon style={{ color: '#A1A1A1' }} />}
          aria-controls='panel2bh-content'
          id='panel2bh-header'
          style={{ backgroundColor: '#F1F1F1', color: '#A1A1A1', borderRadius: '8px 8px 0 0' }}
        >
          {/* style={{ backgroundColor: '#0EDB8A', color: 'white' }}> */}
          <Typography>Contact Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid xs={6} margin={'5%'}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>Address Line1</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.memberAddressLine1}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>country</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.country}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>city</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.city}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>police station</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.policeStation}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>mobile</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.mobileNo}</Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>address line2</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.memberAddressLine2}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>province</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.state}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>postal code</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.postalCode}</Typography>
              </Box>
              <Box display={'flex'} marginLeft={'10%'} marginY={'10px'}>
                <Typography style={TypographyStyle1}>email</Typography>&nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>{data?.email}</Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default MemberPolicyDetails

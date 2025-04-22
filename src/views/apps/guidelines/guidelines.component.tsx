'use client'
import React, { useState } from 'react'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'

// import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'

import AddIcon from '@mui/icons-material/Add'

import { map } from 'rxjs'

import AgeModal from './modals/age.modal'
import { GuidlineService } from '@/services/remote-api/api/master-services/guidline.service'
import { FettleDataGrid } from '../shared-component/components/fettle.data.grid'

const guidelinesService = new GuidlineService()

const dataSource1$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (!pageRequest.searchKey) {
    return guidelinesService.getAgeGuidlineList(pageRequest).pipe(
      map(data => {
        return data
      })
    )
  }
}

const dataSource2$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (!pageRequest.searchKey) {
    return guidelinesService.getGenderGuidlineList(pageRequest).pipe(
      map(data => {
        return data
      })
    )
  }
}

const dataSource3$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (!pageRequest.searchKey) {
    return guidelinesService.getRelationshipGuidlineList(pageRequest).pipe(
      map(data => {
        return data
      })
    )
  }
}

const dataSource4$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (!pageRequest.searchKey) {
    return guidelinesService.getAnnualIncomeGuidlineList(pageRequest).pipe(
      map(data => {
        return data
      })
    )
  }
}

const dataSource5$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc']

  if (!pageRequest.searchKey) {
    return guidelinesService.getBmiGuidlineList(pageRequest).pipe(
      map(data => {
        return data
      })
    )
  }
}

const useStyles = makeStyles((theme: any) => ({
  input1: {
    width: '50%'
  },
  clientTypeRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row'
    }
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: 2
  },
  formControl: {
    minWidth: 182
  },
  formControl1: {
    minWidth: 300
  },
  heading: {
    fontSize: theme?.typography?.pxToRem(15),

    // flexBasis: '33.33%',
    flexShrink: 0,
    fontWeight: 700
  },
  secondaryHeading: {
    fontSize: theme?.typography?.pxToRem(15),
    color: theme?.palette?.text?.secondary
  },
  buttonPrimary: {}
}))

const columnsDefinations1 = [
  { field: 'underwritingMinAge', headerName: 'Min Age' },
  { field: 'underwritingMaxAge', headerName: 'Max Age' }
]

export default function GuidelinesComponent(props: any) {
  const classes = useStyles()
  const [ageModal, setAgeModal] = useState(false)
  const [type, setType] = useState(0)

  const handleClose = () => {
    setAgeModal(false)
    setType(0)
  }

  const configuration1: any = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,

    // actionButtons: actionBtnList,
    header: {
      enable: true,

      // enableDownload: true,
      // downloadbleColumns: xlsColumns,
      // addCreateButton: 'CREATE',
      // addCreateButton: roleService.checkActionPermission(PAGE_NAME, 'CREATE'),
      // onCreateButtonClick: handleOpen,
      text: 'Questionnaire Management'

      // enableGlobalSearch: true,
      // searchText: 'Search by Name,Policy Number',
      // selectionMenuButtonText: 'Advance Search',
    }
  }

  return (
    <div>
      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '20px',
          height: '2em',
          fontSize: '18px'
        }}
      >
        <span
          style={{
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '5px'
          }}
        >
          Guidelines
        </span>
      </Grid>
      <Paper
        elevation={0}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '1%'
        }}
      >
        <Box padding={'10px'} display={'flex'} flexDirection={'row'} flexWrap={'wrap'}>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={6}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align='center' variant='h4'>
                  Age Group
                </Typography>
                <Button
                  color='primary'
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(1)
                    setAgeModal(true)
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <FettleDataGrid
                $datasource={dataSource1$}
                columnsdefination={columnsDefinations1}
                // onEdit={openEditSection}
                config={configuration1}
              />
            </Grid>
            <Grid item xs={6}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align='center' variant='h4'>
                  Gender
                </Typography>
                <Button
                  color='primary'
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(2)
                    setAgeModal(true)
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <FettleDataGrid
                $datasource={dataSource2$}
                columnsdefination={columnsDefinations1}
                // onEdit={openEditSection}
                config={configuration1}
              />
            </Grid>
            <Grid item xs={6}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align='center' variant='h4'>
                  Relationship
                </Typography>
                <Button
                  color='primary'
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(3)
                    setAgeModal(true)
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <FettleDataGrid
                $datasource={dataSource3$}
                columnsdefination={columnsDefinations1}
                // onEdit={openEditSection}
                config={configuration1}
              />
            </Grid>
            <Grid item xs={6}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align='center' variant='h4'>
                  Annual Income
                </Typography>
                <Button
                  color='primary'
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(4)
                    setAgeModal(true)
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <FettleDataGrid
                $datasource={dataSource4$}
                columnsdefination={columnsDefinations1}
                // onEdit={openEditSection}
                config={configuration1}
              />
            </Grid>
            <Grid item xs={6}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align='center' variant='h4'>
                  BMI
                </Typography>
                <Button
                  color='primary'
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(5)
                    setAgeModal(true)
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <FettleDataGrid
                $datasource={dataSource5$}
                columnsdefination={columnsDefinations1}
                // onEdit={openEditSection}
                config={configuration1}
              />
            </Grid>
          </Grid>

          {/* <Paper
            elevation="10px"
            style={{
              borShadow: '1px 1px 2px 0px rgba(0,0,0,1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1%',
            }}>
            <Box width={'250px'} height={'300px'} boxShadow={'0 1px 3px 0 rgba(0, 0, 0, 0.15)'} padding={'5px'}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align="center" variant="h4">
                  Age Group
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(1);
                    setAgeModal(true);
                  }}>
                  <AddIcon />
                </Button>
              </Box>
              <FettleDataGrid
                $datasource={dataSource1$}
                columnsdefination={columnsDefinations1}
                // onEdit={openEditSection}
                config={configuration1}
              />
            </Box>
          </Paper>
          <Paper
            elevation="10px"
            style={{
              borShadow: '1px 1px 2px 0px rgba(0,0,0,1)',
              display: 'flex',
              // background: 'wheat',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1%',
            }}>
            <Box width={'250px'} height={'300px'} boxShadow={'0 1px 3px 0 rgba(0, 0, 0, 0.15)'} padding={'5px'}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align="center" variant="h4">
                  Gender
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(2);
                    setAgeModal(true);
                  }}>
                  <AddIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation="10px"
            style={{
              borShadow: '1px 1px 2px 0px rgba(0,0,0,1)',
              display: 'flex',
              // background: 'wheat',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1%',
            }}>
            <Box width={'250px'} height={'300px'} boxShadow={'0 1px 3px 0 rgba(0, 0, 0, 0.15)'} padding={'5px'}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align="center" variant="h4">
                  Relationship
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(3);
                    setAgeModal(true);
                  }}>
                  <AddIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation="10px"
            style={{
              borShadow: '1px 1px 2px 0px rgba(0,0,0,1)',
              display: 'flex',
              // background: 'wheat',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1%',
            }}>
            <Box width={'250px'} height={'300px'} boxShadow={'0 1px 3px 0 rgba(0, 0, 0, 0.15)'} padding={'5px'}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align="center" variant="h4">
                  Anual Income
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(4);
                    setAgeModal(true);
                  }}>
                  <AddIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation="10px"
            style={{
              borShadow: '1px 1px 2px 0px rgba(0,0,0,1)',
              display: 'flex',
              // background: 'wheat',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1%',
            }}>
            <Box width={'250px'} height={'300px'} boxShadow={'0 1px 3px 0 rgba(0, 0, 0, 0.15)'} padding={'5px'}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography align="center" variant="h4">
                  BMI
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.buttonPrimary}
                  style={{ marginLeft: '5px' }}
                  onClick={() => {
                    setType(5);
                    setAgeModal(true);
                  }}>
                  <AddIcon />
                </Button>
              </Box>
            </Box>
          </Paper> */}
        </Box>
      </Paper>

      <AgeModal open={ageModal} setOpen={setAgeModal} handleClose={handleClose} type={type} />
    </div>
  )
}

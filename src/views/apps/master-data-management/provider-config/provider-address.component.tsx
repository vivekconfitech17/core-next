'use client'
import React, { useRef, useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import { Button } from 'primereact/button'
import {
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import { Toast } from 'primereact/toast'
import { ArrowBack, ArrowForward, Delete, Edit } from '@mui/icons-material'
import { Pagination, PaginationItem } from '@mui/lab'

import { ProviderTypeService } from '@/services/remote-api/api/master-services'

const Transition = React.forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction='up' ref={ref} {...props} />
})

const providertypeservice = new ProviderTypeService()
const pt$ = providertypeservice.getProviderTypes()
const ptq$ = providertypeservice.getProviderOwnerTypes()
const ptr$ = providertypeservice.getProviderCategory()

export default function ProviderAddressConfig() {
  const [active, setActive] = React.useState(0)
  const [showInput, setShowInput] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState('')
  const [providerTypes, setProviderTypes] = React.useState([])
  const [providerOwnerTypes, setProviderOwnerTypes] = React.useState([])
  const [categoryTypes, setCategoryTypes] = React.useState([])

  const [mainData, setMainData]: any = useState([])
  const [handleEditName, setHandleEditName] = useState('')

  // const[editId,setEditId] = useState();
  const [open, setOpen] = useState(false)
  const toast: any = useRef(null)
  const [idEdit, setEditId] = useState()

  // setthe get provider type value
  const useObservable = (observable: any, setter: any) => {
    // useEffect(() => {
    //   let subscription = observable.subscribe(result => {
    //     setter(result.content);
    //   });
    //   return () => subscription.unsubscribe();
    // }, [observable, setter]);
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleClickOpen = (id: any) => {
    setEditId(id)
    setOpen(true)
  }

  // hold the get data in the state for a dropdown
  useObservable(pt$, setProviderTypes)
  useObservable(ptq$, setProviderOwnerTypes)
  useObservable(ptr$, setCategoryTypes)

  // make an active button on proposer section
  const makeActive = (select: any) => {
    if (select === 1) {
      setActive(1)
      setShowInput(false)
    }

    if (select === 2) {
      setActive(2)
      setShowInput(false)
    }

    if (select === 3) {
      setActive(3)
      setShowInput(false)
    }
  }

  const handleAddFieldClick = () => {
    setShowInput(true)
  }

  const handleSelectChange = (event: any) => {
    setSelectedOption(event.target.value)
  }

  const fetchProviderLabel = () => {
    try {
      providertypeservice.getProviderLabel().subscribe((res: any) => {
        setMainData(res)
      })
    } catch (error) {
      console.error('Error saving the value:', error)
    }
  }

  const fetchProviderOwnerType = () => {
    try {
      providertypeservice.getProviderOwner().subscribe((res: any) => {
        setMainData(res)
      })
    } catch (error) {
      console.error('Error saving the value:', error)
    }
  }

  const fetchProviderType = () => {
    try {
      providertypeservice.getProviderType().subscribe((res: any) => {
        setMainData(res)
      })
    } catch (error) {
      console.error('Error saving the value:', error)
    }
  }

  const handleSaveClick = async () => {
    if (selectedOption) {
      const payload = {
        name: selectedOption
      }

      try {
        providertypeservice.addProviderType(payload).subscribe(res => {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'SucessFully Added Provider Type',
            life: 2000
          })
          setShowInput(false)
        })
        setTimeout(() => {
          fetchProviderType()
        }, 1000)
        setShowInput(false)
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else {
      console.log('Input value is empty')
    }
  }

  const handleSaveClickOwnerType = async () => {
    if (selectedOption) {
      const payload = {
        name: selectedOption
      }

      try {
        providertypeservice.addProviderOwner(payload).subscribe((res: any) => {
          if (res?.id) {
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: 'SucessFully Added Provider Owner Type',
              life: 2000
            })
            setShowInput(false)
          }
        })
        setTimeout(() => {
          fetchProviderOwnerType()
        }, 1000)
        setShowInput(false)
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else {
      console.log('Input value is empty')
    }
  }

  // const fetchFundData = () => {
  //   try {
  //     providertypeservice.getProviderList(0).subscribe(res => {
  //       // setFundData(res?.content)
  //     });

  //   } catch (error) {
  //     console.error('Error saving the value:', error);
  //   }
  // };

  const handleEditApi = (id: any) => {
    if (active == 1) {
      try {
        handleEditName.length > 0 &&
          providertypeservice.editProviderList(id, handleEditName).subscribe((res: any) => {
            // setFundData(res?.content)
            // fetchFundData();
            fetchProviderLabel()
            handleClose()
            setHandleEditName('')
          })

        // setShowInput(false);
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else if (active == 2) {
      try {
        handleEditName.length > 0 &&
          providertypeservice.editProviderType(id, handleEditName).subscribe(res => {
            // setFundData(res?.content)
            // fetchFundData();
            fetchProviderType()
            handleClose()
            setHandleEditName('')
          })

        // setShowInput(false);
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else {
      try {
        handleEditName.length > 0 &&
          providertypeservice.editOwnerProviderType(id, handleEditName).subscribe(res => {
            // setFundData(res?.content)
            // fetchFundData();

            fetchProviderOwnerType()
            handleClose()
            setHandleEditName('')
          })

        // setShowInput(false);
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    }
  }

  const handleDelete = (id: any) => {
    if (active == 1) {
      try {
        providertypeservice.deleteProviderList(id).subscribe(res => {
          // setFundData(res?.content)
          // fetchFundData();
          fetchProviderLabel()
        })

        // setShowInput(false);
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else if (active == 2) {
      try {
        providertypeservice.deleteProviderTypesList(id).subscribe(res => {
          // setFundData(res?.content)
          // fetchFundData();
          fetchProviderType()
        })

        // setShowInput(false);
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else {
      try {
        providertypeservice.deleteProviderOwnerTypesList(id).subscribe(res => {
          // setFundData(res?.content)
          // fetchFundData();
          fetchProviderOwnerType()
        })

        // setShowInput(false);
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    }
  }

  const handleSaveClickCategory = async () => {
    if (selectedOption) {
      const payload = {
        name: selectedOption
      }

      try {
        providertypeservice.addProviderCategoryType(payload).subscribe((res: any) => {
          if (res?.id) {
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: 'SucessFully Added Provider Label',
              life: 2000
            })
            setShowInput(false)
          }
        })
        setTimeout(() => {
          fetchProviderLabel()
        }, 1000)
        setShowInput(false)
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else {
      console.log('Input value is empty')
    }
  }

  const handleSaveClicked = async () => {
    if (selectedOption) {
      const payload = {
        name: selectedOption
      }

      try {
        providertypeservice.addProviderOwnerType(payload).subscribe(res => {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'SucessFully Added Provider OwnerType',
            life: 2000
          })
          setShowInput(false)
        })

        setShowInput(false)
      } catch (error) {
        console.error('Error saving the value:', error)
      }
    } else {
      console.log('Input value is empty')
    }
  }

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby='alert-dialog-slide-description'
      >
        <DialogContent>
          <div id='alert-dialog-slide-description'>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Edit />
              <h1 style={{ fontSize: '1.5rem' }}>Edit Name</h1>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: '1.5rem' }}>
              <TextField
                onChange={e => setHandleEditName(e.target.value)}
                id='outlined-basic'
                value={handleEditName}
                label='Edit Name'
                variant='outlined'
                style={{ width: '400px' }}
              />
              <Button style={{ padding: '15px', fontSize: '1rem' }} onClick={() => handleEditApi(idEdit)}>
                Save
              </Button>
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose}>Agree</Button> */}
        </DialogActions>
      </Dialog>
      <Paper elevation={0}>
        <Box p={3} my={2}>
          <>
            <Grid container item xs={12}>
              <Button
                style={active === 1 ? { color: 'white', backgroundColor: '#41e276', margin: '2px' } : { margin: '2px' }}
                onClick={() => {
                  makeActive(1)
                  fetchProviderLabel()
                }}
              >
                PROVIDER LABEL
              </Button>
              <Button
                style={active === 2 ? { color: 'white', backgroundColor: '#41e276', margin: '2px' } : { margin: '2px' }}
                onClick={() => {
                  makeActive(2)
                  fetchProviderType()
                }}
              >
                PROVIDER TYPE
              </Button>
              <Button
                style={active === 3 ? { color: 'white', backgroundColor: '#41e276', margin: '2px' } : { margin: '2px' }}
                onClick={() => {
                  makeActive(3)
                  fetchProviderOwnerType()
                }}
              >
                PROVIDER OWNER TYPE
              </Button>
            </Grid>
            <span></span>&nbsp;
            {active === 1 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'end', flexDirection: 'column', paddingRight: '20px' }} mt={4}>
                  {!showInput && (
                    <Button color='primary' onClick={handleAddFieldClick}>
                      Add New
                    </Button>
                  )}

                  {showInput && (
                    <>
                      <FormControl variant='outlined' margin='normal' style={{ width: '200px', marginTop: '-12px' }}>
                        <TextField
                          label='Provider Label'
                          value={selectedOption}
                          onChange={handleSelectChange}
                          variant='outlined'
                          margin='normal'
                        />
                      </FormControl>

                      <Button style={{ display: 'flex' }} color='secondary' onClick={handleSaveClickCategory}>
                        Save
                      </Button>
                    </>
                  )}
                </Box>
              </>
            )}
            {active === 2 && (
              <Box sx={{ display: 'flex', alignItems: 'end', flexDirection: 'column', paddingRight: '20px' }} mt={4}>
                {!showInput && (
                  <Button color='primary' onClick={handleAddFieldClick}>
                    Add New
                  </Button>
                )}

                {showInput && (
                  <>
                    <FormControl variant='outlined' margin='normal' style={{ width: '200px', marginTop: '-12px' }}>
                      <TextField
                        label='Provider Type'
                        value={selectedOption}
                        onChange={handleSelectChange}
                        variant='outlined'
                        margin='normal'
                      />
                    </FormControl>

                    <Button style={{ display: 'flex' }} color='secondary' onClick={handleSaveClick}>
                      Save
                    </Button>
                  </>
                )}
              </Box>
            )}
            {active === 3 && (
              <Box sx={{ display: 'flex', alignItems: 'end', flexDirection: 'column', paddingRight: '20px' }} mt={4}>
                {!showInput && (
                  <Button color='primary' onClick={handleAddFieldClick}>
                    Add New
                  </Button>
                )}
                {showInput && (
                  <>
                    <FormControl variant='outlined' margin='normal' style={{ width: '200px', marginTop: '-12px' }}>
                      <TextField
                        label='Provider Owner Type'
                        value={selectedOption}
                        onChange={handleSelectChange}
                        variant='outlined'
                        margin='normal'
                      />
                    </FormControl>

                    <Button style={{ display: 'flex' }} color='secondary' onClick={handleSaveClickOwnerType}>
                      Save
                    </Button>
                  </>
                )}
              </Box>
            )}
            {mainData?.content?.length > 0 && (
              <>
                {' '}
                <Box sx={{ marginTop: '10px' }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell align='center'>Code</TableCell>
                          <TableCell align='center'>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mainData?.content?.map((item: any) => {
                          return (
                            <TableRow key={item.code}>
                              <TableCell>{item?.name}</TableCell>
                              <TableCell align='center'>{item?.code}</TableCell>
                              <TableCell align='center'>
                                <Edit
                                  style={{ marginRight: '25px', cursor: 'pointer' }}
                                  onClick={() => handleClickOpen(item?.id)}
                                />
                                <Delete onClick={() => handleDelete(item?.id)} style={{ cursor: 'pointer' }} />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'end', marginTop: '1rem' }}>
                  <Pagination
                    count={mainData?.totalPages}
                    renderItem={(item: any) => (
                      <PaginationItem slots={{ previous: ArrowBack, next: ArrowForward }} {...item} />
                    )}
                  />
                </Box>
              </>
            )}
          </>
        </Box>
      </Paper>
    </>
  )
}

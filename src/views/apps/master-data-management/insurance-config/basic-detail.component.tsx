'use client'
import React, { useEffect, useState } from 'react'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  TextField
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { CheckCircleOutlineOutlined, CloudUpload, FileCopySharp } from '@mui/icons-material'

import { ProviderTypeService } from '@/services/remote-api/fettle-remote-api'

const Providertypeservice = new ProviderTypeService()

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const BasicDetailComponent = () => {
  const initialValues = {
    insuranceName: '',
    address: '',
    country: '',
    websiteURL: '',
    phoneNo: '',
    phoneNo1: '',
    emailId: '',
    emailId1: '',
    signature: '',
    logo: ''
  }

  const [countryDetails, setCountryDetails] = useState([])
  const [updateID, setUpdateID] = useState(null)
  const [allow, setAllow] = useState(false)
  const [signUploadedFile, setSignUploadedFile] = useState('')
  const [logoUploadedFile, setLogoUploadedFile] = useState('')
  const [open, setOpen] = useState(false)
  const [activated, setActivated] = useState('')
  const [updatedDone, setUpadetedDone] = useState(false)

  //   const [disable, setDisable] = useState(false);
  const [fetchL, setFetchL] = useState(true)

  const validationSchema = Yup.object({
    insuranceName: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
    country: Yup.string().required('Country is required'),

    // phoneNo: Yup.number()
    //   .typeError('Must be a number')
    //   .required('Number is required')
    //   .min(1000000000, 'Number should be 10 digits'),
    phoneNo1: Yup.number()
      .typeError('Must be a number')
      .required('Number is required')
      .min(1000000000, 'Number should be 10 digits'),

    // emailId: Yup.string()
    //   .email('Invalid email format')
    //   .required('Email is required'),
    emailId1: Yup.string().email('Invalid email format').required('Email is required')
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values: any, { setSubmitting, resetForm }) => {
      if (allow) {
        const formData = new FormData()

        for (const key in values) {
          if (key === 'signature' || key === 'logo') {
            try {
              formData.append(key, values[key])
            } catch (error) {
              console.error(`Error converting ${key} base64 to file:`, error)
            }
          } else {
            formData.append(key, values[key])
          }
        }

        Providertypeservice.updateBasicDetail(updateID, formData).subscribe(
          res => {
            if (res) {
              // setDisable(true);
              setUpadetedDone(true)
              setAllow(false)

              //   setTimeout(() => {
              //     setUpadetedDone(false);
              //   }, 2000);
              resetForm()
            }
          },
          error => {
            console.error('Error updating basic detail:', error)
          }
        )
      } else {
        const formData = new FormData()

        for (const key in values) {
          if (values[key] instanceof File) {
            formData.append(key, values[key])
          } else {
            formData.append(key, values[key])
          }
        }

        Providertypeservice.saveBasicDetail(formData).subscribe(
          res => {
            if (res) {
              //   setDisable(true);
            }
          },
          error => {
            console.error('Error updating basic detail:', error)
          }
        )
      }
    }
  })

  const handleChange = async (event: any) => {
    const { name, value, files } = event.target

    if (files) {
      formik.setFieldValue(name, files[0])
    } else {
      formik.handleChange(event)
    }
  }

  const fetchData = () => {
    Providertypeservice.getBasicDetail().subscribe((res: any) => {
      if (res[0]?.insuranceName && res[0]?.country) {
        setAllow(true)
      } else {
        setAllow(false)
      }

      setUpdateID(res[0]?.id)
      setFetchL(false)
      Object.keys(res[0]).forEach(key => {
        // formik.setFieldValue(key, res[0][key]);
        if (key == 'logo') {
          setTimeout(() => {
            setLogoUploadedFile(res[0][key])
          }, 200)
        } else if (key == 'signature') {
          setTimeout(() => {
            setSignUploadedFile(res[0][key])
          }, 200)
        } else {
          formik.setFieldValue(key, res[0][key])
        }
      })
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCountry = async () => {
    const response: any = await Providertypeservice.getCountryDetail()

    setCountryDetails(response?.content)
  }

  const handleClickOpen = (val: any) => {
    setActivated(val)
    setOpen(true)
  }

  const handleClose = (value: any) => {
    setOpen(false)

    // setSelectedValue(value);
  }

  return (
    <>
      <h2 style={{ margin: '0.5rem 0.1rem' }}>Basic Details</h2>
      <SimpleDocumentDialog
        open={open}
        onClose={handleClose}
        value={activated == 'logo' ? logoUploadedFile : signUploadedFile}
      />
      {updatedDone && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70vw',
            height: '70vh',
            backgroundColor: 'transparent',
            zIndex: '5',
            backdropFilter: 'blur(1px)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff', // Semi-transparent background
              padding: '50px',
              borderRadius: '5px',
              boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'
            }}
          >
            <div>
              <CheckCircleOutlineOutlined style={{ color: '#0edb8a', width: '150px', height: '150px' }} />
            </div>
            <div style={{ fontWeight: '600', textAlign: 'center', color: 'gray' }}>Updated Sucessfully !!</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                component='label'
                role={undefined}
                variant='contained'
                style={{
                  color: 'white',
                  backgroundColor: '#0edb8a',
                  minWidth: '8.7rem',
                  marginTop: '2px'
                }}
                tabIndex={-1}
                onClick={() => {
                  fetchData()
                  setUpadetedDone(false)
                }}

                // startIcon={<CloudUpload style={{ color: formik.values.signature && 'white' }} />}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
      <Paper elevation={0} style={{ padding: '2rem 3rem' }}>
        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
              <Box style={{ width: '40%' }}>
                <div>
                  <TextField
                    variant='outlined'
                    style={{ width: '100%' }}
                    label='Name'
                    name='insuranceName'
                    value={formik.values.insuranceName}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    // helperText={
                    //   formik.touched.insuranceName && formik.errors.insuranceName ? formik.errors.insuranceName : ''
                    // }
                    error={formik.touched.insuranceName && Boolean(formik.errors.insuranceName)}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>{fetchL && <CircularProgress size={20} />}</InputAdornment>
                      )
                    }}
                    margin='normal'
                    disabled={Boolean(formik.values.insuranceName)}
                  />
                </div>
                <div>
                  <TextField
                    id='outlined-multiline-static'
                    variant='outlined'
                    style={{ width: '100%' }}
                    label='Address'
                    name='address'
                    value={formik.values.address}
                    onChange={handleChange}
                    // helperText={formik.touched.address && formik.errors.address ? formik.errors.address : ''}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    onBlur={formik.handleBlur}
                    margin='normal'
                    fullWidth
                    multiline
                    rows={4}
                  />
                </div>
                <div>
                  <FormControl variant='outlined' style={{ width: '100%' }}>
                    <InputLabel id='demo-simple-select-label'>Country</InputLabel>
                    <Select
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      label='Country'
                      name='country'
                      value={formik.values.country}
                      onFocus={handleCountry}
                      onChange={handleChange}
                      disabled={Boolean(formik.values.country)}
                      style={{ width: '100%' }}
                    >
                      <MenuItem value={formik.values.country}>{formik.values.country}</MenuItem>
                      {countryDetails?.map((item: any) => (
                        <MenuItem key={item?.name} value={item?.name}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <TextField
                    variant='outlined'
                    label='Website URL'
                    style={{ width: '100%' }}
                    name='websiteURL'
                    value={formik.values.websiteURL}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    // helperText={formik.touched.websiteURL && formik.errors.websiteURL ? formik.errors.websiteURL : ''}
                    error={formik.touched.websiteURL && Boolean(formik.errors.websiteURL)}
                    fullWidth
                    margin='normal'
                  />
                </div>
                <div>
                  <TextField
                    variant='outlined'
                    label='Contact No. 1'
                    name='phoneNo'
                    style={{ width: '100%' }}
                    value={formik.values.phoneNo}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    // helperText={formik.touched.phoneNo && formik.errors.phoneNo ? formik.errors.phoneNo : ''}
                    // error={formik.touched.phoneNo && Boolean(formik.errors.phoneNo)}
                    fullWidth
                    margin='normal'
                    disabled={Boolean(formik.values.phoneNo)}
                  />
                </div>
              </Box>
              <Box style={{ width: '40%' }}>
                <div>
                  <TextField
                    variant='outlined'
                    label='Contact No. 2'
                    name='phoneNo1'
                    style={{ width: '100%' }}
                    value={formik.values.phoneNo1}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    // helperText={formik.touched.phoneNo1 && formik.errors.phoneNo1 ? formik.errors.phoneNo1 : ''}
                    error={formik.touched.phoneNo1 && Boolean(formik.errors.phoneNo1)}
                    fullWidth
                    margin='normal'
                  />
                </div>
                <div>
                  <TextField
                    variant='outlined'
                    label='Email No. 1'
                    style={{ width: '100%' }}
                    name='emailId'
                    value={formik.values.emailId}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    // helperText={formik.touched.emailId && formik.errors.emailId ? formik.errors.emailId : ''}
                    // error={formik.touched.emailId && Boolean(formik.errors.emailId)}
                    fullWidth
                    margin='normal'
                    disabled={Boolean(formik.values.emailId)}
                  />
                </div>
                <div>
                  <TextField
                    variant='outlined'
                    label='Email No. 2'
                    style={{ width: '100%' }}
                    name='emailId1'
                    value={formik.values.emailId1}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    // helperText={formik.touched.emailId1 && formik.errors.emailId1 ? formik.errors.emailId1 : ''}
                    error={formik.touched.emailId1 && Boolean(formik.errors.emailId1)}
                    fullWidth
                    margin='normal'
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',

                    // alignItems: 'center',
                    width: '100%',

                    //   border:"1px solid red",
                    margin: '2rem 1rem'
                  }}
                >
                  <div style={{ color: 'gray', fontSize: '1rem', fontWeight: '700' }}>SIGNATURE</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                      <Button
                        component='label'
                        role={undefined}
                        variant='contained'
                        style={{
                          color: formik.values.signature && 'white',
                          backgroundColor: formik.values.signature && '#0edb8a',
                          minWidth: '8.7rem'
                        }}
                        tabIndex={-1}
                        startIcon={<CloudUpload style={{ color: formik.values.signature && 'white' }} />}
                      >
                        Upload file
                        <VisuallyHiddenInput
                          type='file'
                          name='signature'
                          accept='.jpg, .jpeg, .png'
                          onChange={handleChange}
                        />
                      </Button>
                      <div style={{ fontSize: '10px', color: 'gray', whiteSpace: 'nowrap' }}>
                        {formik.values.signature.name}
                      </div>
                    </div>
                    <div
                      style={
                        signUploadedFile.length > 1
                          ? { visibility: 'visible', marginLeft: '7px', cursor: 'pointer' }
                          : { visibility: 'hidden', marginLeft: '7px' }
                      }
                      onClick={() => handleClickOpen('signature')}
                    >
                      <FileCopySharp style={{ color: '#0edb8a' }} />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',

                    // alignItems: 'center',
                    width: '100%',
                    margin: '2rem 1rem'
                  }}
                >
                  <div style={{ color: 'gray', fontSize: '1rem', fontWeight: '700' }}>Logo</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                      <Button
                        component='label'
                        role={undefined}
                        variant='contained'
                        style={{
                          color: formik.values.logo && 'white',
                          backgroundColor: formik.values.logo && '#0edb8a',
                          minWidth: '8.7rem'
                        }}
                        tabIndex={-1}
                        startIcon={<CloudUpload style={{ color: formik.values.logo && 'white' }} />}
                      >
                        Upload file
                        <VisuallyHiddenInput
                          type='file'
                          name='logo'
                          accept='.jpg, .jpeg, .png'
                          onChange={handleChange}
                        />
                      </Button>
                      <div style={{ fontSize: '10px', color: 'gray', whiteSpace: 'nowrap' }}>
                        {formik.values.logo.name}
                      </div>
                    </div>
                    <div
                      style={
                        logoUploadedFile.length > 1
                          ? { visibility: 'visible', marginLeft: '7px', cursor: 'pointer' }
                          : { visibility: 'hidden', marginLeft: '7px' }
                      }
                      onClick={() => handleClickOpen('logo')}
                    >
                      <FileCopySharp style={{ color: '#0edb8a' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Button
                    variant='contained'
                    style={
                      !formik.isSubmitting
                        ? {
                            backgroundColor: '#0edb8a',
                            color: 'white',
                            width: '90%',
                            fontSize: '1rem',
                            marginTop: '1rem'
                          }
                        : {
                            color: 'white',
                            width: '90%',
                            fontSize: '1rem',
                            marginTop: '1rem'
                          }
                    }
                    type='submit'
                    disabled={formik.isSubmitting}
                  >
                    {allow ? 'Update' : 'Save'}
                  </Button>
                </div>
                {/* <div>
                  <TextField
                    variant="outlined"
                    label="Logo"
                    type="file"
                    style={{ width: '100%' }}
                    name="logo"
                    onChange={handleChange}
                    helperText={formik.touched.logo && formik.errors.logo ? formik.errors.logo : ''}
                    error={formik.touched.logo && Boolean(formik.errors.logo)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CloudUpload />
                        </InputAdornment>
                      )
                    }}
                    margin="normal"
                  />
                </div> */}
              </Box>
            </Box>
          </Box>
        </form>
      </Paper>
    </>
  )
}

export default BasicDetailComponent

const SimpleDocumentDialog = ({ open, onClose, value }: { open: boolean; onClose: any; value: any }) => {
  // const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose()
  }

  const handleListItemClick = (value: any) => {
    onClose(value)
  }

  return (
    <Dialog onClose={handleClose} open={open} sx={{ width: '1500px', maxWidth: '1500px' }}>
      <DialogTitle>Uploaded Document</DialogTitle>
      <img src={`data:image/jpeg;base64,${value}`} alt='uploaded document' />
    </Dialog>
  )
}

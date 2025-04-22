import * as React from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import * as yup from 'yup'

import { HierarchyService } from '@/services/remote-api/api/hierarchy-services/hierarchy.services'

import Asterisk from '../../shared-component/components/red-asterisk'

const branchService = new HierarchyService()

const useStyles = makeStyles(theme => ({
  input1: {
    width: '50%'
  },
  clientTypeRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row'
    }
  },
  formControl: {
    minWidth: '90%'
  }
}))

// function useQuery1() {
//   return new URLSearchParams(useLocation().search);
// }

const schemaObject = {
  centerPhoneNo: yup.string()['min'](10, 'Must be exactly 10 digit')['max'](10, 'Must be exactly 10 digit').nullable(),
  centerAltPhoneNo: yup
    .string()
    ['min'](10, 'Must be exactly 10 digit')
    ['max'](10, 'Must be exactly 10 digit')
    .nullable(),
  centerMailId: yup.string().email('Enter a valid email').nullable(),
  centerAltMailId: yup.string().email('Enter a valid email').nullable(),
  centerName: yup.string()
}

const validationSchema = yup.object(schemaObject)

const initialValues = {
  centerName: '',
  centerPhoneNo: '',
  centerAltPhoneNo: '',
  centerFaxNo: '',
  centerAltFaxNo: '',
  centerMailId: '',
  centerAltMailId: ''
}

export default function BranchBasicDetailsComponent(props: any) {
  const classes = useStyles()
  const query2 = useSearchParams()
  const router = useRouter()
  const id: any = useParams().id

  const formik = useFormik({
    initialValues: {
      ...initialValues
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      handleSubmitPlan()
    }
  })

  React.useEffect(() => {
    if (id) {
      populateData(id)
    }
  }, [id])

  const populateData = (id: any) => {
    branchService.getBranchDetails(id).subscribe(value => {
      formik.setValues({
        centerName: value.centerName,
        centerPhoneNo: value.centerPhoneNo,
        centerAltPhoneNo: value.centerAltPhoneNo,
        centerFaxNo: value.centerFaxNo,
        centerAltFaxNo: value.centerAltFaxNo,
        centerMailId: value.centerMailId,
        centerAltMailId: value.centerAltMailId
      })
    })
  }

  const handleSubmitPlan = () => {
    const payload = {
      centerName: formik.values.centerName,
      centerPhoneNo: formik.values.centerPhoneNo,
      centerAltPhoneNo: formik.values.centerAltPhoneNo,
      centerFaxNo: formik.values.centerFaxNo,
      centerAltFaxNo: formik.values.centerAltFaxNo,
      centerMailId: formik.values.centerMailId,
      centerAltMailId: formik.values.centerAltMailId
    }

    if (query2.get('mode') === 'create') {
      branchService.saveBranch(payload).subscribe((res: any) => {
        props.setBranchId(res.id)
        props.handleNext()
      })
    }

    if (query2.get('mode') === 'edit') {
      branchService.editBranch(payload, id, '').subscribe(res => {
        props.handleNext()
      })
    }
  }

  const handleClose = (event: any) => {
    router.push(`/branch?mode=viewList`)

    // window.location.reload();
  }

  return (
    <Paper elevation={0}>
      <Box p={3} my={2}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  size='small'
                  id='standard-basic'
                  name='centerName'
                  value={formik.values.centerName}
                  onChange={formik.handleChange}
                  error={formik.touched.centerName && Boolean(formik.errors.centerName)}
                  helperText={formik.touched.centerName && formik.errors.centerName}
                  label={
                    <span>
                      Name <Asterisk />
                    </span>
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='centerPhoneNo'
                  value={formik.values.centerPhoneNo}
                  label='Mobile No'
                  onChange={formik.handleChange}
                  error={formik.touched.centerPhoneNo && Boolean(formik.errors.centerPhoneNo)}
                  helperText={formik.touched.centerPhoneNo && formik.errors.centerPhoneNo}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='centerAltPhoneNo'
                  value={formik.values.centerAltPhoneNo}
                  label='Alt Mobile No'
                  onChange={formik.handleChange}
                  error={formik.touched.centerAltPhoneNo && Boolean(formik.errors.centerAltPhoneNo)}
                  helperText={formik.touched.centerAltPhoneNo && formik.errors.centerAltPhoneNo}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='centerMailId'
                  value={formik.values.centerMailId}
                  label='Email'
                  onChange={formik.handleChange}
                  error={formik.touched.centerMailId && Boolean(formik.errors.centerMailId)}
                  helperText={formik.touched.centerMailId && formik.errors.centerMailId}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='centerAltMailId'
                  value={formik.values.centerAltMailId}
                  label='Email'
                  onChange={formik.handleChange}
                  error={formik.touched.centerAltMailId && Boolean(formik.errors.centerAltMailId)}
                  helperText={formik.touched.centerAltMailId && formik.errors.centerAltMailId}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='centerFaxNo'
                  value={formik.values.centerFaxNo}
                  label='Fax No'
                  onChange={formik.handleChange}
                  error={formik.touched.centerFaxNo && Boolean(formik.errors.centerFaxNo)}
                  helperText={formik.touched.centerFaxNo && formik.errors.centerFaxNo}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='standard-basic'
                  name='centerAltFaxNo'
                  value={formik.values.centerAltFaxNo}
                  label='Alt Fax No'
                  onChange={formik.handleChange}
                  error={formik.touched.centerAltFaxNo && Boolean(formik.errors.centerAltFaxNo)}
                  helperText={formik.touched.centerAltFaxNo && formik.errors.centerAltFaxNo}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button color='secondary' style={{ marginRight: '5px' }} type='submit'>
                Save
              </Button>
              <Button color='primary' onClick={handleClose} className='p-button-text'>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Paper>
  )
}

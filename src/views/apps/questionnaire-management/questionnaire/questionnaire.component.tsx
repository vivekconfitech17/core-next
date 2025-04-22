
import React from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import { makeStyles } from '@mui/styles'
import * as yup from 'yup'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { Button, FormHelperText } from '@mui/material'

import { QuestionnaireService } from '@/services/remote-api/api/master-services/questionnaire.service'

const questionnaireService = new QuestionnaireService()

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
  actionContainer: {},
  buttonPrimary: {}
}))

const validationSchema = yup.object({
  question: yup.string().required('Question is required'),
  minimumAge: yup.string().required('Minimum age is required'),
  maximumAge: yup.string().required('Maximum age is required'),
  gender: yup.string().required('Gender is required')
})

const initialValues = {
  question: '',
  minimumAge: '',
  maximumAge: '',
  gender: ''
}

// function useQuery1() {
//   return new URLSearchParams(useLocation().search);
// }

export default function QuestionnaireComponent(props: any) {
  const classes = useStyles()
  const query = useSearchParams()
  const history = useRouter()
  const id: any = useParams().id

  const formik = useFormik({
    initialValues: {
      ...initialValues
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      handleSubmit()

      // console.log("asasas", values)
    }
  })

  React.useEffect(() => {
    if (id) {
      populateData(id)
    }
  }, [id])

  const populateData = (id: any) => {
    questionnaireService.getQuestionnaireById(id).subscribe((value: any) => {
      formik.setValues({
        question: value.question,
        minimumAge: value.minimumAge,
        maximumAge: value.maximumAge,
        gender: value.gender
      })
    })
  }

  const handleSubmit = () => {
    const payload = { ...formik.values }

    if (query.get('mode') === 'create') {
      questionnaireService.saveQuestionnaire(payload).subscribe(res => {
        history.push('/questionnaire?mode=viewList')
      })
    }

    if (query.get('mode') === 'edit') {
      questionnaireService.saveQuestionnaire(payload).subscribe(res => {
        history.push('/questionnaire?mode=viewList')
      })
    }
  }

  const handleClose = () => {
    history.push(`/questionnaire?mode=viewList`)

    // window.location.reload();
  }

  return (
    <div>
      {/* <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '20px',
          height: '2em',
          fontSize: '18px',
        }}>
        <span
          style={{
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '5px',
          }}>
          Questionnaire
        </span>
      </Grid> */}
      <Paper
        elevation={0}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '1%'
        }}
      >
        <form onSubmit={formik.handleSubmit} noValidate>
          <Box padding={'10px'}>
            <Grid container spacing={3}>
              <Grid item xs={6} style={{ marginBottom: '15px' }}>
                <Box>
                  <TextField
                    variant='standard'
                    name='question'
                    label='Question'
                    fullWidth
                    value={formik.values.question}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.question && Boolean(formik.errors.question) && (
                    <FormHelperText>{formik.touched.question && formik.errors.question}</FormHelperText>
                  )}
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={3} style={{ marginTop: '4px' }}>
                <Box style={{ marginTop: '3px' }}>
                  {/* <FormControl> */}
                  <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                    Gender
                  </InputLabel>
                  <Select
                    label='Gender'
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    name='gender'
                    // style={{width:"50px"}}
                    fullWidth
                    value={formik.values.gender}
                    onChange={formik.handleChange}

                    // value={x.documentType}
                    // disabled={!!x.documentName}
                    // onChange={e => handleInputChangeDocumentType(e, i)}
                  >
                    <MenuItem value='male'>Male</MenuItem>
                    <MenuItem value='female'>Female</MenuItem>
                  </Select>
                  {formik.touched.gender && Boolean(formik.errors.gender) && (
                    <FormHelperText>{formik.touched.gender && formik.errors.gender}</FormHelperText>
                  )}
                  {/* </FormControl> */}
                </Box>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '15px' }}>
                <Box style={{ marginTop: '3px' }}>
                  <TextField
                    variant='standard'
                    name='minimumAge'
                    label='Age From'
                    fullWidth
                    value={formik.values.minimumAge}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.minimumAge && Boolean(formik.errors.minimumAge) && (
                    <FormHelperText>{formik.touched.minimumAge && formik.errors.minimumAge}</FormHelperText>
                  )}
                </Box>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '15px' }}>
                <Box style={{ marginTop: '3px' }}>
                  <TextField
                    variant='standard'
                    name='maximumAge'
                    label='Age To'
                    fullWidth
                    value={formik.values.maximumAge}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.maximumAge && Boolean(formik.errors.maximumAge) && (
                    <FormHelperText>{formik.touched.maximumAge && formik.errors.maximumAge}</FormHelperText>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid item xs={12} style={{ marginBottom: '15px', marginTop: '10px' }}>
            <Divider />
          </Grid>

          <Grid
            item
            xs={12}
            className={classes.actionContainer}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button variant='contained' color='primary' type='submit' className={classes.buttonPrimary}>
              Save
            </Button>
            <Button variant='text' type='button' onClick={handleClose}>
              Cancel
            </Button>
          </Grid>
        </form>
      </Paper>
    </div>
  )
}

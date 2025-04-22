import * as React from 'react'

import { Snackbar } from '@mui/material'
import { Button } from 'primereact/button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import MuiAlert from '@mui/lab/Alert'

import 'date-fns'

import { HierarchyService } from '@/services/remote-api/api/hierarchy-services/hierarchy.services'
import Asterisk from '@/views/apps/shared-component/components/red-asterisk'

const orgtypeservice = new HierarchyService()

function Alert(props: any) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

export default function PositionAddModal(props: any) {
  const [remarks, setRemarks] = React.useState('')
  const [fullWidth, setFullWidth] = React.useState(true)
  const [maxWidth, setMaxWidth] = React.useState<any>('sm')
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleClose = () => {
    props.closePositionModal()
  }

  const handleModalSubmit = () => {
    if (remarks !== null && remarks !== '') {
      const payload = {
        name: remarks,
        type: props.type,
        parentPosition: props.selectedNode?.id ? props.selectedNode.id : null
      }

      orgtypeservice.addPosition(payload).subscribe(res => {
        props.submitPositionModal()
        setRemarks('')
      })
    }

    if (remarks === null || remarks === '') {
      setSnackbarMessage('Please enter position')
      setSnackbarOpen(true)
    }

    // props.submitPositionModal(remarks)
    // invoiceservice.revertInvoice(remarks,props.selectedInvoiceForReversal).subscribe(ele=> {
    //     props.closePositionModal();
    // })
  }

  const handleChange = (e: any) => {
    setRemarks(e.target.value)
  }

  return (
    <Dialog
      open={props.positionModal}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby='form-dialog-title'
      disableEnforceFocus
    >
      <DialogTitle id='form-dialog-title'>Add Position</DialogTitle>
      <DialogContent>
        <TextField
          id='standard-multiline-flexible'
          // required
          multiline
          name='remarks'
          value={remarks}
          onChange={handleChange}
          label={
            <span>
              Position Name <Asterisk />
            </span>
          }
        />
        <Snackbar
          open={snackbarOpen}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        >
          <Alert onClose={handleSnackbarClose} severity='error'>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary' className='p-button-text'>
          Cancel
        </Button>
        <Button onClick={handleModalSubmit} color='primary'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}

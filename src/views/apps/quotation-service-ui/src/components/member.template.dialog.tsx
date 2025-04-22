import * as React from 'react'

import { Button } from 'primereact/button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

import 'date-fns'

// import { useFormik } from "formik";

import { MemberService } from '@/services/remote-api/api/member-services'

const memberservice = new MemberService()

export default function MemberTemplateModal(props: any) {
  const fullWidth = true
  const [apiValList, setApiValList] = React.useState(props.apiList.length !== 0 ? props.apiList : [])
  const maxWidth = 'sm'
  const [noOfRows, setNoOfRows] = React.useState(100)
  const [quotationDetails, setQuotationDetails] = React.useState(props.quotationDetails ? props.quotationDetails : '')
  const [renewalPolicyId, setRenewalPolicyId] = React.useState(props.renewalPolicyId ? props.renewalPolicyId : '')

  const path = window.location.pathname.split('/')

  const handleModalSubmit = (e: any) => {
    let allOk = true
    const hasAPI = true
    const payload = []
    const payload2 = []
    const payload3: any = []
    let url: any = ''

    if (apiValList.length === 0) {
      memberservice.downloadTemplate(JSON.stringify(payload3), noOfRows, false).subscribe((res: any) => {
        const { data, headers } = res
        const fileName = headers['content-disposition'].replace(/\w+; filename=(.*)/, '$1')
        const blob = new Blob([data], { type: headers['content-type'] })
        const dom: any = document.createElement('a')
        const url = window.URL.createObjectURL(blob)

        dom.href = url
        dom.download = decodeURI(fileName)
        dom.style.display = 'none'
        document.body.appendChild(dom)
        dom.click()
        dom?.parentNode?.removeChild(dom)
        window.URL.revokeObjectURL(url)
        handleClose()
      })
    }

    if (apiValList.length !== 0) {
      apiValList.forEach((api: any) => {
        const quryParams = []
        const pathParams = []

        const qObj: any = {}
        const pathObj: any = {}

        api.pathVaraibles.forEach((ele: any) => {
          if (ele.value === '') {
            //error message
            allOk = false
          }

          if (ele.value !== '') {
            pathObj[ele.urlPlaceholder] = ele.value
          }
        })

        api.queryParameters.forEach((ele: any) => {
          if (ele.value === '' && ele.required) {
            //error message
            allOk = false
          }

          if (ele.value !== '') {
            qObj[ele.urlPlaceholder] = [ele.value]
          }
        })

        if (quotationDetails && quotationDetails.renewalPolicyId) {
          const policyObj = {
            policyId: [quotationDetails.renewalPolicyId]
          }

          payload3.push({
            apiId: api.id,
            queryParameters: { ...qObj, ...policyObj },
            pathVaraibles: pathObj
          })
        } else if (renewalPolicyId && renewalPolicyId != '') {
          const policyObj = {
            policyId: [renewalPolicyId]
          }

          payload3.push({
            apiId: api.id,
            queryParameters: { ...qObj, ...policyObj },
            pathVaraibles: pathObj
          })
        } else {
          payload3.push({
            apiId: api.id,
            queryParameters: qObj,
            pathVaraibles: pathObj
          })
        }
      })

      if (allOk) {
        if ((quotationDetails && quotationDetails.renewalPolicyId) || (renewalPolicyId && renewalPolicyId != '')) {
          memberservice.downloadTemplate(JSON.stringify(payload3), noOfRows, true).subscribe((res: any) => {
            const { data, headers } = res
            const fileName = headers['content-disposition'].replace(/\w+; filename=(.*)/, '$1')
            const blob = new Blob([data], { type: headers['content-type'] })
            const dom = document.createElement('a')
            const url = window.URL.createObjectURL(blob)

            dom.href = url
            dom.download = decodeURI(fileName)
            dom.style.display = 'none'
            document.body.appendChild(dom)
            dom.click()
            dom.parentNode?.removeChild(dom)
            window.URL.revokeObjectURL(url)
            handleClose()
          })
        } else {
          if (path[1] === 'endorsements') {
            url = memberservice.downloadTemplateEndorsement

            // payload3[0].queryParameters[0].action = props.action
          } else {
            url = memberservice.downloadTemplate
          }

          url(JSON.stringify(payload3), noOfRows, false, props.action).subscribe((res: any) => {
            const { data, headers } = res
            const fileName = headers['content-disposition'].replace(/\w+; filename=(.*)/, '$1')
            const blob = new Blob([data], { type: headers['content-type'] })
            const dom = document.createElement('a')
            const url = window.URL.createObjectURL(blob)

            dom.href = url
            dom.download = decodeURI(fileName)
            dom.style.display = 'none'
            document.body.appendChild(dom)
            dom.click()
            dom.parentNode?.removeChild(dom)
            window.URL.revokeObjectURL(url)
            handleClose()
          })
        }

        // var blob = new Blob([res], { type: "" });

        //   var blob = new Blob([s2ab(atob(data))],{
        //     type: ''
        // });
      }
    }

    // props.handleBlacklistSubmit(payload);
  }

  // const s2ab = s => {
  //   var buf = new ArrayBuffer(s.length);
  //   var view = new Uint8Array(buf);
  //   for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  //   return buf;
  // };

  const handleClose = () => {
    props.closeTemplateModal()
  }

  const handleQueryParamChange = (e: any, i: any, j: any) => {
    const list = [...apiValList]

    list[i]['queryParameters'][j]['value'] = e.target.value
    setApiValList(list)
  }

  const handlePathParamChange = (e: any, i: any, j: any) => {
    const list = [...apiValList]

    list[i]['pathVaraibles'][j]['value'] = e.target.value
    setApiValList(list)
  }

  // const [selectedStartDate, setSelectedStartDate] = React.useState(new Date());
  // const handleStartDateChange = (date) => {
  //     setSelectedStartDate(date);
  //     const timestamp = new Date(date).getTime();
  //     formik.setFieldValue('startDate', timestamp);
  // };

  const handleRowInput = (e: any) => {
    setNoOfRows(e.target.value)
  }

  return (
    <Dialog
      open={props.openTemplate}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby='form-dialog-title'
      disableEnforceFocus
    >
      <DialogTitle id='form-dialog-title'>Member Template Input</DialogTitle>
      <DialogContent>
        <form onSubmit={handleModalSubmit}>
          <Grid container spacing={3} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'row' }}>
            {apiValList.map((x: any, i: number) => {
              return (
                <div key={`apiValList-${i}`}>
                  {x.pathVaraibles.map((y: any, j: number) => {
                    return (
                      <Grid item xs={12} sm={6} className='p-2' key={`gridPathvariable-${j}`}>
                        <TextField
                          id='standard-basic'
                          fullWidth
                          name={y.urlPlaceholder}
                          value={y.value}
                          onChange={e => handlePathParamChange(e, i, j)}
                          label={y.alias}
                          required={true}
                        />
                      </Grid>
                    )
                  })}
                  {x.queryParameters.map((y: any, j: number) => {
                    return (
                      <Grid key={`gridQueryParameters-${j}`} item xs={12} sm={6} className='p-2'>
                        <TextField
                          fullWidth
                          id='standard-basic'
                          name={y.urlPlaceholder}
                          value={y.value}
                          onChange={e => handleQueryParamChange(e, i, j)}
                          label={y.alias}
                          required={y.required}
                        />
                      </Grid>
                    )
                  })}
                </div>
              )
            })}
            <Grid item xs={12} sm={6} className='p-2'>
              <TextField
                id='standard-basic'
                name='noOfRows'
                fullWidth
                value={noOfRows}
                onChange={e => handleRowInput(e)}
                label='Number of Rows'
                required={true}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleModalSubmit} color='secondary'>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

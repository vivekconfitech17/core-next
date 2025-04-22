// import { Button } from 'primereact/button';

import React from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { withStyles } from '@mui/styles'

import { forkJoin } from 'rxjs'

import { Button } from 'primereact/button'

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { ClientService, ProspectService } from '@/services/remote-api/api/client-services'
import {
  ClientTypeService,
  GroupTypeService,
  PrefixTypeService,
  SuffixTypeService
} from '@/services/remote-api/api/master-services'
import { QuotationService } from '@/services/remote-api/api/quotation-services'
import { PolicyService } from '@/services/remote-api/fettle-remote-api'
import { FettleAutocomplete } from '@/views/apps/shared-component/components/fettle.autocomplete'

const prospectService = new ProspectService()
const quotationService = new QuotationService()
const clientTypeService = new ClientTypeService()
const grouptypeService = new GroupTypeService()
const prefixservice = new PrefixTypeService()
const suffixservice = new SuffixTypeService()
const policyService = new PolicyService()
const clientService = new ClientService()

const useStyles = (theme: any) => ({
  formControl: {
    margin: theme.spacing ? theme.spacing(1) : '8px',
    width: '90%'
  },
  tagBlock: {},
  aLabel: {
    display: 'flex',
    alignItems: 'center'
  }
})

// function isLeapYear(year) {
//   // Leap year conditions
//   if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
//     return true;
//   }

//   return false;
// }

const today = new Date()
const endDate = new Date(today)

endDate.setDate(today.getDate() + 364)

function withRouter(Component: any) {
  return function WrappedComponent(props: any) {
    const router = useRouter()
    const params = useParams()
    const query = useSearchParams()
    return <Component {...props} router={router} params={params} query={query}/>
  }
}

class QuotationBasicDetailsComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      quotationManagementForm: {
        clientType: '',
        groupType: '',
        prefix: '',
        firstName: '',
        middletName: '',
        lastName: '',
        suffix: '',
        displayName: '',
        mobileNo: '',
        alternateMobileNo: '',
        emailId: '',
        alternateEmailId: '',
        addresses: '',
        code: ''
      },
      tag: '',
      policyDuration: 365,
      policyStartDate: new Date(),
      policyEndDate: endDate,

      // policyEndDate: new Date(today.getDate() + 365),
      selectedProspect: '',
      clientTypes: [],
      groupTypes: [],
      prefixes: [],
      suffixes: []
    }
  }

  componentDidMount() {
    const APIs = [this.getCleintTypes(), this.getGroupTypes(), this.getPrefixTypes(), this.getSuffixTypes()]

    forkJoin(APIs).subscribe((res: any) => {
      this.setState({
        ...this.state,
        clientTypes: res[0].content,
        groupTypes: res[1].content,
        prefixes: res[2].content,
        suffixes: res[3].content
      })
      // const query = new URLSearchParams(this.props.location.search)
      const query = this.props.query;

      if (query.get('type') == 'renewal') {
        this.getRenewalDetails()
      } else {
        this.setNewProspect()
      }
    })
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.quotationDetails != this.props.quotationDetails) {
      const prospectId = this.props.quotationDetails.prospectId

      this.populateBasicDetails()
      localStorage.setItem('prospectID', prospectId)
    }
  }

  isProspectDisabled = () => {
    return (
      this.props.quotationDetails.memberUploadStatus === 'COMPLETED' ||
      this.props.quotationDetails.premiumCalculationStatus === 'COMPLETED'
    )
  }

  populateBasicDetails = () => {
    const prospectId = this.props.quotationDetails.prospectId

    this.setState({
      ...this.state,
      tag: this.props.quotationDetails.tag,
      selectedProspect: prospectId,
      policyDuration: this.props.quotationDetails.policyDuration,
      policyStartDate: this.props.quotationDetails.policyStartDate
        ? new Date(this.props.quotationDetails.policyStartDate)
        : new Date(),
      policyEndDate: this.props.quotationDetails.policyEndDate
        ? new Date(this.props.quotationDetails.policyEndDate)
        : new Date()
    })
    this.getProspectDetails(prospectId)
  }

  getCleintTypes = () => {
    return clientTypeService.getCleintTypes()
  }

  getGroupTypes = () => {
    return grouptypeService.getGroupTypes()
  }

  getPrefixTypes = () => {
    return prefixservice.getPrefixTypes()
  }

  getSuffixTypes = () => {
    return suffixservice.getSuffixTypes()
  }

  setNewProspect = () => {
    // const query = new URLSearchParams(this.props.location.search)
    const query = this.props.query;
    const prospectId = query.get('prospectId')

    if (prospectId) {
      this.setState({
        ...this.state,
        selectedProspect: prospectId
      })
      this.getProspectDetails(prospectId)
    }
  }

  getRenewalDetails() {
    // const query = new URLSearchParams(this.props.location.search)
    const query = this.props.query;
    const policyId = query.get('policyId')
    const isRenewal = query.get('type') === 'renewal'

    const calculateUpdatedDates = (startDate: any, endDate: any) => {
      const originalEndDate = new Date(endDate)
      const updatedStartDate = new Date(originalEndDate.getTime())
      const updatedEndDate = new Date(originalEndDate.getTime())

      updatedStartDate.setDate(updatedStartDate.getDate() + 1)
      updatedStartDate.setHours(0, 0, 0, 0)

      const diffInMilliseconds = endDate - startDate
      const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24)

      updatedEndDate.setDate(updatedEndDate.getDate() + Math.ceil(diffInDays))

      return { updatedStartDate, updatedEndDate }
    }

    const setStateWithPolicyDetails = (policy: any) => {
      const { updatedStartDate, updatedEndDate } = calculateUpdatedDates(policy.policyStartDate, policy.policyEndDate)

      this.setState({
        ...this.state,
        selectedProspect: policy.prospectId,
        policyDuration: policy.policyDuration,
        policyStartDate: isRenewal
          ? updatedStartDate
          : policy.policyStartDate
            ? new Date(policy.policyStartDate)
            : new Date(),
        policyEndDate: isRenewal ? updatedEndDate : policy.policyEndDate ? new Date(policy.policyEndDate) : new Date()
      })

      if (policy.clientId) {
        this.getClientDetails(policy.clientId)
      }
    }

    if (policyId) {
      policyService.getPolicyDetails(policyId).subscribe(policy => setStateWithPolicyDetails(policy))
    } else {
      const quotationId = this.props.params.quotationId

      quotationService.getQuoationDetailsByID(quotationId).subscribe(res => setStateWithPolicyDetails(res))
    }
  }

  getClientDetails(clientId: any) {
    clientService.getClientDetails(clientId).subscribe((res: any) => {
      if (res.clientBasicDetails && res.prospectId) {
        const prospectID = res.prospectId

        this.setState({
          ...this.state,
          selectedProspect: prospectID
        })
        localStorage.setItem('prospectID', prospectID)
        this.getProspectDetails(prospectID)
      }
    })
  }

  prospectDataSourceCallback$ = (
    params: any = {},
    action: any,
    pageRequest: any = {
      page: 0,
      size: 10,
      summary: true,
      active: true
    }
  ) => {
    let reqParam = { ...pageRequest, ...params }

    if (action?.searchText) {
      reqParam = {
        ...reqParam,
        code: action.searchText,
        displayName: action.searchText,
        mobileNo: action.searchText
      }
      delete reqParam.active
    }

    return prospectService.getProspects(reqParam)
  }

  handleAutoComplete = (name: string, e: any, value: any) => {
    this.getProspectDetails(value?.id)
    this.setState({
      ...this.state,
      selectedProspect: value?.id
    })
    localStorage.setItem('prospectID', value?.id)
  }

  getProspectDetails = (id: any) => {
    if (id) {
      prospectService.getProspectDetails(id).subscribe((result: any) => {
        this.setState({
          ...this.state,
          quotationManagementForm: {
            ...this.state.quotationManagementForm,
            ...result,
            addresses: result?.addresses[0]?.addressDetails?.AddressLine1
          }
        })
      })
    }
  }

  createProspect = () => {
    this.props.router.push('/client/prospects?mode=create&navigate=quotation')
  }

  handleQmChange = (e: any) => {
    const { name, value } = e.target

    this.setState({
      ...this.state,
      [name]: value
    })
  }

  saveQuotation = () => {
    // const query = new URLSearchParams(this.props.location.search)
    const query = this.props.query;
    const payload: any = {
      prospectId: this.state.selectedProspect,
      tag: this.state.tag,
      policyStartDate: new Date(this.state.policyStartDate).setHours(0, 0, 0, 0),
      policyEndDate: new Date(this.state.policyEndDate).setHours(23, 59, 59, 0)
    }

    if (query.get('policyId')) {
      payload['renewalPolicyId'] = query.get('policyId')
    }

    const quotationId = localStorage.getItem('quotationId')

    if (quotationId) {
      const pageRequest: any = {
        action: 'update-basic'
      }

      quotationService.updateQuotation(pageRequest, payload, quotationId).subscribe((res: any) => {
        this.props.handleNext()
      })
    } else {
      quotationService.saveQuotation(payload).subscribe((res: any) => {
        localStorage.setItem('quotationId', res.id)
        this.props.handleNext()
      })
    }
  }

  handleEndDateChange = (date: any) => {
    const endDate = new Date(date)

    this.setState({ policyEndDate: endDate })
  }

  handleStartDateChange = (date: any) => {
    const startDate = new Date(date)

    this.setState({ policyStartDate: startDate })
    const endDate = new Date(date)

    endDate.setDate(date.getDate() + 364)
    this.setState({ policyEndDate: endDate })
  }

  render() {
    const { classes } = this.props

    const {
      clientTypes,
      groupTypes,
      prefixes,
      suffixes,
      tag,
      policyDuration,
      policyStartDate,
      policyEndDate,
      selectedProspect,
      quotationManagementForm
    } = this.state

    // const query = new URLSearchParams(this.props.location.search)
    const query = this.props.query;

    return (
      <div>
        <div className={classes.header} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='h6' gutterBottom>
            Quotation Management - Create Quotation
          </Typography>
          <Typography variant='h6' gutterBottom style={{ textTransform: 'capitalize' }}>
            {query.get('type')}
          </Typography>
        </div>
        <Paper elevation={0} style={{ padding: 15 }}>
          <Grid container spacing={1} alignItems='flex-end'>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                <TextField id='tag' name='tag' label='Tag' value={tag} onChange={this.handleQmChange} />
              </FormControl>
            </Grid>

            <Grid container item xs={12} sm={6} md={4}>
              <Grid item xs={12}>
                <Typography variant='body2'>Already created a prospect?</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl className={classes.formControl}>
                  <FettleAutocomplete
                    id='prospect'
                    name='prospect'
                    label='Search Prospect'
                    $datasource={this.prospectDataSourceCallback$}
                    displayKey='displayName'
                    value={selectedProspect}
                    changeDetect={true}
                    onChange={(e: any, newValue: any) => this.handleAutoComplete('selectedProspect', e, newValue)}
                    disabled={this.isProspectDisabled() || query.get('type') === 'renewal'}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid item container xs={12} sm={6} md={4}>
              <Grid item xs={12}>
                <Typography variant='body2'>Prospect not created?</Typography>
              </Grid>
              <Grid item xs={12} style={{ paddingTop: '18px' }} container alignItems='flex-end'>
                <Button color='primary' onClick={this.createProspect} disabled={query.get('type') === 'renewal'}>
                  Create Prospect
                </Button>
              </Grid>
            </Grid>

            {/* <Grid item xs={12} sm={6} md={3}>
              <FormControl>
                <TextField
                  id="policy-duration"
                  name="policyDuration"
                  label="Policy Duration (In days)"
                  value={policyDuration}
                  onChange={this.handleQmChange}
                />
              </FormControl>
            </Grid> */}

            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    autoOk={true}
                    id="date-picker-inline"
                    label="Policy Start Date"
                    value={policyStartDate}
                    disabled={query.get('type') === "renewal"}
                    onChange={this.handleStartDateChange}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider> */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    label='Policy Start Date'
                    value={policyStartDate}
                    disabled={query.get('type') === 'renewal'}
                    onChange={this.handleStartDateChange}
                    renderInput={(params: any) => <TextField {...params} margin='normal' variant='outlined' />}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl className={classes.formControl}>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    autoOk={true}
                    id="date-picker-inline"
                    label="Policy End Date"
                    // disabled={query.get('type') === "renewal"}
                    value={policyEndDate}
                    onChange={this.handleEndDateChange}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider> */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    label='Policy End Date'
                    // disabled={query.get('type') === "renewal"}
                    value={policyEndDate}
                    onChange={this.handleEndDateChange}
                    renderInput={(params: any) => <TextField {...params} margin='normal' variant='outlined' />}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} style={{ padding: 15, marginTop: 20 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                <InputLabel id='client-type-label' style={{ marginBottom: '0px' }}>
                  Client type
                </InputLabel>
                <Select
                  label='Client type'
                  labelId='client-type-label'
                  id='client-type-select'
                  name='clientType'
                  value={quotationManagementForm.clientType}
                  disabled
                >
                  {clientTypes.map((ele: any) => {
                    return (
                      <MenuItem key={ele.id} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}></Grid> */}
            {quotationManagementForm.groupType && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl className={classes.formControl}>
                  <InputLabel id='group-type-label' style={{ marginBottom: '0px' }}>
                    Group type
                  </InputLabel>
                  <Select
                    label='Group type'
                    labelId='group-type-label'
                    id='group-type-select'
                    name='groupType'
                    value={quotationManagementForm.groupType}
                    disabled
                  >
                    {groupTypes.map((ele: any) => {
                      return (
                        <MenuItem key={ele.id} value={ele.code}>
                          {ele.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
          {!quotationManagementForm.groupType && (
            <React.Fragment>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id='prefix-select-label' style={{ marginBottom: '0px' }}>
                      Prefix
                    </InputLabel>
                    <Select
                      label='Prefix'
                      labelId='prefix-select-label'
                      name='prefix'
                      value={quotationManagementForm.prefix}
                      disabled
                    >
                      {prefixes.map((ele: any) => {
                        return (
                          <MenuItem key={ele.id} value={ele.code}>
                            {ele.abbreviation}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      id='first-name'
                      name='firstName'
                      label='First Name'
                      value={quotationManagementForm.firstName ? quotationManagementForm.firstName : ''}
                      disabled
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      id='middle-name'
                      name='middleName'
                      label='Middle Name'
                      value={quotationManagementForm.middletName ? quotationManagementForm.middletName : ''}
                      disabled
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      id='last-name'
                      name='lastName'
                      label='Last Name'
                      value={quotationManagementForm.lastName ? quotationManagementForm.lastName : ''}
                      disabled
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id='suffix-select-label' style={{ marginBottom: '0px' }}>
                      Suffix
                    </InputLabel>
                    <Select
                      label='Suffix'
                      labelId='suffix-select-label'
                      name='suffix'
                      value={quotationManagementForm.suffix}
                      disabled
                    >
                      {suffixes.map((ele: any) => {
                        return (
                          <MenuItem key={ele.id} value={ele.id}>
                            {ele.abbreviation}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      id='displayName'
                      name='displayName'
                      label='Display Name'
                      value={quotationManagementForm.displayName ? quotationManagementForm.displayName : ''}
                      disabled
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </React.Fragment>
          )}
          {quotationManagementForm.groupType && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id='first-name'
                    name='firstName'
                    label='Name'
                    value={quotationManagementForm.firstName ? quotationManagementForm.firstName : ''}
                    disabled
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id='displayName'
                    name='displayName'
                    label='Display Name'
                    value={quotationManagementForm.displayName ? quotationManagementForm.displayName : ''}
                    disabled
                  />
                </FormControl>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='contact-no'
                  name='contactNo'
                  label='Contact No'
                  value={quotationManagementForm.mobileNo ? quotationManagementForm.mobileNo : ''}
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='email-id'
                  name='emailId'
                  label='Email Id'
                  value={quotationManagementForm.emailId ? quotationManagementForm.emailId : ''}
                  disabled
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='alt-contact-no'
                  name='altContactNo'
                  label='Alternate Contact No'
                  value={quotationManagementForm.alternateMobileNo ? quotationManagementForm.alternateMobileNo : ''}
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                <TextField
                  id='alt-email-id'
                  name='altEmailId'
                  label='Alternate Email Id'
                  value={quotationManagementForm.alternateEmailId ? quotationManagementForm.alternateEmailId : ''}
                  disabled
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Grid item xs={12} sm={6}>
              <FormControl style={{ width: '95%' }}>
                <TextField
                  id='address'
                  name='address'
                  label='Address'
                  multiline
                  maxRows={10}
                  value={quotationManagementForm.addresses ? quotationManagementForm.addresses : ''}
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} container justifyContent='flex-end'>
              <Button color='secondary' onClick={this.saveQuotation}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }
}
export default withRouter(withStyles(useStyles)(QuotationBasicDetailsComponent))

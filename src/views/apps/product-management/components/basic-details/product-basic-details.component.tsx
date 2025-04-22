
import React, { useEffect } from 'react'

import { Button } from 'primereact/button'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import Alert from '@mui/lab/Alert'

// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { Paper } from '@mui/material'

import {
  ClientTypeService,
  CurrencyService,
  GroupTypeService,
  ProductMarketService,
  ProductTypeService
} from '@/services/remote-api/api/master-services'
import { ProductService } from '@/services/remote-api/api/product-services'

const useStyles = makeStyles((theme: any) => ({
  root: {
    flexGrow: 1,
    minHeight: 100,
    padding: 30
  },
  paper: {
    padding: theme?.spacing ? theme.spacing(2) : '8px',
    textAlign: 'center',
    color: theme?.palette?.text?.secondary
  },
  formControl: {
    margin: theme?.spacing ? theme.spacing(1) : '8px',
    minWidth: 182,
    width: '90%'
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    color: 'primary'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500
  },
  gridItem: {
    marginBottom: theme?.spacing ? theme.spacing(2) : '8px'
  },
  selectEmpty: {}
}))

const producttypeservice = new ProductTypeService()
const currencyservice = new CurrencyService()
const prodmarketservice = new ProductMarketService()
const grouptypeservice = new GroupTypeService()
const clienttypeservice = new ClientTypeService()
const productservice = new ProductService()

const cs$ = currencyservice.getCurrencies()
const pt$ = producttypeservice.getProductTypes()
const gt$ = grouptypeservice.getGroupTypes()
const ct$ = clienttypeservice.getCleintTypes()
const pm$ = prodmarketservice.getProductMarket()

export default function ProductBasicDetailsComponent(props: any) {
  const classes = useStyles()

  const today = new Date()
  const tommorow = new Date()

  const [currencyList, setCurrencyList] = React.useState([])
  const [productTypes, setProductTypes]: any = React.useState([])
  const [productMarkets, setProductMarkets]: any = React.useState([])
  const [clientTypes, setClientTypes]: any = React.useState([])
  const [groupTypes, setGroupMarkets]: any = React.useState([])

  const [state, setState] = React.useState({
    productBasicDetailsForm: {
      productTypeId: 'PT585526',
      productTypeName: productTypes?.find((p: any) => p.code === 'PT585526')?.name,
      name: '',
      productMarketId: 'PM243607',
      productMarketName: productMarkets?.find((p: any) => p.code === 'PM243607')?.name,
      description: '',
      clientTypeId: '',
      groupTypeId: '',
      productCurrencyCd: '',
      validFrom: today,
      validUpTo: new Date(tommorow.setDate(today.getDate() + 365)),
      premiumCurrencyCd: ''
    }
  })

  const [showMessage, setShowMessage] = React.useState(false)

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter(result.content)
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(cs$, setCurrencyList)
  useObservable(pt$, setProductTypes)
  useObservable(pm$, setProductMarkets)
  useObservable(gt$, setGroupMarkets)
  useObservable(ct$, setClientTypes)

  useEffect(() => {
    if ('productBasicDetails' in props.productDetails) {
      setState({
        productBasicDetailsForm: {
          ...props.productDetails.productBasicDetails
        }
      })
    }

    // setFieldNamefromIds();
  }, [props.productDetails])

  const setFieldNamefromIds = () => {
    const prodDetails = props.productDetails?.productBasicDetails

    if (!prodDetails?.productTypeName && prodDetails?.productTypeId) {
      const formObj = {
        ...prodDetails,
        productTypeName: productTypes.find((p: any) => p.code === prodDetails.productTypeId)?.name || '',
        productMarketName: productMarkets.find((p: any) => p.code === prodDetails.productMarketId)?.name || '',
        clientTypeName: clientTypes.find((p: any) => p.id === prodDetails.clientTypeId)?.name || '',
        groupTypeName:
          (prodDetails.groupTypeId && groupTypes.find((p: any) => p.id === prodDetails.groupTypeId)?.name) || ''
      }

      setState({
        productBasicDetailsForm: formObj
      })
      props.updateBasiDetails({
        productBasicDetailsForm: formObj
      })
    }
  }

  const handleChange = (event: any) => {
    const { name, value } = event.target

    const formObj: any = {
      ...state.productBasicDetailsForm,
      [name]: value,
      ...(name === 'productTypeId' &&
        value && { productTypeName: productTypes?.find((p: any) => p.code === value).name }),
      ...(name === 'productMarketId' &&
        value && { productMarketName: productMarkets?.find((p: any) => p.code === value).name }),
      ...(name === 'clientTypeId' && value && { clientTypeName: clientTypes?.find((p: any) => p.id === value).name }),
      ...(name === 'groupTypeId' && value && { groupTypeName: groupTypes?.find((p: any) => p.id === value).name })
    }

    setState({
      productBasicDetailsForm: formObj
    })

    props.updateBasiDetails({
      productBasicDetailsForm: formObj
    })
  }

  const handleValidFromChange = (date: any) => {
    const formObj = {
      ...state.productBasicDetailsForm,
      validFrom: date
    }

    setState({
      productBasicDetailsForm: formObj
    })
    props.updateBasiDetails({
      productBasicDetailsForm: formObj
    })
  }

  const handleValidToChange = (date: any) => {
    const formObj = {
      ...state.productBasicDetailsForm,
      validUpTo: date
    }

    setState({
      productBasicDetailsForm: formObj
    })
    props.updateBasiDetails({
      productBasicDetailsForm: formObj
    })
  }

  const handleSubmit = (e: any) => {
    if (state.productBasicDetailsForm.validFrom > state.productBasicDetailsForm.validUpTo) {
      setShowMessage(true)

      return
    }

    const payload: any = {
      productBasicDetails: {
        ...state.productBasicDetailsForm,
        validFrom: new Date(state.productBasicDetailsForm.validFrom).getTime(),
        validUpTo: new Date(state.productBasicDetailsForm.validUpTo).getTime()
      }
    }

    const productId = localStorage.getItem('productId')

    if (productId) {
      productservice.editProduct(payload.productBasicDetails, productId, '1').subscribe(res => {
        if (res.status === 200) {
          props.handleNextStep()
        }
      })
    } else {
      productservice.saveProductBasicDetails(payload.productBasicDetails).subscribe((res: any) => {
        if (res.status === 201) {
          localStorage.setItem('productId', res.data.id)
          props.handleNextStep()
        }
      })
    }
  }

  const handleSnackClose = () => {
    setShowMessage(false)
  }

  return (
    <Paper elevation={0} style={{ padding: '16px' }}>
      <Grid container alignItems='center'>
        <Snackbar open={showMessage} autoHideDuration={6000} onClose={handleSnackClose}>
          <Alert onClose={handleSnackClose} variant='filled' severity='error'>
            Valid upto should be greater than valid from
          </Alert>
        </Snackbar>

        <Grid item container>
          <Grid item xs={12}>
            <Grid item xs={12} sm={6} md={4} className={classes.header} color='inherit'>
              <span>Product Basic Details</span>
            </Grid>
          </Grid>
        </Grid>

        <Grid item container alignItems='center' className={classes.gridItem}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                Product Type
              </InputLabel>
              <Select
                name='productTypeId'
                label='Product Type'
                value={state.productBasicDetailsForm.productTypeId}
                // renderValue={()=> productTypes.find((p:any) =>  p.name === 'Health')}
                onChange={handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}
              >
                {productTypes.map((ele: any) => {
                  return (
                    <MenuItem key={ele.code} value={ele.code}>
                      {ele.name}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl}>
              <TextField
                id='product-name'
                name='name'
                value={state.productBasicDetailsForm.name}
                onChange={handleChange}
                label='Name'
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                Product Market
              </InputLabel>
              <Select
                name='productMarketId'
                label='Product Market'
                value={state.productBasicDetailsForm.productMarketId}
                onChange={handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}
              >
                {productMarkets.map((ele: any) => {
                  return (
                    <MenuItem key={ele.code} value={ele.code}>
                      {ele.name}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl}>
              <TextField
                id='product-desc'
                label='Description'
                name='description'
                multiline
                maxRows={10}
                rows={1}
                value={state.productBasicDetailsForm.description}
                onChange={handleChange}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Grid item container alignItems='center' className={classes.gridItem}>
          {/* <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <TextField
                id="product-desc"
                label="Description"
                name="description"
                multiline
                maxRows={10}
                rows={1}
                value={state.productBasicDetailsForm.description}
                onChange={handleChange}
              />
            </FormControl>
          </Grid> */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl} style={{ alignSelf: 'flex-end' }}>
              <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                Client Type
              </InputLabel>
              <Select
                name='clientTypeId'
                label='Client Type'
                value={state.productBasicDetailsForm.clientTypeId}
                onChange={handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}
              >
                {clientTypes.map((ele: any) => {
                  return (
                    <MenuItem key={ele.id} value={ele.id}>
                      {ele.name}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {state.productBasicDetailsForm.clientTypeId === 'GROUP' ? (
              <FormControl className={classes.formControl}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  Group Type
                </InputLabel>
                <Select
                  name='groupTypeId'
                  label='Group Type'
                  value={state.productBasicDetailsForm.groupTypeId}
                  onChange={handleChange}
                  displayEmpty
                  className={classes.selectEmpty}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {groupTypes.map((ele: any) => {
                    return (
                      <MenuItem key={ele.id} value={ele.id}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            ) : (
              `Client Type: ${state.productBasicDetailsForm.clientTypeId}`
            )}
          </Grid>
        </Grid>

        <Grid item container alignItems='center' className={classes.gridItem}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                Product Currency
              </InputLabel>
              <Select
                name='productCurrencyCd'
                label='Product Currency'
                value={state.productBasicDetailsForm.productCurrencyCd}
                onChange={handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}
              >
                {currencyList.map((ele: any) => {
                  return (
                    <MenuItem key={ele.code} value={ele.code}>
                      {ele.name}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                {/* <KeyboardDatePicker
                  views={['year', 'month', 'date']}
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="valid-from"
                  autoOk={true}
                  label="Valid From"
                  name="validFrom"
                  value={state.productBasicDetailsForm.validFrom}
                  onChange={handleValidFromChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                /> */}
                <DatePicker
                  views={['year', 'month', 'day']}
                  label='Valid From'
                  value={state.productBasicDetailsForm.validFrom}
                  onChange={handleValidFromChange}
                  renderInput={params => (
                    <TextField {...params} margin='normal' style={{ marginBottom: '0px' }} variant='outlined' />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl}>
                {/* <KeyboardDatePicker
                  views={['year', 'month', 'date']}
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="valid-upto"
                  autoOk={true}
                  label="Valid Upto"
                  name="validUpTo"
                  value={state.productBasicDetailsForm.validUpTo}
                  onChange={handleValidToChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                /> */}
                <DatePicker
                  views={['year', 'month', 'day']}
                  label='Valid Upto'
                  value={state.productBasicDetailsForm.validUpTo}
                  onChange={handleValidToChange}
                  renderInput={params => (
                    <TextField {...params} margin='normal' style={{ marginBottom: '0px' }} variant='outlined' />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl className={classes.formControl} style={{ marginTop: '16px' }}>
                <InputLabel id='demo-simple-select-label' style={{ marginBottom: '0px' }}>
                  Premium Currency
                </InputLabel>
                <Select
                  name='premiumCurrencyCd'
                  label='Premium Currency'
                  value={state.productBasicDetailsForm.premiumCurrencyCd}
                  onChange={handleChange}
                  displayEmpty
                  className={classes.selectEmpty}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {currencyList.map((ele: any) => {
                    return (
                      <MenuItem key={ele.code} value={ele.code}>
                        {ele.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
          </LocalizationProvider>
        </Grid>

        <Grid item container alignItems='center' className={classes.gridItem}>
          {/* <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl} style={{ marginTop: '16px' }}>
              <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                Premium Currency
              </InputLabel>
              <Select
                name="premiumCurrencyCd"
                value={state.productBasicDetailsForm.premiumCurrencyCd}
                onChange={handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}>
                {currencyList.map((ele:any) => {
                  return <MenuItem value={ele.code}>{ele.name}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid> */}
        </Grid>

        <Grid item container alignItems='center' className={classes.gridItem}>
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px' }}>
            {!localStorage.getItem('productId') && <Button onClick={handleSubmit}>Save and Next</Button>}
            {/* <Button variant="contained" onClick={handleClose} className="p-button-text">
                    Cancel
                  </Button> */}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

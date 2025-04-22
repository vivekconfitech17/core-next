import React from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import Alert from '@mui/lab/Alert'
import { createStyles, withStyles } from '@mui/styles'
import { forkJoin, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { FormHelperText, Paper } from '@mui/material'

import { BenefitService, LimitFrequencyService, ServiceTypeService } from '@/services/remote-api/api/master-services'
import { ProductService } from '@/services/remote-api/api/product-services'
import {
  defaultPageRequestServiceGrouping,
  defaultPageRequestServices
} from '@/services/remote-api/models/page.request.service.grouping'
import ServiceDesignTable from './service-design-table'
import { FettleAutocomplete } from '@/views/apps/shared-component/components/fettle.autocomplete'

const useStyles = (theme: any) =>
  createStyles({
    serviceDesignRoot: {
      flexGrow: 1,
      minHeight: 100,
      padding: 30
    },
    header: {
      paddingTop: 10,
      paddingBottom: 10,
      color: '#4472C4'
    },
    formControl: {
      margin: theme?.spacing ? theme.spacing(1) : '8px',
      height: '65px',
      width: '90%'
    },
    serviceAutoComplete: {
      /* width: 500, */
      '& .MuiInputBase-formControl': {
        maxHeight: 200,
        overflowX: 'hidden',
        overflowY: 'auto'
      }
    },
    actionBlock: {
      display: 'flex',
      alignItems: 'center'
    },
    tableBg: {
      height: 400,
      width: '100%',
      backgroundColor: '#fff',
      boxShadow:
        '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
      borderRadius: '4px'
    }
  })

const serviceTypeService = new ServiceTypeService()
const limitFrequencyService = new LimitFrequencyService()
const productservice = new ProductService()
const benefitService = new BenefitService()

const initForm = {
  serviceTypeId: '',
  serviceTypeName: '',
  searchBy: '',
  groupId: null,
  serviceIds: [],
  serviceName: '',
  maxLimitValue: '',
  percentage: '',
  benefitId: '',
  benefitName: '',
  frequencies: [{ limitFrequencyId: '', maxLimit: '', limitFrequencyList: [] }],
  waitingPeriod: '',
  coShareOrPayPercentage: '',
  toBeExcluded: false,
  isAddOtherLimitValues: false
}

function withRouter(Component: any) {
  return function WrappedComponent(props: any) {
    const router = useRouter()

    return <Component {...props} router={router} />
  }
}

class ServiceDesignComponent extends React.Component<any, any> {
  isEditedId: any
  constructor(props: any) {
    super(props)

    this.state = {
      serviceDesignForm: { ...initForm },
      serviceTypes: [],
      serviceTypeChangeDetect: false,
      benefitList: [],
      allLimitFrequencies: [],
      limitFrequencyList: [],
      rows: [],
      editIndex: '',
      openSnackbar: false,
      errorMsg: {
        serviceTypeId: '',
        serviceName: '',
        maxLimitValue: '',
        waitingPeriod: '',
        coShareOrPayPercentage: ''
      }
    }
    this.isEditedId = ''
  }

  componentDidMount() {
    this.getServiceTypes()
    this.getBenefitStructure()
    this.getLimitFrequcies()
  }

  /* setSeviceDesignData = () => {
        const productDetails = this.props.productDetails;
        if (productDetails && productDetails.productServices) {
            let rows = JSON.parse(JSON.stringify(productDetails.productServices.services));
            rows.forEach((item:any) => {
                if (item.groupId) {
                    this.groupDataSourceCallback$({}, "", defaultPageRequestServiceGrouping, item.serviceTypeId).subscribe((res:any) => {
                        const groupName = res.content && res.content.find(g => g.id === item.groupId).name || null;
                        item.serviceName = groupName;
                        item.serviceTypeName = this.getServiceTypeName(item.serviceTypeId);
                        this.setState({
                            ...this.state,
                            rows: [...this.state.rows, item]
                        });
                        this.props.updateServiceDesignDetails([...this.state.rows, item]);
                    });
                } else if (item.serviceIds && item.serviceIds.length > 0) {
                    this.servicesDataSourceCallback$({}, "", defaultPageRequestServiceGrouping, item.serviceTypeId).subscribe((res:any) => {
                        const servicesNames = res.content && res.content.filter(g => item.serviceIds.indexOf(g.id) > -1).map(o => o.name).join() || "";
                        item.serviceName = servicesNames;
                        item.serviceTypeName = this.getServiceTypeName(item.serviceTypeId);
                        this.setState({
                            ...this.state,
                            rows: [...this.state.rows, item]
                        });
                        this.props.updateServiceDesignDetails([...this.state.rows, item]);
                    });
                } else {
                    item.serviceTypeName = this.getServiceTypeName(item.serviceTypeId);
                    this.setState({
                        ...this.state,
                        rows: [...this.state.rows, item]
                    });
                    this.props.updateServiceDesignDetails([...this.state.rows, item]);
                }
            });
        }
    }; */

  setSeviceDesignData = () => {
    const productDetails = this.props.productDetails

    if (productDetails && productDetails.productServices) {
      const servicesRows = JSON.parse(JSON.stringify(productDetails?.productServices?.services ?? ''))

      console.log(servicesRows)

      if (servicesRows) {
        const serviceRow$ = servicesRows?.map((item: any) => {
          if (item.groupId) {
            return this.groupDataSourceCallback$({}, '', defaultPageRequestServiceGrouping, item.serviceTypeId).pipe(
              switchMap((res: any) => {
                const serviceName = (res.content && res.content.find((g: any) => g.id === item.groupId).name) || ''
                const serviceTypeName = this.getServiceTypeName(item.serviceTypeId)

                return of({ ...item, serviceName, serviceTypeName })
              })
            )
          } else if (item.serviceIds && item.serviceIds.length > 0) {
            return this.servicesDataSourceCallback$({}, '', defaultPageRequestServiceGrouping, item.serviceTypeId).pipe(
              switchMap((res: any) => {
                const serviceName =
                  (res.content &&
                    res.content
                      .filter((g: any) => item.serviceIds.indexOf(g.id) > -1)
                      .map((o: any) => o.name)
                      .join()) ||
                  ''

                const serviceTypeName = this.getServiceTypeName(item.serviceTypeId)

                return of({ ...item, serviceName, serviceTypeName })
              })
            )
          } else {
            const serviceTypeName = this.getServiceTypeName(item.serviceTypeId)

            return of({ ...item, serviceTypeName })
          }
        })

        forkJoin(serviceRow$).subscribe((res: any) => {
          this.setState({
            ...this.state,
            rows: res
          })
          this.props.updateServiceDesignDetails(res)
        })
      }
    }
  }

  getBenefitStructure = () => {
    const serviceDesignBenefitList: any = []

    this.props.benefitStructure.forEach((benefit: any) => {
      this.setBenefitList(benefit.hirearchy, serviceDesignBenefitList)
    })
    this.setState({ ...this.state, benefitList: serviceDesignBenefitList })
  }

  setBenefitList = (benefit: any, serviceDesignBenefitList: any) => {
    if (benefit.rules && benefit.rules.length > 0) {
      const coverageRules = benefit.rules.filter((rule: any) => rule.ruleTextArea.indexOf('Coverage') > -1)

      if (coverageRules.length > 0) {
        const { name, id, code } = benefit

        serviceDesignBenefitList.push({ name, id, code })
      }
    }

    if (benefit.child && benefit.child.length > 0) {
      benefit.child.forEach((childObj: any) => {
        this.setBenefitList(childObj, serviceDesignBenefitList)
      })
    }
  }

  getServiceTypes = () => {
    const serviceTypeService$ = serviceTypeService.getServiceTypes()

    serviceTypeService$.subscribe(response => {
      this.setState({
        ...this.state,
        serviceTypes: response.content
      })

      this.setSeviceDesignData()
    })
  }

  getServiceTypeName = (id: any) => {
    if (!this.state.serviceTypes || this.state.serviceTypes.length === 0 || !id) return

    return this.state.serviceTypes.find((item: any) => item.id === id).name
  }

  getLimitFrequcies = () => {
    const limitFrequencyService$ = limitFrequencyService.getLimitFrequencies()

    limitFrequencyService$.subscribe(response => {
      this.setState({
        ...this.state,
        allLimitFrequencies: response.content
      })
    })
  }

  handleChange = (e: any) => {
    const { name, value, checked } = e.target
    let freqDto: any = []

    if (name === 'isAddOtherLimitValues' || name === 'toBeExcluded') {
      if (name === 'isAddOtherLimitValues') {
        if (checked) {
          freqDto = [{ limitFrequencyId: '', maxLimit: '', limitFrequencyList: this.state.allLimitFrequencies }]
        } else {
          freqDto = []
        }
      }

      this.setState({
        ...this.state,
        serviceDesignForm: {
          ...this.state.serviceDesignForm,
          [name]: checked,
          frequencies: freqDto,
          ...(name === 'toBeExcluded' &&
            checked === false && {
              isAddOtherLimitValues: false,
              waitingPeriod: '',
              coShareOrPayPercentage: '',
              maxLimitValue: '',
              percentage: '',
              benefitId: '',
              benefitName: ''
            })
        }
      })
    } else {
      let serviceTypeName = '',
        benefitName = ''

      if (name === 'serviceTypeId') {
        serviceTypeName = this.state.serviceTypes.find((service: any) => service.id === value).name
      } else if (name === 'benefitId') {
        benefitName = this.state.benefitList.find((service: any) => service.id === value).name
      }

      this.setState({
        ...this.state,
        serviceDesignForm: {
          ...this.state.serviceDesignForm,
          [name]: value,
          ...(name === 'serviceTypeId' && { serviceTypeName, groupId: null, serviceIds: [], serviceName: '' }),
          ...(name === 'benefitId' && { benefitName })
        },
        ...(name === 'serviceTypeId' && { serviceTypeChangeDetect: value /* , toBeExcluded: false */ })
        /* ...((name === 'serviceTypeId' || name === 'searchBy') && { toBeExcluded: false }) */
      })
    }
  }

  groupDataSourceCallback$ = (
    params = {},
    action: any,
    pageRequest = defaultPageRequestServiceGrouping,
    serviceTypeId = this.state.serviceDesignForm.serviceTypeId
  ) => {
    let reqParam = {
      ...pageRequest,
      ...params,
      nonGroupedServiceGroup: false,
      groupedServiceServiceGroup: true,
      parentEligibleServiceGroupIrrespectiveGruping: false
    }

    if (action.searchText) {
      reqParam = {
        ...reqParam,
        groupCode: action.searchText,
        groupName: action.searchText
      }
    }

    return serviceTypeService.getServiceGroupes(serviceTypeId, reqParam)
  }

  servicesDataSourceCallback$ = (
    params = {},
    action: any,
    pageRequest = defaultPageRequestServices,
    serviceTypeId = this.state.serviceDesignForm.serviceTypeId
  ) => {
    let reqParam = { ...pageRequest, ...params }

    if (action.searchText) {
      reqParam = {
        ...reqParam,
        nameAlias: action.searchText,
        icdCode: action.searchText,
        name: action.searchText
      }
    }

    return serviceTypeService.getServices(serviceTypeId, '', reqParam)
  }

  handleServiceAutocompleteChange = (e: any, newValue: any, name: any) => {
    if (newValue && Array.isArray(newValue)) {
      this.setState({
        ...this.state,
        serviceDesignForm: {
          ...this.state.serviceDesignForm,
          [name]: newValue.map(o => o.id),
          serviceName: newValue.map(o => o.name).join()
        }
      })
    } else {
      this.setState({
        ...this.state,
        serviceDesignForm: {
          ...this.state.serviceDesignForm,
          [name]: newValue ? newValue.id : '',
          serviceName: newValue ? newValue?.code : ''
        }
      })
    }
  }

  autocompleteFilterChange = (options: any, state: any) => {
    if (state.inputValue) {
      return options.filter((item: any) => item.name.toLowerCase().indexOf(state.inputValue) > -1)
    }

    return [{ id: 'selectall', name: 'Select all' }, ...options]
  }

  handleAddMore = () => {
    const frequencies = this.state.serviceDesignForm.frequencies

    const difference = this.state.allLimitFrequencies.filter((x: any) => {
      return frequencies.findIndex((o: any) => o.limitFrequencyId === x.id) === -1
    })

    this.setState({
      ...this.state,
      serviceDesignForm: {
        ...this.state.serviceDesignForm,
        frequencies: [
          ...this.state.serviceDesignForm.frequencies,
          { limitFrequencyId: '', maxLimit: '', limitFrequencyList: difference }
        ]
      }
    })
  }

  // handleRemoveRow = (idx:any) => {
  //   const frequencies = this.state.serviceDesignForm.frequencies;
  //   const allLimitFrequencies = this.state.allLimitFrequencies;

  //   if (frequencies[idx].limitFrequencyId) {
  //     this.state.limitFrequencyList = allLimitFrequencies.filter((item:any) => item.id === frequencies[idx].limitFrequencyId);
  //   }

  //   frequencies.splice(idx, 1);

  //   frequencies.map((item:any, rowId:any) => {
  //     const difference = allLimitFrequencies.filter((x:any) => {
  //       return (
  //         frequencies.findIndex((o:any,id:any) => {
  //           return rowId != id && o.limitFrequencyId === x.id;
  //         }) === -1
  //       );
  //     });
  //     item.limitFrequencyList = difference;
  //   });

  //   this.setState({
  //     ...this.state,
  //     serviceDesignForm: {
  //       ...this.state.serviceDesignForm,
  //       frequencies: [...frequencies],
  //     },
  //     limitFrequencyList: this.state.limitFrequencyList,
  //   });
  // };
  handleRemoveRow = (idx: any) => {
    const { serviceDesignForm, allLimitFrequencies, limitFrequencyList } = this.state

    // Create a new copy of frequencies array (to avoid direct mutation)
    let updatedFrequencies = [...serviceDesignForm.frequencies]

    // Create a new limitFrequencyList instead of mutating state directly
    let updatedLimitFrequencyList = [...limitFrequencyList]

    // If the row being removed has a limitFrequencyId, update the list
    if (updatedFrequencies[idx].limitFrequencyId) {
      updatedLimitFrequencyList = allLimitFrequencies.filter(
        (item: any) => item.id === updatedFrequencies[idx].limitFrequencyId
      )
    }

    // Remove the selected row
    updatedFrequencies.splice(idx, 1)

    // Update limitFrequencyList for remaining rows
    updatedFrequencies = updatedFrequencies.map((item: any, rowId: any) => {
      const difference = allLimitFrequencies.filter((x: any) => {
        return updatedFrequencies.findIndex((o: any, id: any) => rowId !== id && o.limitFrequencyId === x.id) === -1
      })

      return { ...item, limitFrequencyList: difference }
    })

    // Update state immutably using setState
    this.setState((prevState: any) => ({
      ...prevState,
      serviceDesignForm: {
        ...prevState.serviceDesignForm,
        frequencies: updatedFrequencies // Update frequencies properly
      },
      limitFrequencyList: updatedLimitFrequencyList // Update limitFrequencyList properly
    }))
  }

  buildFrequencyListForEachRow = (frequencies: any) => {
    if (frequencies && frequencies.length > 0) {
      frequencies.map((item: any, rowId: any) => {
        const difference = this.state.allLimitFrequencies.filter((x: any) => {
          return (
            frequencies.findIndex((o: any, id: any) => {
              return rowId != id && o.limitFrequencyId === x.id
            }) === -1
          )
        })

        item.limitFrequencyList = difference
      })
    }
  }

  handleOtherLimitValues = (idx: number) => (e: any) => {
    const { name, value } = e.target
    const frequencies = this.state.serviceDesignForm.frequencies

    frequencies[idx][name] = value

    this.buildFrequencyListForEachRow(frequencies)

    const updatedLimitFrequencyList = this.state.limitFrequencyList.filter((item: any) => item.id === value)

    this.setState({
      ...this.state,
      serviceDesignForm: {
        ...this.state.serviceDesignForm,
        frequencies: [...frequencies]
      },
      limitFrequencyList: updatedLimitFrequencyList
    })
  }

  addToTable = () => {
    if (this.state.serviceDesignForm) {
      const { serviceDesignForm, errorMsg } = this.state

      // Define the fields to be validated
      const commonFields = [{ field: 'serviceTypeId', message: 'Service Type is Required' }]

      const additionalFields = [
        { field: 'coShareOrPayPercentage', message: 'Co-share/Pay percentage is Required' },
        { field: 'maxLimitValue', message: 'Max limit is Required' },
        { field: 'waitingPeriod', message: 'Waiting Period is Required' }
      ]

      // Determine which fields to check
      const fieldsToCheck = serviceDesignForm.toBeExcluded ? commonFields : [...commonFields, ...additionalFields]

      let hasError = false

      // Validate each field
      fieldsToCheck.forEach(({ field, message }) => {
        if (!serviceDesignForm[field]) {
          errorMsg[field] = message
          hasError = true
        } else {
          errorMsg[field] = ''
        }
      })

      this.setState({ errorMsg })

      if (hasError) return
    }

    let rows = []
    const rowObj = { ...this.state.serviceDesignForm }

    if (this.isEditedId.toString()) {
      this.setState((prevState: any) => ({
        rows: {
          ...prevState.rows,
          [this.isEditedId]: { ...rowObj, groupId: rowObj.groupId ? rowObj.groupId : null }
        }
      }))

      // this.state.rows[this.isEditedId] = { ...rowObj, groupId: rowObj.groupId ? rowObj.groupId : null }
      rows = this.state.rows
      this.isEditedId = ''
    } else {
      rows = [...this.state.rows, rowObj]
    }

    this.props.updateServiceDesignDetails(rows)

    this.setState({
      ...this.state,
      rows,
      serviceDesignForm: {
        ...this.state.serviceDesignForm,
        ...initForm
      }
    })
  }

  saveNNext = () => {
    const servicesDTO = this.state.rows.map((row: any) => {
      return {
        serviceTypeId: row.serviceTypeId,
        groupId: row.groupId,
        serviceIds: row.serviceIds,
        maxLimitValue: row.maxLimitValue ? Number(row.maxLimitValue) : row.maxLimitValue,
        derievedMaxLimitDto: {
          benefitId: row.benefitId,
          percentage: row.percentage ? Number(row.percentage) : row.percentage,
          expression: `${row.percentage}% of ${row.benefitName}`
        },
        frequencies:
          (row.frequencies &&
            row.frequencies.map(({ limitFrequencyId, maxLimit }: { limitFrequencyId: any; maxLimit: any }) => ({
              limitFrequencyId,
              maxLimit: Number(maxLimit)
            }))) ||
          [],
        waitingPeriod: row.waitingPeriod ? Number(row.waitingPeriod) : row.waitingPeriod,
        coShareOrPayPercentage: row.coShareOrPayPercentage
          ? Number(row.coShareOrPayPercentage)
          : row.coShareOrPayPercentage,
        toBeExcluded: row.toBeExcluded
      }
    })

    const requestPayload: any = {
      productServices: {
        services: servicesDTO
      }
    }

    const productId: any = localStorage.getItem('productId')

    productservice.editProduct(requestPayload, productId, '3').subscribe((res: any) => {
      if (res.status === 200) {
        this.setOpenSnackbar(true)
        this.props.handleNextStep()
      }
    })
  }

  setOpenSnackbar = (status: any) => {
    this.setState({ ...this.state, openSnackbar: status })
  }

  editTableRule = (row: any, idx: any) => {
    this.isEditedId = idx

    this.buildFrequencyListForEachRow(row.frequencies)

    this.setState({
      ...this.state,
      serviceDesignForm: {
        ...this.state.serviceDesignForm,
        ...row,
        benefitId: row?.derievedMaxLimitDto?.benefitId || '',
        percentage: row?.derievedMaxLimitDto?.percentage || '',
        searchBy: row.serviceIds.length > 0 ? 'Individual' : 'Group',
        isAddOtherLimitValues: row?.frequencies?.length > 0 || false
      },
      serviceTypeChangeDetect: row.serviceTypeId
    })
  }

  deleteTableRule = (row: any, idx: any) => {
    const temp = this.state.rows

    temp.splice(idx, 1)
    this.setState({ ...this.state, rows: temp })
  }

  render() {
    const { classes } = this.props

    const {
      serviceDesignForm,
      serviceTypes,
      serviceTypeChangeDetect,
      allLimitFrequencies,
      benefitList,
      openSnackbar,
      errorMsg,
      rows
    } = this.state

    return (
      <Paper elevation={0} className={classes.serviceDesignRoot}>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => this.setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => this.setOpenSnackbar(false)} severity='success' variant='filled'>
            Product updated successfully
          </Alert>
        </Snackbar>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Grid item xs={3} className={classes.header}>
              <h3>Service Design</h3>
            </Grid>
          </Grid>
        </Grid>

        <Grid container alignItems='center' item xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <InputLabel id='select-service-type-label'>Service Type</InputLabel>
              <Select
                label='Service Type'
                name='serviceTypeId'
                value={serviceDesignForm.serviceTypeId}
                onChange={this.handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}
              >
                {serviceTypes.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.displayName}
                  </MenuItem>
                ))}
              </Select>
              {errorMsg.serviceTypeId && <FormHelperText>{errorMsg.serviceTypeId}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.formControl}>
              <InputLabel id='select-search-by-label'>Search By</InputLabel>
              <Select
                label='Search By'
                name='searchBy'
                value={serviceDesignForm.searchBy}
                onChange={this.handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value='Group'>Group</MenuItem>
                <MenuItem value='Individual'>Individual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {serviceDesignForm.searchBy === 'Group' && (
            <Grid item xs={12} sm={6} md={4} style={{ height: '65px' }}>
              <FettleAutocomplete
                id='group-name'
                name='groupId'
                label='Group'
                $datasource={this.groupDataSourceCallback$}
                value={serviceDesignForm.groupId ?? ''}
                changeDetect={serviceTypeChangeDetect}
                onChange={(e: any, newValue: any) => this.handleServiceAutocompleteChange(e, newValue, 'groupId')}
              />
            </Grid>
          )}
          {serviceDesignForm.searchBy === 'Individual' && (
            <Grid xs={12} sm={6} md={4} style={{ height: '65px' }}>
              <FettleAutocomplete
                id='services'
                name='serviceIds'
                label='Services'
                $datasource={this.servicesDataSourceCallback$}
                multiple={true}
                value={serviceDesignForm.serviceIds ?? []}
                changeDetect={serviceTypeChangeDetect}
                onChange={(e: any, newValue: any) => this.handleServiceAutocompleteChange(e, newValue, 'serviceIds')}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={serviceDesignForm.toBeExcluded}
                  onChange={this.handleChange}
                  name='toBeExcluded'
                  color='primary'
                />
              }
              label='Mark As Excluded'
            />
          </Grid>
          {!serviceDesignForm.toBeExcluded && (
            <React.Fragment>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      name='maxLimitValue'
                      label='Max Limit'
                      value={serviceDesignForm.maxLimitValue || ''}
                      onChange={this.handleChange}
                    />
                    {errorMsg.maxLimitValue && <FormHelperText>{errorMsg.maxLimitValue}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4} container alignItems='flex-end'>
                  <FormControl className={classes.formControl}>
                    <TextField
                      type='number'
                      name='percentage'
                      label='Percentage of'
                      value={serviceDesignForm.percentage}
                      onChange={this.handleChange}
                    />
                  </FormControl>
                  <span className='mx:2' style={{ height: '40px' }}>
                    Of
                  </span>
                </Grid>
                {/* <Grid item xs={1} style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                  Of
                </Grid> */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id='select-search-by-label'>Benefits</InputLabel>
                    <Select
                      label='Benefits'
                      name='benefitId'
                      value={serviceDesignForm.benefitId}
                      onChange={this.handleChange}
                      displayEmpty
                      className={classes.selectEmpty}
                      inputProps={{ 'aria-label': 'Without label' }}
                    >
                      {benefitList.map((benefit: any) => (
                        <MenuItem key={benefit.id} value={benefit.id}>
                          {benefit.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={serviceDesignForm.isAddOtherLimitValues}
                        onChange={this.handleChange}
                        name='isAddOtherLimitValues'
                        color='primary'
                      />
                    }
                    label='Add Other Limit Values'
                  />
                </Grid>
              </Grid>
              {serviceDesignForm.isAddOtherLimitValues &&
                serviceDesignForm.frequencies.map((item: any, idx: any) => (
                  <Grid container spacing={1} key={idx}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl className={classes.formControl}>
                        <InputLabel id='select-search-by-label'>Limit Frequency</InputLabel>
                        <Select
                          label='Limit Frequency'
                          name='limitFrequencyId'
                          value={item.limitFrequencyId}
                          onChange={this.handleOtherLimitValues(idx)}
                          displayEmpty
                          className={classes.selectEmpty}
                          inputProps={{ 'aria-label': 'Without label' }}
                        >
                          {item.limitFrequencyList.map((item: any) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl className={classes.formControl}>
                        <TextField
                          name='maxLimit'
                          label='Max Limit'
                          value={item.maxLimit}
                          onChange={this.handleOtherLimitValues(idx)}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={1} className={classes.actionBlock}>
                      {serviceDesignForm.frequencies.length > 1 && (
                        <Box>
                          <IconButton color='secondary' aria-label='delete' onClick={() => this.handleRemoveRow(idx)}>
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Box>
                      )}
                      {idx === serviceDesignForm.frequencies.length - 1 &&
                        serviceDesignForm.frequencies.length < allLimitFrequencies.length && (
                          <Box>
                            <IconButton color='primary' aria-label='add' onClick={() => this.handleAddMore()}>
                              <AddCircleOutlineIcon />
                            </IconButton>
                          </Box>
                        )}
                    </Grid>
                  </Grid>
                ))}

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      name='waitingPeriod'
                      label='Waiting Period'
                      value={serviceDesignForm.waitingPeriod}
                      onChange={this.handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>Days</InputAdornment>
                      }}
                    />
                    {errorMsg.waitingPeriod && <FormHelperText>{errorMsg.waitingPeriod}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      name='coShareOrPayPercentage'
                      label='Co-Share/Co-Pay Percentage'
                      value={serviceDesignForm.coShareOrPayPercentage}
                      onChange={this.handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>%</InputAdornment>
                      }}
                    />
                    {errorMsg.coShareOrPayPercentage && (
                      <FormHelperText>{errorMsg.coShareOrPayPercentage}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </React.Fragment>
          )}

          <Grid container spacing={1}>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button color='primary' icon='pi pi-plus' iconPos='right' onClick={this.addToTable}>
                Add
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1} style={{ marginTop: 30 }}>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className={classes.tableBg}>
                <ServiceDesignTable
                  designList={this.state.rows}
                  action={true}
                  editTableRule={this.editTableRule}
                  deleteTableRule={this.deleteTableRule}
                />
              </div>
            </Grid>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
              <Button color='secondary' onClick={this.saveNNext} disabled={this.state.rows.length === 1}>
                Save & Next
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withRouter(withStyles(useStyles)(ServiceDesignComponent))

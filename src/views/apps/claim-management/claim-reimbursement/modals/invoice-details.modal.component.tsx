import * as React from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import { AddCircleOutlined } from '@mui/icons-material'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import { Autocomplete } from '@mui/lab'
import { Button } from 'primereact/button'

import { ServiceTypeService } from '@/services/remote-api/api/master-services/service.type.service'

export default function InvoiceDetailsModal(props: any) {
  const {
    isOpen,
    onClose,
    onSubmit,
    changeInvoiceItems,
    selectedInvoiceItemIndex,
    selectedInvoiceItems,
    handleAddInvoiceItemRow,
    handleDeleteInvoiceItemRow,
    benefitOptions,
    benefitsWithCost
  } = props

  const [detailList, setDetailList] = React.useState([{}])
  const [serviceTypeList, setServiceTypeList] = React.useState<any>()
  const [expenseHeadList, setExpenseHeadList] = React.useState<any>()

  const serviceTypeService = new ServiceTypeService()

  const getServiceTypes = () => {
    const serviceTypeService$ = serviceTypeService.getServiceTypes()

    serviceTypeService$.subscribe(response => {
      const temp: any = []

      response.content.forEach(el => {
        temp.push(el)
      })
      setServiceTypeList(temp)
    })
  }

  const getExpenseHead = (id: any) => {
    const expenseHeadService$ = serviceTypeService.getExpenseHead(id)

    expenseHeadService$.subscribe(response => {
      const temp: any = []

      response.content.forEach(el => {
        const obj = {
          label: el?.name,
          value: el?.id
        }

        temp.push(obj)
      })
      setExpenseHeadList(temp)
    })
  }

  React.useEffect(() => {
    getServiceTypes()

    // getExpenseHead();
  }, [])

  const handleRemoveRow = (index: any) => {
    setDetailList(oldList => {
      return [...oldList.slice(0, index), ...oldList.slice(index + 1)]
    })
  }

  const lastRowIndex = detailList.length - 1

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth='md' aria-labelledby='form-dialog-title' disableEnforceFocus>
      <DialogTitle id='form-dialog-title'>Invoice Items</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item md={4}>
            Invoice no: {props.invoiceNo}
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Benefit</TableCell>
                    <TableCell>Service Type</TableCell>
                    <TableCell>Expense Head</TableCell>
                    <TableCell>Rate(KSH)</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Total(KSH)</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoiceItems.map((detail: any, index: any) => {
                    return (
                      <TableRow key={`TableRow-${index}`}>
                        <TableCell>
                          {selectedInvoiceItems.length - 1 === index && (
                            <IconButton
                              onClick={() => handleAddInvoiceItemRow(selectedInvoiceItemIndex)}
                              aria-label='Add a row below'
                            >
                              <AddCircleOutlined />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <BenefitCostComponent
                            key={index}
                            x={detail}
                            selectedInvoiceItemIndex={selectedInvoiceItemIndex}
                            changeInvoiceItems={changeInvoiceItems}
                            i={index}
                            benefitOptions={benefitOptions}
                            benefitsWithCost={benefitsWithCost}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            label='Service Type'
                            name='serviceType'
                            value={detail.serviceType}
                            onChange={e => {
                              getExpenseHead(e.target.value)
                              changeInvoiceItems(e, selectedInvoiceItemIndex, index)
                            }}
                          >
                            {serviceTypeList?.map((ele: any) => {
                              return (
                                <MenuItem key={ele?.id} value={ele?.id}>
                                  {ele?.displayName}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            label='Expense Head'
                            name='expenseHead'
                            value={detail.expenseHead}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          >
                            {expenseHeadList?.map((ele: any) => {
                              return (
                                <MenuItem key={ele?.value} value={ele?.value}>
                                  {ele?.label}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            name='rateKes'
                            type='number'
                            value={detail.rateKes}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name='unit'
                            type='number'
                            value={detail.unit}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name='totalKes'
                            disabled
                            value={detail.totalKes}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          />
                        </TableCell>
                        <TableCell>
                          {selectedInvoiceItems.length !== 1 && (
                            <IconButton
                              onClick={() => handleDeleteInvoiceItemRow(selectedInvoiceItemIndex, index)}
                              aria-label='Remove this row'
                            >
                              <RemoveCircleOutline style={{ color: '#dc3545' }} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button className='p-button-text' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSubmit} color='primary'>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const BenefitCostComponent = (props: any) => {
  const { x, i, changeInvoiceItems, selectedInvoiceItemIndex, benefitOptions } = props;

  const handleBenefitChange = (e: any, val: any, i: number) => {
    const eData = {
      target: {
        name: 'benefitId',
        value: val?.benefitStructureId || null,
      },
    };

    changeInvoiceItems(eData, selectedInvoiceItemIndex, i);
  };

  return (
    <Grid container spacing={3} key={i} style={{ marginBottom: '20px' }}>
      <Grid item xs={4}>
        <FormControl style={{ minWidth: 220 }}>
          <Autocomplete
            value={
              x.benefitId
                ? benefitOptions.find((item: any) => item.benefitStructureId === x.benefitId) || null
                : null
            }
            onChange={(e, val) => handleBenefitChange(e, val, i)}
            id={`benefit-autocomplete-${i}`}
            options={benefitOptions}
            getOptionLabel={(option: any) => option?.label || ''}
            isOptionEqualToValue={(option: any, value: any) =>
              option?.benefitStructureId === value?.benefitStructureId
            }
            renderInput={(params) => <TextField {...params} label="Select Benefit" />}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};

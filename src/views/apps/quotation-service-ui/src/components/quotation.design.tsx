
import React from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from 'primereact/button'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import Alert from '@mui/lab/Alert'
import { withStyles, withTheme } from '@mui/styles'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { delay, EMPTY, expand, forkJoin, map, switchMap } from 'rxjs'

import './css/index.css'
import './css/material-rte.css'

import { Accordion, AccordionDetails, AccordionSummary, Box, Divider } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { AlertTitle } from '@mui/lab'

import { StatefulTargetBox as TargetBox } from './targetbox'
import InvoiceAgentModal from './modals/invoice.agent.modal.component'
import MemberTemplateModal from './member.template.dialog'
import FileUploadDialogComponent from './file.upload.dialog'

import { AgentsService, defaultPageRequest } from '@/services/remote-api/fettle-remote-api'
import { replaceAll, toTitleCase } from '@/services/utility'
import { MemberFieldConstants } from '@/views/apps/member-upload-management/MemberFieldConstants'
import { BenefitStructureService } from '@/services/remote-api/api/benefit-structure-services'
import { PremiumFrequencyService } from '@/services/remote-api/api/master-services'
import { MemberProcessService, MemberService } from '@/services/remote-api/api/member-services'
import { PlanService } from '@/services/remote-api/api/plan-services'
import { ProductService } from '@/services/remote-api/api/product-services'
import { QuotationService } from '@/services/remote-api/api/quotation-services'
import {
  FettleAutocomplete,
  FettleBenefitRuleTreeViewComponent /* , FettleRichTextEditor */,
  FettleDataGrid
} from '@/views/apps/shared-component'

const productService = new ProductService()
const benefitStructureService = new BenefitStructureService()
const planservice = new PlanService()
const premiumFrequencyService = new PremiumFrequencyService()
const memberservice = new MemberService()
const quotationService = new QuotationService()
const memberProcessService = new MemberProcessService()
const agentservice = new AgentsService()

const styles = (theme: any) => ({
  formControl: {
    margin: theme?.spacing ? theme.spacing(1) : '8px',
    width: '100%'
  },
  ruleContainer: {
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  },
  lineEllipsis: {
    textOverflow: 'ellipsis',
    width: '95%',
    display: 'block',
    overflow: 'hidden'
  },
  AccordionSummary: {
    backgroundColor: theme?.palette?.background.default
  }

  // AccordionDetails: {
  //   backgroundColor: theme.palette.background.default,
  // },
})

const HtmlTooltip = withStyles((theme: any) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme?.typography?.pxToRem(12),
    border: '1px solid #dadde9'
  }
}))(Tooltip)

const memberPageRequest = {
  page: 0,
  size: 10,
  summary: true,
  active: true
}

const dataSourceMember$: any = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true
  }
) => {
  pageRequest.key = 'sourceType'
  pageRequest.value = 'QUOTATION'
  pageRequest.key2 = 'sourceId'
  pageRequest.value2 = localStorage.getItem('quotationId')

  return memberProcessService.getMemberRequests(pageRequest)
}

function withRouter(Component: any) {
  return function WrappedComponent(props: any) {
    const router = useRouter()
    const query = useSearchParams()
    return <Component {...props} router={router} query={query}/>
  }
}

class QuotationDesignComponent extends React.Component<any, any> {
  query: any
  mode: string | null
  memberConfiguration: any
  constructor(props: any) {
    super(props)
    this.query = this.props.query
    this.mode = this.query.get('mode')
    this.state = {
      selectedProductId: '',
      selectedPlan: '',
      benefitHierarchy: [],
      productRuleDetails: '',
      productDetails: {},
      planDetails: {},
      premiumCurrencyCd: '',
      premiumRuleDetails: {},
      openModal: false,
      openTemplate: false,
      apiList: [],
      memberUpload: null,
      rows: [],
      discount: 0,
      loading: 0,
      totalPremiumAfterLoadingAndDiscount: 0,
      openSnackbar: false,
      snackbarMsg: '',
      alertType: '',
      premiumFrequncyList: [],
      selectedFrequencyId: '',
      totalPremium: 0,
      addFile: false,
      quotationDetails: {},
      buttonTxt: 'Calculate',
      agentsList: [],
      openAgentModal: false,
      isRetail: true,
      customCategory: [],
      memberColDefn: [],
      selectedCategory: [],
      planSchemeEmpty: false,
      isPlanSchemeSaved: false,
      dataTable: [],
      showMemberTable: false
    }

    this.memberConfiguration = {
      enableSelection: false,
      scrollHeight: '300px',
      pageSize: 10,
      actionButtons: false,
      onLoadedData: this.onLoadedData,
      editCell: true,
      header: {
        enable: true,
        text: 'Member Management',
        addCreateButton: true,
        createButtonText: 'Save',
        createButtonIcon: 'pi pi-save',
        onCreateButtonClick: this.saveRowEdit
      }
    }

    this.getPaymentFrequencies()
    this.getMemberConfig()
    this.getMemberConfiguration()
    this.getAgentDetails()
  }

  getAgentDetails = () => {
    const userType = localStorage.getItem('userType')
    const userDetails: any = localStorage?.getItem('user_details')

    if (userType == 'AGENT') {
      const pagerequestquery = {
        page: 0,
        size: 10,
        summary: false,
        name: JSON.parse(userDetails)?.name
      }

      agentservice.importAgentData(pagerequestquery).subscribe((res: any) => {
        const content = res.content
        const temp = []

        const item = {
          contactNo: content[0].agentBasicDetails.contactNos[0].contactNo,
          code: content[0].agentBasicDetails.code,
          name: content[0].agentBasicDetails.name,
          agentId: content[0].id,
          commissionType: 'PERCENTAGE',
          commission: content[0].commission,
          finalValue: ''
        }

        temp.push(item)
        this.setState({
          ...this.state,
          agentsList: temp
        })
      })
    }
  }

  saveRowEdit = () => {
    if (this.state.dataTable.length) {
      const payload = this.state.dataTable.map((row: any) => ({
        id: row.id,
        planScheme: row.planScheme
      }))

      const sourceType = 'QUOTATION'
      const sourceId = this.state.quotationDetails.id || localStorage.getItem('quotationId')

      memberservice.savePlanScheme(payload, sourceType, sourceId).subscribe((res: any) => {
        this.toggleSnackbar(true, 'success', 'Saved successfully')
        this.setState({ isPlanSchemeSaved: true })
      })
    } else {
      this.toggleSnackbar(true, 'warning', 'Select category for all members')
    }
  }

  onLoadedData = (data: any) => {
    const planSchemeEmpty = data.some((item: any) => !item.planScheme)

    this.setState({
      dataTable: planSchemeEmpty ? [] : data,
      planSchemeEmpty,
      isPlanSchemeSaved: !planSchemeEmpty && this.state.isPlanSchemeSaved
    })
  }

  onCellEditComplete = (event: any, newData: any) => {
    // this.onLoadedData(newData);
    console.log('newData', newData)
  }

  editor = (options: any) => {
    return (
      <Dropdown
        value={options.value}
        style={{ fontSize: '10px !important' }}
        className='text-xs'
        showOnFocus
        showClear
        options={this.state.rows.map((item: any) => item.categoryName)}
        onChange={e => options.editorCallback(e.value)}
        placeholder='Category'
        itemTemplate={option => {
          return <Tag className='text-xs' value={option} severity={'success'}></Tag>
        }}
      />
    )
  }

  componentDidUpdate(prevProps: any) {
    const { quotationDetails } = this.props

    if (quotationDetails !== this.state.quotationDetails) {
      /**
       * To update the local variable change
       * changeType value is "L" else keep it ""
       */
      if (quotationDetails.changeType) {
        this.setState({
          ...this.state,
          quotationDetails
        })

        return
      }

      if (quotationDetails.id) {
        this.setState({
          ...this.state,
          quotationDetails,
          selectedProductId: quotationDetails.productId,
          selectedPlan: quotationDetails.planId

          // selectedFrequencyId: "873209101462482944"
        })
        setTimeout(this.buildPremiumRules, 0)
      }

      if (quotationDetails.memberUploadStatus === 'COMPLETED') {
        this.fetchMemberUploads()
      }

      if (quotationDetails.memberUploadStatus === 'INPROGRESS') {
        this.checkCalculationStatus()
      }
    }
  }

  fetchMemberUploads = () => {
    dataSourceMember$().subscribe((page: any) => {
      dataSourceMember$({ page: 0, size: page.totalElements }).subscribe((res: any) => {
        const planSchemeEmpty = res.content.some((item: any) => ['', undefined, null].includes(item.planScheme))

        this.setState({ showMemberTable: planSchemeEmpty })
      })
    })
  }

  buildPremiumRules = () => {
    const { quotationDetails } = this.props

    if (!quotationDetails.productId) {
      return
    }

    forkJoin([this.getProductDetails(quotationDetails.productId), this.getPremiumDetails(quotationDetails.productId)])
      .pipe(
        switchMap((res: any) => {
          this.setState({
            ...this.state,
            productDetails: res[0],
            premiumCurrencyCd: res[0].productBasicDetails.premiumCurrencyCd,
            premiumRuleDetails: res[1]
          })
          this.getAllBenefitStructures()

          return planservice.getPlanDetails(quotationDetails.planId)
        })
      )
      .subscribe((res: any) => {
        if (res.id) {
          this.setState({
            ...this.state,
            planDetails: res,
            totalPremium: quotationDetails.totalPremium,
            rows: res.planCategorys.map((p: any) => {
              const catAmts = quotationDetails.categoryMemberHeadCountPremiumAmounts[p.name]

              return {
                categoryId: p.id,
                categoryName: p.name,
                premiumRules: (quotationDetails.catagoryPremiumRules[p.name]
                  ? quotationDetails.catagoryPremiumRules[p.name]
                  : []
                ).map((qpr: any) => ({
                  ...this.getPremiumRuleDetails(qpr),
                  sumOfPremium: catAmts ? catAmts.premiumAmount : 0
                })),
                headCount: catAmts ? catAmts.headCount : 0
              }
            })
          })
        }
      })
  }

  getPremiumRuleDetails = (id: any) => {
    let ruleObj, freqObj

    for (const i in this.state.premiumRuleDetails.premiumRules) {
      ruleObj = this.state.premiumRuleDetails.premiumRules[i].premiumRules.find((rd: any) => rd.id == id)

      if (ruleObj) {
        freqObj = ruleObj.premiumPaymentFrequencies.find(
          (ppf: any) => ppf.premiumPaymentFrequncyId == this.props.quotationDetails.paymentFrequency
        )

        // break;
        return { ...ruleObj, premiumAmount: freqObj.premiumAmount }
      }
    }

    // return { ...ruleObj, premiumAmount: freqObj.premiumAmount };
  }

  getPaymentFrequencies = () => {
    return premiumFrequencyService.getPremiumFrequencies().subscribe((res: any) => {
      const selectedFreq = res.content.filter((f: any) => f.name.toLowerCase() === 'per annum')

      this.setState({
        ...this.state,
        premiumFrequncyList: res.content,
        selectedFrequencyId: this.props.quotationDetails.paymentFrequency || selectedFreq[0].id
      })
    })
  }

  getMemberConfig = () => {
    return memberservice.getMemberConfiguration().subscribe((res: any) => {
      res.content[0].fields.forEach((el: any) => {
        if (el.sourceApiId) {
          this.getAPIDetails(el.sourceApiId)
        }
      })
    })
  }

  handleSelectChange = (rowData: any, event: any) => {
    const updatedCategories = [...this.state.selectedCategory]

    const existingCategoryIndex = updatedCategories.findIndex((item: any) => item.id == event.target.value.id)

    if (existingCategoryIndex > -1) {
      updatedCategories[existingCategoryIndex] = event.target.value
    } else {
      updatedCategories.push(event.target.value)
    }

    this.setState({ selectedCategory: updatedCategories })
  }

  getMemberConfiguration = () => {
    memberservice.getMemberConfiguration().subscribe((res: any) => {
      if (res.content && res.content.length > 0) {
        const colDef = res.content[0].fields.map((r: any) => {
          const col: any = {
            field: MemberFieldConstants[r?.name?.toUpperCase() as keyof typeof MemberFieldConstants],
            headerName: toTitleCase(replaceAll(r.name, '_', ' '))
          }

          if (r.name == 'DATE_OF_BIRTH') {
            col.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{new Date(rowData.dateOfBirth).toLocaleDateString()}</span>
            }
          }

          if (r.name == 'MEMBERSHIP_NO') {
            col.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{rowData.membershipNo}</span>
            }
          }

          if (r.name == 'MOBILE_NO') {
            col.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{rowData.mobileNo}</span>
            }
          }

          if (r.name == 'EMAIL') {
            col.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{rowData.email}</span>
            }
          }

          if (r.name === 'PLAN_SCHEME') {
            col.body = (rowData: any) => {
              return <Tag value={rowData.planScheme} severity='success'></Tag>
            }

            col.editor = this.editor
            col.style = { width: '10%', minWidth: '8rem' }
            col.bodyStyle = { cursor: 'pointer' }
            col.onCellEditComplete = this.onCellEditComplete
          }

          return col
        })

        const fieldNamesToRemove = [
          'email',
          'mobileNo',
          'membershipNo',
          'identificationDocType',
          'identificationDocNumber'
        ]

        const updatedColumns = colDef.filter((column: any) => !fieldNamesToRemove.includes(column.field))

        this.setState({
          ...this.state,
          memberColDefn: updatedColumns
        })
        res.content[0].fields.forEach((el: any) => {
          if (el.sourceApiId) {
            this.getAPIDetails(el.sourceApiId)
          }
        })
      }
    })
  }

  openModal = () => {
    this.setState({
      ...this.state,
      openModal: true
    })
  }

  changeFileStat = () => {
    this.setState({
      ...this.state,
      addFile: true
    })
  }

  openTemplateModal = () => {
    this.setState({
      ...this.state,
      openTemplate: true
    })
  }

  closeModal = () => {
    this.setState({
      ...this.state,
      openModal: false
    })
  }

  closeTemplateModal = () => {
    this.setState({
      ...this.state,
      openTemplate: false
    })
  }

  productDataSourceCallback$ = (params = {}, action: any, pageRequest = defaultPageRequest) => {
    let reqParam: any = { ...pageRequest, ...params }

    if (action?.searchText && action?.searchText.length > 2) {
      reqParam = {
        ...reqParam,
        name: action?.searchText
      }
      delete reqParam.active
    }

    return productService.getProducts(reqParam)
  }

  planDataSourceCallback$ = (params = {}, action: any, pageRequest = defaultPageRequest) => {
    let reqParam: any = { ...pageRequest, ...params }

    if (action?.searchText) {
      reqParam = {
        ...reqParam,
        code: action?.searchText,
        name: action?.searchText,
        clientType: action?.searchText
      }
    }

    return planservice
      .getPlanFromProduct(this.state.selectedProductId)
      .pipe(map((res: any) => ({ content: res, totalElements: res.length })))
  }

  handleProductChange = (name: any, e: any, value: any) => {
    console.log("In");
    
    if (value && value.id) {
      this.buildProductDetails(name, value.id)
    } else {
      this.setState({ ...this.state, [name]: '' })
    }
  }

  buildProductDetails = (name: any, id: any) => {
    this.setState({ ...this.state, [name]: id })
    forkJoin([this.getProductDetails(id), this.getPremiumDetails(id)]).subscribe((res: any) => {
      this.setState({
        ...this.state,
        selectedProductId: id,
        productDetails: res[0],
        premiumCurrencyCd: res[0].productBasicDetails.premiumCurrencyCd,
        premiumRuleDetails: res[1]
      })
      this.getAllBenefitStructures()
    })
  }

  handlePlanChange = (name: any, e: any, value: any) => {
    if (value && value.id) {
      this.setState({ ...this.state, [name]: value.id, rows: [] })
      planservice.getPlanDetails(value.id).subscribe((res: any) => {
        if (res.id) {
          this.setState({
            ...this.state,
            rows: res.planCategorys.map((p: any) => ({
              categoryId: p.id,
              categoryName: p.name,
              premiumRules: []
            }))
          })
        }
      })
    } else {
      this.setState({ ...this.state, [name]: '', rows: [] })
    }
  }

  getProductDetails = (productId: any) => {
    return productService.getProductDetails(productId)
  }

  getPremiumDetails = (productId: any) => {
    return productService.getPremiums(productId)
  }

  getAPIDetails = (sourceid: any) => {
    return memberservice.getSourceDetails(sourceid).subscribe((res: any) => {
      this.setState({
        ...this.state,
        apiList: [...this.state.apiList, res]
      })
    })
  }

  getAllBenefitStructures = () => {
    benefitStructureService.getAllBenefitStructures().subscribe((res: any) => {
      if (res.content) {
        this.buildPreviewHierarchy(res.content)
      }
    })
  }

  buildPreviewHierarchy = (benefitStructures: any) => {
    const previewHierarchy = benefitStructures.map((benefit: any) => {
      return { ...benefit, hirearchy: { ...benefit.hirearchy, child: [] } }
    })

    /* eslint-disable @typescript-eslint/no-this-alias */
    const self = this
    /* eslint-enable @typescript-eslint/no-this-alias */

    this.state.productDetails.productRules.forEach((rule: any) => {
      const mainBenefitIndex = benefitStructures.findIndex((b: any) => b.id === rule.benefitStructureId)

      if (mainBenefitIndex > -1) {
        const benefitElm = benefitStructures[mainBenefitIndex].hirearchy

        if (benefitElm.id === rule.benefitId) {
          const o = previewHierarchy[mainBenefitIndex].hirearchy

          if (!rule.parentId) {
            o.child.push({
              ...rule,
              benefitCode: o.code,
              child: [],
              type: 'rule'
            })
          }

          /**
           * Adding Premium Rules into Product Rule
           */
          const premiumRules = self.state.premiumRuleDetails.premiumRules.filter(
            (p: any) => p.productRuleId === rule.id
          )

          if (premiumRules.length > 0) {
            const pIdx = o.child.findIndex((c: any) => c.id === rule.id)

            o.child[pIdx].child = [
              ...o.child[pIdx].child,
              ...premiumRules.reverse()[0].premiumRules.map((o: any) => ({ ...o, type: 'premiumRule' }))
            ]
          }
        } else {
          this.getChildBenefitHierarchy(benefitElm, rule, previewHierarchy, mainBenefitIndex)
        }
      }
    })
    console.log(previewHierarchy);
    
    this.setState({
      ...this.state,
      benefitHierarchy: previewHierarchy
    })
  }

  getChildBenefitHierarchy = (benefitElm: any, rule: any, previewHierarchy: any, mainBenefitIndex: any) => {
    if (benefitElm.child && benefitElm.child.length > 0) {
      const subBenefitIndex = benefitElm.child.findIndex((item: any) => item.id === rule.benefitId)

      if (subBenefitIndex > -1) {
        const newBenefitElm = {
          ...benefitElm.child[subBenefitIndex],
          child: [],
          type: 'benefit'
        }

        if (rule.parentId) {
          this.getChildRuleHierarchy(
            previewHierarchy[mainBenefitIndex].hirearchy,
            mainBenefitIndex,
            rule,
            newBenefitElm
          )
        }
      } else {
        benefitElm.child.forEach((item: any) => {
          this.getChildBenefitHierarchy(item, rule, previewHierarchy, mainBenefitIndex)
        })
      }
    }
  }

  getChildRuleHierarchy = (parentHierarchy: any, mainBenefitIndex: any, rule: any, newBenefitElm: any) => {
    const parentIdx = parentHierarchy.child.findIndex((item: any) => item.id === rule.parentId)

    if (parentIdx > -1) {
      let benefitIdx = parentHierarchy.child[parentIdx].child.findIndex(
        (benefit: any) => benefit.id === newBenefitElm.id
      )

      if (benefitIdx === -1) {
        parentHierarchy.child[parentIdx].child.push(newBenefitElm)
        benefitIdx = parentHierarchy.child[parentIdx].child.length - 1
      }

      const o = parentHierarchy.child[parentIdx].child[benefitIdx]

      o.child.push({ ...rule, benefitCode: o.code, child: [], type: 'rule' })

      /**
       * Adding Premium Rules into Product Rule
       */
      const premiumRules = this.state.premiumRuleDetails.premiumRules.filter((p: any) => p.productRuleId === rule.id)

      if (premiumRules.length > 0) {
        const pIdx = o.child.findIndex((c: any) => c.id === rule.id)

        o.child[pIdx].child = [
          ...o.child[pIdx].child,
          ...premiumRules.reverse()[0].premiumRules.map((o: any) => ({ ...o, type: 'premiumRule' }))
        ]
      }
    } else {
      parentHierarchy.child.forEach((item: any) => {
        this.getChildRuleHierarchy(item, mainBenefitIndex, rule, newBenefitElm)
      })
    }
  }

  getBenefitParameterDetails = (nodeData: any) => {}

  createPlan = () => {
    this.props.router.push('/plans?mode=create')
  }

  handleFrequency = (e: any) => {
    const { name, value } = e.target

    this.state.rows.forEach((row: any) => {
      row.premiumRules.forEach((pr: any) => {
        const filteredFrequency = pr.premiumPaymentFrequencies
          ? pr.premiumPaymentFrequencies.filter((p: any) => p.premiumPaymentFrequncyId === value)
          : 0

        let amt = 0

        if (filteredFrequency !== 0 && filteredFrequency.length > 0) {
          amt = filteredFrequency[0].premiumAmount
        }

        pr.premiumAmount = amt
        pr.sumOfPremium = amt * pr.headCount
      })
    })

    const totalPremium = this.getTotalPremium(this.state.rows)

    this.setState({
      ...this.state,
      [name]: value,
      rows: this.state.rows,
      totalPremium
    })
  }

  skipMemberUpload = () => {
    this.setState({
      ...this.state,
      memberUpload: false
    })
  }

  findParent = (benefitItems: any, ruleObj: any) => {
    let parentRule = {}

    for (let i = 0; i < benefitItems.child.length; i++) {
      const b = benefitItems.child[i]
      const elm = b.child.filter((c: any) => c.id === ruleObj.parentId)

      if (elm.length > 0) {
        parentRule = elm[0]

        return parentRule
      } else {
        parentRule = this.findParent(b, ruleObj)
        if (parentRule) break
      }
    }

    return parentRule
  }

  handleDrop = (row: any, ruleObj: any) => {
    const parentRule = {}
    const insertIdx = this.state.rows.findIndex((r: any) => r.categoryName === row.categoryName)

    {
      /* 
      // commented by imran on 06/12/23 to obtain drag by parent on rule tree
    if (ruleObj.parentId) {
      for (let i = 0; i < this.state.benefitHierarchy.length; i++) {
        const item = this.state.benefitHierarchy[i];
        const elm = item.hirearchy.child.filter((c:any) => c.id === ruleObj.parentId);
        if (elm.length > 0) {
          parentRule = elm[0];
          break;
        } else {
          parentRule = this.findParent(item.hirearchy, ruleObj);
        }
      }

      const isParentRuleExist = this.state.rows[insertIdx].premiumRules.some((p:any) =>  p.ruleName === parentRule.name);
      if (isParentRuleExist) {
        this.addToTable(insertIdx, ruleObj);
      } else {
        this.toggleSnackbar(true, 'error', 'Add parent rule');
      }
    } else {
      this.addToTable(insertIdx, ruleObj);
    }
  */
    }

    if (ruleObj.child) {
      ruleObj.child.map((rule: any) => this.addToTable(insertIdx, rule))
    } else {
      this.addToTable(insertIdx, ruleObj)
    }
  }

  addToTable = (idx: any, ruleObj: any) => {
    const isRuleExist = this.state.rows[idx].premiumRules.some((p: any) => p.id === ruleObj.id)

    if (!isRuleExist) {
      const filteredFrequency = this.state.selectedFrequencyId
        ? ruleObj.premiumPaymentFrequencies?.filter(
            (p: any) => p.premiumPaymentFrequncyId === this.state.selectedFrequencyId
          )
        : 0

      let premiumAmount = 0

      if (filteredFrequency !== 0 && filteredFrequency?.length > 0) {
        premiumAmount = filteredFrequency[0].premiumAmount
      }

      const rows = this.state.rows

      rows[idx] = {
        ...rows[idx],
        premiumRules: [
          ...rows[idx].premiumRules,
          {
            name: ruleObj.name,
            expression: ruleObj.expression,
            id: ruleObj.id,
            premiumPaymentFrequencies: ruleObj.premiumPaymentFrequencies,
            premiumAmount,
            headCount: 0,
            sumOfPremium: 0
          }
        ]
      }

      this.setState({
        ...this.state,
        rows
      })
    }
  }

  handleDropCustom = (row: any, ruleObj: any) => {
    const insertIdx = this.state.customCategory.findIndex((r: any) => r.categoryId === row.categoryId)

    if (ruleObj.child) {
      ruleObj.child.map((rule: any) => this.addToTableCustom(insertIdx, rule))
    } else {
      this.addToTableCustom(insertIdx, ruleObj)
    }
  }

  addToTableCustom = (idx: any, ruleObj: any) => {
    const isRuleExist = this.state.customCategory[idx].premiumRules.some((p: any) => p.id === ruleObj.id)

    if (!isRuleExist) {
      const filteredFrequency = this.state.selectedFrequencyId
        ? ruleObj.premiumPaymentFrequencies.filter(
            (p: any) => p.premiumPaymentFrequncyId === this.state.selectedFrequencyId
          )
        : 0

      let premiumAmount = 0

      if (filteredFrequency !== 0 && filteredFrequency.length > 0) {
        premiumAmount = filteredFrequency[0].premiumAmount
      }

      const rows = [...this.state.customCategory]

      rows[idx] = {
        ...rows[idx],
        premiumRules: [
          ...rows[idx].premiumRules,
          {
            name: ruleObj.name,
            expression: ruleObj.expression,
            id: ruleObj.id,
            premiumPaymentFrequencies: ruleObj.premiumPaymentFrequencies,
            premiumAmount,
            headCount: 0,
            sumOfPremium: 0
          }
        ]
      }

      this.setState({ customCategory: rows })
    }
  }

  toggleSnackbar = (
    status: any,
    alertType = this.state.alertType || 'success',
    snackbarMsg = this.state.snackbarMsg || 'Success'
  ) => {
    this.setState({
      ...this.state,
      openSnackbar: status,
      alertType,
      snackbarMsg
    })
  }

  handleRTEChange = (value: any) => {}

  handleHeadCountChange = (e: any, rowIdx: any) => {
    const { name, value } = e.target
    const inputValue = value.replace(/[^1-9]/g, '')
    const rows = this.state.rows

    rows[rowIdx][name] = inputValue
    rows[rowIdx].premiumRules.forEach((pr: any) => {
      pr.sumOfPremium = inputValue * pr.premiumAmount
    })

    const totalPremium = this.getTotalPremium(this.state.rows)

    this.setState({
      ...this.state,
      rows,
      totalPremium
    })
  }

  getTotalPremium = (rows: any) => {
    return rows.reduce((acc: any, currVal: any) => {
      if (currVal.premiumRules.length > 0) {
        return acc + currVal.premiumRules.reduce((a: any, c: any) => a + c.sumOfPremium, 0)
      } else {
        return acc
      }
    }, 0)
  }

  onstart(args: any) {
    args.dataTransfer.setData('text', args.target.innerText)
  }

  onComplete = () => {
    this.setState({
      ...this.state,
      memberUpload: true
    })
  }

  calculatePremium = () => {
    if (this.state.quotationDetails.premiumCalculationStatus == 'INPROGRESS') {
      this.toggleSnackbar(true, 'warning', 'Premium Calculation is Under Processing...')

      return
    }

    if (this.state.quotationDetails.memberUploadStatus !== 'COMPLETED') {
      this.toggleSnackbar(true, 'warning', 'Please Upload Member From Member Tab')

      return
    }

    if (this.state.showMemberTable && !this.state.isPlanSchemeSaved) {
      this.toggleSnackbar(true, 'warning', 'Please Save Member Management Table Above')

      return
    }

    if (!this.state.productDetails) {
      this.toggleSnackbar(true, 'warning', 'Please Select a product ')

      return
    }

    const { selectedFrequencyId, selectedProductId, selectedPlan, rows } = this.state

    const catagoryPremiumRules = rows.map((r: any) => {
      return {
        [r.categoryName]: r.premiumRules.map((pr: any) => pr?.id?.toString())
      }
    })

    const payload: any = {
      paymentFrequency: selectedFrequencyId,
      productId: selectedProductId,
      planId: selectedPlan,
      catagoryPremiumRules: Object.assign({}, ...catagoryPremiumRules)
    }

    const pageRequest: any = {
      action: 'calculate-premium'
    }

    const quotationId: any = localStorage.getItem('quotationId')

    const invAgents: any = []

    this.state.agentsList.forEach((ag: any) => {
      invAgents.push({
        agentId: ag.agentId,
        commissionType: ag.commissionType,
        commissionValue: ag.commission,
        finalValue: (Number(ag.commission) * Number(this.state.totalPremium)) / 100

        // ag.finalValue,
      })
    })

    payload['quotationAgents'] = invAgents

    quotationService.updateQuotation(pageRequest, payload, quotationId).subscribe((res: any) => {
      const q = { ...this.state.quotationDetails }

      this.setState({
        ...this.state,

        /* quotationDetails: {
            ...q,
            premiumCalculationStatus: 'INPROGRESS'
          }, */
        buttonTxt: 'In Progress'
      })
      this.props.updateQuotation({ ...this.state.quotationDetails, premiumCalculationStatus: 'INPROGRESS' }, 'L')
      setTimeout(this.checkCalculationStatus, 5000)
    })
  }

  uploadDiscountAndLoading = () => {
    const {
      selectedFrequencyId,
      selectedProductId,
      selectedPlan,
      rows,
      loading,
      discount,
      totalPremiumAfterLoadingAndDiscount
    } = this.state

    const catagoryPremiumRules = rows.map((r: any) => {
      return {
        [r.categoryName]: r.premiumRules.map((pr: any) => pr?.id?.toString())
      }
    })

    const payload: any = {
      paymentFrequency: selectedFrequencyId,
      productId: selectedProductId,
      planId: selectedPlan,
      catagoryPremiumRules: Object.assign({}, ...catagoryPremiumRules),
      discount: discount,
      loading: loading,
      totalAfterDicountAndLoadingAmount: totalPremiumAfterLoadingAndDiscount
    }

    const quotationId: any = localStorage.getItem('quotationId')

    const invAgents: any = []

    this.state.agentsList.forEach((ag: any) => {
      invAgents.push({
        agentId: ag.agentId,
        commissionType: ag.commissionType,
        commissionValue: ag.commission,
        finalValue: (Number(ag.commission) * Number(this.state.totalPremium)) / 100

        // ag.finalValue,
      })
    })

    payload['quotationAgents'] = invAgents

    quotationService.uploadDiscountAndLoading(payload, quotationId).subscribe((res: any) => {
      // this.props.router.push(`/quotations?mode=viewList`);
    })
  }

  removePremuimRule = (parentId: any, index: any) => {
    const rows = [...this.state.rows]

    rows[parentId].premiumRules.splice(index, 1)
    this.setState({
      ...this.state,
      rows
    })
  }
  removePremuimRuleCustom = (parentId: any, index: any) => {
    const rows = [...this.state.customCategory]

    rows[parentId].premiumRules.splice(index, 1)
    this.setState({
      ...this.state,
      rows
    })
  }

  checkCalculationStatus = () => {
    const quotationId: any = localStorage.getItem('quotationId')

    quotationService
      .getQuoationDetailsByID(quotationId)
      .pipe(
        expand((res: any) => {
          if (res.memberUploadStatus === 'INPROGRESS') {
            return quotationService.getQuoationDetailsByID(quotationId).pipe(delay(10000))
          } else {
            return EMPTY
          }
        })
      )
      .subscribe((res: any) => {
        if (res.memberUploadStatus !== 'INPROGRESS') {
          this.setState({
            ...this.state,
            buttonTxt: 'Calculate'
          })
          this.props.updateQuotation(res)
        }
      })
  }

  handleCloseAgentModal = () => {
    this.setState({
      ...this.state,
      openAgentModal: false
    })
  }

  handleAgentModalSubmit = (selectedAgents: any) => {
    // const finalArr = [...agentsList,...selectedAgents];

    this.setState({
      ...this.state,
      agentsList: selectedAgents,
      openAgentModal: false
    })
  }

  changeCommision = (e: any, i: any) => {
    const { name, value } = e.target
    const { agentsList } = this.state
    const list = [...agentsList]

    list[i][name] = value
    this.setState({ agentsList: list })
    this.calculateFinalValue(list, i)
  }

  calculateFinalValue = (list: any, i: any) => {
    list[i]['finalValue'] = (Number(list[i]['commission']) * Number(this.state.totalPremium)) / 100
    this.setState({ agentsList: list })
  }

  setAgentsList = (newAgentsList: any) => {
    this.setState({ agentsList: newAgentsList })
  }

  // handleAgentModalSubmit = selectedAgents => {
  //   this.setAgentsList(selectedAgents);
  //   this.handleCloseAgentModal();
  // };

  handleOpenAgentModal = () => {
    this.setState({ openAgentModal: true })
  }

  handleAddCategory = () => {
    this.setState({
      customCategory: [
        ...this.state.customCategory,
        {
          categoryId: +(Math.random() * 100).toFixed(6),
          categoryName: 'Custom',
          premiumRules: []
        }
      ]
    })
  }

  handleRemoveClickContact = (index: any) => {
    const list = [...this.state.customCategory]

    list.splice(index, 1)
    this.setState({ customCategory: list })
  }

  handleCategoryNameChange = (event: any, idx: any) => {
    const newName = event.target.value
    const updatedCustomCategory = [...this.state.customCategory]

    const isDuplicateCustom = this.state.customCategory.some(
      (item: any, i: any) => i !== idx && item.categoryName.trim() === newName
    )

    const isDuplicateRows = this.state.rows.some((item: any, i: any) => item.categoryName.trim() === newName)

    if (isDuplicateCustom || isDuplicateRows) {
      this.toggleSnackbar(true, 'error', 'Duplicate name found!')
    } else {
      updatedCustomCategory[idx] = {
        ...updatedCustomCategory[idx],
        categoryName: event.target.value
      }

      this.setState({
        customCategory: updatedCustomCategory
      })
    }
  }

  handleSaveCustomCategory = () => {
    const customCategories = this.state.customCategory.map((category: any) => ({
      name: category.categoryName,
      description: ''
    }))

    const selectedPlan = this.state.selectedPlan

    selectedPlan &&
      customCategories.length > 0 &&
      planservice.addPlanCategory(customCategories, selectedPlan).subscribe((res: any) => {
        const updatedCustomCategory = this.state.customCategory.map((category: any) => {
          const matchingResItem = res.find((resItem: any) => resItem.name === category.name)

          if (matchingResItem) {
            return { ...category, id: matchingResItem.id }
          }

          return category
        })

        this.setState({ rows: [...this.state.rows, ...updatedCustomCategory] })
        this.setState({ customCategory: [] })
      })
  }

  handleChange = (e: any) => {
    const { name, value } = e.target

    console.log(name, value)
  }

  calculatePremiumAfterLoadingAndDiscount = (loadingVal: any, discountVal: any) => {
    const la = (Number(loadingVal) / 100) * this.state.totalPremium
    const da = (Number(discountVal) / 100) * this.state.totalPremium
    const at = this.state.totalPremium + la - da

    this.setState({
      ...this.state,
      totalPremiumAfterLoadingAndDiscount: at
    })
  }

  render() {
    const { classes } = this.props

    const {
      benefitHierarchy,
      selectedProductId,
      selectedPlan,
      memberUpload,
      rows,
      openSnackbar,
      snackbarMsg,
      alertType,
      selectedFrequencyId,
      premiumFrequncyList,
      totalPremium,
      quotationDetails,
      productDetails,
      buttonTxt,
      isRetail,
      customCategory,
      planSchemeEmpty,
      isPlanSchemeSaved,
      showMemberTable
    } = this.state
    console.log(benefitHierarchy);
    
    return (
      <div className={classes.quotationDesignRoot}>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => this.toggleSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => this.toggleSnackbar(false)} severity={alertType} variant='filled'>
            <AlertTitle>{alertType}</AlertTitle>
            {snackbarMsg}
          </Alert>
        </Snackbar>
        <DndProvider backend={HTML5Backend}>
          <Grid container spacing={1}>
            <Grid
              item
              xs={12}
              sm={3}
              style={{
                position: 'relative'
              }}
            >
              <Paper
                elevation={0}
                style={{
                  minHeight: 'auto',
                  padding: 4,
                  position: 'sticky',
                  top: '70px'
                }}
              >
                
                <FettleBenefitRuleTreeViewComponent
                  hierarchy={benefitHierarchy}
                  onNodeSelect={this.getBenefitParameterDetails}
                  showAsTooltip={true}
                  hideRightInfo={true}
                  draggable={true}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Paper elevation={0} style={{ minHeight: 500, width: '100%', padding: 15 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <FormControl className={classes.formControl}>
                      <FettleAutocomplete
                        id='product'
                        name='product'
                        label='Product'
                        displayKey='productBasicDetails.name'
                        $datasource={this.productDataSourceCallback$}
                        changeDetect={true}
                        txtValue={productDetails?.productBasicDetails?.name}
                        value={selectedProductId}
                        onChange={(e: any, newValue: any) => this.handleProductChange('selectedProductId', e, newValue)}
                      />
                    </FormControl>
                  </Grid>
                  {selectedProductId && (
                    <React.Fragment key={selectedProductId}>
                      <Grid item xs={12} sm={6} md={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <FormControl className={classes.formControl}>
                          <FettleAutocomplete
                            id='plan'
                            name='plan'
                            label='Plan'
                            $datasource={this.planDataSourceCallback$}
                            changeDetect={true}
                            txtValue={this.state?.planDetails?.name}
                            value={selectedPlan}
                            onChange={(e: any, newValue: any) => this.handlePlanChange('selectedPlan', e, newValue)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} style={{ display: 'flex', alignItems: 'center' }}>
                        <Button color='secondary' className='p-button-secondary' onClick={this.createPlan}>
                          Create Plan
                        </Button>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <FormControl className={classes.formControl}>
                          <InputLabel id='select-search-by-label'>Payment Frequency</InputLabel>
                          <Select
                            name='selectedFrequencyId'
                            label='Payment Frequency'
                            displayEmpty
                            className={classes.selectEmpty}
                            inputProps={{ 'aria-label': 'Without label' }}
                            value={selectedFrequencyId}
                            onChange={this.handleFrequency}
                          >
                            {premiumFrequncyList.map((freq: any) => (
                              <MenuItem key={freq.code} value={freq.id}>
                                {freq.name}
                              </MenuItem>
                            ))}
                            gent
                          </Select>
                        </FormControl>
                      </Grid>
                    </React.Fragment>
                  )}
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={12} style={{ minHeight: 500, marginTop: 15 }}>
                    {rows.map((row: any, idx: any) => (
                      <TargetBox key={`row${idx}`} onDrop={(data: any) => this.handleDrop(row, data)}>
                        <Accordion elevation={0} key={`row${idx}`} style={{ width: '100% !important' }}>
                          <AccordionSummary
                            className={classes.AccordionSummary}
                            expandIcon={<ExpandMoreIcon color='primary' />}
                          >
                            {idx > -1 && (
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{ width: '15%', padding: '4px' }}>{row.categoryName}</TableCell>
                                    <TableCell style={{ width: '25%', padding: '4px' }}>Premium Rule</TableCell>
                                    <TableCell style={{ width: '20%', padding: '4px' }}>
                                      Premium Amount(Per Member)
                                    </TableCell>
                                    <TableCell style={{ width: '20%', padding: '4px' }}>
                                      Applicable Head Count
                                    </TableCell>
                                    <TableCell style={{ width: '20%', padding: '4px' }} align='right'>
                                      Sum of Premium
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                              </Table>
                            )}
                          </AccordionSummary>
                          <AccordionDetails>
                            <Table>
                              <TableBody>
                                <TableRow key={`row${idx}`} hover>
                                  <TableCell style={{ width: '15%', padding: '4px' }}>{row.categoryName}</TableCell>
                                  <TableCell style={{ width: '25%', padding: '4px' }}>
                                    {row.premiumRules.map((p: any, i: any) => (
                                      <HtmlTooltip
                                        key={p.name}
                                        disableHoverListener={false}
                                        disableFocusListener
                                        disableTouchListener
                                        title={
                                          <React.Fragment>
                                            <Typography color='inherit'>{p.expression}</Typography>
                                          </React.Fragment>
                                        }
                                      >
                                        <div>
                                          {p.name ? (
                                            <div key={p.name} className={classes.ruleContainer}>
                                              <span className={classes.lineEllipsis}>{p.name}</span>
                                              <span>
                                                <IconButton
                                                  color='secondary'
                                                  aria-label='remove'
                                                  onClick={() => this.removePremuimRule(idx, i)}
                                                >
                                                  <RemoveCircleIcon style={{ color: '#dc3545' }} />
                                                </IconButton>
                                              </span>
                                            </div>
                                          ) : null}
                                        </div>
                                      </HtmlTooltip>
                                    ))}
                                  </TableCell>
                                  <TableCell style={{ width: '20%', padding: '4px' }}>
                                    {row.premiumRules.map((p: any) => (
                                      <Typography key={p.name}>{p.premiumAmount}</Typography>
                                    ))}
                                  </TableCell>
                                  <TableCell style={{ width: '20%', padding: '4px' }}>
                                    <Box key={row.categoryName}>
                                      {quotationDetails.memberUploadStatus && <span>{row.headCount}</span>}
                                      {!quotationDetails.memberUploadStatus &&
                                        row.premiumRules.length > 0 &&
                                        !memberUpload && (
                                          <TextField
                                            fullWidth
                                            name='headCount'
                                            value={row.headCount}
                                            onChange={e => this.handleHeadCountChange(e, idx)}
                                            inputProps={{
                                              style: { textAlign: 'right' },
                                              readOnly: true
                                            }}
                                          />
                                        )}
                                    </Box>
                                  </TableCell>
                                  <TableCell style={{ width: '20%', padding: '4px' }} align='right'>
                                    <div>{row?.premiumRules[0]?.sumOfPremium}</div>
                                  </TableCell>
                                  <TableCell style={{ padding: 0 }}>
                                  <ExpandMoreIcon color='primary' style={{ padding: '16px', opacity: 0 }} />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </AccordionDetails>
                        </Accordion>
                      </TargetBox>
                    ))}
                    <Divider style={{ margin: '12px 0' }} />
                    {customCategory.length === 0 && isRetail && !!selectedPlan && (
                      <Grid container justifyContent='flex-end'>
                        <Grid item>
                          <Tooltip title='Add a custom category'>
                            <Button color='primary' onClick={this.handleAddCategory}>
                              <AddIcon />
                            </Button>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    )}
                    {isRetail &&
                      customCategory.map((row: any, idx: any) => {
                        return (
                          <Box
                            style={{
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              margin: '4px 0',
                              borderRadius: '4px'
                            }}
                            key={`rows${idx}`}
                          >
                            <TargetBox
                              style={{
                                opacity: this.state.customCategory[idx].premiumRules.length > 0 ? 1 : 0.8
                              }}
                              key={`rows${idx}`}
                              onDrop={(data: any) => this.handleDropCustom(row, data)}
                            >
                              <Grid container justifyContent='flex-end' alignItems='flex-end' key={idx}>
                                <Grid item>
                                  <TextField
                                    label='Category Name'
                                    variant='standard'
                                    style={{ marginRight: '5px' }}
                                    value={this.state.customCategory[idx].categoryName}
                                    onChange={event => this.handleCategoryNameChange(event, idx)}
                                  />
                                </Grid>
                                <Grid item>
                                  {customCategory.length !== 0 && (
                                    <Tooltip title='Delete'>
                                      <Button
                                        onClick={() => this.handleRemoveClickContact(idx)}
                                        className='p-button-secondary'
                                        color='secondary'
                                        style={{ marginRight: '5px' }}
                                      >
                                        <DeleteIcon style={{ color: '#dc3545' }} />
                                      </Button>
                                    </Tooltip>
                                  )}
                                  {customCategory.length - 1 === idx && (
                                    <>
                                      {this.state.customCategory[idx].categoryName.trim() === 'Custom' ||
                                      this.state.customCategory[idx].categoryName.trim() == '' ? (
                                        <Tooltip title='Change Custom Name' arrow open>
                                          <Button disabled color='primary' onClick={this.handleAddCategory}>
                                            <AddIcon />
                                          </Button>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title='Add a custom Category' arrow>
                                          <Button color='primary' onClick={this.handleAddCategory}>
                                            <AddIcon />
                                          </Button>
                                        </Tooltip>
                                      )}
                                    </>
                                  )}
                                </Grid>
                              </Grid>
                              <Accordion elevation={0} key={`rows${idx}`} style={{ width: '100% !important' }}>
                                <AccordionSummary
                                  className={classes.AccordionSummary}
                                  style={{
                                    fontWeight: row.premiumRules.length > 0 ? 'bolder !important' : 'normal !important'
                                  }}
                                  expandIcon={<ExpandMoreIcon color='primary' />}
                                >
                                  {idx > -1 && (
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell style={{ width: '15%', padding: '4px' }}>
                                            {row.categoryName}
                                          </TableCell>
                                          <TableCell style={{ width: '25%', padding: '4px' }}>Premium Rule</TableCell>
                                          <TableCell style={{ width: '20%', padding: '4px' }}>
                                            Premium Amount(Per Member)
                                          </TableCell>
                                          <TableCell style={{ width: '20%', padding: '4px' }}>
                                            Applicable Head Count
                                          </TableCell>
                                          <TableCell style={{ width: '20%', padding: '4px' }} align='right'>
                                            Sum of Premium
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                    </Table>
                                  )}
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Table>
                                    <TableBody>
                                      <TableRow key={`row${idx}`} hover>
                                        <TableCell style={{ width: '15%', padding: '4px' }}>
                                          {row.categoryName}
                                        </TableCell>
                                        <TableCell style={{ width: '25%', padding: '4px' }}>
                                          {row.premiumRules.map((p: any, i: any) => (
                                            <HtmlTooltip
                                              key={p.name}
                                              disableHoverListener={false}
                                              disableFocusListener
                                              disableTouchListener
                                              title={
                                                <React.Fragment>
                                                  <Typography color='inherit'>{p.expression}</Typography>
                                                </React.Fragment>
                                              }
                                            >
                                              <div>
                                                <div key={p.name} className={classes.ruleContainer}>
                                                  <span className={classes.lineEllipsis}>{p.name}</span>
                                                  <span>
                                                    <IconButton
                                                      color='secondary'
                                                      aria-label='remove'
                                                      onClick={() => this.removePremuimRuleCustom(idx, i)}
                                                    >
                                                      <RemoveCircleIcon />
                                                    </IconButton>
                                                  </span>
                                                </div>
                                              </div>
                                            </HtmlTooltip>
                                          ))}
                                        </TableCell>
                                        <TableCell style={{ width: '20%', padding: '4px' }}>
                                          {row.premiumRules.map((p: any) => (
                                            <Typography key={p.name}>{p.premiumAmount}</Typography>
                                          ))}
                                        </TableCell>
                                        <TableCell style={{ width: '20%', padding: '4px' }}>
                                          <Box key={row.categoryName}>
                                            {quotationDetails.memberUploadStatus && <span>{row.headCount}</span>}
                                            {!quotationDetails.memberUploadStatus &&
                                              row.premiumRules.length > 0 &&
                                              !memberUpload && (
                                                <TextField
                                                  fullWidth
                                                  name='headCount'
                                                  value={row.headCount}
                                                  inputProps={{
                                                    style: { textAlign: 'right' },
                                                    readOnly: true
                                                  }}
                                                />
                                              )}
                                          </Box>
                                        </TableCell>
                                        <TableCell style={{ width: '20%', padding: '4px' }} align='right'>
                                          <div>{row?.premiumRules[0]?.sumOfPremium}</div>
                                        </TableCell>
                                        <TableCell style={{ padding: 0 }}>

                                        <ExpandMoreIcon color='primary' style={{ padding: '16px', opacity: 0 }} />
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </AccordionDetails>
                              </Accordion>
                            </TargetBox>
                          </Box>
                        )
                      })}
                    <Divider style={{ margin: '12px 0' }} />
                    <Grid container justifyContent='flex-end'>
                      {!(this.state.customCategory.length < 1) && isRetail && (
                        <Grid item>
                          <Button
                            color='secondary'
                            className='p-button-secondary'
                            onClick={this.handleSaveCustomCategory}
                            disabled={
                              !this.state.selectedPlan ||
                              this.state.customCategory.length < 1 ||
                              this.state.customCategory.some((item: any) =>
                                ['Custom', ''].includes(item.categoryName.trim())
                              )
                            }
                          >
                            Save Category
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                    <Divider style={{ margin: '12px 0' }} />
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell align='right' />
                          <TableCell align='center'>Total Premium</TableCell>
                          <TableCell align='right' />
                          <TableCell align='right' />
                          <TableCell align='right'>{totalPremium}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                  <Divider style={{ marginBottom: '12px' }} />

                  {/* <TextField
                    onChange={(e:any) => {
                      console.log(e.target.value);
                      this.setState({
                        ...this.state,
                        discount: e.target.value,
                      });
                      // this.calculatePremiumAfterLoadingAndDiscount(e.target.value);
                    }}
                    size="small"
                    type="number"
                    id="standard-basic"
                    name="discount"
                    value={this.state.discount}
                    // disabled={query2.get('mode') === 'view' ? true : false}
                    // onChange={(e:any) => {
                    //   console.log('eee', e.target.value);
                    //   this.setState({
                    //     ...this.state,
                    //     discount: e.target.value,
                    //   });
                    //   this.calculatePremiumAfterLoadingAndDiscount(this.state.loading, e.target.value);
                    // }}
                    InputProps={{
                      classes: {
                        root: classes.inputRoot,
                        disabled: classes.disabled,
                      },
                    }}
                    label="discount percentage (%)"
                  /> */}
                  {/* <Grid item xs={12}>
                    <table style={{ width: '100%' }}>
                      <tr style={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid item xs={12} sm={6} md={3}>
                     
                        </Grid>
                      </tr>
                      <tr style={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid style={{ display: 'flex', alignItems: 'center' }} item xs={3}>
                          <td>Discount</td>
                        </Grid>
                        <Grid item xs={6}>
                          <td>
                            <TextField
                              size='small'
                              type='number'
                              id='standard-basic'
                              name='discount'
                              defaultValue={quotationDetails.discount}
                              // value={this.state.discount}
                              // disabled={query2.get('mode') === 'view' ? true : false}
                              // onChange={this.handleChange}
                              onChange={(e: any) => {
                                const la = (Number(this.state.loading) / 100) * this.state.totalPremium
                                const da = (Number(e.target.value) / 100) * this.state.totalPremium
                                const at = this.state.totalPremium + la - da

                                this.setState({
                                  ...this.state,
                                  discount: e.target.value,
                                  totalPremiumAfterLoadingAndDiscount: at
                                })

                              }}
                              InputProps={{
                                classes: {
                                  root: classes.inputRoot,
                                  disabled: classes.disabled
                                }
                              }}
                              label='discount percentage(%)'
                            />
                          </td>
                        </Grid>
                        <Grid item xs={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <td>{(Number(this.state.discount) / 100) * totalPremium}</td>
                        </Grid>
                      </tr>
                      <tr style={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid style={{ display: 'flex', alignItems: 'center' }} item xs={3}>
                          <td>Loading</td>
                        </Grid>
                        <Grid item xs={6}>
                          <td>
                            <TextField
                              size='small'
                              type='number'
                              id='standard-basic'
                              defaultValue={quotationDetails.discount}
                              name='loading'
                              onChange={(e: any) => {
                                const da = (Number(this.state.discount) / 100) * this.state.totalPremium
                                const la = (Number(e.target.value) / 100) * this.state.totalPremium
                                const at = this.state.totalPremium + la - da

                                this.setState({
                                  ...this.state,
                                  loading: e.target.value,
                                  totalPremiumAfterLoadingAndDiscount: at
                                })

                              }}
                              label='loading percentage(%)'
                            />
                          </td>
                        </Grid>
                        <Grid item xs={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <td>{(Number(this.state.loading) / 100) * totalPremium}</td>
                        </Grid>
                      </tr>
                    </table>
                  </Grid> */}
<Grid container spacing={2}>
  <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
    <Typography>Discount</Typography>
  </Grid>
  <Grid item xs={6}>
    <TextField
      size="small"
      type="number"
      name="discount"
      defaultValue={quotationDetails.discount}
      onChange={(e: any) => {
        const la = (Number(this.state.loading) / 100) * this.state.totalPremium
        const da = (Number(e.target.value) / 100) * this.state.totalPremium
        const at = this.state.totalPremium + la - da
        this.setState({
          ...this.state,
          discount: e.target.value,
          totalPremiumAfterLoadingAndDiscount: at
        })
      }}
      label="Discount Percentage (%)"
    />
  </Grid>
  <Grid item xs={3} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
    <Typography>{(Number(this.state.discount) / 100) * totalPremium}</Typography>
  </Grid>

  {/* Loading row */}
  <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
    <Typography>Loading</Typography>
  </Grid>
  <Grid item xs={6}>
    <TextField
      size="small"
      type="number"
      name="loading"
      defaultValue={quotationDetails.loading}
      onChange={(e: any) => {
        const da = (Number(this.state.discount) / 100) * this.state.totalPremium
        const la = (Number(e.target.value) / 100) * this.state.totalPremium
        const at = this.state.totalPremium + la - da
        this.setState({
          ...this.state,
          loading: e.target.value,
          totalPremiumAfterLoadingAndDiscount: at
        })
      }}
      label="Loading Percentage (%)"
    />
  </Grid>
  <Grid item xs={3} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
    <Typography>{(Number(this.state.loading) / 100) * totalPremium}</Typography>
  </Grid>
</Grid>

                  <Divider style={{ marginBottom: '12px' }} />

                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell align='right' />
                        <TableCell align='center'>Total Premium After Discount</TableCell>
                        <TableCell align='right' />
                        <TableCell align='right' />
                        <TableCell align='right'>
                          {this.state.totalPremiumAfterLoadingAndDiscount ||
                            quotationDetails.totalAfterDicountAndLoadingAmount}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {/* </Grid> */}
                  <Divider style={{ marginBottom: '12px' }} />

                  <Grid item xs={12}>
                    {showMemberTable && (
                      <FettleDataGrid
                        $datasource={dataSourceMember$}
                        config={this.memberConfiguration}
                        columnsdefination={this.state.memberColDefn}
                      />
                    )}
                  </Grid>
                  <Divider style={{ margin: '12px 0' }} />

                  <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {localStorage.getItem('userType') != 'AGENT' && (
                      <Button color='Secondary' className='p-button-secondary' onClick={this.handleOpenAgentModal}>
                        Search Agent
                      </Button>
                    )}

                    <InvoiceAgentModal
                      agentsList={this.state.agentsList}
                      handleCloseAgentModal={this.handleCloseAgentModal}
                      openAgentModal={this.state.openAgentModal}
                      setAgentsList={this.setAgentsList}
                      handleAgentModalSubmit={this.handleAgentModalSubmit}
                    />
                  </Grid>
                  <Divider style={{ margin: '8px 0' }} />
                  <Grid item xs={12} style={{ marginTop: '10px' }}>
                    <Table size='small' aria-label='a dense table'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Agent name</TableCell>
                          <TableCell>Commission value</TableCell>
                          <TableCell align='right'>Final value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.agentsList.map((row: any, i: any) => {
                          return (
                            <TableRow key={row.agentId}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>
                                <TextField
                                  size='small'
                                  type='number'
                                  id='standard-basic'
                                  name='commission'
                                  value={row.commission}
                                  disabled={this.mode === 'view' ? true : false}
                                  onChange={(e: any) => {
                                    this.changeCommision(e, i)
                                  }}
                                  label='Commission value (%)'
                                  InputProps={{
                                    classes: {
                                      root: classes.inputRoot,
                                      disabled: classes.disabled
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell align='right'>
                                {(Number(row.commission) * Number(this.state.totalPremium)) / 100}
                              </TableCell>
                              {/* <TableCell align="right">{Number(row.finalValue).toFixed(2)}</TableCell> */}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </Grid>

                  <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title={!this.state.agentsList?.length ? 'Select Agent First' : ''}>
                      <span>
                        <Button
                          color='primary'
                          onClick={this.calculatePremium}
                          disabled={!this.state.agentsList?.length}
                        >
                          {buttonTxt}
                        </Button>
                      </span>
                    </Tooltip>
                  </Grid>
                  {quotationDetails.premiumCalculationStatus === 'COMPLETED' && (
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        color='primary'
                        onClick={this.uploadDiscountAndLoading}

                        // disabled={
                        //   quotationDetails.premiumCalculationStatus == 'INPROGRESS' ||
                        //   quotationDetails.memberUploadStatus !== 'COMPLETED' ||
                        //   (isRetail ? !isPlanSchemeSaved : false)
                        // }
                      >
                        Update discount and Loading
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DndProvider>
        <FileUploadDialogComponent
          open={this.state.openModal}
          closeModal={this.closeModal}
          addFile={this.state.addFile}
          changeFileStat={this.changeFileStat}
          onComplete={this.onComplete}
        />
        {this.state.openTemplate ? (
          <MemberTemplateModal
            closeTemplateModal={this.closeTemplateModal}
            openTemplate={this.state.openTemplate}
            apiList={this.state.apiList}
            quotationDetails={this.props.quotationDetails}

            // handleModalSubmit={handleModalSubmit}
          />
        ) : null}
        {/* <FettleRichTextEditor onChange={this.handleRTEChange} />
                <h3>Text to Drag/Drop</h3>
                <p draggable="true" onDragStart={this.onstart}>
                    UName
                </p>
                <p draggable="true" onDragStart={this.onstart}>
                    UAddress
                </p>
                <p draggable="true" onDragStart={this.onstart}>
                    UMobile
                </p> */}
      </div>
    )
  }
}

// export default withRouter(withStyles(styles)(QuotationDesignComponent));
export default withRouter(withTheme(withStyles(styles)(QuotationDesignComponent)))

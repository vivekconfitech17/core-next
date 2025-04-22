
import React from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import { Button } from 'primereact/button'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import Alert from '@mui/lab/Alert'
import { withStyles } from '@mui/styles'
import PropTypes from 'prop-types'

import { interval } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'

import { TabPanel, TabView } from 'primereact/tabview'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'

import RefreshIcon from '@mui/icons-material/Refresh'

import GetAppIcon from '@mui/icons-material/GetApp'

import { MemberProcessService, MemberService } from '@/services/remote-api/api/member-services'
import FileUploadDialogComponent from './file.upload.dialog'
import MemberTemplateModal from './member.template.dialog'

import { replaceAll, toTitleCase } from '@/services/utility'
import { MemberFieldConstants } from '@/views/apps/member-upload-management/MemberFieldConstants'
import { FettleDataGrid } from '@/views/apps/shared-component/components/fettle.data.grid'

const memberservice = new MemberService()
const memberProcessService = new MemberProcessService()

const BorderLinearProgress = withStyles((theme: any) => ({
  root: {
    height: 10,
    borderRadius: 5
  },
  colorPrimary: {
    backgroundColor: theme?.palette?.grey[theme.palette.type === 'light' ? 200 : 700]
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#1a90ff'
  }
}))(LinearProgressWithLabel)

function LinearProgressWithLabel(props: any) {
  return (
    <Box display='flex' alignItems='center'>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant='body2' color='textSecondary'>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  )
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired
}

const useStyles = (theme: any) => ({
  tableBg: {
    height: 400,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  categoryButton: {
    marginLeft: '5px',
    marginRight: '5px'
  }
})

const columnsDefinations = [
  {
    field: 'id',
    headerName: 'Request ID',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere' }}>{rowData.id}</span>
  },
  {
    field: 'fileName',
    headerName: 'File Name',
    body: (rowData: any) => <span style={{ lineBreak: 'anywhere' }}>{rowData.fileName}</span>
  },
  { field: 'totalRecords', headerName: 'Total Record Count' },
  { field: 'successfullyProcessedRecordCount', headerName: 'Success Record Count' },
  { field: 'unsuccessProcessedRecordCount', headerName: 'Unsuccess Record Count' },

  // {field: 'rowCreatedDate', headerName: 'Created Date' },
  { field: 'status', headerName: 'Status' }
]

const processStatusReq: any = {
  page: 0,
  size: 10,
  summary: true,
  active: true
}

const dataSource$ = () => {
  processStatusReq.sort = ['rowCreatedDate dsc']
  processStatusReq.sourceType = 'QUOTATION'
  processStatusReq.sourceId = localStorage.getItem('quotationId')

  const pid = localStorage.getItem('prospectID')

  // if (pageRequest.searchKey) {
  //   pageRequest['code'] = pageRequest.searchKey;
  //   pageRequest['type'] = pageRequest.searchKey;
  //   pageRequest['name'] = pageRequest.searchKey;
  //   pageRequest['contactNo'] = pageRequest.searchKey;
  // }
  // delete pageRequest.searchKey;
  return memberservice.getProcessStatus(pid, processStatusReq).pipe(
    map((data: any) => {
      const content = data.content

      const records = content.map((item: any) => {
        // item['rowCreatedDate'] = new Date(item.rowCreatedDate).toLocaleDateString();

        if (item.status === 'PENDING') {
          item['progressPercentage'] = 0
        }

        if (item.status === 'INPROGRESS') {
          if (item.steps) {
            item.steps.forEach((el: any) => {
              if (el.name === 'LOAD' && el.status === 'INPROGRESS') {
                item['progressPercentage'] = 0
              }

              if (el.name === 'LOAD' && el.status === 'COMPLETED') {
                item['progressPercentage'] = 33
              }

              if (el.name === 'VALIDATION' && el.status === 'COMPLETED') {
                item['progressPercentage'] = 66
              }
            })
          }
        }

        if (item.status === 'COMPLETED') {
          item['progressPercentage'] = 100
        }

        if (item.status === 'FAILED') {
          item['progressPercentage'] = 100
        }

        // item['progressPercentage'] = 70;

        // if(item.)
        return item
      })

      data.content = records

      return data
    })
  )
}

const memberPageRequest = {
  page: 0,
  size: 10,
  summary: true,
  active: true
}

const dataSourceMember$ = (
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

class MemberUploadComponent extends React.Component<any, any> {
  actionBtnList: any
  configuration: any
  memberConfiguration: any
  constructor(props: any) {
    super(props)
    let downloadString = 'Download Template'
    // const query = new URLSearchParams(this.props.location.search)
    
    const query = this.props.query;

    // if (query.get('policyId')) {
    //   downloadString = 'Download Renewal Template';
    // } else if (props.quotationDetails) {
    //   if (props.quotationDetails.renewalPolicyId) {
    //     downloadString = 'Download Renewal Template';
    //   } else {
    //     downloadString = 'Download Template';
    //   }
    // }

    if (query.get('policyId')) {
      downloadString = 'Download Renewal Template'
    } else if (query.get('type') == 'renewal') {
      downloadString = 'Download Renewal Template'
    } else {
      downloadString = 'Download Template'
    }

    this.state = {
      openTemplate: false,
      openModal: false,
      showProgress: false,
      progressValue: 0,
      apiList: [],
      addFile: false,
      memberUpload: null,
      tabValue: 0,
      memberColDefn: [],
      openSnackbar: false,
      snackbarMsg: '',
      dowmloadTemplateString: downloadString,
      renewalPolicyId: query.get('policyId') ? query.get('policyId') : '',
      activeTabIndex: 0,
      reloadTable: false
    }

    this.actionBtnList = [
      {
        icon: 'pi pi-download',
        className: 'ui-button-warning',
        onClick: this.openReportSection
      },
      {
        icon: 'pi pi-file-excel',
        className: 'action-btn',
        onClick: this.downloadSourceFile
      },
      {
        icon: 'pi pi-align-justify',
        onClick: this.handleProgressStat
      }
    ]

    this.configuration = {
      enableSelection: false,
      scrollHeight: '300px',
      pageSize: 10,
      progressColumn: false,
      autoRefreshInterval: 5000,
      autoRefresh: true,
      actionButtons: this.actionBtnList,
      header: {
        enable: true,
        text: 'Process List'
      }
    }
    this.memberConfiguration = {
      enableSelection: false,
      scrollHeight: '300px',
      pageSize: 10,
      actionButtons: false,
      header: {
        enable: true,
        text: 'Member Management'
      }
    }
    this.getMemberConfiguration()
  }

  handleTabChange = (index: any) => {
    this.setState({ activeTabIndex: index })
  }

  getAPIDetails = (sourceid: any) => {
    return memberservice.getSourceDetails(sourceid).subscribe(res => {
      this.setState({
        ...this.state,
        apiList: [...this.state.apiList, res]
      })
    })
  }

  openTemplateModal = () => {
    this.setState({
      ...this.state,
      openTemplate: true
    })
  }

  closeTemplateModal = () => {
    this.setState({
      ...this.state,
      openTemplate: false
    })
  }

  doOpenModal = () => {
    this.setState({
      ...this.state,
      openModal: true
    })
  }

  doCloseModal = () => {
    this.setState({
      ...this.state,
      openModal: false
    })
  }

  openReportSection = (val: any) => {
    memberservice.downloadReport(val.id, 'report').subscribe(res => {
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
      dom?.parentNode?.removeChild(dom)
      window.URL.revokeObjectURL(url)
    })
  }

  // openReportSection = val => {
  //   memberservice.downloadReport(val.id, 'report').subscribe(res => {
  //     const { data, headers } = res;
  //     const fileName = headers['content-disposition'].replace(/\w+; filename=(.*)/, '$1');
  //     const blob = new Blob([data], { type: headers['content-type'] });
  //     let dom = document.createElement('a');
  //     let url = window.URL.createObjectURL(blob);
  //     dom.href = url;
  //     dom.download = decodeURI(fileName);
  //     dom.style.display = 'none';
  //     document.body.appendChild(dom);
  //     dom.click();
  //     dom.parentNode.removeChild(dom);
  //     window.URL.revokeObjectURL(url);
  //   });
  // };

  downloadSourceFile = (val: any) => {
    memberservice.downloadReport(val.id, 'source_file').subscribe(res => {
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
    })
  }

  handleProgressStat = (process: any) => {
    memberservice.getProcessStat(process.id).subscribe(res => {
      if (res.status === 'INPROGRESS') {
        const subscriber = interval(5000)
          .pipe(
            take(100),
            switchMap(i => memberservice.getProcessStat(process.id))
          )
          .subscribe((el: any) => {
            if (el.status === 'INPROGRESS') {
              const progressvalue = this.getProgressValue(el)

              this.setState({
                ...this.state,
                progressValue: progressvalue,
                showProgress: true
              })
            } else {
              if (el.status === 'COMPLETED') {
                this.setState({
                  ...this.state,
                  progressValue: 100
                })
              }

              subscriber.unsubscribe()
            }
          })
      } else {
        const progressvalue = this.getProgressValue(res)

        this.setState({
          ...this.state,
          progressValue: progressvalue,
          showProgress: true
        })
      }
    })
  }

  getProgressValue = (item: any) => {
    if (item.status === 'PENDING') {
      return 0
    }

    if (item.status === 'INPROGRESS') {
      if (item.steps) {
        item.steps.forEach((el: any) => {
          if (el.name === 'LOAD' && el.status === 'INPROGRESS') {
            return 0
          }

          if (el.name === 'LOAD' && el.status === 'COMPLETED') {
            return 33
          }

          if (el.name === 'VALIDATION' && el.status === 'COMPLETED') {
            return 66
          }
        })
      }
    }

    if (item.status === 'COMPLETED') {
      return 100
    }

    // if (item.status === 'FAILED') {
    //   return 100;

    // }
  }

  changeFileStat = () => {
    this.setState({
      ...this.state,
      addFile: true
    })
  }

  onComplete = () => {
    this.toggleSnackbar(true, 'success', 'File uploaded successfully. Please wait for sometime to process.')
    this.props.getQuoationDetailsByID()
    this.setState({ memberUpload: true })
    setTimeout(() => {
      this.setState({ reloadTable: true })
    }, 3000)
    setTimeout(() => {
      this.setState({ reloadTable: false })
    }, 1000)
  }

  // navigateToList = () => {
  //   this.props.router.push(`/quotations?mode=viewList`);
  // };

  // handleTabChange = (e, newValue) => {
  //   if (newValue === 1) {
  //     memberPageRequest.value2 = localStorage.getItem('quotationId');
  //     this.setState({
  //       ...this.state,
  //       tabValue: newValue,
  //     });
  //     return;
  //   }
  //   this.setState({
  //     ...this.state,
  //     tabValue: newValue,
  //   });
  // };

  getMemberConfiguration = () => {
    memberservice.getMemberConfiguration().subscribe(res => {
      if (res.content && res.content.length > 0) {
        const colDef: any = res.content[0].fields.map((r: any) => {
          const obj: any = {
            field: MemberFieldConstants[r.name.toUpperCase() as keyof typeof MemberFieldConstants],
            headerName: toTitleCase(replaceAll(r.name, '_', ' '))
          }

          if (r.name == 'DATE_OF_BIRTH') {
            obj.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{new Date(rowData.dateOfBirth).toLocaleDateString()}</span>
            }
          }

          if (r.name == 'MEMBERSHIP_NO') {
            obj.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{rowData.membershipNo}</span>
            }
          }

          if (r.name == 'MOBILE_NO') {
            obj.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{rowData.mobileNo}</span>
            }
          }

          if (r.name == 'EMAIL') {
            obj.body = (rowData: any) => {
              return <span style={{ lineBreak: 'anywhere' }}>{rowData.email}</span>
            }
          }

          return obj
        })

        this.setState({
          ...this.state,
          memberColDefn: colDef
        })
        res.content[0].fields.forEach((el: any) => {
          if (el.sourceApiId) {
            this.getAPIDetails(el.sourceApiId)
          }
        })
      }
    })
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

  render() {
    const { classes } = this.props

    const {
      showProgress,
      progressValue,
      tabValue,
      openSnackbar,
      alertType,
      snackbarMsg,
      dowmloadTemplateString,
      activeTabIndex,
      reloadTable
    } = this.state

    return (
      <div>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => this.toggleSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => this.toggleSnackbar(false)} severity={alertType} variant='filled'>
            {snackbarMsg}
          </Alert>
        </Snackbar>
        <Grid container justifyContent='flex-end'>
          <Grid item container justifyContent='flex-end' style={{ padding: '10px 0' }}>
            <Button
              className='ml-2 mt-2 p-button-secondary'
              size='small'
              color='secondary'
              onClick={this.openTemplateModal}
              icon={<GetAppIcon />}
            >
              {dowmloadTemplateString}
            </Button>
            <Button
              className='ml-2 mt-2'
              size='small'
              color='primary'
              onClick={this.doOpenModal}
              icon={<CloudUploadIcon />}
            >
              Member Upload
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent='flex-end'>
          <Grid item container justifyContent='flex-end' style={{ padding: '10px 0' }}>
            <Button
              className='ml-2 mt-2'
              size='small'
              color='primary'
              onClick={() => {
                this.setState({ reloadTable: true })

                setTimeout(() => {
                  this.setState({ reloadTable: false })
                }, 1000)
              }}
              icon={<RefreshIcon />}
            >
              Reload Table
            </Button>
          </Grid>
        </Grid>
        <TabView
          activeIndex={activeTabIndex}
          onTabChange={e => this.handleTabChange(e.index)}
          scrollable
          style={{ fontSize: '14px' }}
        >
          <TabPanel leftIcon='pi pi-user mr-2' header='Process Status'>
            <FettleDataGrid
              $datasource={dataSource$}
              columnsdefination={columnsDefinations}
              onEdit={this.openReportSection}
              config={this.configuration}
            />
          </TabPanel>
          <TabPanel leftIcon='pi pi-user-minus mr-2' header='Uploaded Member'>
            <FettleDataGrid
              reloadtable={reloadTable}
              $datasource={dataSourceMember$}
              config={this.memberConfiguration}
              columnsdefination={this.state.memberColDefn}
            />
          </TabPanel>
        </TabView>

        {showProgress && (
          <>
            <h5 style={{ marginTop: '10px' }}>Progress Status</h5>
            <BorderLinearProgress value={progressValue} />
          </>
        )}

        <FileUploadDialogComponent
          open={this.state.openModal}
          closeModal={this.doCloseModal}
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
            renewalPolicyId={this.state.renewalPolicyId}

            // handleModalSubmit={handleModalSubmit}
          />
        ) : null}
      </div>
    )
  }
}
export default withRouter(withStyles(useStyles)(MemberUploadComponent))

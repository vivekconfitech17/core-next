
import React, { useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { forkJoin } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { PreAuthService } from '@/services/remote-api/api/claims-services/claim.preauth.services'
import { MemberService } from '@/services/remote-api/api/member-services'
import { ProvidersService } from '@/services/remote-api/api/provider-services'

import CanellationModal from '../modal/in-hospital/cancellation.modal'
import DischargeUpdationModal from '../modal/in-hospital/discharge.updation.modal'
import HospitalVisitUpdationModal from '../modal/in-hospital/hospital.visit.updation.modal'
import PreAuthTimeLineModal from '../../claim-preauth/modals/preauth.timeline.modal.component'

import { FettleDataGrid } from '@/views/apps/shared-component/components/fettle.data.grid'

const preAuthService = new PreAuthService()
const providersService = new ProvidersService()
const memberService = new MemberService()

const docTempalte = {
  documentType: '',
  docFormat: '',
  documentName: '',
  documentOriginalName: ''
}

const useStyles = makeStyles(theme => ({
  tableBg: {
    height: 400,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  agentListButton: {
    marginLeft: '5px'
  },
  header: {
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '10px 10px 0px 0px',
    background: '#0edb8a',
    padding: 20,
    borderBottom: 'none'
  },
  headerText: {
    fontSize: '16px',
    fontWeight: 'Bold',
    color: '#002776'
  }
}))

function withRouter(Component: any) {
  return function WrappedComponent(props: any) {
    const router = useRouter()

    return <Component {...props} router={router} />
  }
}

const PatientListCompoent = () => {
  const [dishargeUpdationModal, setDishargeUpdationModal] = React.useState(false)
  const [hospitaVisitUpdation, setHospitaVisitUpdation] = React.useState(false)
  const [cancellationModal, setCancellationModal] = React.useState(false)
  const [preAuthId, setPreAuthId] = React.useState('')
  const [memberShipNo, setMemberShipNo] = React.useState()
  const [benefitsWithCost, setBenefitSWithCost] = React.useState([])
  const [selectedPreAuth, setSelectedPreAuth] = React.useState({})
  const [openTimeLineModal, setOpenTimeLineModal] = React.useState(false)
  const [providers, setProviders] = useState<any>()
  const id: any = useParams().id
  const toast: any = useRef(null)

  useEffect(() => {
    const subscription = providersService
      .getProviders({ page: 0, size: 1000, summary: true, active: true, sort: ['rowCreatedDate dsc'] })
      .subscribe((result: any) => {
        setProviders(result.content)
      })

    return () => subscription.unsubscribe()
  }, [])

  const [documentList, setDocumentList] = React.useState([{ ...docTempalte }])

  const classes = useStyles()

  const handleDischargeUpdate = (rowData: any) => {
    const { id, memberShipNo } = rowData
    const benefitsWCost = rowData.benefitsWithCost

    setBenefitSWithCost(benefitsWCost)
    setDishargeUpdationModal(true)
    setPreAuthId(id)
    setMemberShipNo(memberShipNo)
  }

  const handleCloseDischargeModal = () => {
    setDishargeUpdationModal(false)
  }

  const handleHospitalVisitUpdate = (rowData: any) => {
    const { id, memberShipNo } = rowData
    const benefitsWCost = rowData.benefitsWithCost

    setBenefitSWithCost(benefitsWCost)
    setHospitaVisitUpdation(true)
    setPreAuthId(id)
    setMemberShipNo(memberShipNo)
  }

  const handleCloseHospitalVisitUpdateModal = () => {
    setHospitaVisitUpdation(false)
  }

  const handleCancellationModal = (rowData: any) => {
    const { id, memberShipNo } = rowData
    const benefitsWCost = rowData.benefitsWithCost

    setBenefitSWithCost(benefitsWCost)
    setCancellationModal(true)
    setPreAuthId(id)
    setMemberShipNo(memberShipNo)
  }

  const handleCloseCancellationModal = () => {
    setCancellationModal(false)
  }

  const openEditSection = () => {
    handleCloseDischargeModal()
  }

  const statusApi: any = {
    today: 'TODAY',
    thisweek: 'THIS_WEEK',
    thismonth: 'THIS_MONTH',
    thisyear: 'THIS_YEAR'
  }

  const dataSource3$: any = (
    pageRequest: any = {
      page: 0,
      size: 10
    }
  ) => {
    pageRequest.sort = ['rowCreatedDate dsc']
    pageRequest['hospitalizationStatus'] = 'IN_HOSPITAL'
    pageRequest['durationType'] = statusApi[id]

    // Fetch the provider list first
    return providersService.getProviders().pipe(
      switchMap(providerResponse => {
        return preAuthService.getCaseStatusList(pageRequest).pipe(
          switchMap(data => {
            const detailObservables = data.content.map(item => {
              const { memberShipNo, providers } = item

              const providerName = (id: any) =>
                providerResponse.content.find(prov => prov.id == id)?.providerBasicDetails.name || ''

              item['providers'] = providers.map((item: any) => ({
                ...item,
                providerName: providerName(item.providerId)
              }))

              const pageRequest = {
                page: 0,
                size: 10,
                summary: true,
                active: true,
                key: 'MEMBERSHIP_NO',
                value: memberShipNo
              }

              const memberDetails$ = memberService.getMember(pageRequest)

              return forkJoin({ memberDetails$ }).pipe(
                map(({ memberDetails$ }) => {
                  return {
                    memberShipName: memberDetails$?.content[0]?.name || 'Not available'
                  }
                })
              )
            })

            return forkJoin(detailObservables).pipe(
              map(details => {
                // data.content = data?.content.map((item, index) => {
                //   return {
                //     ['serial']: index + 1,
                //     ['memberDetails']: (
                //       <MemberDetails
                //         preAuthId={item.id}
                //         memberShipNo={item.memberShipNo}
                //         memberShipName={details[index].memberShipName}
                //         doa={item.expectedDOA}
                //         dod={item.expectedDOD}
                //         providers={item.providers
                //           .map((item, index) => (item.providerName ? `${index + 1}. ${item.providerName}` : 'Not Available'))
                //           .join('<br>')}
                //       />
                //     ),
                //     ['accounts']: <AccountGrid benefitsWithCost={item.benefitsWithCost} />,
                //     ['diagnosis']: (
                //       <DiagnosisGrid
                //         diagnosis={'CARCINOMA IN SITU OF ORAL CAVITY AND STOMACH[$42.33]'}
                //         procedure={'MEDICAL NUTRITION THERAPY'}
                //       />
                //     ),
                //   };
                // });
                return data
              })
            )
          })
        )
      })
    )
  }

  const openTimeLine = (preAuth: any) => {
    setSelectedPreAuth(preAuth)
    setOpenTimeLineModal(true)
  }

  const handleCloseTimeLineModal = () => {
    setOpenTimeLineModal(false)
  }

  const xlsColumns = [
    'id',
    'memberShipNo',
    'memberName',
    'policyNumber',
    'admissionDate',
    'dischargeDate',
    'benefitWithCost'
  ]

  const userType = localStorage.getItem('userType')

  const configuration: any = {
    enableSelection: false,
    scrollHeight: '300px',
    rowExpand: true,
    pageSize: 10,
    actionButtons:
      userType === 'TPA'
        ? ''
        : [
            {
              icon: 'pi pi-user-minus',
              className: 'ui-button-warning',
              tooltip: 'Discharged',
              onClick: handleDischargeUpdate
            },
            {
              icon: 'pi pi-user',
              className: classes.agentListButton,
              tooltip: 'Not Discharged',
              onClick: handleHospitalVisitUpdate
            },
            {
              icon: 'pi pi-times-circle',
              className: classes.agentListButton,
              tooltip: 'Cancel',
              onClick: handleCancellationModal
            },
            {
              key: 'timeleine_preauth',
              icon: 'pi pi-calendar-times',
              onClick: openTimeLine,
              tooltip: 'Timeline'
            }
          ],
    header: {
      enable: true,
      enableDownload: true,
      downloadbleColumns: xlsColumns,
      enableGlobalSearch: false,
      selectionMenuButtonText: 'Action'
    }
  }

  const renderBenefitWithCost = (rowData: any) => {
    const length = rowData?.benefitsWithCost?.length

    const totalAmount = rowData.benefitsWithCost.reduce((acc: any, curr: any) => acc + curr.estimatedCost, 0)

    const benefitsWithCost = rowData.benefitsWithCost?.map((ben: any, index: number) => {
      const provider = providers?.find((p: any) => p?.id === ben?.providerId)

      return (
        <li key={`${ben?.providerId}-${ben?.benefitId}-${index}`}>
          {provider?.providerBasicDetails?.name} | {ben.benefitName} | {ben.iname} | {ben.diagnosisName} :
          <b>{ben.estimatedCost}</b>
        </li>
      )
    })

    return <p>{benefitsWithCost}</p>
  }

  const columnsDefinations = [
    { field: 'id', headerName: 'Claim No.' },
    { field: 'memberShipNo', headerName: 'Membership No.', expand: true },
    { field: 'memberName', headerName: 'Name' },
    { field: 'policyNumber', headerName: 'Policy No.', expand: true },
    {
      field: 'admissionDate',
      headerName: 'Admission Date',
      expand: true,
      body: (rowData: any) => <p>{new Date(rowData.expectedDOA).toLocaleDateString()}</p>
    },
    {
      field: 'dischargeDate',
      headerName: 'Discharge Date',
      expand: true,
      body: (rowData: any) => <p>{new Date(rowData.expectedDOD).toLocaleDateString()}</p>
    },
    {
      field: 'benefitWithCost',
      headerName: 'Estimated Cost',
      body: (rowData: any) => (
        <p style={{ width: '250px', whiteSpace: 'break-spaces' }}>{renderBenefitWithCost(rowData)}</p>
      )
    }

    // { field: 'serial', headerName: 'Sl.', style: { width: '4rem' } },
    // { field: 'memberDetails', headerName: 'MEMBER DETAILS' },
    // { field: 'accounts', headerName: 'ACCOUNTS' },
    // { field: 'diagnosis', headerName: 'DIAGNOSIS' },
  ]

  const admissionUpdationModalSubmit = (values: any) => {
    handleCloseDischargeModal()
    handleCloseHospitalVisitUpdateModal()
    handleCloseCancellationModal()

    const payload: any = {
      memberShipNo: memberShipNo,
      preauthId: preAuthId,
      ...values
    }

    preAuthService.admissionUpdate(preAuthId, payload).subscribe(res => {
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content Updated', life: 2000 })
    })

    const reader = new FileReader()
    const readers = new FileReader()

    readers.onload = function () {
      const list: any = [...documentList]

      list['documentOriginalName'] = payload?.feedbackForm?.name
      setDocumentList(list)
      const formData = new FormData()

      formData.append('docType', 'FEEDBACK_FORM')
      formData.append('filePart', payload?.feedbackForm)
      preAuthService.downloadDischargeDocs(preAuthId, formData).subscribe(response => {
        // list[0]['documentName']=response.get('id');
        // list[1]['docFormat']=response.get('docFormat');
        // setDocumentList(list);
      })
    }

    reader.onload = function () {
      const list: any = [...documentList]

      list['documentOriginalName'] = payload?.dischargeCertificate?.name
      setDocumentList(list)
      const formData = new FormData()

      formData.append('docType', 'DISCHARGE_CERTIFICATE')
      formData.append('filePart', payload?.dischargeCertificate)
      preAuthService.downloadDischargeDocs(preAuthId, formData).subscribe(response => {
        // list[0]['documentName']=response.get('id');
        // list[1]['docFormat']=response.get('docFormat');
        // setDocumentList(list);
      })
    }

    reader.readAsDataURL(payload?.dischargeCertificate)
    readers.readAsDataURL(payload?.feedbackForm)
  }

  return (
    <div style={{ backgroundColor: 'var(--surface-f)' }}>
      <Typography style={{ fontSize: '16px', padding: '16px' }}>In Hospital</Typography>
      <DischargeUpdationModal
        data={{ estimatedAmount: 12000, sanctionAmount: 12000 }}
        dishargeUpdationModal={dishargeUpdationModal}
        handleCloseClaimModal={handleCloseDischargeModal}
        admissionUpdationModalSubmit={admissionUpdationModalSubmit}
      />
      <HospitalVisitUpdationModal
        data={{ estimatedAmount: 12000, sanctionAmount: 12000 }}
        admissionUpdationModal={hospitaVisitUpdation}
        preAuthId={preAuthId}
        handleCloseClaimModal={handleCloseHospitalVisitUpdateModal}
        admissionUpdationModalSubmit={admissionUpdationModalSubmit}
      />
      <CanellationModal
        data={{ estimatedAmount: 12000, sanctionAmount: 12000 }}
        admissionUpdationModal={cancellationModal}
        handleCloseClaimModal={handleCloseCancellationModal}
        admissionUpdationModalSubmit={admissionUpdationModalSubmit}
      />
      <FettleDataGrid $datasource={dataSource3$} config={configuration} columnsdefination={columnsDefinations} />
      <PreAuthTimeLineModal preAuth={selectedPreAuth} open={openTimeLineModal} onClose={handleCloseTimeLineModal} />
    </div>
  )
}

export default withRouter(PatientListCompoent)

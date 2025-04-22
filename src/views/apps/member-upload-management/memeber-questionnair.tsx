import React, { useEffect, useState } from 'react'

import { ToggleButton, ToggleButtonGroup } from '@mui/lab'

import { Toast } from 'primereact/toast'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { MemberService } from '@/services/remote-api/api/member-services/member.services'
import { QuestionnaireService } from '@/services/remote-api/api/master-services/questionnaire.service'

const questionnaireService = new QuestionnaireService()
const memberservice = new MemberService()

const MemberQuestionnair = ({ memberData }: { memberData: any }) => {
  const [questionnaires, setQuestionnairs] = useState([])
  const [answers, setAnswers] = useState({})
  const toast: any = React.useRef(null)

  const handleToggle = (id: any, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const dataSource$: any = (pageRequest: any) => {
    pageRequest.age = memberData.age
    pageRequest.gender = memberData.gender

    return questionnaireService.getMemberQuestionnaireList(pageRequest)
  }

  const saveQuestionnair = () => {
    if (Object.entries(answers).length < 1) {
      toast.current.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please answer at least one question!!',
        life: 3000
      })

      return
    }

    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer: answer === 'yes' ? true : false
    }))

    memberservice.saveMemberQuestionnair(payload, memberData.id).subscribe({
      next: response => {
        console.log('Save successful', response)
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Answers Updated Successfully!!',
          life: 3000
        })
      },
      error: error => {
        console.error('Save failed', error)
        toast.current.show({
          severity: 'error',
          summary: 'Failed',
          detail: 'Something went wrong!!',
          life: 3000
        })
      }
    })
  }

  useEffect(() => {
    dataSource$().subscribe((pageData: any) => setQuestionnairs(pageData))

    memberservice.getMemberQuestionnair(memberData.id).subscribe((savedAnswers: any) => {
      const mappedAnswers = savedAnswers.reduce(
        (acc: any, { questionId, answer }: { questionId: any; answer: any }) => {
          acc[questionId] = answer ? 'yes' : 'no'

          return acc
        },
        {}
      )

      setAnswers(mappedAnswers)
    })
  }, [memberData.id])

  return (
    <>
      <Toast ref={toast} />
      <Grid container>
        {questionnaires.map(({ id, question }) => (
          <Grid item xs={12} sm={6} md={3} key={id}>
            <Typography variant='h6'>{question}</Typography>
            <ToggleButtonGroup
              color='primary'
              value={answers[id] || ''}
              exclusive
              onChange={(e, value) => handleToggle(id, value)}
              aria-label={`question-${id}`}
            >
              <ToggleButton size='small' value='yes' aria-label='yes'>
                Yes
              </ToggleButton>
              <ToggleButton size='small' value='no' aria-label='no'>
                No
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        ))}
        <Grid item xs={12} container style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button color='secondary' onClick={() => saveQuestionnair()}>
            Save
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default MemberQuestionnair

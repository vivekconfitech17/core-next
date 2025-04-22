'use client'
import React, { useEffect } from 'react'

import { Snackbar } from '@mui/material'
import Grid from '@mui/material/Grid'
import { makeStyles } from '@mui/styles'
import MuiAlert from '@mui/lab/Alert'

import { Button } from 'primereact/button'

import ConfirmationDialogComponent from './modals/confirmation.dialog.component'
import EmployeeAddModal from './modals/employee.add.modal.component'
import EmployeeListModal from './modals/employee.list.modal.component'
import PositionAddModal from './modals/position.add.modal.component'

import { TreeViewComponent } from './treeview'
import { UsersService } from '@/services/remote-api/api/user-management-service/users.service'
import { HierarchyService } from '@/services/remote-api/api/hierarchy-services/hierarchy.services'
import { AgentsService } from '@/services/remote-api/api/agents-services/agents.services'

function Alert(props: any) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const usersService = new UsersService()
const usersService$ = usersService.getUsers()
const orgtypeservice = new HierarchyService()
const agentsService = new AgentsService()
const ot$ = orgtypeservice.getSampleData()

const useStyles = makeStyles((theme: any) => ({
  root: {
    width: '100%',
    flexGrow: 1,
    minHeight: 100,
    padding: 30
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#4472C4'
  },
  heading: {
    fontSize: theme?.typography?.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme?.typography?.pxToRem(15),
    color: theme?.palette?.text?.secondary
  }
}))

export default function AgentHierarchyComponent(props: any) {
  const classes = useStyles()
  const [hierarchyData, setHierarchyData] = React.useState([])
  const [confirmModal, setConfirmModal] = React.useState(false)
  const [employeeModal, setEmployeeModal] = React.useState(false)
  const [positionModal, setPositionModal] = React.useState(false)
  const [employeelistmodal, setEmployeelistmodal] = React.useState(false)
  const [selectedUsersList, setSelectedUsersList] = React.useState([])
  const [selectedEmployee, setSelectedEmployee] = React.useState({})
  const [selectedNode, setSelectedNode] = React.useState({})
  const [orgTypes, setOrgTypes] = React.useState([])
  const [userList, setUsersList] = React.useState([])
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((res: any) => {
        const uList: any = []

        res.forEach((usr: any, i: any) => {
          const fname = usr.firstName ? usr.firstName : ''
          const lname = usr.lastName ? usr.lastName : ''

          const obj = {
            type: 'USER',
            id: usr.userName,
            username: usr.userName,
            name: fname + ' ' + lname
          }

          uList.push(obj)
        })

        const pageRequest: any = {
          page: 0,
          size: 10,
          summary: true,
          active: true,
          sort: ['']
        }

        agentsService.getAgents(pageRequest).subscribe(agentlist => {
          const agList: any = []

          agentlist.content.forEach(ag => {
            const obj = {
              type: 'AGENT',
              id: ag.id,
              username: ag.agentBasicDetails.name
            }

            agList.push(obj)
          })

          const arr = [...uList, ...agList]

          setter(arr)
          orgtypeservice.getSampleData().subscribe(result => {
            const arrval = formatDta(result, arr)

            setHierarchyData(arrval)
          })
        })
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(usersService$, setUsersList)

  // useObservable(ot$, setOrgTypes);
  const formatDta = (data: any, userArray: any) => {
    data &&
      data.forEach((dt: any) => {
        dt['child'] = dt.childPositions

        if (dt?.user?.userId) {
          userArray &&
            userArray.forEach((usr: any) => {
              if (usr?.id === dt?.user?.userId) {
                dt['employeeList'] = [{ id: usr?.id, name: usr?.username }]
                dt['expression'] = usr?.username
              }
            })
        }

        if (dt?.childPositions?.length !== 0) {
          formatDta(dt?.childPositions, userArray)
        }
      })

    return data
  }

  const addParentPosition = () => {
    setSelectedNode({})
    setPositionModal(true)
  }

  const addPosition = (item: any) => {
    if (item !== null) {
      setSelectedNode(item)
      setPositionModal(true)
    }

    if (item === null) {
      setSnackbarMessage(
        'Position not selected properly.Please left click on the desired position name and then right click for action'
      )
      setSnackbarOpen(true)
    }
  }

  const deletePosition = (item: any) => {
    if (item !== null) {
      setSelectedNode(item)

      if (item.childPositions.length === 0) {
        setConfirmModal(true)
      }

      if (item.childPositions.length !== 0) {
        setSnackbarMessage('Cannot be deleted,this position has child positions.Please delete them first')
        setSnackbarOpen(true)
      }
    }

    if (item === null) {
      setSnackbarMessage(
        'Position not selected properly.Please left click on the desired position name and then right click for action'
      )
      setSnackbarOpen(true)
    }
  }

  const addEmployee = (item: any) => {
    if (item !== null) {
      setSelectedNode(item)
      setEmployeeModal(true)
    }

    if (item === null) {
      setSnackbarMessage(
        'Position not selected properly.Please left click on the desired position name and then right click for action'
      )
      setSnackbarOpen(true)
    }
  }

  const closePositionModal = () => {
    setPositionModal(false)
    setSelectedNode({})
  }

  const closeEmployeeModal = () => {
    setEmployeeModal(false)
    setSelectedNode({})
  }

  const confirmYes = (item: any) => {
    setConfirmModal(false)

    orgtypeservice.deletePosition(item.id).subscribe(res => {
      getHierarchyData()
    })
  }

  const confirmNo = () => {
    setConfirmModal(false)
  }

  const getHierarchyData = () => {
    orgtypeservice.getSampleData().subscribe(result => {
      const arrval = formatDta(result, userList)

      setHierarchyData(arrval)
    })
  }

  const submitPositionModal = () => {
    getHierarchyData()

    // let randomId = Math.random();
    // let posVal = {
    //     id: randomId,
    //     name: item,
    //     expression: "",
    //     child: [],
    //     employeeList: [],
    // }

    // let resultarr = calcPosData(hierarchyData, selectedNode, posVal)

    setPositionModal(false)
  }

  const submitEmployeeModal = () => {
    getHierarchyData()
    setEmployeeModal(false)
  }

  const closeEmployeeListModal = () => {
    setEmployeelistmodal(false)
  }

  const showEmployeeList = (empList: any) => {
    setSelectedUsersList(empList)
    setEmployeelistmodal(true)
  }

  const calcPosData = (list: any, selectedData: any, val: any) => {
    if (selectedData) {
      list.forEach((el: any) => {
        if (el.id === selectedData.id) {
          el.child.push(val)

          return list
        } else calcPosData(el.child, selectedData, val)
      })
    }
  }

  const calcEmpData = (list: any, selectedData: any, val: any) => {
    if (selectedData) {
      list.forEach((el: any) => {
        if (el.id === selectedData.id) {
          // el.employeeList.push(val);
          el.employeeList[0] = val
          const arrlen = el.employeeList.length

          el.expression = val?.name

          return list
        } else calcEmpData(el.child, selectedData, val)
      })
    }
  }

  return (
    <div>
      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '20px',
          height: '2em',
          color: '#000',
          fontSize: '18px',
          fontWeight: 600
        }}
      >
        <span
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          Intermediary Hierarchy
        </span>
      </Grid>
      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '20px'
        }}
      >
        <Button color='secondary' className='p-button-secondary' onClick={addParentPosition}>
          Add parent Position
        </Button>
      </Grid>
      <div style={{ width: '400px' }}>
        <TreeViewComponent
          deleteAction={true}
          deletePosition={deletePosition}
          hierarchy={hierarchyData}
          addPosition={addPosition}
          addEmployee={addEmployee}
          showListView={showEmployeeList}
          activateRgtClck={true}
        />
      </div>
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
      <PositionAddModal
        closePositionModal={closePositionModal}
        positionModal={positionModal}
        submitPositionModal={submitPositionModal}
        selectedNode={selectedNode}
        type='AGENT'
      />
      <EmployeeAddModal
        closeEmployeeModal={closeEmployeeModal}
        employeeModal={employeeModal}
        submitEmployeeModal={submitEmployeeModal}
        headerText='Add Agent'
        selectedNode={selectedNode}
        userList={userList}
      />
      <ConfirmationDialogComponent
        confirmNo={confirmNo}
        confirmModal={confirmModal}
        confirmYes={confirmYes}
        headerText='Confirmation'
        selectedNode={selectedNode}
      />

      <EmployeeListModal
        employeelistmodal={employeelistmodal}
        closeEmployeeListModal={closeEmployeeListModal}
        selectedUsersList={selectedUsersList}
      />
    </div>
  )
}

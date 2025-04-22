'use client'
import React, { useEffect, useState } from 'react'

import { Select, MenuItem } from '@mui/material'
import { makeStyles } from '@mui/styles'

import { GroupTypeService } from '@/services/remote-api/api/master-services'
import { UsersService } from '@/services/remote-api/api/user-management-service'
import { HierarchyService } from '@/services/remote-api/api/hierarchy-services/hierarchy.services'
import { AgentsService } from '@/services/remote-api/api/agents-services'
import TreeStructure from '../components/target.tree.componet'

const useStyles = makeStyles((theme: any) => ({
  table: {
    minWidth: 650
  },
  selectYear: {
    margin: theme?.spacing ? theme?.spacing(2) : '8px',
    minWidth: 270
  },
  submitButton: {
    marginLeft: theme?.spacing ? theme?.spacing(2) : '8px'
  }
}))

const grouptypeService = new GroupTypeService()
const gt$ = grouptypeService.getGroupTypes()
const usersService = new UsersService()
const usersService$ = usersService.getUsers()
const orgtypeservice = new HierarchyService()
const agentsService = new AgentsService()

const TargetComponent = () => {
  const classes = useStyles()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [groupTypes, setGroupTypes] = React.useState([])

  const [hierarchyData, setHierarchyData] = React.useState([])
  const [userList, setUsersList] = React.useState([])

  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2]

  const months = Array.from({ length: 12 }, (_, index) =>
    new Date(0, index).toLocaleString('en-US', { month: 'long' }).toUpperCase()
  )

  // console.log('groupTypes ', groupTypes);
  const formatDta = (data: any[], userArray: any[]) => {
    data &&
      data.forEach(dt => {
        dt['child'] = dt.childPositions

        if (dt?.user?.userId) {
          userArray &&
            userArray.forEach(usr => {
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

  // console.log('hierarchyData ', hierarchyData);
  // console.log('userList ', userList);

  const useObservableTree = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((res: any) => {
        console.log(res);
        
        const uList: any = []

        res.content.forEach((usr: any, i: any) => {
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
            const arrval: any = formatDta(result, arr)

            setHierarchyData(arrval)
          })
        })
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservableTree(usersService$, setUsersList)

  const useObservable = (observable: any, setter: any) => {
    useEffect(() => {
      const subscription = observable.subscribe((result: any) => {
        setter((prv: any) => [{ id: 0, code: 'RETAIL', name: 'Retail' }, ...result.content])
      })

      return () => subscription.unsubscribe()
    }, [observable, setter])
  }

  useObservable(gt$, setGroupTypes)

  const handleYearChange = (year: any) => {
    setSelectedYear(year)

    // setTableData(
    //   months.map((month, index) => ({
    //     id: index + 1,
    //     period: `${month}-${year}`,
    //     retail: null,
    //     corporate: null,
    //     sme: null,
    //     community: null,
    //   })),
    // );
  }

  return (
    <>
      <Select value={selectedYear} onChange={e => handleYearChange(e.target.value)} className={classes.selectYear}>
        {years.map(year => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
      <TreeStructure data={hierarchyData} groupTypes={groupTypes} months={months} selectedYear={selectedYear} />
    </>
  )
}

export default TargetComponent

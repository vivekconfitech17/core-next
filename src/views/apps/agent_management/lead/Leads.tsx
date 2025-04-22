'use client'
import React, { useEffect, useState } from 'react';
import {
  styled,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Call as CallIcon,
  PersonAdd as ConvertIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import ViewLeadDialog from './components/ViewLeadDialog';
import EditLeadDialog from './components/EditLeadDialog';
import ScheduleMeetingDialog from './components/ScheduleMeetingDialog';
import LogCallDialog from './components/LogCallDialog';
import ConvertToClientDialog from './components/ConvertToClientDialog';
import DeleteLeadDialog from './components/DeleteLeadDialog';
import { map, switchMap } from 'rxjs/operators';
import { ClientTypeService, ProspectService } from '@/services/remote-api/fettle-remote-api';

const clienttypeervice = new ClientTypeService();
const prospectService = new ProspectService();

const dataSource$ = (
  pageRequest: any = {
    page: 0,
    size: 10,
    summary: true,
    active: true,
  },
) => {
  pageRequest.sort = ['rowLastUpdatedDate dsc'];
  if (pageRequest.searchKey) {
    pageRequest['code'] = pageRequest.searchKey.trim();
    pageRequest['displayName'] = pageRequest.searchKey.trim();
    pageRequest['mobileNo'] = pageRequest.searchKey.trim();
  }
  delete pageRequest.searchKey;
  return prospectService.getProspects(pageRequest).pipe(
    switchMap(data => {
      return clienttypeervice.getCleintTypes().pipe(
        map(ct => {
          data.content.forEach((cl: any) => {
            ct.content.forEach(clienttype => {
              if (cl.clientType === clienttype.code) {
                cl['clientTypeName'] = clienttype.name;
              }
            });
          });
          return data;
        }),
      );
    }),
  )
};

import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: any) => ({
  root: {
    width: '100%',
    padding: theme.spacing ? theme.spacing(3) : "8px",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing ? theme.spacing(3) : "8px"
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing ? theme.spacing(2) : "8px"
  },
  table: {
    minWidth: 750,
  },
  actionButton: {
    marginRight: theme.spacing ? theme.spacing(1) : "8px"
  },
}));

const Leads = () => {
  const classes = useStyles();


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState({
    view: false,
    edit: false,
    schedule: false,
    call: false,
    convert: false,
    delete: false,
  });

  useEffect(() => {
    setLoading(true);
    const subscription = dataSource$().subscribe({
      next: (data: any) => {
        setLeads(data.content || []);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: any, lead: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: any) => {
    handleMenuClose();
    setDialogState({ ...dialogState, [action]: true });
  };

  const handleCloseDialog = (dialog: any) => {
    setDialogState({ ...dialogState, [dialog]: false });
    setSelectedLead(null);
  };

  // Handler functions for each action
  const handleViewDetails = (leadData: any) => {
    console.log('Viewing details for lead:', leadData);
  };

  const handleEditLead = (leadData: any) => {
    console.log('Editing lead:', leadData);
  };

  const handleScheduleMeeting = (meetingData: any) => {
    console.log('Scheduling meeting:', meetingData);
  };

  const handleLogCall = (callData: any) => {
    console.log('Logging call:', callData);
  };

  const handleConvertToClient = (clientData: any) => {
    console.log('Converting to client:', clientData);
  };

  const handleDeleteLead = (leadId: any) => {
    console.log('Deleting lead:', leadId);
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" component="h1">
          Leads
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => (window.location.href = "/client/prospects?mode=create")}
        >
          Add New Lead
        </Button>
      </div>

      <Paper className={classes.paper}>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Lead Name</TableCell>
                <TableCell>Prospect Code</TableCell>
                <TableCell>Client Type</TableCell>
                <TableCell>Contact</TableCell>
                {/* <TableCell>Status</TableCell>
                <TableCell>Forecast</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Last Updated</TableCell> */}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No leads found</TableCell>
                </TableRow>
              ) : (
                leads
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: any) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.displayName || row.name}</TableCell>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.clientTypeName}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box mr={2} display="flex">
                            <IconButton
                              size="small"
                              className={classes.actionButton}
                              onClick={() => window.location.href = `tel:${row.mobileNo}`}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              className={classes.actionButton}
                              onClick={() => window.location.href = `mailto:${row.email}`}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box>
                            <Typography variant="body2">{row.mobileNo}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {row.emailId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {/* <TableCell>
                        <Chip
                          label={row.status || 'N/A'}
                          style={{ 
                            backgroundColor: getStatusColor(row.status), 
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                          size="small"
                        />
                      </TableCell> */}
                      {/* <TableCell>
                        <Typography 
                          variant="body2" 
                          style={{ 
                            color: parseInt(row.forecast) > 70 ? '#4CAF50' : '#FF9800'
                          }}
                        >
                          {row.forecast || 'N/A'}
                        </Typography>
                      </TableCell> */}
                      {/* <TableCell>{row.assignedTo || 'N/A'}</TableCell> */}
                      {/* <TableCell>
                        <Typography variant="body2">
                          {new Date(row.rowLastUpdatedDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(row.rowLastUpdatedDate).toLocaleTimeString()}
                        </Typography>
                      </TableCell> */}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={leads.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Lead" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('schedule')}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Schedule Meeting" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('call')}>
          <ListItemIcon>
            <CallIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Log Call" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('convert')}>
          <ListItemIcon>
            <ConvertIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Convert to Client" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete Lead" />
        </MenuItem>
      </Menu>

      <ViewLeadDialog
        open={dialogState.view}
        onClose={() => handleCloseDialog('view')}
        lead={selectedLead}
      />
      <EditLeadDialog
        open={dialogState.edit}
        onClose={() => handleCloseDialog('edit')}
        lead={selectedLead}
        onSave={handleEditLead}
      />
      <ScheduleMeetingDialog
        open={dialogState.schedule}
        onClose={() => handleCloseDialog('schedule')}
        lead={selectedLead}
        onSchedule={handleScheduleMeeting}
      />
      <LogCallDialog
        open={dialogState.call}
        onClose={() => handleCloseDialog('call')}
        lead={selectedLead}
        onLog={handleLogCall}
      />
      <ConvertToClientDialog
        open={dialogState.convert}
        onClose={() => handleCloseDialog('convert')}
        lead={selectedLead}
        onConvert={handleConvertToClient}
      />
      <DeleteLeadDialog
        open={dialogState.delete}
        onClose={() => handleCloseDialog('delete')}
        lead={selectedLead}
        onDelete={handleDeleteLead}
      />
    </div>
  );
};

export default Leads; 

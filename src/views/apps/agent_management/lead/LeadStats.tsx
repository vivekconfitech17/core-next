import React from 'react';
import { makeStyles } from '@mui/styles';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';

const useStyles = makeStyles((theme:any) => ({
  statsCard: {
    padding: theme?.spacing?theme.spacing(3):'24px',
    borderRadius: 12,
    height: '100%',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme?.spacing?theme.spacing(1):'8px',
  },
  icon: {
    color: '#fff',
    fontSize: 24,
  },
  value: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme?.spacing?theme.spacing(1):'8px',
  },
  label: {
    color: theme?.palette?.text?.secondary,
    fontSize: '0.875rem',
  },
  percentageUp: {
    color: theme?.palette?.success?.main,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme?.spacing?theme.spacing(1):'8px',
  },
}));

const StatsCard = ({ icon: Icon, value, label, percentage, color }:{
  icon: any; 
  value: any;
  label: string; 
  percentage: number; 
  color?: string;
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.statsCard}>
      <Box className={classes.iconBox} style={{ backgroundColor: color }}>
        <Icon className={classes.icon} />
      </Box>
      <Typography variant="h5" className={classes.value}>
        {value}
      </Typography>
      <Typography className={classes.label}>{label}</Typography>
      <Typography className={classes.percentageUp}>
        <TrendingUpIcon fontSize="small" style={{ marginRight: 4 }} />
        {percentage}% increase
      </Typography>
    </Paper>
  );
};

const LeadStats = () => {
  const statsData = [
    {
      icon: PeopleIcon,
      value: '2,847',
      label: 'Total Leads',
      percentage: 12.5,
      color: '#4CAF50',
    },
    {
      icon: AttachMoneyIcon,
      value: '$94,271',
      label: 'Revenue Generated',
      percentage: 8.2,
      color: '#2196F3',
    },
    {
      icon: TimelineIcon,
      value: '67.5%',
      label: 'Conversion Rate',
      percentage: 4.7,
      color: '#9C27B0',
    },
    {
      icon: TrendingUpIcon,
      value: '1,234',
      label: 'Active Campaigns',
      percentage: 6.8,
      color: '#FF9800',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatsCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default LeadStats;

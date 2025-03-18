import React from 'react';
import { Container, Grid2, Paper, Typography, Box, Button } from '@mui/material';
// import ServerDetails from './ServerDetails/ServerDetails';
// import CpuUsage from './CpuUsage/CpuUsage';
// import DiskUsage from './DiskUsage/DiskUsage';
// import RunningProcesses from './RunningProcesses/RunningProcesses';
// import DockerContainers from './DockerContainers/DockerContainers';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Grid2 container spacing={3}>
        <Grid2 item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" component="h2">
              Server Details
            </Typography>
            {/* <ServerDetails /> */}
          </Paper>
        </Grid2>
        <Grid2 item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" component="h2">
              CPU Usage
            </Typography>
            {/* <CpuUsage /> */}
          </Paper>
        </Grid2>
        <Grid2 item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" component="h2">
              Disk Usage
            </Typography>
            {/* <DiskUsage /> */}
          </Paper>
        </Grid2>
        <Grid2 item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2">
              Running Processes
            </Typography>
            {/* <RunningProcesses /> */}
          </Paper>
        </Grid2>
        <Grid2 item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2">
              Docker Containers
            </Typography>
            {/* <DockerContainers /> */}
          </Paper>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Dashboard;

import React from 'react';
import { Container, Grid2, Paper, Typography, Box, Button } from '@mui/material';
import {Route, Routes, useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import TopBar from "../top-bar/TopBar";
import NavigationBar from "../navigation-bar/NavigationBar";
import ServerDetails from "./ServerDetails/ServerDetails";
import CpuUsage from "./CpuUsage/CpuUsage";
import DiskUsage from "./DiskUsage/DiskUsage";
import RunningProcesses from "./RunningProcesses/RunningProcesses";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
      <Box sx={{ display: 'flex' }}>
          {/*<TopBar />*/}
          <NavigationBar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                  <Route path="/server" element={<ServerDetails />} />
                  <Route path="/cpu" element={<CpuUsage />} />
                  <Route path="/disk" element={<DiskUsage />} />
                  <Route path="/processes" element={<RunningProcesses />} />
                  {/*<Route path="/docker" element={<DockerContainers />} />*/}
              </Routes>
          </Box>
      </Box>
  );
};

export default Dashboard;

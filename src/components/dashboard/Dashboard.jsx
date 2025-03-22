// src/components/dashboard/Dashboard.jsx
import React, {useContext} from 'react';
import {Box, Toolbar, Divider, useMediaQuery, useTheme} from '@mui/material';
import {Routes, Route, useNavigate} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import TopBar from "../top-bar/TopBar";
import NavigationBar from "../navigation-bar/NavigationBar";
import ServerDetails from "./ServerDetails/ServerDetails";
import CpuUsage from "./CpuUsage/CpuUsage";
import DiskUsage from "./DiskUsage/DiskUsage";
import RunningProcesses from "./RunningProcesses/RunningProcesses";
const Dashboard = () => {
    const navigate = useNavigate();
    const {logout} = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Box sx={{display: 'flex', height: '100vh'}}>
            {/* Top navigation bar with app title and user controls */}
            <TopBar handleLogout={handleLogout}/>

            {/* Side navigation menu */}
            <NavigationBar/>

            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {sm: `calc(100% - 240px)`},
                    ml: {sm: '240px'},
                    overflow: 'auto'
                }}
            >
                <Toolbar/> {/* Spacer to push content below app bar */}

                {/* Dashboard routes */}
                <Routes>
                    <Route path="/server" element={<ServerDetails/>}/>
                    <Route path="/cpu" element={<CpuUsage/>}/>
                    <Route path="/disk" element={<DiskUsage/>}/>
                    <Route path="/processes" element={<RunningProcesses/>}/>

                    {/* Redirect to server details by default */}
                    <Route path="*" element={<ServerDetails/>}/>
                </Routes>
            </Box>
        </Box>
    );
};

export default Dashboard;
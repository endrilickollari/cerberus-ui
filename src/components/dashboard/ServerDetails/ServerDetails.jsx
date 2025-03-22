// src/components/dashboard/ServerDetails/ServerDetails.jsx
import React, {useState, useEffect} from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Divider,
    Card,
    CardContent,
    CardHeader, Grid2
} from '@mui/material';
import {Line} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import useApi from '../../hooks/useApi';
import apiEndpoints from '../../services/api';

// Register Chart.js components
Chart.register(...registerables);

const ServerDetails = () => {
    // Server details API hook
    const serverApi = useApi();
    // System info API hook
    const systemApi = useApi();

    // Fetch data when component mounts
    useEffect(() => {
        // Fetch server and system data
        const fetchData = async () => {
            try {
                console.log('Fetching server details...');
                const serverResult = await serverApi.request({
                    url: '/server-details'
                });
                console.log('Server details received:', serverResult ? 'Success' : 'No data');

                try {
                    console.log('Fetching system info...');
                    const systemResult = await systemApi.request({
                        url: '/server-details'
                    });
                    console.log('System info received:', systemResult ? 'Success' : 'No data');
                } catch (error) {
                    console.error('Failed to fetch system info (endpoint might not exist):', error);
                }
            } catch (error) {
                console.error('Failed to fetch server details:', error);
            }
        };

        // Execute fetch
        fetchData();
    }, []); // Empty dependency array to ensure this only runs once

    // Parse and format uptime data
    const formatUptimeData = (uptimeString) => {
        if (!uptimeString) return {serverTime: '', uptime: '', users: 0, loadAvg: []};

        const uptime = uptimeString.trim();
        // Extract server time (portion before "up")
        const serverTime = uptime.substring(0, uptime.indexOf('up')).trim();

        // Extract uptime details
        let uptimeDetails = uptime.substring(uptime.indexOf('up') + 2, uptime.indexOf('users,')).trim();
        if (uptimeDetails.endsWith(', 0')) {
            uptimeDetails = uptimeDetails.slice(0, -3).trim();
        }

        // Extract user count
        const userCountString = uptime.substring(uptime.indexOf('users,') - 2, uptime.indexOf('users,')).trim();
        const userCount = parseInt(userCountString) || 0;

        // Extract load average
        const loadAverageString = uptime.substring(uptime.indexOf('load average: ') + 'load average: '.length).trim();
        const loadAverageValues = loadAverageString.split(', ').map(parseFloat);

        return {
            serverTime,
            uptime: uptimeDetails,
            users: userCount,
            loadAvg: loadAverageValues
        };
    };

    // Load average chart data
    const getLoadAverageChartData = (loadAvgValues) => {
        return {
            labels: ['1 min', '5 min', '15 min'],
            datasets: [{
                label: 'Load Average',
                data: loadAvgValues,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
            }],
        };
    };

    // Chart options
    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Load'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Load: ${context.parsed.y}`;
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // Extract uptime data
    const uptimeData = serverApi.data
        ? formatUptimeData(serverApi.data.uptime)
        : {serverTime: '', uptime: '', users: 0, loadAvg: [0, 0, 0]};

    // Set up chart data
    const loadChartData = getLoadAverageChartData(uptimeData.loadAvg);

    // Handle errors
    if (serverApi.error || systemApi.error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error fetching server details. Please check your connection and try again.
            </Alert>
        );
    }

    // Handle loading state
    if (serverApi.loading || systemApi.loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    // No data yet
    if (!serverApi.data && !systemApi.data) {
        return (
            <Typography>Loading server information...</Typography>
        );
    }

    return (
        <Grid2 container spacing={3}>
            {/* Server Overview Card */}
            <Grid2
                item xs={12} md={6}>
                <Card elevation={3}>
                    <CardHeader title="Server Overview"/>
                    <Divider/>
                    <CardContent>
                        <List>
                            <ListItem divider>
                                <ListItemText
                                    primary="Server Time"
                                    secondary={uptimeData.serverTime || 'N/A'}
                                />
                            </ListItem>
                            <ListItem divider>
                                <ListItemText
                                    primary="Uptime"
                                    secondary={uptimeData.uptime || 'N/A'}
                                />
                            </ListItem>
                            <ListItem divider>
                                <ListItemText
                                    primary="Active Users"
                                    secondary={uptimeData.users}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Hostname"
                                    secondary={serverApi.data?.hostname?.trim() || 'N/A'}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid2>

            {/* System Information Card */}
            <Grid item xs={12} md={6}>
                <Card elevation={3}>
                    <CardHeader title="System Information"/>
                    <Divider/>
                    <CardContent>
                        <List>
                            <ListItem divider>
                                <ListItemText
                                    primary="Operating System"
                                    secondary={serverApi.data?.os?.trim() || 'N/A'}
                                />
                            </ListItem>
                            <ListItem divider>
                                <ListItemText
                                    primary="Kernel Version"
                                    secondary={serverApi.data?.kernel_version?.trim() || 'N/A'}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Architecture"
                                    secondary={systemApi.data?.architecture || 'N/A'}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* Load Average Chart */}
            <Grid item xs={12}>
                <Card elevation={3}>
                    <CardHeader title="System Load Average"/>
                    <Divider/>
                    <CardContent>
                        <Box sx={{height: 300, mt: 2}}>
                            <Line data={loadChartData} options={chartOptions}/>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid2>
    );
};

export default ServerDetails;
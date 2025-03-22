// src/components/dashboard/DiskUsage/DiskUsage.jsx
import React, {useState, useEffect, useMemo} from 'react';
import {
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Alert,
    LinearProgress,
    useTheme, Grid2
} from '@mui/material';
import {Pie, Bar} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import useApi from '../../hooks/useApi';
import apiEndpoints from '../../services/api';

// Register Chart.js components
Chart.register(...registerables);

const DiskUsage = () => {
    // Get theme for colors
    const theme = useTheme();

    // Disk usage API hook
    const diskApi = useApi(apiEndpoints.getDiskUsage);

    // Fetch data on mount and create a refresh function
    useEffect(() => {
        // Fetch disk data
        const fetchData = async () => {
            try {
                console.log('Fetching disk usage data...');
                const result = await diskApi.request({
                    url: '/server-details/disk-usage'
                });
                console.log('Disk data received:', result ?
                    (Array.isArray(result) ? `${result.length} items` : 'Object') :
                    'No data');
            } catch (error) {
                console.error('Failed to fetch disk usage:', error);
            }
        };

        // Initial fetch
        fetchData();

        // Set up polling interval - 10 minutes in milliseconds
        const TEN_MINUTES = 10 * 60 * 1000;
        console.log(`Setting up disk usage refresh interval for every ${TEN_MINUTES / 1000} seconds`);

        const intervalId = setInterval(() => {
            console.log('Interval triggered - refreshing disk usage data');
            fetchData();
        }, TEN_MINUTES);

        // Cleanup interval on unmount
        return () => {
            console.log('Cleaning up disk usage interval');
            clearInterval(intervalId);
        };
    }, []); // Empty dependency array to ensure this only runs once

    // Handle manual refresh
    const handleRefresh = () => {
        diskApi.request({
            url: '/server-details/disk-usage'
        }).catch(error => {
            console.error('Failed to refresh disk usage:', error);
        });
    };

    // Parse disk data to ensure numeric values
    const diskData = useMemo(() => {
        if (!diskApi.data) {
            console.log('No disk data available');
            return [];
        }

        console.log('Processing disk data:',
            Array.isArray(diskApi.data) ?
                `${diskApi.data.length} items` :
                'Non-array data');

        // Safety check
        if (!Array.isArray(diskApi.data)) {
            console.error('Expected disk data to be an array');
            return [];
        }

        return diskApi.data.map(disk => {
            // Validate each disk object
            if (!disk) return null;

            try {
                return {
                    ...disk,
                    // Ensure numeric values by removing 'G' suffix and converting to numbers
                    size_gb: parseFloat(disk.size?.replace('G', '')) || 0,
                    used_gb: parseFloat(disk.used?.replace('G', '')) || 0,
                    available_gb: parseFloat(disk.available?.replace('G', '')) || 0,
                    use_percentage: parseFloat(disk.use_percentage?.replace('%', '')) || 0
                };
            } catch (error) {
                console.error('Error parsing disk data:', error, disk);
                return null;
            }
        }).filter(Boolean); // Remove any null entries
    }, [diskApi.data]);

    // Generate randomized colors for pie chart segments
    const getChartColors = (count) => {
        const colors = [];
        const borderColors = [];

        for (let i = 0; i < count; i++) {
            const hue = (i * 137.5) % 360; // Use golden angle approximation for good distribution
            colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
            borderColors.push(`hsla(${hue}, 70%, 50%, 1)`);
        }

        return {colors, borderColors};
    };

    // Pie chart for disk usage percentage
    const pieChartData = useMemo(() => {
        if (!diskData.length) {
            console.log('No disk data for pie chart');
            return {
                labels: [],
                datasets: [{
                    label: 'Disk Usage (%)',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1,
                }]
            };
        }

        const {colors, borderColors} = getChartColors(diskData.length);

        return {
            labels: diskData.map(disk => disk.mounted_on || 'Unknown'),
            datasets: [{
                label: 'Disk Usage (%)',
                data: diskData.map(disk => disk.use_percentage || 0),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1,
            }],
        };
    }, [diskData]);

    // Bar chart for used vs available space
    const barChartData = useMemo(() => {
        if (!diskData.length) {
            console.log('No disk data for bar chart');
            return {
                labels: [],
                datasets: []
            };
        }

        return {
            labels: diskData.map(disk => disk.mounted_on || 'Unknown'),
            datasets: [
                {
                    label: 'Used Space (GB)',
                    data: diskData.map(disk => disk.used_gb || 0),
                    backgroundColor: theme.palette.error.light,
                    borderColor: theme.palette.error.main,
                    borderWidth: 1,
                },
                {
                    label: 'Available Space (GB)',
                    data: diskData.map(disk => disk.available_gb || 0),
                    backgroundColor: theme.palette.success.light,
                    borderColor: theme.palette.success.main,
                    borderWidth: 1,
                },
            ],
        };
    }, [diskData, theme]);

    // Chart options
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.parsed}%`;
                    }
                }
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: false,
            },
            y: {
                stacked: false,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Gigabytes (GB)'
                }
            },
        },
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };

    // Handle loading state
    if (diskApi.loading && !diskData.length) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    // Handle error state
    if (diskApi.error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error fetching disk data: {diskApi.error.message}
            </Alert>
        );
    }

    return (
        <Grid2 container spacing={3}>
            {/* Usage Percentage Chart */}
            <Grid2 item xs={12} md={6}>
                <Card elevation={3}>
                    <CardHeader
                        title="Disk Usage Percentage"
                        action={
                            <Tooltip title="Refresh data">
                                <IconButton onClick={handleRefresh} disabled={diskApi.loading}>
                                    {diskApi.loading ? (
                                        <CircularProgress size={24}/>
                                    ) : (
                                        <RefreshIcon/>
                                    )}
                                </IconButton>
                            </Tooltip>
                        }
                    />
                    <Divider/>
                    <CardContent>
                        <Box sx={{height: 400, position: 'relative'}}>
                            {diskData.length > 0 ? (
                                <Pie data={pieChartData} options={pieChartOptions}/>
                            ) : (
                                <Typography align="center" sx={{pt: 8}}>
                                    No disk data available
                                </Typography>
                            )}

                            {diskApi.loading && (
                                <LinearProgress sx={{position: 'absolute', bottom: 0, left: 0, right: 0}}/>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid2>

            {/* Used vs Available Space */}
            <Grid2 item xs={12} md={6}>
                <Card elevation={3}>
                    <CardHeader title="Disk Space Allocation"/>
                    <Divider/>
                    <CardContent>
                        <Box sx={{height: 400}}>
                            {diskData.length > 0 ? (
                                <Bar data={barChartData} options={barChartOptions}/>
                            ) : (
                                <Typography align="center" sx={{pt: 8}}>
                                    No disk data available
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid2>

            {/* Disk Details */}
            <Grid2 item xs={12}>
                <Card elevation={3}>
                    <CardHeader title="Filesystem Details"/>
                    <Divider/>
                    <CardContent>
                        <List>
                            {diskData.map((disk, index) => {
                                // Warning threshold for disk usage (over 85%)
                                const isWarning = disk.use_percentage > 85;

                                return (
                                    <ListItem
                                        key={index}
                                        divider={index < diskData.length - 1}
                                        sx={isWarning ? {bgcolor: 'rgba(255, 193, 7, 0.08)'} : {}}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    {disk.mounted_on}
                                                    {isWarning && (
                                                        <Tooltip title="High disk usage">
                                                            <WarningIcon
                                                                color="warning"
                                                                fontSize="small"
                                                                sx={{ml: 1}}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {`Filesystem: ${disk.filesystem}, Size: ${disk.size}, Usage: ${disk.use_percentage}%`}
                                                    </Typography>
                                                    <Box sx={{mt: 1, display: 'flex', alignItems: 'center'}}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={disk.use_percentage}
                                                            sx={{
                                                                flexGrow: 1,
                                                                mr: 2,
                                                                height: 8,
                                                                borderRadius: 1,
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: isWarning ? 'warning.main' : ''
                                                                }
                                                            }}
                                                        />
                                                        <Typography variant="body2">
                                                            {`${disk.used} used / ${disk.available} free`}
                                                        </Typography>
                                                    </Box>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}

                            {diskData.length === 0 && !diskApi.loading && (
                                <ListItem>
                                    <ListItemText primary="No disk data available"/>
                                </ListItem>
                            )}
                        </List>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    );
};

export default DiskUsage;
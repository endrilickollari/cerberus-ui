import React, {useState, useEffect, useMemo} from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Modal,
    Divider,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Tooltip,
    Badge, Alert, Button, Grid2
} from '@mui/material';
import {Bar, Doughnut} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import useApi from '../../hooks/useApi';
import apiEndpoints from '../../services/api';

// Register Chart.js components
Chart.register(...registerables);

const CpuUsage = () => {
    // State for selected CPU details
    const [selectedCpu, setSelectedCpu] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // CPU data API hook
    const cpuApi = useApi(apiEndpoints.getCpuInfo);

    // Fetch data on mount and create a refresh function
    useEffect(() => {
        // Fetch disk data
        const fetchData = async () => {
            try {
                console.log('Fetching CPU usage data...');
                const result = await cpuApi.request({
                    url: '/server-details/cpu-info'
                });
                console.log('CPU data received:', result ?
                    (Array.isArray(result) ? `${result.length} items` : 'Object') :
                    'No data');
            } catch (error) {
                console.error('Failed to fetch CPU usage:', error);
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
    }, []);

    // Filter valid CPU data
    const cpuData = useMemo(() => {
        if (!cpuApi.data) {
            console.log('No CPU data available');
            return [];
        }

        console.log('Processing CPU data:',
            Array.isArray(cpuApi.data) ?
                `${cpuApi.data.length} items` :
                'Non-array data');

        // Safety check
        if (!Array.isArray(cpuApi.data)) {
            console.error('Expected CPU data to be an array');
            return [];
        }

        // Filter and validate each CPU entry
        return cpuApi.data
            .filter(cpu => cpu && typeof cpu === 'object')
            .filter(cpu => cpu.processor !== undefined && cpu.processor !== "")
            .map(cpu => {
                // Ensure all properties have default values to prevent null/undefined errors
                return {
                    processor: cpu.processor || '',
                    vendor_id: cpu.vendor_id || 'Unknown',
                    cpu_family: cpu.cpu_family || '',
                    model: cpu.model || '',
                    model_name: cpu.model_name || 'Unknown CPU',
                    stepping: cpu.stepping || '',
                    microcode: cpu.microcode || '',
                    cpu_mhz: parseFloat(cpu.cpu_mhz) || 0,
                    cache_size: cpu.cache_size || 'Unknown',
                    physical_id: cpu.physical_id || '',
                    siblings: cpu.siblings || '',
                    core_id: cpu.core_id || '',
                    cpu_cores: parseInt(cpu.cpu_cores) || 1,
                    apicid: cpu.apicid || '',
                    initial_apicid: cpu.initial_apicid || '',
                    fpu: cpu.fpu || '',
                    fpu_exception: cpu.fpu_exception || '',
                    cpuid_level: cpu.cpuid_level || '',
                    wp: cpu.wp || '',
                    flags: cpu.flags || '',
                    bugs: cpu.bugs || '',
                    bogomips: cpu.bogomips || 0,
                    clflush_size: cpu.clflush_size || '',
                    cache_alignment: cpu.cache_alignment || '',
                    address_sizes: cpu.address_sizes || '',
                    power_management: cpu.power_management || ''
                };
            });
    }, [cpuApi.data]);

    // Handle manual refresh
    const handleRefresh = () => {
        cpuApi.request({
            url: '/server-details/cpu-info'
        }).catch(error => {
            console.error('Failed to refresh CPU usage:', error);
        });
    };

    // Handle CPU selection for details
    const handleCpuClick = (cpu) => {
        setSelectedCpu(cpu);
        setOpenModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // Prepare chart data
    const barChartData = useMemo(() => ({
        labels: cpuData.map(cpu => `CPU ${cpu.processor}`),
        datasets: [{
            label: 'CPU MHz',
            data: cpuData.map(cpu => parseFloat(cpu.cpu_mhz)),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    }), [cpuData]);

    // Chart options
    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'MHz'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // Determine CPU cores distribution by vendor
    const vendorDistribution = useMemo(() => {
        if (!cpuData.length) return {labels: [], data: []};

        const vendorCounts = cpuData.reduce((acc, cpu) => {
            const vendor = cpu.vendor_id || 'Unknown';
            acc[vendor] = (acc[vendor] || 0) + 1;
            return acc;
        }, {});

        return {
            labels: Object.keys(vendorCounts),
            data: Object.values(vendorCounts)
        };
    }, [cpuData]);

    // Pie chart data for vendor distribution
    const vendorChartData = {
        labels: vendorDistribution.labels,
        datasets: [{
            label: 'CPU Vendor Distribution',
            data: vendorDistribution.data,
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
        }],
    };

    // Handle loading state
    if (cpuApi.loading && !cpuData.length) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4}}>
                <CircularProgress size={40}/>
                <Typography sx={{ml: 2}}>Loading CPU data...</Typography>
            </Box>
        );
    }

    // Handle error state
    if (cpuApi.error) {
        console.error('CPU data error:', cpuApi.error);
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error fetching CPU data: {cpuApi.error.message || 'Unknown error'}
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ml: 2}}
                    onClick={handleRefresh}
                >
                    Retry
                </Button>
            </Alert>
        );
    }

    // Check if we have data
    if (!cpuData.length) {
        console.log('No CPU data available');
        return (
            <Box sx={{p: 4}}>
                <Alert severity="info">
                    No CPU data available
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ml: 2}}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </Alert>
            </Box>
        );
    }

    return (
        <Grid2 container spacing={3}>
            {/* CPU Performance Chart */}
            <Grid2 item xs={12} lg={8}>
                <Card elevation={3}>
                    <CardHeader
                        title="CPU Performance"
                        action={
                            <Tooltip title="Refresh data">
                                <IconButton onClick={handleRefresh} disabled={cpuApi.loading}>
                                    {cpuApi.loading ? (
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
                        <Box sx={{height: 400}}>
                            <Bar data={barChartData} options={chartOptions}/>
                        </Box>
                    </CardContent>
                </Card>
            </Grid2>

            {/* CPU Vendor Distribution */}
            <Grid2 item xs={12} lg={4}>
                <Card elevation={3}>
                    <CardHeader title="CPU Vendor Distribution"/>
                    <Divider/>
                    <CardContent>
                        <Box sx={{height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {vendorDistribution.labels.length > 0 ? (
                                <Doughnut
                                    data={vendorChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <Typography>No vendor data available</Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid2>

            {/* CPU List */}
            <Grid2 item xs={12}>
                <Card elevation={3}>
                    <CardHeader title="CPU Information"/>
                    <Divider/>
                    <CardContent>
                        <List>
                            {cpuData.map((cpu, index) => (
                                <ListItem
                                    key={index}
                                    divider={index < cpuData.length - 1}
                                    secondaryAction={
                                        <Tooltip title="View Details">
                                            <IconButton edge="end" onClick={() => handleCpuClick(cpu)}>
                                                <InfoIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemText
                                        primary={`CPU ${cpu.processor}: ${cpu.model_name}`}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {`${cpu.cpu_mhz} MHz • ${cpu.cpu_cores || '?'} Cores • ${cpu.vendor_id || 'Unknown Vendor'}`}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Cache: {cpu.cache_size || 'N/A'}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}

                            {cpuData.length === 0 && !cpuApi.loading && (
                                <ListItem>
                                    <ListItemText primary="No CPU data available"/>
                                </ListItem>
                            )}
                        </List>
                    </CardContent>
                </Card>
            </Grid2>

            {/* CPU Details Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
                <Paper sx={{
                    width: '80%',
                    maxWidth: 800,
                    maxHeight: '80vh',
                    p: 4,
                    overflow: 'auto',
                    outline: 'none'
                }}>
                    {selectedCpu && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                CPU {selectedCpu.processor} Details
                            </Typography>

                            <Divider sx={{my: 2}}/>

                            <Grid container spacing={2}>
                                {Object.entries(selectedCpu).map(([key, value]) => (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {key.replace(/_/g, ' ').toUpperCase()}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            {value || 'N/A'}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Paper>
            </Modal>
        </Grid2>
    );
};

export default CpuUsage;
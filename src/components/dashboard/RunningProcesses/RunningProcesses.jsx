// src/components/dashboard/RunningProcesses/RunningProcesses.jsx
import React, {useState, useEffect, useMemo} from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    CircularProgress,
    TextField,
    InputAdornment,
    Modal,
    Button,
    Divider,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Tooltip,
    Alert,
    Chip, Grid2
} from '@mui/material';
import {Bar} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ClearIcon from '@mui/icons-material/Clear';
import useApi from '../../hooks/useApi';
import apiEndpoints from '../../services/api';

// Register Chart.js components
Chart.register(...registerables);

const RunningProcesses = () => {
    // State for search, sorting, and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'cpu_consumption',
        direction: 'desc'
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // State for chart modal
    const [openModal, setOpenModal] = useState(false);

    // Processes API hook
    const processesApi = useApi(apiEndpoints.getRunningProcesses);

    // Fetch data on mount and create a refresh function
    // Fetch data on mount and create a refresh function
    useEffect(() => {
        // Fetch processes data
        const fetchData = async () => {
            try {
                console.log('Fetching running processes data...');
                const result = await processesApi.request({
                    url: '/server-details/running-processes'
                });
                console.log('Processes data received:', result ? `${Array.isArray(result) ? result.length : 'Object'} items` : 'No data');
            } catch (error) {
                console.error('Failed to fetch processes:', error);
            }
        };

        // Initial fetch
        fetchData();

        // Set up polling interval - 10 minutes in milliseconds
        const TEN_MINUTES = 10 * 60 * 1000;
        console.log(`Setting up refresh interval for every ${TEN_MINUTES / 1000} seconds`);

        const intervalId = setInterval(() => {
            console.log('Interval triggered - refreshing process data');
            fetchData();
        }, TEN_MINUTES);

        // Cleanup interval on unmount
        return () => {
            console.log('Cleaning up interval');
            clearInterval(intervalId);
        };
    }, []); // Empty dependency array to ensure this only runs once

    // Handle manual refresh
    const handleRefresh = () => {
        processesApi.request({
            url: '/server-details/running-processes'
        }).catch(error => {
            console.error('Failed to refresh processes:', error);
        });
    };

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0); // Reset to first page on new search
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Handle sort
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle modal
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // Sorted and filtered processes
    const filteredAndSortedProcesses = useMemo(() => {
        // Make sure we have data before trying to filter/sort
        const processes = processesApi.data || [];
        console.log('Running filteredAndSortedProcesses with data:', processes.length ? 'Has data' : 'No data');

        if (!processes.length) {
            return [];
        }

        // First filter by search term
        const filtered = processes.filter(process =>
            Object.values(process).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        // Then sort
        const sorted = [...filtered].sort((a, b) => {
            // Convert to numbers for numeric fields
            const numericFields = ['process_id', 'cpu_consumption', 'vsz', 'rss'];

            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (numericFields.includes(sortConfig.key)) {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        console.log(`Filtered and sorted: ${sorted.length} processes`);
        return sorted;
    }, [processesApi.data, searchTerm, sortConfig]);

    // Paginated processes
    const paginatedProcesses = useMemo(() => {
        // Safety check
        if (!filteredAndSortedProcesses || !Array.isArray(filteredAndSortedProcesses)) {
            console.log('No filteredAndSortedProcesses array available for pagination');
            return [];
        }

        const start = page * rowsPerPage;
        const end = start + rowsPerPage;

        // Ensure we don't go out of bounds
        if (start >= filteredAndSortedProcesses.length) {
            return [];
        }

        return filteredAndSortedProcesses.slice(start, end);
    }, [filteredAndSortedProcesses, page, rowsPerPage]);

    // Chart data for CPU consumption
    const chartData = useMemo(() => {
        // Safety check for empty data
        if (!filteredAndSortedProcesses || filteredAndSortedProcesses.length === 0) {
            return {
                labels: [],
                datasets: [{
                    label: 'CPU Consumption (%)',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                }],
            };
        }

        // Get top 20 processes by CPU consumption for the chart
        const topProcesses = [...filteredAndSortedProcesses]
            .sort((a, b) => parseFloat(b.cpu_consumption) - parseFloat(a.cpu_consumption))
            .slice(0, 20);

        return {
            labels: topProcesses.map(process => {
                const cmd = process.command || 'Unknown';
                const shortCmd = cmd.substring(0, 15) + (cmd.length > 15 ? '...' : '');
                return `${process.process_id} (${shortCmd})`;
            }),
            datasets: [{
                label: 'CPU Consumption (%)',
                data: topProcesses.map(process => parseFloat(process.cpu_consumption) || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }],
        };
    }, [filteredAndSortedProcesses]);

    // Chart options
    const chartOptions = {
        indexAxis: 'y', // Horizontal bar chart
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'CPU %'
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: function (tooltipItems) {
                        const process = filteredAndSortedProcesses.find(
                            p => p.process_id === tooltipItems[0].label.split(' ')[0]
                        );
                        return process ? `${process.command}` : '';
                    },
                    label: function (context) {
                        return `CPU: ${context.raw}%`;
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // Process status colors
    const getStatusColor = (stat) => {
        if (stat.includes('R')) return 'success'; // Running
        if (stat.includes('S')) return 'info'; // Sleeping
        if (stat.includes('D')) return 'warning'; // Disk sleep
        if (stat.includes('Z')) return 'error'; // Zombie
        if (stat.includes('T')) return 'default'; // Stopped
        return 'default';
    };

    // Process status labels
    const getStatusLabel = (stat) => {
        if (stat.includes('R')) return 'Running';
        if (stat.includes('S')) return 'Sleeping';
        if (stat.includes('D')) return 'Disk Sleep';
        if (stat.includes('Z')) return 'Zombie';
        if (stat.includes('T')) return 'Stopped';
        return stat;
    };

    // Handle loading state
    if (processesApi.loading && !processesApi.data) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
                <Typography sx={{ml: 2}}>Loading processes data...</Typography>
            </Box>
        );
    }

    // Handle error state
    if (processesApi.error) {
        console.error('Process data error:', processesApi.error);
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error fetching process data: {processesApi.error.message || 'Unknown error'}
            </Alert>
        );
    }

    // Check if we have data
    if (!processesApi.data && !processesApi.loading) {
        console.log('No process data available and not loading');
        return (
            <Box sx={{p: 4}}>
                <Alert severity="info">
                    Loading process data...
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
            <Grid2 item xs={12}>
                <Card elevation={3}>
                    <CardHeader
                        title="Running Processes"
                        action={
                            <Box sx={{display: 'flex', gap: 1}}>
                                <Tooltip title="View CPU Usage Chart">
                                    <IconButton onClick={handleOpenModal}>
                                        <ShowChartIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Refresh data">
                                    <IconButton onClick={handleRefresh} disabled={processesApi.loading}>
                                        {processesApi.loading ? (
                                            <CircularProgress size={24}/>
                                        ) : (
                                            <RefreshIcon/>
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                    />
                    <Divider/>

                    <CardContent sx={{p: 2}}>
                        {/* Search Bar */}
                        <Box sx={{mb: 2}}>
                            <TextField
                                fullWidth
                                placeholder="Search processes by any field..."
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon/>
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                aria-label="clear search"
                                                onClick={handleClearSearch}
                                            >
                                                <ClearIcon/>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Processes Table */}
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'user'}
                                                direction={sortConfig.key === 'user' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('user')}
                                            >
                                                User
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'process_id'}
                                                direction={sortConfig.key === 'process_id' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('process_id')}
                                            >
                                                PID
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'cpu_consumption'}
                                                direction={sortConfig.key === 'cpu_consumption' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('cpu_consumption')}
                                            >
                                                CPU %
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'vsz'}
                                                direction={sortConfig.key === 'vsz' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('vsz')}
                                            >
                                                VSZ
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'rss'}
                                                direction={sortConfig.key === 'rss' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('rss')}
                                            >
                                                RSS
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'stat'}
                                                direction={sortConfig.key === 'stat' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('stat')}
                                            >
                                                Status
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'started'}
                                                direction={sortConfig.key === 'started' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('started')}
                                            >
                                                Started
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'time'}
                                                direction={sortConfig.key === 'time' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('time')}
                                            >
                                                Time
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'command'}
                                                direction={sortConfig.key === 'command' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('command')}
                                            >
                                                Command
                                            </TableSortLabel>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedProcesses.map((process, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{process.user}</TableCell>
                                            <TableCell>{process.process_id}</TableCell>
                                            <TableCell>{process.cpu_consumption}</TableCell>
                                            <TableCell>{process.vsz}</TableCell>
                                            <TableCell>{process.rss}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(process.stat)}
                                                    size="small"
                                                    color={getStatusColor(process.stat)}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{process.started}</TableCell>
                                            <TableCell>{process.time}</TableCell>
                                            <TableCell sx={{
                                                maxWidth: 300,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <Tooltip title={process.command}>
                                                    <span>{process.command}</span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {paginatedProcesses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                {searchTerm ? 'No results found' : 'No processes available'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={filteredAndSortedProcesses.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </CardContent>
                </Card>
            </Grid2>

            {/* CPU Consumption Chart Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
                <Paper sx={{
                    width: '90%',
                    maxWidth: 1000,
                    maxHeight: '90vh',
                    p: 4,
                    overflow: 'auto',
                    outline: 'none'
                }}>
                    <Typography variant="h6" gutterBottom>
                        Top CPU Consuming Processes
                    </Typography>
                    <Divider sx={{mb: 3}}/>

                    <Box sx={{height: 600}}>
                        {filteredAndSortedProcesses.length > 0 ? (
                            <Bar data={chartData} options={chartOptions}/>
                        ) : (
                            <Typography align="center" sx={{pt: 8}}>
                                No process data available
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                        <Button variant="contained" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Box>
                </Paper>
            </Modal>
        </Grid2>
    );
};

export default RunningProcesses;
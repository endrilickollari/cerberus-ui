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
    Alert,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Grid2,
    IconButton,
    MenuItem,
    Menu, Button, Modal, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import {Line} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import useApi from '../../hooks/useApi';
import apiEndpoints from '../../services/api';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';

// Register Chart.js components
Chart.register(...registerables);

const ServerDetails = () => {
    // Server details API hook
    const serverApi = useApi();
    // System info API hook
    const systemApi = useApi();
    // State for libraries data
    const librariesApi = useApi();
    // State for dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    // State for libraries modal
    const [librariesModalOpen, setLibrariesModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Handle menu open/close
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle libraries action
    const handleViewLibraries = async () => {
        handleMenuClose();

        try {
            console.log('Fetching installed libraries...');
            await librariesApi.request({
                url: '/server-details/libraries'
            });
            console.log('Libraries data received');
            setLibrariesModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch libraries:', error);
            // Open modal anyway, it will show loading state or error
            setLibrariesModalOpen(true);
        }
    };

    // Close libraries modal
    const handleCloseLibrariesModal = () => {
        setLibrariesModalOpen(false);
    };

    // Refresh libraries data
    const handleRefreshLibraries = async () => {
        try {
            console.log('Refreshing libraries data...');
            await librariesApi.request({
                url: '/server-details/libraries'
            });
            console.log('Libraries data refreshed');
        } catch (error) {
            console.error('Failed to refresh libraries:', error);
        }
    };

    // Filter libraries based on search term
    const filteredLibraries = useMemo(() => {
        if (!librariesApi.data || !Array.isArray(librariesApi.data)) {
            return [];
        }

        return librariesApi.data.filter(lib => {
            // Ensure lib is an object and has name/version properties
            if (!lib || typeof lib !== 'object') return false;

            const nameMatch = lib.name && lib.name.toLowerCase().includes(searchTerm.toLowerCase());
            const versionMatch = lib.version && lib.version.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || versionMatch;
        });
    }, [librariesApi.data, searchTerm]);/**/

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
            serverTime, uptime: uptimeDetails, users: userCount, loadAvg: loadAverageValues
        };
    };

    // Load average chart data
    const getLoadAverageChartData = (loadAvgValues) => {
        return {
            labels: ['1 min', '5 min', '15 min'], datasets: [{
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
                beginAtZero: true, title: {
                    display: true, text: 'Load'
                }
            }
        }, plugins: {
            legend: {
                position: 'top',
            }, tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Load: ${context.parsed.y}`;
                    }
                }
            }
        }, responsive: true, maintainAspectRatio: false,
    };

    // Extract uptime data
    const uptimeData = serverApi.data ? formatUptimeData(serverApi.data.uptime) : {
        serverTime: '',
        uptime: '',
        users: 0,
        loadAvg: [0, 0, 0]
    };

    // Set up chart data
    const loadChartData = getLoadAverageChartData(uptimeData.loadAvg);

    // Handle errors
    if (serverApi.error || systemApi.error) {
        return (<Alert severity="error" sx={{mb: 2}}>
            Error fetching server details. Please check your connection and try again.
        </Alert>);
    }

    // Handle loading state
    if (serverApi.loading || systemApi.loading) {
        return (<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
            <CircularProgress/>
        </Box>);
    }

    // No data yet
    if (!serverApi.data && !systemApi.data) {
        return (<Typography>Loading server information...</Typography>);
    }

    return (<Grid2 container spacing={3}>
        {/* Server Overview Card */}
        <Grid2
            item xs={12} md={6}>
            <Card elevation={3}>
                <CardHeader title="Server Overview"
                            action={<IconButton
                                aria-label="server-actions"
                                aria-controls={menuOpen ? 'server-actions-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={menuOpen ? 'true' : undefined}
                                onClick={handleMenuClick}
                            >
                                <MoreVertIcon/>
                            </IconButton>}
                />
                <Menu
                    id="server-actions-menu"
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    MenuListProps={{
                        'aria-labelledby': 'server-actions-button',
                    }}
                >
                    <MenuItem onClick={handleViewLibraries}>View Installed Libraries</MenuItem>
                    {/* Add more actions here as needed */}
                </Menu>
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
        <Grid2 item xs={12}>
            <Card elevation={3}>
                <CardHeader title="System Load Average"/>
                <Divider/>
                <CardContent>
                    <Box sx={{height: 300, mt: 2}}>
                        <Line data={loadChartData} options={chartOptions}/>
                    </Box>
                </CardContent>
            </Card>
        </Grid2>
        {/* Libraries Modal */}
        <Modal
            open={librariesModalOpen}
            onClose={handleCloseLibrariesModal}
            aria-labelledby="libraries-modal-title"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: {xs: '90%', sm: '80%', md: '70%'},
                maxHeight: '80vh',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography id="libraries-modal-title" variant="h6" component="h2">
                        Installed Libraries
                    </Typography>
                    <Box>
                        <IconButton
                            size="small"
                            onClick={handleRefreshLibraries}
                            disabled={librariesApi.loading}
                            sx={{mr: 1}}
                        >
                            <RefreshIcon/>
                        </IconButton>
                        <IconButton size="small" onClick={handleCloseLibrariesModal}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    placeholder="Search libraries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                    sx={{mb: 2}}
                />

                <Box sx={{flexGrow: 1, overflow: 'auto'}}>
                    {librariesApi.loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                            <CircularProgress/>
                        </Box>
                    ) : librariesApi.error ? (
                        <Alert severity="error" sx={{mb: 2}}>
                            Error loading libraries: {librariesApi.error.message || 'Unknown error'}
                        </Alert>
                    ) : !librariesApi.data || !filteredLibraries.length ? (
                        <Alert severity="info">
                            {searchTerm ? 'No libraries match your search' : 'No libraries data available'}
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Library Name</TableCell>
                                        <TableCell>Version</TableCell>
                                        <TableCell>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLibraries.map((lib, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{lib.name || 'N/A'}</TableCell>
                                            <TableCell>{lib.version || 'N/A'}</TableCell>
                                            <TableCell>{lib.description || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>

                <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                    <Button onClick={handleCloseLibrariesModal} variant="outlined">
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    </Grid2>);
};

export default ServerDetails;
import React, {useState, useEffect, useMemo} from 'react';
import {
    Typography,
    Box,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    TextField,
    InputAdornment,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    Tooltip,
    Menu,
    MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import useApi from '../../../hooks/useApi';

const DockerContainers = () => {
    // API hook for Docker containers
    const containersApi = useApi();
    // State for search functionality
    const [searchTerm, setSearchTerm] = useState('');
    // State for selected container actions menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedContainer, setSelectedContainer] = useState(null);
    const menuOpen = Boolean(anchorEl);

    // Fetch data when component mounts
    useEffect(() => {
        fetchContainers();
    }, []);

    // Function to fetch Docker containers
    const fetchContainers = async () => {
        try {
            console.log('Fetching Docker containers...');
            await containersApi.request({
                url: '/docker/containers'
            });
            console.log('Docker containers received');
        } catch (error) {
            console.error('Failed to fetch Docker containers:', error);
        }
    };

    // Handle menu open for a specific container
    const handleMenuClick = (event, container) => {
        setAnchorEl(event.currentTarget);
        setSelectedContainer(container);
    };

    // Handle menu close
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedContainer(null);
    };

    // Handle refresh containers
    const handleRefreshContainers = () => {
        fetchContainers();
    };

    // Handle container actions (placeholder functions)
    const handleStartContainer = () => {
        console.log('Start container:', selectedContainer);
        handleMenuClose();
    };

    const handleStopContainer = () => {
        console.log('Stop container:', selectedContainer);
        handleMenuClose();
    };

    const handleDeleteContainer = () => {
        console.log('Delete container:', selectedContainer);
        handleMenuClose();
    };

    const handleViewContainerDetails = () => {
        console.log('View container details:', selectedContainer);
        handleMenuClose();
    };

    // Filter containers based on search term
    const filteredContainers = useMemo(() => {
        if (!containersApi.data || !Array.isArray(containersApi.data)) {
            return [];
        }

        return containersApi.data.filter(container => {
            if (!container || typeof container !== 'object') return false;

            // This would need to be adapted based on your container data structure
            const nameMatch = container.name &&
                container.name.toLowerCase().includes(searchTerm.toLowerCase());
            const idMatch = container.id &&
                container.id.toLowerCase().includes(searchTerm.toLowerCase());
            const imageMatch = container.image &&
                container.image.toLowerCase().includes(searchTerm.toLowerCase());

            return nameMatch || idMatch || imageMatch;
        });
    }, [containersApi.data, searchTerm]);

    // Format container ID for display
    const shortenContainerId = (id) => {
        if (!id) return '';
        return id.substring(0, 12);
    };

    // Handle errors
    if (containersApi.error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error fetching Docker containers. Please check your connection and try again.
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Docker Containers"
                action={
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <TextField
                            size="small"
                            placeholder="Search containers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small"/>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{mr: 1}}
                        />
                        <Tooltip title="Refresh">
                            <IconButton onClick={handleRefreshContainers}>
                                <RefreshIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                }
            />
            <CardContent>
                {containersApi.loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table sx={{minWidth: 650}} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Container ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Ports</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredContainers.length > 0 ? (
                                    filteredContainers.map((container, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <Tooltip title={container.id || 'N/A'}>
                                                    <span>{container.container_id}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{container.names || 'N/A'}</TableCell>
                                            <TableCell>{container.image || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={container.status || 'Unknown'}
                                                    size="small"
                                                    color={container.status?.toLowerCase().includes('running') ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>{container.ports || 'None'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={(event) => handleMenuClick(event, container)}
                                                >
                                                    <MoreVertIcon fontSize="small"/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {containersApi.data && Array.isArray(containersApi.data) && containersApi.data.length === 0
                                                ? 'No Docker containers found'
                                                : searchTerm
                                                    ? 'No matching containers found'
                                                    : 'No data available'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Container Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleViewContainerDetails}>
                        <InfoIcon fontSize="small" sx={{mr: 1}}/>
                        View Details
                    </MenuItem>
                    <MenuItem onClick={handleStartContainer}>
                        <PlayArrowIcon fontSize="small" sx={{mr: 1}}/>
                        Start
                    </MenuItem>
                    <MenuItem onClick={handleStopContainer}>
                        <StopIcon fontSize="small" sx={{mr: 1}}/>
                        Stop
                    </MenuItem>
                    <MenuItem onClick={handleDeleteContainer} sx={{color: 'error.main'}}>
                        <DeleteIcon fontSize="small" sx={{mr: 1}}/>
                        Remove
                    </MenuItem>
                </Menu>
            </CardContent>
        </Card>
    );
};

export default DockerContainers;
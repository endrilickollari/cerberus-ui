import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Modal,
    Paper,
    Grid,
    Divider,
    IconButton,
    Tooltip,
    Chip,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import useApi from '../../../hooks/useApi';

// Custom Tab Panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`docker-details-tabpanel-${index}`}
            aria-labelledby={`docker-details-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 2, pb: 1 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Function to create accessibility properties for tabs
function a11yProps(index) {
    return {
        id: `docker-details-tab-${index}`,
        'aria-controls': `docker-details-tabpanel-${index}`,
    };
}

const DockerImageDetailsModal = ({ open, onClose, imageId }) => {
    // API hook for image details
    const imageDetailsApi = useApi();
    // State for the active tab
    const [activeTab, setActiveTab] = useState(0);

    // Format size for display (convert to MB/GB as appropriate)
    const formatSize = (sizeInBytes) => {
        if (typeof sizeInBytes !== 'number') return 'N/A';

        if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(2)} KB`;
        } else if (sizeInBytes < 1024 * 1024 * 1024) {
            return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        } else {
            return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
    };

    // Copy to clipboard function
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a snackbar notification here to show it was copied
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Fetch image details when modal opens or imageId changes
    useEffect(() => {
        if (open && imageId) {
            const fetchImageDetails = async () => {
                try {
                    console.log(`Fetching details for image: ${imageId}`);
                    await imageDetailsApi.request({
                        url: `/docker/image/${imageId}`
                    });
                    console.log('Image details received');
                } catch (error) {
                    console.error('Failed to fetch image details:', error);
                }
            };

            fetchImageDetails();
        }
    }, [open, imageId]);

    // Handle close with cleanup
    const handleClose = () => {
        setActiveTab(0);
        onClose();
    };

    // Modal style
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: 900,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 1,
        overflow: 'auto'
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-docker-image-details"
            aria-describedby="modal-docker-image-information"
        >
            <Paper sx={modalStyle}>
                {/* Header with close button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography id="modal-docker-image-details" variant="h6" component="h2">
                        Docker Image Details
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Loading state */}
                {imageDetailsApi.loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error state */}
                {imageDetailsApi.error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        Error fetching image details. Please try again.
                    </Alert>
                )}

                {/* Content when data is loaded */}
                {!imageDetailsApi.loading && imageDetailsApi.data && (
                    <>
                        {/* Basic information */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        ID
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mr: 1,
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-all',
                                                maxWidth: '90%'
                                            }}
                                        >
                                            {imageDetailsApi.data.id || 'N/A'}
                                        </Typography>
                                        <Tooltip title="Copy to clipboard">
                                            <IconButton
                                                size="small"
                                                onClick={() => copyToClipboard(imageDetailsApi.data.id)}
                                            >
                                                <FileCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Created
                                    </Typography>
                                    <Typography variant="body2">
                                        {imageDetailsApi.data.created || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Author
                                    </Typography>
                                    <Typography variant="body2">
                                        {imageDetailsApi.data.author || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Size
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatSize(imageDetailsApi.data.size)} (Virtual: {formatSize(imageDetailsApi.data.virtual_size)})
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        OS / Architecture
                                    </Typography>
                                    <Typography variant="body2">
                                        {imageDetailsApi.data.os || 'N/A'} / {imageDetailsApi.data.architecture || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Docker Version
                                    </Typography>
                                    <Typography variant="body2">
                                        {imageDetailsApi.data.docker_version || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        {/* Tabs for detailed information */}
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    aria-label="Docker image details tabs"
                                >
                                    <Tab label="Config" {...a11yProps(0)} />
                                    <Tab label="Tags & Digests" {...a11yProps(1)} />
                                    <Tab label="Layers" {...a11yProps(2)} />
                                    <Tab label="Labels" {...a11yProps(3)} />
                                    <Tab label="History" {...a11yProps(4)} />
                                </Tabs>
                            </Box>

                            {/* Config tab */}
                            <TabPanel value={activeTab} index={0}>
                                <Grid container spacing={3}>
                                    {/* Command */}
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Command
                                            </Typography>
                                            {imageDetailsApi.data.cmd && imageDetailsApi.data.cmd.length > 0 ? (
                                                <Typography
                                                    variant="body2"
                                                    component="div"
                                                    sx={{
                                                        bgcolor: 'background.default',
                                                        p: 1,
                                                        borderRadius: 1,
                                                        fontFamily: 'monospace'
                                                    }}
                                                >
                                                    {imageDetailsApi.data.cmd.join(' ')}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2">None</Typography>
                                            )}
                                        </Box>

                                        {/* Entrypoint */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Entrypoint
                                            </Typography>
                                            {imageDetailsApi.data.entrypoint && imageDetailsApi.data.entrypoint.length > 0 ? (
                                                <Typography
                                                    variant="body2"
                                                    component="div"
                                                    sx={{
                                                        bgcolor: 'background.default',
                                                        p: 1,
                                                        borderRadius: 1,
                                                        fontFamily: 'monospace'
                                                    }}
                                                >
                                                    {imageDetailsApi.data.entrypoint.join(' ')}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2">None</Typography>
                                            )}
                                        </Box>

                                        {/* Working Dir */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Working Directory
                                            </Typography>
                                            <Typography variant="body2">
                                                {imageDetailsApi.data.working_dir || 'None'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Environment Variables */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Environment Variables
                                        </Typography>
                                        {imageDetailsApi.data.env && imageDetailsApi.data.env.length > 0 ? (
                                            <Box
                                                sx={{
                                                    bgcolor: 'background.default',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    maxHeight: 200,
                                                    overflow: 'auto'
                                                }}
                                            >
                                                <List dense>
                                                    {imageDetailsApi.data.env.map((env, index) => (
                                                        <ListItem key={index} disablePadding>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{ fontFamily: 'monospace' }}
                                                                    >
                                                                        {env}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2">None</Typography>
                                        )}

                                        {/* Exposed Ports */}
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Exposed Ports
                                            </Typography>
                                            {imageDetailsApi.data.exposed_ports &&
                                            Object.keys(imageDetailsApi.data.exposed_ports).length > 0 ? (
                                                <Box sx={{ mt: 1 }}>
                                                    {Object.keys(imageDetailsApi.data.exposed_ports).map((port, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={port}
                                                            size="small"
                                                            sx={{ mr: 1, mb: 1 }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2">None</Typography>
                                            )}
                                        </Box>

                                        {/* Volumes */}
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Volumes
                                            </Typography>
                                            {imageDetailsApi.data.volumes &&
                                            Object.keys(imageDetailsApi.data.volumes).length > 0 ? (
                                                <Box sx={{ mt: 1 }}>
                                                    {Object.keys(imageDetailsApi.data.volumes).map((volume, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={volume}
                                                            size="small"
                                                            sx={{ mr: 1, mb: 1 }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2">None</Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* Tags & Digests tab */}
                            <TabPanel value={activeTab} index={1}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Repository Tags
                                        </Typography>
                                        {imageDetailsApi.data.repo_tags && imageDetailsApi.data.repo_tags.length > 0 ? (
                                            <List dense>
                                                {imageDetailsApi.data.repo_tags.map((tag, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText
                                                            primary={tag}
                                                            primaryTypographyProps={{
                                                                variant: 'body2',
                                                                sx: { fontFamily: 'monospace' }
                                                            }}
                                                        />
                                                        <Tooltip title="Copy to clipboard">
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={() => copyToClipboard(tag)}
                                                            >
                                                                <FileCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2">None</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Repository Digests
                                        </Typography>
                                        {imageDetailsApi.data.repo_digests && imageDetailsApi.data.repo_digests.length > 0 ? (
                                            <List dense>
                                                {imageDetailsApi.data.repo_digests.map((digest, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText
                                                            primary={digest}
                                                            primaryTypographyProps={{
                                                                variant: 'body2',
                                                                sx: {
                                                                    fontFamily: 'monospace',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }
                                                            }}
                                                        />
                                                        <Tooltip title="Copy to clipboard">
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={() => copyToClipboard(digest)}
                                                            >
                                                                <FileCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2">None</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* Layers tab */}
                            <TabPanel value={activeTab} index={2}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Layers ({imageDetailsApi.data.layers ? imageDetailsApi.data.layers.length : 0})
                                </Typography>
                                {imageDetailsApi.data.layers && imageDetailsApi.data.layers.length > 0 ? (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Digest</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {imageDetailsApi.data.layers.map((layer, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontFamily: 'monospace',
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        maxWidth: '600px'
                                                                    }}
                                                                >
                                                                    {layer}
                                                                </Typography>
                                                                <Tooltip title="Copy to clipboard">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => copyToClipboard(layer)}
                                                                        sx={{ ml: 1 }}
                                                                    >
                                                                        <FileCopyIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body2">No layer information available</Typography>
                                )}

                                {/* Additional Size Information */}
                                <Box sx={{ mt: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Total Size
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatSize(imageDetailsApi.data.size)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Shared Size
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatSize(imageDetailsApi.data.shared_size)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Virtual Size
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatSize(imageDetailsApi.data.virtual_size)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </TabPanel>

                            {/* Labels tab */}
                            <TabPanel value={activeTab} index={3}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Image Labels
                                </Typography>
                                {imageDetailsApi.data.labels && Object.keys(imageDetailsApi.data.labels).length > 0 ? (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Key</TableCell>
                                                    <TableCell>Value</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {Object.entries(imageDetailsApi.data.labels).map(([key, value], index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>{key}</TableCell>
                                                        <TableCell>{value}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body2">No labels defined</Typography>
                                )}
                            </TabPanel>

                            {/* History tab */}
                            <TabPanel value={activeTab} index={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Build History
                                </Typography>
                                {imageDetailsApi.data.history && imageDetailsApi.data.history.length > 0 ? (
                                    <Box>
                                        {imageDetailsApi.data.history.map((item, index) => (
                                            <Accordion
                                                key={index}
                                                disableGutters
                                                elevation={0}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    mb: 1,
                                                    '&:before': {
                                                        display: 'none',
                                                    },
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    id={`history-header-${index}`}
                                                >
                                                    <Typography variant="body2">
                                                        {item.created && `${item.created} • `}
                                                        {item.comment || (item.created_by ? item.created_by.substring(0, 60) + '...' : 'No details')}
                                                        {item.empty_layer && ' (Empty Layer)'}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Command
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                component="div"
                                                                sx={{
                                                                    bgcolor: 'background.default',
                                                                    p: 1,
                                                                    borderRadius: 1,
                                                                    fontFamily: 'monospace',
                                                                    whiteSpace: 'pre-wrap',
                                                                    wordBreak: 'break-all'
                                                                }}
                                                            >
                                                                {item.created_by || 'N/A'}
                                                            </Typography>
                                                        </Grid>

                                                        {item.comment && (
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle2" color="text.secondary">
                                                                    Comment
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {item.comment}
                                                                </Typography>
                                                            </Grid>
                                                        )}

                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Created
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {item.created || 'N/A'}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Empty Layer
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {item.empty_layer ? 'Yes' : 'No'}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2">No history information available</Typography>
                                )}
                            </TabPanel>
                        </Box>
                    </>
                )}
            </Paper>
        </Modal>
    );
};

export default DockerImageDetailsModal;
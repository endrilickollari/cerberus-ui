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
    TextField,
    Button,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    Alert,
    Breadcrumbs,
    Link,
    ListItemIcon,
    ListItemSecondaryAction, Grid2,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {format} from 'date-fns';
import useApi from '../../hooks/useApi';
import apiEndpoints from '../../services/api';
import {LinkIcon} from "lucide-react";

const FileExplorer = () => {
    // State for file system navigation
    const [currentPath, setCurrentPath] = useState('/home');
    const [history, setHistory] = useState(['/home']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [includeHidden, setIncludeHidden] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // API hooks
    const listApi = useApi(apiEndpoints.listFileSystem);
    const detailsApi = useApi(apiEndpoints.listFileSystemDetails);
    const searchApi = useApi(apiEndpoints.searchFileSystem);

    // Fetch file system data on mount and when path changes
    useEffect(() => {
        fetchFileList(currentPath);
    }, [currentPath, includeHidden]);

    // Fetch file list for current path
    const fetchFileList = async (path) => {
        try {
            console.log(`Fetching file list for path: ${path}`);
            await listApi.request({
                url: '/filesystem/list',
                params: {
                    path: path,
                    include_hidden: includeHidden
                }
            });
        } catch (error) {
            console.error('Failed to fetch file list:', error);
        }
    };

    // Fetch file details
    const fetchFileDetails = async (path) => {
        try {
            console.log(`Fetching details for: ${path}`);
            await detailsApi.request({
                url: '/filesystem/details',
                params: {
                    path: path
                }
            });
        } catch (error) {
            console.error('Failed to fetch file details:', error);
        }
    };

    // Search files
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            console.log(`Searching for: ${searchTerm} in ${currentPath}`);
            await searchApi.request({
                url: '/filesystem/search',
                params: {
                    path: currentPath,
                    pattern: searchTerm,
                    max_depth: 5
                }
            });
        } catch (error) {
            console.error('Failed to search files:', error);
        }
    };

    // Process file list data
    const fileEntries = useMemo(() => {
        if (!listApi.data || !listApi.data.entries) {
            console.log('No file entries available');
            return [];
        }

        const entries = listApi.data.entries;
        console.log(`Processing ${entries.length} file entries`);

        // Sort entries: directories first, then files, all alphabetically
        return [...entries].sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'directory' ? -1 : 1;
        });
    }, [listApi.data]);

    // Process search results
    const searchResults = useMemo(() => {
        if (!searchApi.data || !searchApi.data) {
            return [];
        }

        const results = searchApi.data;
        console.log(`Processing ${results.length} search results`);

        return results;
    }, [searchApi.data]);

    // Selected file details
    const fileDetails = useMemo(() => {
        if (!detailsApi.data) {
            return null;
        }

        return detailsApi.data;
    }, [detailsApi.data]);

    // Navigate to a path
    const navigateTo = (path) => {
        if (path === currentPath) return;

        // Add to history
        const newHistory = [...history.slice(0, historyIndex + 1), path];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setCurrentPath(path);
        setSelectedItem(null);
    };

    // Handle back navigation
    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCurrentPath(history[historyIndex - 1]);
            setSelectedItem(null);
        }
    };

    // Handle forward navigation
    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCurrentPath(history[historyIndex + 1]);
            setSelectedItem(null);
        }
    };

    // Go to home directory
    const goHome = () => {
        navigateTo('/home');
    };

    // Handle file/folder click
    const handleItemClick = (entry) => {
        setSelectedItem(entry);
        fetchFileDetails(entry.path);
        if (entry.type === 'directory') {
            navigateTo(entry.path);
        } else {
            setOpenModal(true);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === undefined || bytes === null) return 'Unknown';

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;

        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }

        return `${bytes.toFixed(1)} ${units[i]}`;
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a');
        } catch (e) {
            return dateString || 'Unknown';
        }
    };

    // Get icon for file type
    const getFileIcon = (entry) => {
        if (entry.type === 'directory') {
            return <FolderIcon sx={{ color: 'warning.main' }} />;
        }

        if (entry.type === 'symlink') {
            return <LinkIcon sx={{ color: 'secondary.main' }} />;
        }

        const extension = entry.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return <ImageIcon sx={{color: 'success.main'}}/>;
            case 'pdf':
                return <PictureAsPdfIcon sx={{color: 'error.main'}}/>;
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
            case 'html':
            case 'css':
            case 'php':
            case 'py':
            case 'java':
            case 'c':
            case 'cpp':
                return <CodeIcon sx={{color: 'info.main'}}/>;
            case 'txt':
            case 'md':
            case 'json':
            case 'xml':
            case 'csv':
                return <DescriptionIcon sx={{color: 'primary.main'}}/>;
            default:
                return <InsertDriveFileIcon color="action"/>;
        }
    };

    // Generate breadcrumbs from path
    const renderBreadcrumbs = () => {
        const parts = currentPath.split('/').filter(Boolean);
        const breadcrumbs = [];

        // Add root
        breadcrumbs.push(
            <Link
                key="root"
                color="inherit"
                onClick={() => navigateTo('/')}
                sx={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
            >
                <HomeIcon fontSize="small" sx={{mr: 0.5}}/>
                root
            </Link>
        );

        // Add path parts
        let currentPathAccumulator = '';
        parts.forEach((part, index) => {
            currentPathAccumulator += `/${part}`;
            const path = currentPathAccumulator;

            breadcrumbs.push(
                <Link
                    key={path}
                    color="inherit"
                    onClick={() => navigateTo(path)}
                    sx={{cursor: 'pointer'}}
                >
                    {part}
                </Link>
            );
        });

        return (
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                {breadcrumbs}
            </Breadcrumbs>
        );
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchFileList(currentPath);
    };

    // Show loading state
    if (listApi.loading && !fileEntries.length) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4}}>
                <CircularProgress size={40}/>
                <Typography sx={{ml: 2}}>Loading file system data...</Typography>
            </Box>
        );
    }

    // Show error state
    if (listApi.error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error loading file system: {listApi.error.message || 'Unknown error'}
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

    // Determine which entries to display (search results or file list)
    const displayEntries = searchApi.data ? searchResults : fileEntries;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            {/* Navigation and Search Bar */}
            <Card elevation={3} sx={{mb: 2}}>
                <CardContent sx={{pb: 1}}>
                    {/* Navigation Controls */}
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Tooltip title="Back">
            <span>
              <IconButton
                  color="primary"
                  onClick={goBack}
                  disabled={historyIndex <= 0}
              >
                <ArrowBackIcon/>
              </IconButton>
            </span>
                        </Tooltip>

                        <Tooltip title="Forward">
            <span>
              <IconButton
                  color="primary"
                  onClick={goForward}
                  disabled={historyIndex >= history.length - 1}
              >
                <ArrowForwardIcon/>
              </IconButton>
            </span>
                        </Tooltip>

                        <Tooltip title="Home">
                            <IconButton color="primary" onClick={goHome}>
                                <HomeIcon/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Refresh">
                            <IconButton color="primary" onClick={handleRefresh} disabled={listApi.loading}>
                                {listApi.loading ? <CircularProgress size={24}/> : <RefreshIcon/>}
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{mx: 1}}/>

                        <Box sx={{flexGrow: 1}}>
                            {renderBreadcrumbs()}
                        </Box>
                    </Box>

                    {/* Search Controls */}
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action"/>
                                    </InputAdornment>
                                ),
                                endAdornment: searchApi.loading && (
                                    <InputAdornment position="end">
                                        <CircularProgress size={20}/>
                                    </InputAdornment>
                                )
                            }}
                            sx={{mr: 2}}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={!searchTerm.trim() || searchApi.loading}
                        >
                            Search
                        </Button>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeHidden}
                                    onChange={(e) => setIncludeHidden(e.target.checked)}
                                    name="includeHidden"
                                />
                            }
                            label="Show hidden files"
                            sx={{ml: 2}}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* File System Content */}
            <Grid2 container spacing={2}>
                {/* File List */}
                <Grid2 item xs={12} md={8}>
                    <Card elevation={3}>
                        <CardHeader
                            title={searchApi.data ? "Search Results" : "File System"}
                            subheader={searchApi.data ? `Found ${searchResults.length} results for "${searchTerm}"` : currentPath}
                            action={
                                <Box sx={{display: 'flex'}}>
                                    {searchApi.data && (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => searchApi.setData(null)}
                                            sx={{mr: 1}}
                                        >
                                            Clear Search
                                        </Button>
                                    )}
                                </Box>
                            }
                        />
                        <Divider/>
                        <CardContent sx={{height: '60vh', overflow: 'auto'}}>
                            {displayEntries.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <Grid2 container spacing={2}>
                                        {displayEntries.map((entry) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={entry.path}>
                                                <Paper
                                                    elevation={selectedItem?.path === entry.path ? 3 : 1}
                                                    sx={{
                                                        p: 2,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        bgcolor: selectedItem?.path === entry.path ? 'action.selected' : 'background.paper',
                                                        '&:hover': {bgcolor: 'action.hover'},
                                                        opacity: entry.is_hidden ? 0.6 : 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        height: '100%'
                                                    }}
                                                    onClick={() => handleItemClick(entry)}
                                                >
                                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                        {getFileIcon(entry)}
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                ml: 1,
                                                                fontWeight: 'medium',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {entry.name}
                                                        </Typography>
                                                    </Box>

                                                    <Typography variant="body2" color="text.secondary"
                                                                sx={{mt: 'auto'}}>
                                                        {entry.type === 'file' ? formatFileSize(entry.size) : 'Directory'}
                                                    </Typography>

                                                    <Typography variant="caption" color="text.secondary">
                                                        {entry.last_modified && formatDate(entry.last_modified)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid2>
                                ) : (
                                    <List>
                                        {displayEntries.map((entry) => (
                                            <ListItem
                                                key={entry.path}
                                                button
                                                divider
                                                selected={selectedItem?.path === entry.path}
                                                onClick={() => handleItemClick(entry)}
                                                sx={{opacity: entry.is_hidden ? 0.6 : 1}}
                                            >
                                                <ListItemIcon>
                                                    {getFileIcon(entry)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={entry.name}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2"
                                                                        color="text.primary">
                                                                {entry.type === 'file' ? formatFileSize(entry.size) : 'Directory'}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Modified: {formatDate(entry.last_modified)}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title="View Details">
                                                        <IconButton edge="end" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedItem(entry);
                                                            fetchFileDetails(entry.path);
                                                            setOpenModal(true);
                                                        }}>
                                                            <InfoIcon/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                )
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    p: 4
                                }}>
                                    <Typography color="text.secondary">
                                        {searchApi.data ? 'No search results found' : 'This directory is empty'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>

                {/* File Details */}
                <Grid2 item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardHeader
                            title="File Details"
                            action={
                                <Tooltip title="View Details">
                <span>
                  <IconButton
                      disabled={!selectedItem}
                      onClick={() => selectedItem && setOpenModal(true)}
                  >
                    <VisibilityIcon/>
                  </IconButton>
                </span>
                                </Tooltip>
                            }
                        />
                        <Divider/>
                        <CardContent sx={{height: '60vh', overflow: 'auto'}}>
                            {selectedItem ? (
                                <Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        {getFileIcon(selectedItem)}
                                        <Typography variant="h6" sx={{ml: 1}}>
                                            {selectedItem.name}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{my: 2}}/>

                                    <Grid2 container spacing={2}>
                                        <Grid2 item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Type
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedItem.type === 'directory' ? 'Directory' : 'File'}
                                            </Typography>
                                        </Grid2>

                                        {selectedItem.type === 'file' && (
                                            <Grid2 item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Size
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatFileSize(selectedItem.size)}
                                                </Typography>
                                            </Grid2>
                                        )}

                                        <Grid2 item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Path
                                            </Typography>
                                            <Typography variant="body1" sx={{wordBreak: 'break-all'}}>
                                                {selectedItem.path}
                                            </Typography>
                                        </Grid2>

                                        <Grid2 item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Modified
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(selectedItem.last_modified)}
                                            </Typography>
                                        </Grid2>

                                        <Grid2 item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Hidden
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedItem.is_hidden ? 'Yes' : 'No'}
                                            </Typography>
                                        </Grid2>

                                        <Grid2 item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Owner
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedItem.owner || 'N/A'}
                                            </Typography>
                                        </Grid2>

                                        <Grid2 item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Group
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedItem.group || 'N/A'}
                                            </Typography>
                                        </Grid2>

                                        <Grid2 item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Permissions
                                            </Typography>
                                            <Typography variant="body1" fontFamily="monospace">
                                                {selectedItem.permissions || 'N/A'}
                                            </Typography>
                                        </Grid2>
                                    </Grid2>

                                    {fileDetails?.preview && (
                                        <>
                                            <Divider sx={{my: 2}}/>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Preview
                                            </Typography>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    mt: 1,
                                                    p: 2,
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem',
                                                    bgcolor: 'grey.100',
                                                    overflow: 'auto',
                                                    maxHeight: '200px',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-all'
                                                }}
                                            >
                                                {fileDetails.preview}
                                            </Paper>
                                        </>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <Typography color="text.secondary">
                                        Select a file or directory to view details
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>

            {/* File Details Modal */}
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="file-details-modal"
                sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
                <Paper sx={{width: '80%', maxWidth: 800, maxHeight: '80vh', p: 4, overflow: 'auto', outline: 'none'}}>
                    {fileDetails ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                {fileDetails.name}
                            </Typography>

                            <Divider sx={{my: 2}}/>

                            <Grid2 container spacing={2}>
                                {Object.entries(fileDetails).map(([key, value]) => {
                                    // Skip preview as it's handled separately
                                    if (key === 'preview') return null;

                                    return (
                                        <Grid2 item xs={12} sm={6} key={key}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {key.replace(/_/g, ' ').toUpperCase()}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom sx={{wordBreak: 'break-all'}}>
                                                {key === 'size' ? formatFileSize(value) :
                                                    key === 'last_modified' ? formatDate(value) :
                                                        key === 'is_hidden' ? (value ? 'Yes' : 'No') :
                                                            value || 'N/A'}
                                            </Typography>
                                        </Grid2>
                                    );
                                })}
                            </Grid2>

                            {fileDetails.preview && (
                                <>
                                    <Divider sx={{my: 2}}/>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        PREVIEW
                                    </Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            bgcolor: 'grey.100',
                                            overflow: 'auto',
                                            maxHeight: '300px',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        {fileDetails.preview}
                                    </Paper>
                                </>
                            )}
                        </>
                    ) : selectedItem ? (
                        <Typography>Loading details...</Typography>
                    ) : (
                        <Typography>No item selected</Typography>
                    )}

                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                        <Button onClick={() => setOpenModal(false)} variant="contained">
                            Close
                        </Button>
                    </Box>
                </Paper>
            </Modal>
        </Box>
    );
};

export default FileExplorer;
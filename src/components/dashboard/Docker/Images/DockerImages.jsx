// Handle dialog close (after animation)
const handleDialogClosed = () => {
    if (!deleteConfirmOpen) {
        setImageToDelete(null);
    }
};
import React, {useState, useEffect, useMemo} from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
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
    MenuItem,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useApi from '../../../hooks/useApi';
import DockerImageDetailsModal from './DockerImageDetailsModal';
import DockerRunImageModal from './DockerRunImageModal';

const DockerImages = () => {
    // API hooks
    const imagesApi = useApi(); // For fetching Docker images
    const deleteImageApi = useApi(); // For delete operations

    // State for search functionality
    const [searchTerm, setSearchTerm] = useState('');
    // State for selected image actions menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const menuOpen = Boolean(anchorEl);

    // State for image details modal
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);

    // State for delete confirmation dialog
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    // State for run image modal
    const [runImageModalOpen, setRunImageModalOpen] = useState(false);
    const [imageToRun, setImageToRun] = useState(null);

    // Fetch data when component mounts
    useEffect(() => {
        fetchImages();
    }, []);

    // Function to fetch Docker images
    const fetchImages = async () => {
        try {
            console.log('Fetching Docker images...');
            await imagesApi.request({
                url: '/docker/images'
            });
            console.log('Docker images received');
        } catch (error) {
            console.error('Failed to fetch Docker images:', error);
        }
    };

    // Handle menu open for a specific image
    const handleMenuClick = (event, image) => {
        setAnchorEl(event.currentTarget);
        setSelectedImage(image);
    };

    // Handle menu close
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedImage(null);
    };

    // Handle refresh images
    const handleRefreshImages = () => {
        fetchImages();
    };

    // Show delete confirmation dialog
    const handleDeleteImageClick = () => {
        // Store the image to delete in a separate state
        setImageToDelete(selectedImage);
        setDeleteConfirmOpen(true);
        handleMenuClose();
    };

    // Cancel image deletion
    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        // Don't clear imageToDelete yet, wait until the dialog is fully closed
    };

    // Handle image run
    const handleRunImage = () => {
        setImageToRun(selectedImage);
        setRunImageModalOpen(true);
        handleMenuClose();
    };

    // Handle close run image modal
    const handleCloseRunImageModal = (success) => {
        setRunImageModalOpen(false);
        if (success) {
            // If container was successfully created, we might want to redirect to containers tab
            // or refresh the containers list
            console.log('Container created successfully');
        }
    };

    // Confirm and execute image deletion
    const handleConfirmDelete = async () => {
        if (!imageToDelete || !imageToDelete.image_id) {
            console.error('No image ID available for deletion');
            setDeleteConfirmOpen(false);
            return;
        }

        try {
            console.log(`Deleting image: ${imageToDelete.image_id}`);
            await deleteImageApi.request({
                url: `/docker/image/${imageToDelete.image_id}`,
                method: 'DELETE'
            });

            // If successful, refresh the images list
            if (!deleteImageApi.error) {
                console.log('Image deleted successfully');
                fetchImages(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    // Handle image details view
    const handleViewImageDetails = () => {
        if (selectedImage) {
            setSelectedImageId(selectedImage.image_id);
            setDetailsModalOpen(true);
        }
        handleMenuClose();
    };

    // Handle closing details modal
    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
    };

    // Handle row click to view details directly
    const handleRowClick = (image) => {
        setSelectedImageId(image.image_id);
        setDetailsModalOpen(true);
    };

    // Filter images based on search term
    const filteredImages = useMemo(() => {
        if (!imagesApi.data || !Array.isArray(imagesApi.data)) {
            return [];
        }

        return imagesApi.data.filter(image => {
            if (!image || typeof image !== 'object') return false;

            const repositoryMatch = image.repository &&
                image.repository.toLowerCase().includes(searchTerm.toLowerCase());
            const tagMatch = image.tag &&
                image.tag.toLowerCase().includes(searchTerm.toLowerCase());
            const imageIdMatch = image.image_id &&
                image.image_id.toLowerCase().includes(searchTerm.toLowerCase());

            return repositoryMatch || tagMatch || imageIdMatch;
        });
    }, [imagesApi.data, searchTerm]);

    // Format size for display (convert to MB/GB as appropriate)
    const formatSize = (sizeString) => {
        try {
            // Assuming size comes in bytes as a string
            const sizeInBytes = parseInt(sizeString, 10);
            if (isNaN(sizeInBytes)) return sizeString;

            if (sizeInBytes < 1024 * 1024) {
                return `${(sizeInBytes / 1024).toFixed(2)} KB`;
            } else if (sizeInBytes < 1024 * 1024 * 1024) {
                return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
            } else {
                return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
            }
        } catch (e) {
            return sizeString;
        }
    };

    // Get vulnerability chip color based on severity
    const getVulnerabilityColor = (vulnerability) => {
        if (!vulnerability) return 'default';

        const lowercased = vulnerability.toLowerCase();
        if (lowercased.includes('high') || lowercased.includes('critical')) return 'error';
        if (lowercased.includes('medium')) return 'warning';
        if (lowercased.includes('low')) return 'success';
        return 'default';
    };

    // Get shortened image ID for display
    const shortenImageId = (imageId) => {
        if (!imageId) return '';
        return imageId.substring(0, 12);
    };

    // Handle errors
    if (imagesApi.error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error fetching Docker images. Please check your connection and try again.
            </Alert>
        );
    }

    return (
        <>
            <Card>
                <CardHeader
                    title="Docker Images"
                    action={
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <TextField
                                size="small"
                                placeholder="Search images..."
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
                                <IconButton onClick={handleRefreshImages}>
                                    <RefreshIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }
                />
                <CardContent>
                    {imagesApi.loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                            <CircularProgress/>
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table sx={{minWidth: 650}} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Repository</TableCell>
                                        <TableCell>Tag</TableCell>
                                        <TableCell>Image ID</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell align="right">Size</TableCell>
                                        {/*<TableCell>Vulnerability</TableCell>*/}
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredImages.length > 0 ? (
                                        filteredImages.map((image, index) => (
                                            <TableRow
                                                key={index}
                                                hover
                                                onClick={() => handleRowClick(image)}
                                                sx={{cursor: 'pointer'}}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {image.repository || 'N/A'}
                                                </TableCell>
                                                <TableCell>{image.tag || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Tooltip title={image.image_id || 'N/A'}>
                                                        <span>{shortenImageId(image.image_id)}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>{image.created || 'N/A'}</TableCell>
                                                <TableCell align="right">{image.size}</TableCell>
                                                {/*<TableCell>*/}
                                                {/*    {image.vulnerability ? (*/}
                                                {/*        <Chip*/}
                                                {/*            label={image.vulnerability}*/}
                                                {/*            size="small"*/}
                                                {/*            color={getVulnerabilityColor(image.vulnerability)}*/}
                                                {/*        />*/}
                                                {/*    ) : (*/}
                                                {/*        'None'*/}
                                                {/*    )}*/}
                                                {/*</TableCell>*/}
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => {
                                                            event.stopPropagation(); // Prevent row click
                                                            handleMenuClick(event, image);
                                                        }}
                                                    >
                                                        <MoreVertIcon fontSize="small"/>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                {imagesApi.data && Array.isArray(imagesApi.data) && imagesApi.data.length === 0
                                                    ? 'No Docker images found'
                                                    : searchTerm
                                                        ? 'No matching images found'
                                                        : 'No data available'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Image Actions Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleViewImageDetails}>
                            <InfoIcon fontSize="small" sx={{mr: 1}}/>
                            View Details
                        </MenuItem>
                        <MenuItem onClick={handleRunImage}>
                            <PlayArrowIcon fontSize="small" sx={{mr: 1}}/>
                            Run Container
                        </MenuItem>
                        <MenuItem onClick={handleDeleteImageClick} sx={{color: 'error.main'}}>
                            <DeleteIcon fontSize="small" sx={{mr: 1}}/>
                            Delete Image
                        </MenuItem>
                    </Menu>
                </CardContent>
            </Card>

            {/* Image Details Modal */}
            {selectedImageId && (
                <DockerImageDetailsModal
                    open={detailsModalOpen}
                    onClose={handleCloseDetailsModal}
                    imageId={selectedImageId}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                TransitionProps={{
                    onExited: handleDialogClosed
                }}
            >
                <DialogTitle id="delete-dialog-title">
                    Confirm Image Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete the image
                        <Typography
                            component="span"
                            sx={{
                                fontWeight: 'bold',
                                display: 'inline',
                                mx: 0.5
                            }}
                        >
                            {imageToDelete ? `${imageToDelete.repository}:${imageToDelete.tag}` : ''}
                        </Typography>
                        ? This action cannot be undone.
                    </DialogContentText>

                    {deleteImageApi.error && (
                        <Alert severity="error" sx={{mt: 2}}>
                            Failed to delete image. {deleteImageApi.error?.message || 'Please try again.'}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={deleteImageApi.loading}
                    >
                        {deleteImageApi.loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar - could be used when delete is successful */}
            <Snackbar
                open={deleteImageApi.data && !deleteImageApi.loading && !deleteImageApi.error}
                autoHideDuration={6000}
                onClose={() => {/* Clear the deleteImageApi state if needed */
                }}
                message="Image deleted successfully"
            />

            {/* Run Image Modal */}
            {imageToRun && (
                <DockerRunImageModal
                    open={runImageModalOpen}
                    onClose={handleCloseRunImageModal}
                    imageData={imageToRun}
                />
            )}
        </>
    );
};

export default DockerImages;
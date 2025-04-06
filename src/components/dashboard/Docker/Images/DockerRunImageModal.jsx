import React, {useState, useEffect} from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useApi from '../../../hooks/useApi';

const DockerRunImageModal = ({open, onClose, imageData}) => {
    const runImageApi = useApi();

    // Basic container settings
    const [containerName, setContainerName] = useState('');
    const [networkMode, setNetworkMode] = useState('bridge');
    const [restartPolicy, setRestartPolicy] = useState('no');
    const [isDetached, setIsDetached] = useState(true);

    // Command settings
    const [command, setCommand] = useState('');

    // Environment variables
    const [environmentVars, setEnvironmentVars] = useState([{key: '', value: ''}]);

    // Port mappings
    const [ports, setPorts] = useState([{host_port: '', container_port: '', protocol: 'tcp'}]);

    // Volume mappings
    const [volumes, setVolumes] = useState([{host_path: '', container_path: '', read_only: false}]);

    // Initialize form when modal opens with a specific image
    useEffect(() => {
        if (open && imageData) {
            // Reset form for new image
            setContainerName(generateContainerName(imageData));
            setNetworkMode('bridge');
            setRestartPolicy('no');
            setIsDetached(true);
            setCommand('');
            setEnvironmentVars([{key: '', value: ''}]);
            setPorts([{host_port: '', container_port: '', protocol: 'tcp'}]);
            setVolumes([{host_path: '', container_path: '', read_only: false}]);
        }
    }, [open, imageData]);

    // Generate a default container name based on the image
    const generateContainerName = (image) => {
        if (!image) return '';
        const baseName = image.repository?.split('/').pop() || 'container';
        return `${baseName}-${Math.floor(Math.random() * 10000)}`;
    };

    // Handle environment variables
    const handleEnvChange = (index, field, value) => {
        const newEnvVars = [...environmentVars];
        newEnvVars[index][field] = value;
        setEnvironmentVars(newEnvVars);
    };

    const addEnvironmentVar = () => {
        setEnvironmentVars([...environmentVars, {key: '', value: ''}]);
    };

    const removeEnvironmentVar = (index) => {
        const newEnvVars = [...environmentVars];
        newEnvVars.splice(index, 1);
        setEnvironmentVars(newEnvVars.length ? newEnvVars : [{key: '', value: ''}]);
    };

    // Handle port mappings
    const handlePortChange = (index, field, value) => {
        const newPorts = [...ports];
        newPorts[index][field] = value;
        setPorts(newPorts);
    };

    const addPort = () => {
        setPorts([...ports, {host_port: '', container_port: '', protocol: 'tcp'}]);
    };

    const removePort = (index) => {
        const newPorts = [...ports];
        newPorts.splice(index, 1);
        setPorts(newPorts.length ? newPorts : [{host_port: '', container_port: '', protocol: 'tcp'}]);
    };

    // Handle volume mappings
    const handleVolumeChange = (index, field, value) => {
        const newVolumes = [...volumes];
        newVolumes[index][field] = field === 'read_only' ? value : value;
        setVolumes(newVolumes);
    };

    const addVolume = () => {
        setVolumes([...volumes, {host_path: '', container_path: '', read_only: false}]);
    };

    const removeVolume = (index) => {
        const newVolumes = [...volumes];
        newVolumes.splice(index, 1);
        setVolumes(newVolumes.length ? newVolumes : [{host_path: '', container_path: '', read_only: false}]);
    };

    // Build the payload for the API request
    const buildRunImagePayload = () => {
        // Convert environment vars from array of {key, value} to object
        const environmentObj = {};
        environmentVars.forEach(env => {
            if (env.key && env.key.trim()) {
                environmentObj[env.key.trim()] = env.value;
            }
        });

        // Filter out incomplete port mappings
        const validPorts = ports.filter(port =>
            port.host_port && port.container_port
        );

        // Filter out incomplete volume mappings
        const validVolumes = volumes.filter(volume =>
            volume.host_path && volume.container_path
        );

        // Parse command string into array
        const commandArray = command.trim() ? command.split(/\s+/) : [];

        return {
            image: `${imageData.repository}:${imageData.tag}`,
            name: containerName,
            command: commandArray,
            detached: isDetached,
            environment: environmentObj,
            network: networkMode,
            ports: validPorts,
            restart: restartPolicy,
            volumes: validVolumes
        };
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const payload = buildRunImagePayload();
            console.log('Running container with payload:', payload);

            await runImageApi.request({
                url: '/docker/image/run',
                method: 'POST',
                data: payload
            });

            if (!runImageApi.error) {
                console.log('Container started successfully');
                onClose(true); // Pass true to indicate success
            }
        } catch (error) {
            console.error('Failed to run container:', error);
        }
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            containerName.trim() !== '' &&
            imageData &&
            !runImageApi.loading
        );
    };

    return (
        <Dialog
            open={open}
            onClose={() => onClose(false)}
            fullWidth
            maxWidth="md"
            aria-labelledby="run-image-dialog-title"
        >
            <DialogTitle id="run-image-dialog-title">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Run Image: {imageData ? `${imageData.repository}:${imageData.tag}` : ''}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={() => onClose(false)}
                        size="small"
                    >
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {runImageApi.error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        Failed to run container: {runImageApi.error?.message || 'An error occurred'}
                    </Alert>
                )}

                <Box sx={{mb: 3}}>
                    <Typography variant="subtitle1" gutterBottom>
                        Container Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Container Name"
                                value={containerName}
                                onChange={(e) => setContainerName(e.target.value)}
                                fullWidth
                                required
                                helperText="Give your container a unique name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="network-mode-label">Network Mode</InputLabel>
                                <Select
                                    labelId="network-mode-label"
                                    value={networkMode}
                                    label="Network Mode"
                                    onChange={(e) => setNetworkMode(e.target.value)}
                                >
                                    <MenuItem value="bridge">bridge</MenuItem>
                                    <MenuItem value="host">host</MenuItem>
                                    <MenuItem value="none">none</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="restart-policy-label">Restart Policy</InputLabel>
                                <Select
                                    labelId="restart-policy-label"
                                    value={restartPolicy}
                                    label="Restart Policy"
                                    onChange={(e) => setRestartPolicy(e.target.value)}
                                >
                                    <MenuItem value="no">No</MenuItem>
                                    <MenuItem value="always">Always</MenuItem>
                                    <MenuItem value="on-failure">On Failure</MenuItem>
                                    <MenuItem value="unless-stopped">Unless Stopped</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isDetached}
                                        onChange={(e) => setIsDetached(e.target.checked)}
                                    />
                                }
                                label="Run in detached mode (background)"
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{my: 2}}/>

                <Box sx={{mb: 3}}>
                    <Typography variant="subtitle1" gutterBottom>
                        Command
                    </Typography>
                    <TextField
                        label="Command (optional)"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        helperText="Override the default command (space-separated arguments)"
                    />
                </Box>

                <Divider sx={{my: 2}}/>

                <Box sx={{mb: 3}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">
                            Environment Variables
                        </Typography>
                        <Button
                            startIcon={<AddIcon/>}
                            onClick={addEnvironmentVar}
                            size="small"
                        >
                            Add Variable
                        </Button>
                    </Box>

                    {environmentVars.map((env, index) => (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{p: 2, mb: 1, position: 'relative'}}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        label="Key"
                                        value={env.key}
                                        onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        label="Value"
                                        value={env.value}
                                        onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2} sx={{display: 'flex', alignItems: 'center'}}>
                                    <Tooltip title="Remove">
                                        <IconButton
                                            onClick={() => removeEnvironmentVar(index)}
                                            size="small"
                                            color="error"
                                            disabled={environmentVars.length === 1 && !env.key && !env.value}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>

                <Divider sx={{my: 2}}/>

                <Box sx={{mb: 3}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">
                            Port Mappings
                        </Typography>
                        <Button
                            startIcon={<AddIcon/>}
                            onClick={addPort}
                            size="small"
                        >
                            Add Port
                        </Button>
                    </Box>

                    {ports.map((port, index) => (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{p: 2, mb: 1}}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Host Port"
                                        value={port.host_port}
                                        onChange={(e) => handlePortChange(index, 'host_port', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. 8080"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Container Port"
                                        value={port.container_port}
                                        onChange={(e) => handlePortChange(index, 'container_port', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. 80"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id={`protocol-label-${index}`}>Protocol</InputLabel>
                                        <Select
                                            labelId={`protocol-label-${index}`}
                                            value={port.protocol}
                                            label="Protocol"
                                            onChange={(e) => handlePortChange(index, 'protocol', e.target.value)}
                                        >
                                            <MenuItem value="tcp">TCP</MenuItem>
                                            <MenuItem value="udp">UDP</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={2} sx={{display: 'flex', alignItems: 'center'}}>
                                    <Tooltip title="Remove">
                                        <IconButton
                                            onClick={() => removePort(index)}
                                            size="small"
                                            color="error"
                                            disabled={ports.length === 1 && !port.host_port && !port.container_port}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>

                <Divider sx={{my: 2}}/>

                <Box sx={{mb: 2}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">
                            Volume Mappings
                        </Typography>
                        <Button
                            startIcon={<AddIcon/>}
                            onClick={addVolume}
                            size="small"
                        >
                            Add Volume
                        </Button>
                    </Box>

                    {volumes.map((volume, index) => (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{p: 2, mb: 1}}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Host Path"
                                        value={volume.host_path}
                                        onChange={(e) => handleVolumeChange(index, 'host_path', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. /data/myapp"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Container Path"
                                        value={volume.container_path}
                                        onChange={(e) => handleVolumeChange(index, 'container_path', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. /app/data"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={volume.read_only}
                                                onChange={(e) => handleVolumeChange(index, 'read_only', e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label="Read only"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2} sx={{display: 'flex', alignItems: 'center'}}>
                                    <Tooltip title="Remove">
                                        <IconButton
                                            onClick={() => removeVolume(index)}
                                            size="small"
                                            color="error"
                                            disabled={volumes.length === 1 && !volume.host_path && !volume.container_path}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onClose(false)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!isFormValid()}
                >
                    {runImageApi.loading ? (
                        <>
                            <CircularProgress size={24} sx={{mr: 1}}/>
                            Running...
                        </>
                    ) : (
                        'Run Container'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DockerRunImageModal;
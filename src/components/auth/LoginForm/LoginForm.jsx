// src/components/auth/LoginForm/LoginForm.jsx
import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import {AuthContext} from '../../context/AuthContext';

const LoginForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        ip: '',
        port: ''
    });

    // Error state
    const [formErrors, setFormErrors] = useState({});

    // Auth context and navigation
    const {login, loading, error} = useContext(AuthContext);
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));

        // Clear field-specific error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({...prev, [name]: ''}));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        if (!formData.ip.trim()) {
            errors.ip = 'IP address is required';
        } else if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(formData.ip)) {
            errors.ip = 'Enter a valid IP address';
        }

        if (!formData.port.trim()) {
            errors.port = 'Port is required';
        } else if (!/^\d+$/.test(formData.port) || parseInt(formData.port) > 65535) {
            errors.port = 'Enter a valid port number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        try {
            console.log('Submitting login with credentials:', {
                ...formData,
                password: formData.password ? '********' : ''
            });

            const result = await login(formData);

            if (result.success) {
                console.log('Login successful, navigating to dashboard');
                // Add a small delay to ensure token is set in localStorage
                setTimeout(() => {
                    navigate('/dashboard/server', {replace: true});
                }, 100);
            } else {
                console.error('Login failed:', result.error);
            }
        } catch (err) {
            // Error is handled in the AuthContext
            console.error('Login error:', err);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{p: 4, width: '100%'}}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Cerberus
                    </Typography>
                    <Typography component="h2" variant="h5" align="center" gutterBottom>
                        Server Monitoring
                    </Typography>

                    <Divider sx={{my: 3}}/>

                    {error && (
                        <Alert severity="error" sx={{mb: 3}}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                            error={!!formErrors.username}
                            helperText={formErrors.username}
                            disabled={loading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            disabled={loading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="ip"
                            label="Server IP Address"
                            name="ip"
                            placeholder="e.g. 192.168.1.100"
                            value={formData.ip}
                            onChange={handleChange}
                            error={!!formErrors.ip}
                            helperText={formErrors.ip}
                            disabled={loading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="port"
                            label="Server Port"
                            name="port"
                            placeholder="e.g. 22"
                            value={formData.port}
                            onChange={handleChange}
                            error={!!formErrors.port}
                            helperText={formErrors.port}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2, py: 1.5}}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24}/> : 'Sign In'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginForm;
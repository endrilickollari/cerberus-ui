// src/components/debug/AuthDebugger.jsx
import React, {useContext, useEffect} from 'react';
import {AuthContext} from '../context/AuthContext';
import {Box, Paper, Typography, Divider} from '@mui/material';

/**
 * Debug component to show authentication state
 * Only use during development
 */
const AuthDebugger = () => {
    const {token, user, loading, error} = useContext(AuthContext);

    // Log auth state changes
    useEffect(() => {
        console.log('Auth state change:', {
            hasToken: !!token,
            tokenValue: token ? `${token.substring(0, 10)}...` : null,
            user,
            loading,
            error,
            localStorageToken: localStorage.getItem('token') ? 'exists' : 'missing'
        });
    }, [token, user, loading, error]);

    // Only render in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 10,
                right: 10,
                zIndex: 9999,
                width: 300,
                opacity: 0.8,
                '&:hover': {
                    opacity: 1
                }
            }}
        >
            <Paper sx={{p: 2}}>
                <Typography variant="h6">Auth Debug</Typography>
                <Divider sx={{my: 1}}/>

                <Typography variant="body2">
                    <strong>Token:</strong> {token ? (
                    typeof token === 'object'
                        ? 'Object: ' + JSON.stringify(token).substring(0, 20) + '...'
                        : 'String: ' + token.substring(0, 20) + '...'
                ) : 'Missing'}
                </Typography>

                <Typography variant="body2">
                    <strong>LocalStorage:</strong> {
                    localStorage.getItem('token')
                        ? localStorage.getItem('token').substring(0, 20) + '...'
                        : 'Missing'
                }
                </Typography>

                <Typography variant="body2">
                    <strong>User:</strong> {user ? JSON.stringify(user) : 'null'}
                </Typography>

                <Typography variant="body2">
                    <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
                </Typography>

                <Typography variant="body2">
                    <strong>Error:</strong> {error || 'None'}
                </Typography>
            </Paper>
        </Box>
    );
};

export default AuthDebugger;
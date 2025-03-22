// src/components/top-bar/TopBar.jsx
import React, {useContext, useState} from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Box,
    useMediaQuery,
    useTheme, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import {AuthContext} from '../context/AuthContext';

const TopBar = ({handleLogout}) => {
    const {user} = useContext(AuthContext);
    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

    // Menu state for user dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Handle menu open and close
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle logout from menu
    const onLogout = () => {
        handleMenuClose();
        handleLogout();
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor: theme.palette.primary.main
            }}
        >
            <Toolbar>
                {isMobileView && (
                    <IconButton
                        color="inherit"
                        edge="start"
                        sx={{mr: 2}}
                        // Handle mobile menu toggle - would be implemented in a complete solution
                    >
                        <MenuIcon/>
                    </IconButton>
                )}

                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        letterSpacing: '.2rem',
                    }}
                >
                    CERBERUS MONITOR
                </Typography>

                {/* User menu */}
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            sx={{ml: 2}}
                        >
                            <Avatar sx={{width: 32, height: 32, bgcolor: theme.palette.secondary.main}}>
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleMenuClose}
                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                >
                    <MenuItem onClick={handleMenuClose} sx={{minWidth: 150}}>
                        <AccountCircleIcon sx={{mr: 2}}/>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <SettingsIcon sx={{mr: 2}}/>
                        Settings
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick={onLogout}>
                        <LogoutIcon sx={{mr: 2}}/>
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;
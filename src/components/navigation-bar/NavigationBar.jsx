// src/components/navigation-bar/NavigationBar.jsx
import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    Box,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import ServerIcon from '@mui/icons-material/Storage';
import CpuIcon from '@mui/icons-material/Memory';
import DiskIcon from '@mui/icons-material/SdStorage';
import ProcessIcon from '@mui/icons-material/ListAlt';
import MemoryIcon from '@mui/icons-material/Memory';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiIcon from '@mui/icons-material/Api';
import {FileIcon, FilesIcon} from "lucide-react";

// Sidebar width
const drawerWidth = 240;

const NavigationBar = () => {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Navigation items configuration
    const menuItems = [
        {
            text: 'Server Details',
            path: '/dashboard/server',
            icon: <ServerIcon color="inherit"/>,
            description: 'System overview and load'
        },
        {
            text: 'CPU Usage',
            path: '/dashboard/cpu',
            icon: <CpuIcon color="inherit"/>,
            description: 'Processor performance'
        },
        {
            text: 'Memory Usage',
            path: '/dashboard/memory',
            icon: <MemoryIcon color="inherit"/>,
            description: 'RAM and swap usage'
        },
        {
            text: 'Disk Usage',
            path: '/dashboard/disk',
            icon: <DiskIcon color="inherit"/>,
            description: 'Storage allocation'
        },
        {
            text: 'Running Processes',
            path: '/dashboard/processes',
            icon: <ProcessIcon color="inherit"/>,
            description: 'Active system processes'
        },
        {
            text: 'File Explorer',
            path: '/dashboard/files',
            icon: <FilesIcon color="inherit"/>,
            description: 'Server Files'
        }
    ];

    // If on mobile, render a temporary drawer that can be dismissed
    // For desktop, render a permanent drawer
    const drawerVariant = isMobile ? 'temporary' : 'permanent';

    return (
        <Drawer
            variant={drawerVariant}
            open={!isMobile} // Always open on desktop
            onClose={() => {
            }} // Would handle close on mobile
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                },
            }}
        >
            <Toolbar/> {/* Spacer to push content below app bar */}

            <Box sx={{overflow: 'auto'}}>
                <List>
                    <ListItem sx={{py: 1, px: 2}}>
                        <Typography variant="subtitle1" color="textSecondary">
                            MONITORING
                        </Typography>
                    </ListItem>

                    {menuItems.map((item) => {
                        // Check if current route matches this menu item
                        const isActive = location.pathname === item.path;

                        return (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    selected={isActive}
                                    sx={{
                                        borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                        py: 1.5,
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: 40,
                                        color: isActive ? theme.palette.primary.main : 'inherit'
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        secondary={item.description}
                                        primaryTypographyProps={{
                                            color: isActive ? theme.palette.primary.main : 'inherit',
                                            fontWeight: isActive ? 'medium' : 'regular',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{my: 2}}/>

                <List>
                    <ListItem sx={{py: 1, px: 2}}>
                        <Typography variant="subtitle1" color="textSecondary">
                            RESOURCES
                        </Typography>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/api-docs">
                            <ListItemIcon sx={{minWidth: 40}}>
                                <ApiIcon/>
                            </ListItemIcon>
                            <ListItemText
                                primary="API Documentation"
                                secondary="Swagger documentation"
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
};

export default NavigationBar;
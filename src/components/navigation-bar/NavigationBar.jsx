import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, Box} from '@mui/material';
import ServerIcon from '@mui/icons-material/Storage';
import CpuIcon from '@mui/icons-material/Memory';
import DiskIcon from '@mui/icons-material/SdStorage';
import ProcessIcon from '@mui/icons-material/ListAlt';
import DockerIcon from '@mui/icons-material/Dock';

const NavigationBar = () => {
    const location = useLocation();

    const menuItems = [
        { text: 'Server Details', path: '/dashboard/server', icon: <ServerIcon /> },
        { text: 'CPU Usage', path: '/dashboard/cpu', icon: <CpuIcon /> },
        { text: 'Disk Usage', path: '/dashboard/disk', icon: <DiskIcon /> },
        { text: 'Running Processes', path: '/dashboard/processes', icon: <ProcessIcon /> },
        // { text: 'Docker Containers', path: '/dashboard/docker', icon: <DockerIcon /> },
    ];

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default NavigationBar;
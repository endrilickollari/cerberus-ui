import React, { useState } from 'react';
import {
    Box,
    Grid,
    Tabs,
    Tab,
    Paper,
    Typography
} from '@mui/material';
import DockerImages from './Images/DockerImages';
// Assuming you will have a DockerContainers component
import DockerContainers from './Containers/DockerContainers';

// Custom Tab Panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`docker-tabpanel-${index}`}
            aria-labelledby={`docker-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Function to create accessibility properties for tabs
function a11yProps(index) {
    return {
        id: `docker-tab-${index}`,
        'aria-controls': `docker-tabpanel-${index}`,
    };
}

const Docker = () => {
    // State for active tab
    const [activeTab, setActiveTab] = useState(0);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="Docker management tabs"
                    >
                        <Tab label="Images" {...a11yProps(0)} />
                        <Tab label="Containers" {...a11yProps(1)} />
                    </Tabs>
                </Box>
            </Paper>

            <TabPanel value={activeTab} index={0}>
                <DockerImages />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <DockerContainers />
            </TabPanel>
        </Box>
    );
};

export default Docker;
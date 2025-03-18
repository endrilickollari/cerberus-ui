import React, {useState, useEffect} from 'react';
import {Typography, Box, Paper, List, ListItem, ListItemText, CircularProgress, Grid} from '@mui/material';
import {Pie, Bar} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import useApi from '../../hooks/useApi';

Chart.register(...registerables);

const DiskUsage = () => {
    const {data, error, loading, request} = useApi();
    const [diskData, setDiskData] = useState([]);

    useEffect(() => {
        const fetchDiskData = async () => {
            await request({url: '/server-details/disk-usage'});
        };
        fetchDiskData();
    }, [request]);

    useEffect(() => {
        if (data) {
            setDiskData(data);
        }
    }, [data]);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">Error fetching disk data.</Typography>;
    }

    if (diskData.length === 0) {
        return <Typography>Loading disk data...</Typography>;
    }

    // Pie chart for total disk usage
    const totalUsageChartData = {
        labels: diskData.map(disk => disk.mounted_on),
        datasets: [{
            label: 'Disk Usage (%)',
            data: diskData.map(disk => parseFloat(disk.use_percentage)),
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        }],
    };

    // Bar chart for used vs available space
    const usedAvailableChartData = {
        labels: diskData.map(disk => disk.mounted_on),
        datasets: [
            {
                label: 'Used Space (GB)',
                data: diskData.map(disk => parseFloat(disk.used.replace('G', ''))),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Available Space (GB)',
                data: diskData.map(disk => parseFloat(disk.available.replace('G', ''))),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Paper elevation={3} sx={{p: 3}}>
            <Typography variant="h5" gutterBottom>
                Disk Usage
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Pie data={totalUsageChartData} options={chartOptions}/>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Bar data={usedAvailableChartData} options={chartOptions}/>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <List>
                        {diskData.map((disk, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemText
                                    primary={disk.mounted_on}
                                    secondary={
                                        <React.Fragment>
                                            <Typography component="span" variant="body2" color="textPrimary">
                                                Filesystem: {disk.filesystem}, Size: {disk.size}, Used: {disk.used},
                                                Available: {disk.available}, Usage: {disk.use_percentage}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default DiskUsage;
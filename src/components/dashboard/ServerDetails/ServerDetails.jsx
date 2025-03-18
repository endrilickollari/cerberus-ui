import React, {useState, useEffect} from 'react';
import {Typography, Box, Paper, List, ListItem, ListItemText, CircularProgress} from '@mui/material';
import {Line} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import useApi from '../../hooks/useApi';

Chart.register(...registerables);

const ServerDetails = () => {
    const {data, error, loading, request} = useApi();
    const [serverData, setServerData] = useState(null);

    useEffect(() => {
        const fetchServerDetails = async () => {
            await request({url: '/server-details'});
        };
        fetchServerDetails();
    }, [request]);

    useEffect(() => {
        if (data) {
            setServerData(data);
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
        return <Typography color="error">Error fetching server details.</Typography>;
    }

    if (!serverData) {
        return <Typography>Loading server details...</Typography>;
    }

    const uptime = serverData.uptime.trim();
    const loadAverageString = uptime.substring(uptime.indexOf('load average: ') + 'load average: '.length).trim();
    const loadAverageValues = loadAverageString.split(', ').map(parseFloat);

    const chartData = {
        labels: ['1 min', '5 min', '15 min'],
        datasets: [{
            label: 'Load Average',
            data: loadAverageValues,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        }],
    };

    // Extract server time, uptime, and users
    const serverTime = uptime.substring(0, uptime.indexOf('up')).trim();
    let uptimeDetails = uptime.substring(uptime.indexOf('up') + 2, uptime.indexOf('users,')).trim();
    const userCountString = uptime.substring(uptime.indexOf('users,') - 2, uptime.indexOf('users,')).trim();
    const userCount = parseInt(userCountString);

    // Remove the trailing ", 0" from uptimeDetails
    if (uptimeDetails.endsWith(', 0')) {
        uptimeDetails = uptimeDetails.slice(0, -3).trim();
    }

    return (
        <Paper elevation={3} sx={{p: 3}}>
            <Typography variant="h5" gutterBottom>
                Server Details
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary={`Server time: ${serverTime}`}/>
                </ListItem>
                <ListItem>
                    <ListItemText primary={`Uptime: ${uptimeDetails}`}/>
                </ListItem>
                <ListItem>
                    <ListItemText primary={`Users: ${userCount}`}/>
                </ListItem>
                <ListItem>
                    <ListItemText primary={`Hostname: ${serverData.hostname.trim()}`}/>
                </ListItem>
                <ListItem>
                    <ListItemText primary={`OS: ${serverData.os.trim()}`}/>
                </ListItem>
                <ListItem>
                    <ListItemText primary={`Kernel Version: ${serverData.kernel_version.trim()}`}/>
                </ListItem>
            </List>
            <Box sx={{mt: 3}}>
                <Typography variant="subtitle1">Load Average</Typography>
                <Line data={chartData}/>
            </Box>
        </Paper>
    );
};

export default ServerDetails;
import React, {useState, useEffect} from 'react';
import {Typography, Box, Paper, List, ListItem, ListItemText, CircularProgress, Grid, Modal} from '@mui/material';
import {Bar} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import useApi from '../../hooks/useApi';

Chart.register(...registerables);

const CpuUsage = () => {
    const {data, error, loading, request} = useApi();
    const [cpuData, setCpuData] = useState([]);
    const [selectedCpu, setSelectedCpu] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchCpuData = async () => {
            await request({url: '/server-details/cpu-info'});
        };
        fetchCpuData();
    }, [request]);

    useEffect(() => {
        if (data) {
            setCpuData(data.filter(cpu => cpu.processor !== ""));
        }
    }, [data]);

    const handleCpuClick = (cpu) => {
        setSelectedCpu(cpu);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">Error fetching CPU data.</Typography>;
    }

    if (cpuData.length === 0) {
        return <Typography>Loading CPU data...</Typography>;
    }

    const chartData = {
        labels: cpuData.map(cpu => `CPU ${cpu.processor}`),
        datasets: [{
            label: 'CPU MHz',
            data: cpuData.map(cpu => parseFloat(cpu.cpu_mhz)),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
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
                CPU Information
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Bar data={chartData} options={chartOptions}/>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <List>
                        {cpuData.map((cpu, index) => (
                            <ListItem key={index} alignItems="flex-start" onClick={() => handleCpuClick(cpu)}
                                      style={{cursor: 'pointer'}}>
                                <ListItemText
                                    primary={`CPU ${cpu.processor}: ${cpu.model_name}`}
                                    secondary={
                                        <React.Fragment>
                                            <Typography component="span" variant="body2" color="textPrimary">
                                                MHz: {cpu.cpu_mhz}, Cores: {cpu.cpu_cores}, Vendor: {cpu.vendor_id}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
            <Modal open={openModal} onClose={handleCloseModal}
                   sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Box sx={{
                    width: '80%',
                    maxHeight: '80vh',
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    overflow: 'auto'
                }}>
                    {selectedCpu && (
                        <div>
                            <Typography variant="h6" gutterBottom>CPU {selectedCpu.processor} Details</Typography>
                            <List>
                                {Object.entries(selectedCpu).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key} secondary={value}/>
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    )}
                </Box>
            </Modal>
        </Paper>
    );
};

export default CpuUsage;
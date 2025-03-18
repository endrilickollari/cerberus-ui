import React, {useState, useEffect, useMemo} from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    TextField,
    Modal,
    Button
} from '@mui/material';
import {Bar} from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';
import useApi from '../../hooks/useApi';

Chart.register(...registerables);

const RunningProcesses = () => {
    const {data, error, loading, request} = useApi();
    const [processes, setProcesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'ascending'});
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchProcesses = async () => {
            await request({url: '/server-details/running-processes'});
        };
        fetchProcesses();
    }, [request]);

    useEffect(() => {
        if (data) {
            setProcesses(data);
        }
    }, [data]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    const sortedProcesses = useMemo(() => {
        let sortableProcesses = [...processes];
        if (sortConfig.key !== null) {
            sortableProcesses.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableProcesses;
    }, [processes, sortConfig]);

    const filteredProcesses = useMemo(() => {
        return sortedProcesses.filter(process =>
            Object.values(process).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [sortedProcesses, searchTerm]);

    const handleOpenModal = () => {
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
        return <Typography color="error">Error fetching running processes.</Typography>;
    }

    if (processes.length === 0) {
        return <Typography>Loading running processes...</Typography>;
    }

    const chartData = {
        labels: filteredProcesses.map(process => process.process_id),
        datasets: [{
            label: 'CPU Consumption',
            data: filteredProcesses.map(process => parseFloat(process.cpu_consumption)),
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
        <Paper elevation={3} sx={{p: 3, position: 'relative'}}>
            <Box sx={{position: 'absolute', top: 10, right: 10}}>
                <Button variant="outlined" onClick={handleOpenModal}>Details</Button>
            </Box>
            <Typography variant="h5" gutterBottom>
                Running Processes
            </Typography>
            <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{mb: 2}}
            />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => handleSort('user')} style={{cursor: 'pointer'}}>User</TableCell>
                            <TableCell onClick={() => handleSort('process_id')} style={{cursor: 'pointer'}}>Process
                                ID</TableCell>
                            <TableCell onClick={() => handleSort('cpu_consumption')} style={{cursor: 'pointer'}}>CPU
                                Consumption</TableCell>
                            <TableCell onClick={() => handleSort('vsz')} style={{cursor: 'pointer'}}>VSZ</TableCell>
                            <TableCell onClick={() => handleSort('rss')} style={{cursor: 'pointer'}}>RSS</TableCell>
                            <TableCell onClick={() => handleSort('tty')} style={{cursor: 'pointer'}}>TTY</TableCell>
                            <TableCell onClick={() => handleSort('stat')} style={{cursor: 'pointer'}}>Stat</TableCell>
                            <TableCell onClick={() => handleSort('started')}
                                       style={{cursor: 'pointer'}}>Started</TableCell>
                            <TableCell onClick={() => handleSort('time')} style={{cursor: 'pointer'}}>Time</TableCell>
                            <TableCell onClick={() => handleSort('command')}
                                       style={{cursor: 'pointer'}}>Command</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProcesses.map((process, index) => (
                            <TableRow key={index}>
                                <TableCell>{process.user}</TableCell>
                                <TableCell>{process.process_id}</TableCell>
                                <TableCell>{process.cpu_consumption}</TableCell>
                                <TableCell>{process.vsz}</TableCell>
                                <TableCell>{process.rss}</TableCell>
                                <TableCell>{process.tty}</TableCell>
                                <TableCell>{process.stat}</TableCell>
                                <TableCell>{process.started}</TableCell>
                                <TableCell>{process.time}</TableCell>
                                <TableCell>{process.command}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
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
                    <Typography variant="h6" gutterBottom>CPU Consumption - All Processes</Typography>
                    <Bar data={chartData} options={chartOptions}/>
                </Box>
            </Modal>
        </Paper>
    );
};

export default RunningProcesses;
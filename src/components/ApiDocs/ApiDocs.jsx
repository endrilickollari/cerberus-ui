import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ApiDocs = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Documentation
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: '80vh', // Adjust as needed
          border: '1px solid #ccc',
          overflow: 'hidden',
        }}
      >
        <iframe
          src="https://cerberus-api-0773eaec6d0f.herokuapp.com/swagger/index.html"
          title="API Documentation"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>
    </Container>
  );
};

export default ApiDocs;

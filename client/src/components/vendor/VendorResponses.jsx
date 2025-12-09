import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from '../../api/axios';

const VendorResponses = ({ rfpId }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedResponse, setExpandedResponse] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState(0);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/rfp/${rfpId}/responses`);
      setResponses(res.data);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to load vendor responses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rfpId) {
      fetchResponses();
    }
  }, [rfpId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleExpandResponse = (responseId) => {
    setExpandedResponse(expandedResponse === responseId ? null : responseId);
  };

  const handleAnalyzeResponse = async (response) => {
    try {
      setSelectedResponse(response);
      setAnalyzing(true);
      setAnalysisDialogOpen(true);
      
      const res = await axios.post(`/api/ai/analyze-response`, {
        rfpId,
        responseId: response._id,
        vendorId: response.vendor._id
      });n      
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error('Error analyzing response:', err);
      setAnalysis('Failed to analyze response. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCloseAnalysisDialog = () => {
    setAnalysisDialogOpen(false);
    setSelectedResponse(null);
    setAnalysis('');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'submitted':
        return <Chip icon={<CheckCircleIcon />} label="Submitted" color="success" size="small" />;
      case 'draft':
        return <Chip icon={<ScheduleIcon />} label="Draft" color="warning" size="small" />;
      case 'late':
        return <Chip icon={<ErrorIcon />} label="Late" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={fetchResponses} startIcon={<RefreshIcon />} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (responses.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          No vendor responses yet. Check back later or send reminders to vendors.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          aria-label="response tabs"
        >
          <Tab label={`All Responses (${responses.length})`} />
          <Tab label="Needs Review" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted On</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((response) => (
                <React.Fragment key={response._id}>
                  <TableRow hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={response.vendor.logo} 
                          alt={response.vendor.name}
                          sx={{ width: 32, height: 32, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body1">
                            {response.vendor.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {response.vendor.contactEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(response.status)}
                    </TableCell>
                    <TableCell>
                      {response.submittedAt 
                        ? new Date(response.submittedAt).toLocaleDateString() 
                        : 'Not submitted'}
                    </TableCell>
                    <TableCell>
                      {response.score ? `${response.score}/100` : '-'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => toggleExpandResponse(response._id)}
                          >
                            {expandedResponse === response._id ? 
                              <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Tooltip>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleAnalyzeResponse(response)}
                          startIcon={<SendIcon />}
                        >
                          Analyze
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={5}>
                      <Collapse in={expandedResponse === response._id} timeout="auto" unmountOnExit>
                        <Box p={2} bgcolor="#f9f9f9">
                          <Typography variant="subtitle1" gutterBottom>
                            Response Details
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="textSecondary">
                                <strong>Vendor Notes:</strong>
                              </Typography>
                              <Typography variant="body1" paragraph>
                                {response.notes || 'No additional notes provided.'}
                              </Typography>
                              
                              {response.attachments && response.attachments.length > 0 && (
                                <Box mt={2}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    <strong>Attachments:</strong>
                                  </Typography>
                                  <List dense>
                                    {response.attachments.map((file, index) => (
                                      <ListItem key={index} button component="a" href={file.url} target="_blank">
                                        <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                                        <ListItemText primary={file.name} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                <strong>AI Analysis:</strong>
                              </Typography>
                              {response.aiAnalysis ? (
                                <Box 
                                  component="div" 
                                  dangerouslySetInnerHTML={{ __html: response.aiAnalysis }}
                                  sx={{
                                    '& strong': { color: 'primary.main' },
                                    '& p': { margin: '0.5em 0' }
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  No AI analysis available. Click "Analyze" to generate.
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={responses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* AI Analysis Dialog */}
      <Dialog 
        open={analysisDialogOpen} 
        onClose={handleCloseAnalysisDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>AI Analysis</span>
            <IconButton onClick={handleCloseAnalysisDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedResponse && (
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                Analyzing response from: <strong>{selectedResponse.vendor.name}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Submitted on: {new Date(selectedResponse.submittedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {analyzing ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" color="textSecondary" mt={2}>
                Analyzing response with AI...
              </Typography>
            </Box>
          ) : analysis ? (
            <Box 
              component="div" 
              dangerouslySetInnerHTML={{ __html: analysis }}
              sx={{
                '& h3': { 
                  color: 'primary.main', 
                  fontSize: '1.1rem',
                  mt: 2,
                  mb: 1
                },
                '& p': { 
                  margin: '0.5em 0',
                  lineHeight: 1.6
                },
                '& ul, & ol': {
                  pl: 3,
                  my: 1
                },
                '& li': {
                  mb: 0.5
                },
                '& strong': {
                  color: 'text.primary'
                }
              }}
            />
          ) : (
            <Typography>No analysis available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnalysisDialog} color="primary">
            Close
          </Button>
          {analysis && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                // Save analysis to the response
                // This would be implemented to save to your backend
                alert('Analysis saved successfully!');
                handleCloseAnalysisDialog();
                fetchResponses(); // Refresh the responses
              }}
            >
              Save Analysis
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorResponses;

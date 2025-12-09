import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { format } from 'date-fns';
import {
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Divider, 
  Grid, 
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Alert,
  Tab,
  CircularProgress
} from '@mui/material';
import { 
  TabContext, 
  TabList, 
  TabPanel 
} from '@mui/lab';
import { styled } from '@mui/material/styles';
import { 
  Send as SendIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import VendorResponses from '../components/vendor/VendorResponses';
import VendorSelectionDialog from '../components/vendor/VendorSelectionDialog';

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  color: 'rgba(0, 0, 0, 0.6)',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
  },
}));

const RfpDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('0'); // Changed to string for TabContext
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [sendingToVendors, setSendingToVendors] = useState(false);
  const [sendStatus, setSendStatus] = useState({ success: null, message: '' });
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const fetchRfp = async () => {
    try {
      const res = await axios.get(`/api/rfps/${id}`);
      setRfp(res.data);
      // If your API returns AI analysis inside the RFP object or separately, set it here
      if (res.data.aiAnalysis) {
        setAiAnalysis(res.data.aiAnalysis);
      }
      
      // Pre-fill email form subject if empty
      if (res.data && !emailForm.subject) {
        setEmailForm(prev => ({
          ...prev,
          subject: `Re: ${res.data.title}`,
          message: `Dear Vendor,\n\nI'm following up regarding the RFP "${res.data.title}".\n\n`
        }));
      }
    } catch (err) {
      console.error('Error fetching RFP:', err);
    }
  };

  useEffect(() => {
    fetchRfp();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      alert('Please fill in all email fields');
      return;
    }

    setIsSending(true);
    try {
      await axios.post(`/api/rfps/${id}/send-email`, {
        to: emailForm.to,
        subject: emailForm.subject,
        message: emailForm.message
      });
      setSendStatus({ success: true, message: 'Email sent successfully!' });
      fetchRfp();
      // Clear message but keep subject/to for convenience
      setEmailForm(prev => ({ ...prev, message: '' }));
    } catch (err) {
      console.error('Error sending email:', err);
      setSendStatus({ success: false, message: 'Failed to send email.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = () => {
    fetchRfp();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'primary';
      case 'in_review': return 'info';
      case 'evaluating': return 'warning';
      case 'awarded': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleSendToVendors = async (vendorIds, message) => {
    try {
      setSendingToVendors(true);
      const response = await axios.post(`/api/rfp/${id}/send`, {
        vendorIds,
        message
      });
      
      setSendStatus({
        success: true,
        message: `Successfully sent RFP to ${response.data.results?.filter(r => r.success).length || 0} vendors`
      });
      
      fetchRfp();
      return response.data;
    } catch (error) {
      console.error('Error sending to vendors:', error);
      setSendStatus({
        success: false,
        message: 'Failed to send RFP to vendors. Please try again.'
      });
      throw error;
    } finally {
      setSendingToVendors(false);
    }
  };

  const handleCloseStatus = () => {
    setSendStatus({ success: null, message: '' });
  };

  if (!rfp) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, backgroundColor: 'background.paper', px: 3, pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" display="inline">
              {rfp.title}
              <Chip 
                label={rfp.status ? rfp.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'} 
                color={getStatusColor(rfp.status)}
                size="small"
                sx={{ ml: 2, verticalAlign: 'middle' }}
              />
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} color="primary" size="large">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SendIcon />}
              onClick={() => setVendorDialogOpen(true)}
              sx={{ ml: 1 }}
            >
              Send to Vendors
            </Button>
          </Box>
        </Box>

        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleTabChange} aria-label="RFP details tabs">
              <StyledTab label="Overview" value="0" icon={<DescriptionIcon />} iconPosition="start" />
              <StyledTab 
                value="1"
                label={
                  <Box display="flex" alignItems="center">
                    <AssessmentIcon sx={{ mr: 0.5 }} />
                    <Box component="span">Vendor Responses</Box>
                    {rfp.vendorResponses?.length > 0 && (
                      <Chip 
                        label={rfp.vendorResponses.length} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
              />
              <StyledTab label="Communications" value="2" icon={<ChatBubbleOutlineIcon />} iconPosition="start" />
            </TabList>
          </Box>

          {/* TAB 0: OVERVIEW */}
          <TabPanel value="0" sx={{ px: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {/* Details Card */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Details</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Created On</Typography>
                        <Typography variant="body1">
                          {rfp.createdAt ? new Date(rfp.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {rfp.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Requirements Card */}
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Requirements</Typography>
                      <Button size="small" startIcon={<AttachFileIcon />}>
                        Download All
                      </Button>
                    </Box>
                    <List>
                      {rfp.requirements && rfp.requirements.length > 0 ? (
                        rfp.requirements.map((req, index) => (
                          <ListItem 
                            key={index} 
                            divider={index < rfp.requirements.length - 1}
                          >
                            <ListItemText 
                              primary={req.description}
                              secondary={`Priority: ${req.priority}`}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No requirements specified.
                        </Typography>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Timeline Card */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Timeline</Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Start Date"
                          secondary={rfp.startDate ? new Date(rfp.startDate).toLocaleDateString() : 'Not specified'}
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Deadline"
                          secondary={rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : 'Not specified'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {/* AI Insights Card (Conditional) */}
                {aiAnalysis && (
                  <Card variant="outlined" sx={{ mb: 3, backgroundColor: '#f0f8ff' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>AI Insights</Typography>
                      <Typography><strong>Score:</strong> {aiAnalysis.score}/100</Typography>
                      <Typography sx={{ mt: 1 }}><strong>Analysis:</strong> {aiAnalysis.analysis}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 1: VENDOR RESPONSES */}
          <TabPanel value="1" sx={{ px: 0 }}>
            <VendorResponses rfpId={id} />
          </TabPanel>

          {/* TAB 2: COMMUNICATIONS */}
          <TabPanel value="2" sx={{ px: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Send Email Update</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="To"
                          name="to"
                          value={emailForm.to}
                          onChange={handleEmailChange}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Subject"
                          name="subject"
                          value={emailForm.subject}
                          onChange={handleEmailChange}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Message"
                          name="message"
                          value={emailForm.message}
                          onChange={handleEmailChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SendIcon />}
                          onClick={handleSendEmail}
                          disabled={isSending}
                        >
                          {isSending ? 'Sending...' : 'Send Email'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                 <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Email History</Typography>
                    {rfp.emailHistory && rfp.emailHistory.length > 0 ? (
                      <List>
                        {rfp.emailHistory.map((email, idx) => (
                           <ListItem key={idx} divider>
                              <ListItemText 
                                primary={email.subject}
                                secondary={`${new Date(email.sentAt).toLocaleDateString()} - To: ${email.to}`}
                              />
                           </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No email history available.
                      </Typography>
                    )}
                  </CardContent>
                 </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </Box>

      {/* Dialogs */}
      <VendorSelectionDialog
        open={vendorDialogOpen}
        onClose={() => setVendorDialogOpen(false)}
        rfpId={id}
        onSend={handleSendToVendors}
      />

      {/* Notifications */}
      {sendStatus.success !== null && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
          <Alert 
            severity={sendStatus.success ? 'success' : 'error'}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleCloseStatus}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {sendStatus.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default RfpDetailPage;
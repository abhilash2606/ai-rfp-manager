import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
// 🟢 FIX: Changed 'Grid2' back to 'Grid' to fix the import error
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert, 
  Collapse, 
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';

const RfpCreatePage = () => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    budget: '',
    requirements: [],
    timeline: '30 days',
    deadline: ''
  });
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Prepare the RFP data
      const rfpData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: parseFloat(formData.budget) || 0,
        requirements: Array.isArray(formData.requirements) ? formData.requirements : [],
        timeline: formData.timeline || '30 days',
        deadline: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('Submitting RFP data:', rfpData);
      
      // Post to the new RFP creation endpoint
      const response = await axios.post('/api/rfp', rfpData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('RFP created successfully:', response.data);
      
      // Show success message and redirect
      setError('');
      
      // Redirect to the new RFP's detail page
      if (response.data.data && response.data.data._id) {
        navigate(`/rfp/${response.data.data._id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating RFP:', {
        error: err,
        response: err.response?.data
      });
      
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         'Failed to create RFP. Please try again.';
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiInput.trim()) {
      setError('Please enter a description for the RFP');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      // Call the correct AI route we created
      const response = await axios.post('/api/rfp/parse', { text: aiInput });
      const { title, description, requirements, timeline, budget } = response.data;
      
      setFormData({
        title: title || '',
        description: description || '',
        // Handle budget whether it is string or number
        budget: budget ? parseFloat(String(budget).replace(/[^0-9.]/g, '')) : 0,
        requirements: requirements || [],
        timeline: timeline || ''
      });
      
      setShowAiInput(false);
    } catch (err) {
      console.error('Error generating RFP with AI:', err);
      setError('Failed to generate RFP. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Create New RFP</Typography>
      
      {!showAiInput && (
        <Button
          variant="outlined"
          startIcon={<AutoFixHighIcon />}
          onClick={() => setShowAiInput(true)}
          sx={{ mb: 3 }}
        >
          Generate with AI
        </Button>
      )}

      <Collapse in={showAiInput}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Generate RFP with AI</Typography>
            <IconButton size="small" onClick={() => setShowAiInput(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Describe the RFP... (e.g., 'I need a new company website. Budget $10,000, 3 months.')"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
          >
            {isGenerating ? 'Generating...' : 'Generate RFP'}
          </Button>
        </Paper>
      </Collapse>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* 🟢 FIX: Using standard 'Grid' but with new 'size' props to prevent console warnings */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="RFP Title"
                variant="outlined"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                variant="outlined"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Budget ($)"
                variant="outlined"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                inputProps={{ min: 0, step: 100 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Timeline</InputLabel>
                <Select
                  value={formData.timeline}
                  label="Timeline"
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                >
                  <MenuItem value="14 days">2 weeks</MenuItem>
                  <MenuItem value="30 days">1 month</MenuItem>
                  <MenuItem value="60 days">2 months</MenuItem>
                  <MenuItem value="90 days">3 months</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Deadline"
                variant="outlined"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                required
              />
            </Grid>
            
            {formData.requirements && formData.requirements.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>Requirements</Typography>
                <Box component="ul" sx={{ pl: 2, listStyleType: 'none' }}>
                  {formData.requirements.map((req, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Typography component="span">
                        {typeof req === 'string' ? (
                          `• ${req}`
                        ) : (
                          <>
                            <strong>{req.category || 'General'}:</strong> {req.description} 
                            {req.priority && ` (Priority: ${req.priority})`}
                          </>
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
            
            <Grid size={{ xs: 12 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Create RFP
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default RfpCreatePage;
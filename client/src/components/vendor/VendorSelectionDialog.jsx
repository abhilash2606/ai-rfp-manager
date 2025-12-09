import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Send, Close } from '@mui/icons-material';
import axios from '../../api/axios';

const VendorSelectionDialog = ({ open, onClose, rfpId, onSend }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchVendors();
    }
  }, [open]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVendor = (vendorId) => {
    const currentIndex = selectedVendors.indexOf(vendorId);
    const newSelected = [...selectedVendors];

    if (currentIndex === -1) {
      newSelected.push(vendorId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedVendors(newSelected);
  };

  const handleSendToVendors = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }

    try {
      setSending(true);
      await onSend(selectedVendors, message);
      onClose();
    } catch (error) {
      console.error('Error sending to vendors:', error);
      alert('Failed to send RFP to vendors. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.company && vendor.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Send RFP to Vendors</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Message to Vendors"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to include with the RFP..."
          />
        </Box>

        <Box border={1} borderColor="divider" borderRadius={1} maxHeight={400} overflow="auto">
          {loading ? (
            <Box p={3} textAlign="center">
              <CircularProgress size={24} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Loading vendors...
              </Typography>
            </Box>
          ) : filteredVendors.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                No vendors found. Add vendors to your vendor list first.
              </Typography>
            </Box>
          ) : (
            <List dense>
              {filteredVendors.map((vendor) => (
                <React.Fragment key={vendor._id}>
                  <ListItem 
                    button 
                    onClick={() => handleToggleVendor(vendor._id)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedVendors.includes(vendor._id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={vendor.name}
                      secondary={
                        <>
                          {vendor.company && <span>{vendor.company} • </span>}
                          <span>{vendor.email}</span>
                          {vendor.phone && <span> • {vendor.phone}</span>}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {vendor.isActive ? (
                        <Chip 
                          size="small" 
                          label="Active" 
                          color="success" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          size="small" 
                          label="Inactive" 
                          color="default" 
                          variant="outlined"
                        />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSendToVendors}
          color="primary"
          variant="contained"
          disabled={selectedVendors.length === 0 || sending}
          startIcon={sending ? <CircularProgress size={20} /> : <Send />}
        >
          {sending ? 'Sending...' : `Send to ${selectedVendors.length} Vendor${selectedVendors.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorSelectionDialog;

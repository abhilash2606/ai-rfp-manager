import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  Button, 
  TextField, 
  InputAdornment, 
  IconButton,
  TablePagination
} from '@mui/material';
import { Search, FilterList, Add, Refresh, MoreVert } from '@mui/icons-material';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const statusColors = {
  draft: 'default',
  active: 'primary',
  in_review: 'info',
  completed: 'success',
  cancelled: 'error'
};

const RfpListPage = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRfps();
  }, []);

  const fetchRfps = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/rfp');
      setRfps(res.data);
    } catch (err) {
      console.error('Error fetching RFPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRfps = rfps.filter(rfp => 
    rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfp.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRfps = filteredRfps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const stats = {
    total: rfps.length,
    active: rfps.filter(rfp => rfp.status === 'active').length,
    inReview: rfps.filter(rfp => rfp.status === 'in_review').length,
    completed: rfps.filter(rfp => rfp.status === 'completed').length,
  };

  const StatCard = ({ title, value, color }) => (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          RFP Dashboard
        </Typography>
        <Button
          component={Link}
          to="/create"
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ borderRadius: 2 }}
        >
          New RFP
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total RFPs" value={stats.total} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active" value={stats.active} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="In Review" value={stats.inReview} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed" value={stats.completed} color="success.main" />
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          placeholder="Search RFPs..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRfps}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* RFP Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Vendors</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    Loading RFPs...
                  </TableCell>
                </TableRow>
              ) : paginatedRfps.length > 0 ? (
                paginatedRfps.map((rfp) => (
                  <TableRow key={rfp._id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{rfp.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {rfp.description.substring(0, 60)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rfp.status.replace('_', ' ')}
                        color={statusColors[rfp.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {rfp.createdAt ? format(new Date(rfp.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {rfp.deadline ? format(new Date(rfp.deadline), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {rfp.vendors ? rfp.vendors.length : 0} vendors
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        component={Link} 
                        to={`/rfp/${rfp._id}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No RFPs found. Create your first RFP to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRfps.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default RfpListPage;
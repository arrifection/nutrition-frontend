import { useEffect, useMemo, useState } from 'react';
import { 
    Box, 
    Button, 
    CircularProgress, 
    InputAdornment, 
    Typography, 
    Stack, 
    IconButton,
    TextField,
    Paper,
    Grid,
    Tooltip
} from '@mui/material';
import { Search, ChevronRight, UserPlus, Filter, ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { getPatients, deletePatient } from '../services/api';

const T = {
    heading: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
    subheading: { fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' },
};

export default function Patients({ onBack, onSelectPatient }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        const response = await getPatients();
        if (response.success && Array.isArray(response.data)) {
            setPatients(response.data);
            setError('');
        } else {
            setError(response.error || 'Unable to load patients.');
        }
        setLoading(false);
    };

    const handleDelete = async (e, id, name) => {
        e.stopPropagation(); // Prevent navigating to patient detail
        if (window.confirm(`Are you sure you want to delete patient "${name}"? This action cannot be undone.`)) {
            const response = await deletePatient(id);
            if (response.success) {
                setPatients(prev => prev.filter(p => p.id !== id));
            } else {
                alert("Failed to delete patient: " + response.error);
            }
        }
    };

    const filteredPatients = useMemo(() => {
        if (!search.trim()) return patients;
        const query = search.toLowerCase();
        return patients.filter((patient) =>
            patient.name?.toLowerCase().includes(query) ||
            patient.goal?.toLowerCase().includes(query) ||
            String(patient.age).includes(query)
        );
    }, [patients, search]);

    return (
        <Box className="fade-up" sx={{ p: { xs: 2.5, md: 4, lg: 5 }, maxWidth: 1200, mx: 'auto' }}>
            
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 4 }}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Button 
                            onClick={onBack}
                            sx={{ color: 'var(--text-secondary)', p: 0, minWidth: 0, '&:hover': { background: 'transparent', color: 'var(--brand-green)' } }}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <Typography sx={T.heading}>Patient Management</Typography>
                    </Stack>
                    <Typography sx={T.subheading}>View and manage your entire clinical roster and metabolic profiles.</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<UserPlus size={18} />}
                    sx={{
                        background: 'var(--brand-green)',
                        '&:hover': { background: 'var(--brand-green-hover)' },
                        borderRadius: '10px',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 3, height: 44,
                        boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                    }}
                >
                    Add Patient
                </Button>
            </Stack>

            {/* Filter Bar */}
            <Box className="dd-card" sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, clinical goal, or age..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            '& fieldset': { border: 'none' },
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: 'none' },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} color="var(--text-muted)" />
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton 
                    onClick={fetchPatients}
                    sx={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px' }}
                >
                    <RefreshCw size={18} color="var(--text-secondary)" />
                </IconButton>
                <IconButton sx={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <Filter size={18} color="var(--text-secondary)" />
                </IconButton>
            </Box>

            {/* Main Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress size={32} thickness={5} color="primary" />
                </Box>
            ) : error ? (
                <Box className="dd-card" sx={{ p: 4, textAlign: 'center', borderColor: '#fecaca', background: '#fef2f2' }}>
                    <Typography color="error" sx={{ fontWeight: 600 }}>{error}</Typography>
                </Box>
            ) : filteredPatients.length === 0 ? (
                <Box className="dd-card" sx={{ py: 12, textAlign: 'center' }}>
                    <Box sx={{ color: 'var(--text-muted)', mb: 2, opacity: 0.5 }}>
                        <Search size={48} sx={{ mx: 'auto' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 1 }}>No patients found</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {search ? "Try adjusting your search terms." : "You haven't added any patients yet."}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {filteredPatients.map((patient) => (
                        <Grid item xs={12} key={patient.id}>
                            <Box
                                component="button"
                                onClick={() => onSelectPatient(patient)}
                                className="dd-card"
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    p: { xs: 2, sm: 3 },
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                                    }
                                }}
                            >
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 800, color: '#15803d', flexShrink: 0
                                }}>
                                    {patient.name?.charAt(0)}
                                </Box>
                                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', mb: 0.5 }}>{patient.name}</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--brand-green)' }}>Goal:</span> {patient.goal || 'General Health'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--brand-green)' }}>Age:</span> {patient.age ? `${patient.age}y` : 'N/A'}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 2 }}>
                                    <Tooltip title="Delete Patient">
                                        <IconButton 
                                            onClick={(e) => handleDelete(e, patient.id, patient.name)}
                                            sx={{ 
                                                color: 'var(--text-muted)',
                                                '&:hover': { color: '#ef4444', background: '#fee2e2' }
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <ChevronRight size={20} color="var(--text-muted)" />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

import { useState, useEffect } from "react";
import {
    Plus,
    Users,
    FileText,
    TrendingUp,
    Clock,
    ChevronRight,
    Bell,
    CheckCircle2,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { getPatients } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
    Grid, 
    Stack, 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Button, 
    Avatar,
    Divider,
    IconButton
} from "@mui/material";

export default function Dashboard({ onCreatePlan, onSelectClient }) {
    const { user } = useAuth();
    const role = user?.role || "client";
    const [activeClients, setActiveClients] = useState([]);
    const [loading, setLoading] = useState(role === "dietitian");

    useEffect(() => {
        if (role === "dietitian") {
            const fetchPatients = async () => {
                const response = await getPatients();
                if (response.success && Array.isArray(response.data)) {
                    setActiveClients(response.data);
                }
                setLoading(false);
            };
            fetchPatients();
        } else {
            setLoading(false);
        }
    }, [role]);

    const stats = [
        { label: "Total Patients", value: activeClients.length, icon: Users, color: "bg-blue-500", text: "text-blue-500" },
        { label: "Plans Active", value: "24", icon: FileText, color: "bg-emerald-500", text: "text-emerald-500" },
        { label: "Engagement", value: "88%", icon: TrendingUp, color: "bg-violet-500", text: "text-violet-500" },
        { label: "New Alerts", value: "5", icon: Bell, color: "bg-amber-500", text: "text-amber-500" },
    ];

    const tasks = [
        { id: 1, title: "Review Maria's meal logs", time: "2h ago", type: "review" },
        { id: 2, title: "Initial assessment: David S.", time: "4h ago", type: "assessment" },
        { id: 3, title: "Update macro targets for John", time: "Today", type: "update" },
    ];

    if (role !== "dietitian") {
        return (
            <Box className="fade-up p-6">
                <Typography variant="h4" className="font-black mb-6">Welcome, {user?.username}!</Typography>
                <Card className="glass-panel">
                    <CardContent>
                        <Typography color="textSecondary">Client dashboard view is being updated...</Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box className="fade-up p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" className="font-extrabold text-slate-900 tracking-tight">
                        Hello, {user?.username || 'Clinician'} 👋
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Box>
                <IconButton className="bg-white shadow-sm border border-slate-100">
                    <Bell size={20} />
                </IconButton>
            </Stack>

            {/* Stats Grid */}
            <Grid container spacing={3}>
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card className="glass-panel hover:translate-y-[-4px] transition-all cursor-default">
                                <CardContent className="p-5">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 ${stat.text}`}>
                                            <Icon size={24} />
                                        </div>
                                        <Box>
                                            <Typography variant="caption" className="font-bold uppercase tracking-widest text-slate-400">
                                                {stat.label}
                                            </Typography>
                                            <Typography variant="h5" className="font-black text-slate-900">
                                                {stat.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* CTA Section */}
            <Card className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10">
                <CardContent className="p-8 md:p-12 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                        <Box className="text-center md:text-left">
                            <Typography variant="h4" className="text-white font-black mb-2">Create Clinical Nutrition Plan</Typography>
                            <Typography className="text-slate-400 font-medium">Start a new personalized protocol for your patient in seconds.</Typography>
                        </Box>
                        <Button 
                            onClick={onCreatePlan}
                            variant="contained" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-xl shadow-emerald-500/20 transform transition-transform active:scale-95"
                            startIcon={<Plus size={24} />}
                        >
                            CREATE NEW PLAN
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Patients & Tasks */}
            <Grid container spacing={4}>
                {/* Recent Patients */}
                <Grid item xs={12} lg={8}>
                    <Card className="glass-panel h-full">
                        <Box className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <Typography className="font-black text-slate-900 uppercase tracking-widest text-sm">Recent Patients</Typography>
                            <Button size="small" className="text-emerald-600 font-bold hover:bg-emerald-50">View All</Button>
                        </Box>
                        <CardContent className="p-0">
                            <Box className="divide-y divide-slate-50">
                                {loading ? (
                                    <Box className="p-12 text-center text-slate-400 font-medium italic">Loading patient data...</Box>
                                ) : activeClients.slice(0, 5).map((client) => (
                                    <Box 
                                        key={client.id} 
                                        onClick={() => onSelectClient(client)}
                                        className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                    >
                                        <Avatar className="bg-emerald-100 text-emerald-700 font-bold">
                                            {client.name.charAt(0)}
                                        </Avatar>
                                        <Box className="flex-1">
                                            <Typography className="font-bold text-slate-900">{client.name}</Typography>
                                            <Typography variant="caption" className="text-slate-400 font-medium">{client.goal} • {client.age}y</Typography>
                                        </Box>
                                        <Box className="hidden sm:block text-right mr-4">
                                            <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-widest block">Status</Typography>
                                            <Typography variant="caption" className="font-black text-emerald-600 uppercase">Active Now</Typography>
                                        </Box>
                                        <IconButton className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight size={18} />
                                        </IconButton>
                                    </Box>
                                ))}
                                {activeClients.length === 0 && !loading && (
                                    <Box className="p-12 text-center text-slate-400 italic">No patient records found.</Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Alerts / Tasks */}
                <Grid item xs={12} lg={4}>
                    <Card className="glass-panel h-full">
                        <Box className="p-6 border-b border-slate-100">
                            <Typography className="font-black text-slate-900 uppercase tracking-widest text-sm">Priority Tasks</Typography>
                        </Box>
                        <CardContent className="p-6">
                            <Stack spacing={3}>
                                {tasks.map((task) => (
                                    <Box key={task.id} className="flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-50"></div>
                                        </div>
                                        <Box>
                                            <Typography className="text-sm font-bold text-slate-800">{task.title}</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                                <Clock size={12} className="text-slate-400" />
                                                <Typography variant="caption" className="text-slate-400 font-medium">{task.time}</Typography>
                                            </Stack>
                                        </Box>
                                    </Box>
                                ))}
                                <Divider />
                                <Box className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <div className="bg-white p-2 rounded-xl text-emerald-600">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <Box>
                                            <Typography className="text-xs font-bold text-emerald-900">Good Job!</Typography>
                                            <Typography variant="caption" className="text-emerald-700 font-medium">5 plans finalized today.</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie } from 'recharts';
import { CheckCircle, Clock, Folder, CheckSquare, Activity, AlertTriangle, TrendingUp, Users, Zap, Calendar, Shield, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, gradientFrom, gradientTo }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full opacity-10 bg-gradient-to-br ${gradientFrom} ${gradientTo} blur-2xl group-hover:opacity-20 transition-opacity`}></div>
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <h3 className="text-3xl font-extrabold text-surface-900 mb-0.5">{value}</h3>
        <p className="text-sm font-medium text-surface-500">{title}</p>
        {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
    </div>
);

const RiskBadge = ({ level }) => {
    const config = {
        HIGH: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', emoji: '🔴' },
        MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', emoji: '🟡' },
        LOW: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', emoji: '🟢' },
    };
    const c = config[level] || config.LOW;
    return (
        <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full border ${c.bg} ${c.text} ${c.border}`}>
            <span className="mr-1.5">{c.emoji}</span>{level}
        </span>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/');
                setStats(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStats();
    }, []);

    if (!stats) return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-surface-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-36 bg-surface-200 rounded-2xl"></div>)}</div>
            <div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-80 bg-surface-200 rounded-2xl"></div><div className="h-80 bg-surface-200 rounded-2xl"></div></div>
        </div>
    );

    const isAdmin = user?.role === 'ADMIN';

    const statusChartData = [
        { name: 'Completed', value: stats.completed_tasks, color: '#10b981' },
        { name: 'In Progress', value: stats.in_progress_tasks, color: '#6366f1' },
        { name: 'To Do', value: stats.todo_tasks, color: '#94a3b8' },
        { name: 'Overdue', value: stats.overdue_tasks, color: '#f43f5e' },
    ];

    const pieData = statusChartData.filter(d => d.value > 0);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-surface-500 mt-1">Welcome back, <span className="font-semibold text-surface-700 capitalize">{user?.first_name}</span>. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-sm">
                    <Calendar className="w-4 h-4 text-surface-400" />
                    <span className="text-sm font-medium text-surface-600">{format(new Date(), 'EEEE, MMM dd yyyy')}</span>
                </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                <StatCard title="Total Projects" value={stats.total_projects} icon={Folder} colorClass="bg-blue-500" gradientFrom="from-blue-400" gradientTo="to-blue-600" />
                <StatCard title="Total Tasks" value={stats.total_tasks} icon={CheckSquare} colorClass="bg-indigo-500" gradientFrom="from-indigo-400" gradientTo="to-indigo-600" />
                <StatCard title="Completed" value={stats.completed_tasks} icon={CheckCircle} colorClass="bg-emerald-500" gradientFrom="from-emerald-400" gradientTo="to-emerald-600" />
                <StatCard title="Overdue" value={stats.overdue_tasks} icon={AlertTriangle} colorClass="bg-rose-500" gradientFrom="from-rose-400" gradientTo="to-rose-600" />
                <StatCard title="Efficiency" value={`${stats.efficiency}%`} subtitle="Completion rate" icon={Zap} colorClass="bg-amber-500" gradientFrom="from-amber-400" gradientTo="to-amber-600" />
            </div>

            {/* Row 2: Weekly Productivity + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Productivity Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Weekly Productivity</h2>
                            <p className="text-sm text-surface-500 mt-0.5">Tasks completed & created over the last 7 days</p>
                        </div>
                        {stats.best_day && stats.best_day.completed > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-surface-400 uppercase font-bold tracking-wider">Best Day</p>
                                <p className="text-sm font-bold text-emerald-600">{stats.best_day.day} — {stats.best_day.completed} done</p>
                            </div>
                        )}
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weekly_data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: 13 }} />
                                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                                <Bar dataKey="created" name="Created" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Donut */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8 flex flex-col">
                    <h2 className="text-lg font-bold text-surface-900 mb-1">Task Breakdown</h2>
                    <p className="text-sm text-surface-500 mb-4">Current status distribution</p>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative">
                            <ResponsiveContainer width={200} height={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none" paddingAngle={3}>
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-extrabold text-surface-900">{stats.total_tasks}</p>
                                    <p className="text-xs text-surface-500">Total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {statusChartData.map(item => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-xs font-medium text-surface-600">{item.name}: <span className="font-bold text-surface-900">{item.value}</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Smart Deadline Predictor + Workload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Smart Deadline Predictor */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold text-surface-900">Smart Deadline Predictor</h2>
                    </div>
                    <p className="text-sm text-surface-500 mb-6">AI-powered risk analysis for your active projects</p>
                    <div className="space-y-4">
                        {stats.project_risks.map(p => (
                            <div key={p.id} className={`p-4 rounded-xl border ${p.risk_level === 'HIGH' ? 'border-rose-200 bg-rose-50/30' : p.risk_level === 'MEDIUM' ? 'border-amber-200 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/30'} hover:shadow-sm transition-shadow`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-surface-900">{p.title}</h3>
                                    <RiskBadge level={p.risk_level} />
                                </div>
                                <p className="text-xs text-surface-500 mb-3">{p.risk_label}</p>
                                {/* Progress Bar */}
                                <div className="w-full bg-surface-200 rounded-full h-2 mb-3">
                                    <div className={`h-2 rounded-full transition-all ${p.risk_level === 'HIGH' ? 'bg-rose-500' : p.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${p.progress}%`}}></div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-surface-500">
                                    <span>{p.completed_tasks}/{p.total_tasks} tasks done ({p.progress}%)</span>
                                    <span>{p.days_remaining !== null ? (p.days_remaining >= 0 ? `${p.days_remaining} days left` : `${Math.abs(p.days_remaining)} days overdue`) : 'No deadline'}</span>
                                </div>
                                {p.overdue_tasks > 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-rose-600 font-semibold">
                                        <AlertTriangle className="w-3 h-3" /> {p.overdue_tasks} overdue task{p.overdue_tasks > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                        {stats.project_risks.length === 0 && (
                            <div className="text-center py-8 text-surface-400"><Shield className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No projects to analyze</p></div>
                        )}
                    </div>
                </div>

                {/* Workload Balancer */}
                {isAdmin && stats.workload && stats.workload.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-bold text-surface-900">Workload Balancer</h2>
                        </div>
                        <p className="text-sm text-surface-500 mb-4">Active task distribution across team members</p>
                        
                        {/* Suggestion Banner */}
                        {stats.workload_suggestion && (
                            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-4 h-4 text-indigo-600" />
                                    <p className="text-sm font-bold text-indigo-900">Smart Suggestion</p>
                                </div>
                                <p className="text-sm text-indigo-700">
                                    Assign the next task to <span className="font-bold">{stats.workload_suggestion.name}</span> — currently has the lowest workload ({stats.workload_suggestion.active_tasks} active task{stats.workload_suggestion.active_tasks !== 1 ? 's' : ''}).
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {stats.workload.map((m, i) => {
                                const maxTasks = Math.max(...stats.workload.map(w => w.active_tasks), 1);
                                const barWidth = (m.active_tasks / maxTasks * 100);
                                const colors = ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600', 'from-violet-500 to-fuchsia-600'];
                                return (
                                    <div key={m.id} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-[10px] font-bold uppercase`}>{m.first_name.charAt(0)}</div>
                                                <span className="text-sm font-semibold text-surface-900 capitalize">{m.first_name} {m.last_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="text-surface-500"><span className="font-bold text-surface-900">{m.active_tasks}</span> active</span>
                                                <span className="text-emerald-600 font-medium">{m.completed_count} done</span>
                                                {m.overdue_count > 0 && <span className="text-rose-600 font-medium">{m.overdue_count} overdue</span>}
                                            </div>
                                        </div>
                                        <div className="w-full bg-surface-100 rounded-full h-2.5">
                                            <div className={`h-2.5 rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-500`} style={{width: `${Math.max(barWidth, 5)}%`}}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Activity (shows for non-admins or if no workload data) */}
                {(!isAdmin || !stats.workload || stats.workload.length === 0) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8 flex flex-col">
                        <h2 className="text-lg font-bold text-surface-900 mb-1">Recent Activity</h2>
                        <p className="text-sm text-surface-500 mb-6">Latest updates</p>
                        <div className="space-y-4 flex-1 overflow-y-auto">
                            {stats.recent_activity.map((task, index) => (
                                <div key={task.id} className="relative flex items-start group">
                                    {index !== stats.recent_activity.length - 1 && <div className="absolute top-8 left-3 w-px h-full bg-surface-200"></div>}
                                    <div className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${task.status === 'COMPLETED' ? 'bg-emerald-100' : task.status === 'TODO' ? 'bg-surface-100' : 'bg-blue-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'TODO' ? 'bg-surface-400' : 'bg-blue-500'}`} />
                                    </div>
                                    <div className="ml-4 bg-surface-50 rounded-xl p-3 flex-1 border border-surface-100">
                                        <p className="text-sm font-semibold text-surface-900">{task.title}</p>
                                        <p className="text-xs text-surface-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(task.updated_at), 'MMM dd • h:mm a')}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.recent_activity.length === 0 && <div className="flex flex-col items-center justify-center h-full text-surface-400"><Activity className="w-8 h-8 mb-2 opacity-50" /><p className="text-sm">No recent activity.</p></div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Row 4: Recent Activity for Admin (below the two-column row) */}
            {isAdmin && stats.workload && stats.workload.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
                    <h2 className="text-lg font-bold text-surface-900 mb-1">Recent Activity</h2>
                    <p className="text-sm text-surface-500 mb-6">Latest updates across all projects</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {stats.recent_activity.map((task) => (
                            <div key={task.id} className="bg-surface-50 rounded-xl p-4 border border-surface-100 hover:border-primary-200 transition-colors">
                                <div className={`w-2 h-2 rounded-full mb-2 ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-surface-400'}`}></div>
                                <p className="text-sm font-bold text-surface-900 line-clamp-2 mb-1">{task.title}</p>
                                <p className="text-xs text-surface-500 flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(task.updated_at), 'MMM dd')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

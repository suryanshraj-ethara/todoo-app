import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Plus, Calendar, CheckSquare, X, Pencil, Trash2 } from 'lucide-react';

const Tasks = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', due_date: '', project: '', assigned_to: '' });
    const [error, setError] = useState('');

    const fetchAll = async (endpoint) => {
        let all = [];
        let url = `/${endpoint}/?page=1`;
        while (url) {
            const res = await api.get(url);
            const data = res.data;
            if (data.results) {
                all = [...all, ...data.results];
                url = data.next ? new URL(data.next).pathname.replace('/api', '') + new URL(data.next).search : null;
            } else { all = data; url = null; }
        }
        return all;
    };

    const fetchTasks = async () => setTasks(await fetchAll('tasks'));
    
    useEffect(() => {
        fetchTasks();
        fetchAll('projects').then(setProjects);
        fetchAll('users').then(setAllUsers);
    }, []);

    const isAdmin = user?.role === 'ADMIN';

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form };
            if (!payload.due_date) delete payload.due_date;
            if (!payload.assigned_to) delete payload.assigned_to;
            payload.project = parseInt(payload.project);
            if (payload.assigned_to) payload.assigned_to = parseInt(payload.assigned_to);
            await api.post('/tasks/', payload);
            setShowCreateModal(false);
            setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', due_date: '', project: '', assigned_to: '' });
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.title?.[0] || err.response?.data?.project?.[0] || 'Failed to create task.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form };
            if (!payload.due_date) payload.due_date = null;
            payload.project = parseInt(payload.project);
            payload.assigned_to = payload.assigned_to ? parseInt(payload.assigned_to) : null;
            await api.patch(`/tasks/${editTask.id}/`, payload);
            setShowEditModal(false);
            setEditTask(null);
            fetchTasks();
        } catch (err) {
            setError('Failed to update task.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}/`);
                fetchTasks();
            } catch (err) { alert('Failed to delete task.'); }
        }
    };

    const openEdit = (task) => {
        setEditTask(task);
        setForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date || '',
            project: String(task.project),
            assigned_to: task.assigned_to ? String(task.assigned_to) : ''
        });
        setError('');
        setShowEditModal(true);
    };

    const resetAndOpenCreate = () => {
        setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', due_date: '', project: '', assigned_to: '' });
        setError('');
        setShowCreateModal(true);
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'HIGH': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-surface-100 text-surface-700 border-surface-200';
        }
    };

    // Form fields shared between create and edit modals
    const renderFormFields = () => (
        <>
            {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium text-center">{error}</div>}
            <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Task Title <span className="text-rose-500">*</span></label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Design homepage mockup" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Brief description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1">Project <span className="text-rose-500">*</span></label>
                    <select value={form.project} onChange={e => setForm({...form, project: e.target.value})} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Select project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1">Assign To</label>
                    <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Unassigned</option>
                        {allUsers.filter(u => u.role !== 'ADMIN').map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} (@{u.username})</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1">Due Date</label>
                    <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
            </div>
        </>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
                    <p className="text-sm text-surface-500 mt-1">Manage and track your assigned tasks</p>
                </div>
                {isAdmin && (
                    <button onClick={resetAndOpenCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />New Task
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                <table className="min-w-full divide-y divide-surface-200">
                    <thead className="bg-surface-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Task Details</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Assignee</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Due Date</th>
                            {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-surface-100">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-surface-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{task.title}</div>
                                    {task.description && <div className="text-xs text-surface-500 mt-0.5 truncate max-w-[200px]">{task.description}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-600">
                                    {task.project_details?.title || `Project #${task.project}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {task.assigned_to_details ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                                                {(task.assigned_to_details.first_name || task.assigned_to_details.username).charAt(0)}
                                            </div>
                                            <span className="text-sm text-surface-700 font-medium capitalize">{task.assigned_to_details.first_name}</span>
                                        </div>
                                    ) : <span className="text-sm text-surface-400">Unassigned</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full border ${getStatusColor(task.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-indigo-500' : 'bg-surface-500'}`}></span>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-surface-600 font-medium">
                                        <Calendar className="w-4 h-4 mr-2 text-surface-400" />
                                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : '—'}
                                    </div>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(task)} className="text-surface-400 hover:text-primary-600 transition-colors p-2 hover:bg-primary-50 rounded-lg" title="Edit Task">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(task.id)} className="text-surface-400 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-lg" title="Delete Task">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {tasks.length === 0 && (
                            <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 mb-4"><CheckSquare className="w-8 h-8 text-surface-400" /></div>
                                <h3 className="text-sm font-medium text-surface-900">No tasks found</h3>
                                <p className="text-sm text-surface-500 mt-1">Get started by creating a new task.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-lg p-8 relative animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold text-surface-900 mb-1">Create New Task</h3>
                        <p className="text-sm text-surface-500 mb-6">Fill in the task details below.</p>
                        <form className="space-y-4" onSubmit={handleCreate}>
                            {renderFormFields()}
                            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 mt-2">Create Task</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {showEditModal && editTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-lg p-8 relative animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold text-surface-900 mb-1">Edit Task</h3>
                        <p className="text-sm text-surface-500 mb-6">Modify the task details below.</p>
                        <form className="space-y-4" onSubmit={handleUpdate}>
                            {renderFormFields()}
                            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 mt-2">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;

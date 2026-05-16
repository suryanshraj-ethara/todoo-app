import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Plus, Calendar, Folder, X, Pencil, Trash2, UserPlus, UserMinus } from 'lucide-react';

const Projects = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [memberProject, setMemberProject] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', status: 'ACTIVE', deadline: '' });
    const [error, setError] = useState('');

    const fetchProjects = async () => {
        let all = [];
        let url = '/projects/?page=1';
        while (url) {
            const res = await api.get(url);
            const data = res.data;
            if (data.results) {
                all = [...all, ...data.results];
                url = data.next ? new URL(data.next).pathname.replace('/api', '') + new URL(data.next).search : null;
            } else { all = data; url = null; }
        }
        setProjects(all);
    };

    const fetchUsers = async () => {
        let all = [];
        let url = '/users/?page=1';
        while (url) {
            const res = await api.get(url);
            const data = res.data;
            if (data.results) {
                all = [...all, ...data.results];
                url = data.next ? new URL(data.next).pathname.replace('/api', '') + new URL(data.next).search : null;
            } else { all = data; url = null; }
        }
        setAllUsers(all);
    };

    useEffect(() => { fetchProjects(); fetchUsers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form };
            if (!payload.deadline) delete payload.deadline;
            await api.post('/projects/', payload);
            setShowCreateModal(false);
            setForm({ title: '', description: '', status: 'ACTIVE', deadline: '' });
            fetchProjects();
        } catch (err) {
            setError(err.response?.data?.title?.[0] || 'Failed to create project.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form };
            if (!payload.deadline) payload.deadline = null;
            await api.patch(`/projects/${editProject.id}/`, payload);
            setShowEditModal(false);
            setEditProject(null);
            fetchProjects();
        } catch (err) {
            setError('Failed to update project.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
            try {
                await api.delete(`/projects/${id}/`);
                fetchProjects();
            } catch (err) { alert('Failed to delete project.'); }
        }
    };

    const openEdit = (project) => {
        setEditProject(project);
        setForm({ title: project.title, description: project.description || '', status: project.status, deadline: project.deadline || '' });
        setError('');
        setShowEditModal(true);
    };

    const openMemberManager = (project) => {
        setMemberProject(project);
        setShowMemberModal(true);
    };

    const addMemberToProject = async (userId) => {
        const currentMembers = memberProject.members || [];
        try {
            await api.patch(`/projects/${memberProject.id}/`, { members: [...currentMembers, userId] });
            fetchProjects();
            // Refresh memberProject data
            const res = await api.get(`/projects/${memberProject.id}/`);
            setMemberProject(res.data);
        } catch (err) { alert('Failed to add member.'); }
    };

    const removeMemberFromProject = async (userId) => {
        const currentMembers = memberProject.members || [];
        try {
            await api.patch(`/projects/${memberProject.id}/`, { members: currentMembers.filter(id => id !== userId) });
            fetchProjects();
            const res = await api.get(`/projects/${memberProject.id}/`);
            setMemberProject(res.data);
        } catch (err) { alert('Failed to remove member.'); }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Projects</h1>
                    <p className="text-sm text-surface-500 mt-1">Manage and track your team's projects</p>
                </div>
                {isAdmin && (
                    <button onClick={() => { setForm({ title: '', description: '', status: 'ACTIVE', deadline: '' }); setError(''); setShowCreateModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />New Project
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                <table className="min-w-full divide-y divide-surface-200">
                    <thead className="bg-surface-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Project Details</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Team</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Timeline</th>
                            {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-surface-100">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-surface-50/80 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{project.title}</div>
                                    <div className="text-sm text-surface-500 mt-1">{project.description?.substring(0, 60)}{project.description?.length > 60 ? '...' : ''}</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full border ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-surface-100 text-surface-700 border-surface-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${project.status === 'ACTIVE' ? 'bg-emerald-500' : project.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-surface-500'}`}></span>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex -space-x-2 overflow-hidden items-center">
                                        {project.members_details?.slice(0, 3).map((member) => (
                                            <div key={member.id} className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br from-indigo-400 to-purple-500 items-center justify-center text-xs font-bold text-white">
                                                {(member.first_name || member.username).charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {project.members_details?.length > 3 && <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-surface-100 items-center justify-center text-xs font-bold text-surface-600">+{project.members_details.length - 3}</div>}
                                        {(!project.members_details || project.members_details.length === 0) && <span className="text-sm text-surface-400">No members</span>}
                                        {isAdmin && (
                                            <button onClick={() => openMemberManager(project)} className="ml-2 w-8 h-8 rounded-full bg-primary-50 border-2 border-dashed border-primary-300 flex items-center justify-center hover:bg-primary-100 transition-colors" title="Manage Members">
                                                <UserPlus className="w-3.5 h-3.5 text-primary-500" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-surface-600 font-medium">
                                        <Calendar className="w-4 h-4 mr-2 text-surface-400" />
                                        {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No deadline'}
                                    </div>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(project)} className="text-surface-400 hover:text-primary-600 transition-colors p-2 hover:bg-primary-50 rounded-lg" title="Edit Project">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(project.id)} className="text-surface-400 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-lg" title="Delete Project">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 mb-4"><Folder className="w-8 h-8 text-surface-400" /></div>
                                <h3 className="text-sm font-medium text-surface-900">No projects found</h3>
                                <p className="text-sm text-surface-500 mt-1">Get started by creating a new project.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-lg p-8 relative animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold text-surface-900 mb-1">Create New Project</h3>
                        <p className="text-sm text-surface-500 mb-6">Fill in the details for your new project.</p>
                        <form className="space-y-4" onSubmit={handleCreate}>
                            {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium text-center">{error}</div>}
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Project Title <span className="text-rose-500">*</span></label>
                                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Project Phoenix" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Brief description of the project..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="ACTIVE">Active</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Deadline</label>
                                    <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 mt-2">Create Project</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditModal && editProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-lg p-8 relative animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold text-surface-900 mb-1">Edit Project</h3>
                        <p className="text-sm text-surface-500 mb-6">Modify the project details below.</p>
                        <form className="space-y-4" onSubmit={handleUpdate}>
                            {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium text-center">{error}</div>}
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Project Title <span className="text-rose-500">*</span></label>
                                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="ACTIVE">Active</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Deadline</label>
                                    <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 mt-2">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {showMemberModal && memberProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowMemberModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-lg p-8 relative animate-slide-up max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowMemberModal(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold text-surface-900 mb-1">Manage Members — {memberProject.title}</h3>
                        <p className="text-sm text-surface-500 mb-6">Add or remove members from this project.</p>
                        
                        <div className="overflow-y-auto flex-1 space-y-4">
                            {/* Current Members */}
                            <div>
                                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Current Members ({memberProject.members_details?.length || 0})</p>
                                <div className="space-y-2">
                                    {memberProject.members_details?.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase">{(m.first_name || m.username).charAt(0)}</div>
                                                <div><p className="text-sm font-semibold text-surface-900 capitalize">{m.first_name} {m.last_name}</p><p className="text-xs text-surface-500">@{m.username}</p></div>
                                            </div>
                                            <button onClick={() => removeMemberFromProject(m.id)} className="p-2 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Remove from project">
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!memberProject.members_details || memberProject.members_details.length === 0) && <p className="text-sm text-surface-400 text-center py-3">No members assigned</p>}
                                </div>
                            </div>

                            {/* Available Members */}
                            <div>
                                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Available Members</p>
                                <div className="space-y-2">
                                    {allUsers.filter(u => !(memberProject.members || []).includes(u.id) && u.role !== 'ADMIN').map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold uppercase">{(u.first_name || u.username).charAt(0)}</div>
                                                <div><p className="text-sm font-semibold text-surface-900 capitalize">{u.first_name} {u.last_name}</p><p className="text-xs text-surface-500">@{u.username}</p></div>
                                            </div>
                                            <button onClick={() => addMemberToProject(u.id)} className="p-2 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Add to project">
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;

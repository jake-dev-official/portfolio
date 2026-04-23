import React, { useState, useEffect, useRef } from 'react';
import { Octokit } from '@octokit/rest';
import { FaTrash, FaPlus, FaSave, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DarkSwal = Swal.mixin({
    background: '#1f2937', // bg-gray-800
    color: '#ffffff',
    confirmButtonColor: '#2563eb', // bg-blue-600
    cancelButtonColor: '#4b5563', // bg-gray-600
    customClass: {
        popup: 'border border-gray-700 shadow-2xl rounded-xl'
    }
});

const Admin = () => {
    const [token, setToken] = useState(localStorage.getItem('github_token') || '');
    const [repo, setRepo] = useState(localStorage.getItem('github_repo') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!token && !!repo);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState({ frontend: [], backend: [] });
    const [fileSha, setFileSha] = useState('');
    const [skillsSha, setSkillsSha] = useState('');
    const [resumeSha, setResumeSha] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const formRef = useRef(null);

    // Form State
    const [newProject, setNewProject] = useState({
        title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '',
        techStack: '', // comma separated in form
        imageFileBase64: null, imageFileName: '', displayUrl: ''
    });

    const [newSkill, setNewSkill] = useState({ name: '', icon: '', category: 'frontend' });
    const [editingSkillIndex, setEditingSkillIndex] = useState(null);
    const [pendingResume, setPendingResume] = useState(null);

    const getOctokit = () => new Octokit({ auth: token });

    useEffect(() => {
        if (isAuthenticated) {
            loadProjects();
            loadSkills();
            loadResumeInfo();
        }
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_repo', repo);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_repo');
        setToken('');
        setRepo('');
        setIsAuthenticated(false);
        setProjects([]);
        setMessage('');
    };

    const loadProjects = async () => {
        setLoading(true);
        setMessage('');
        try {
            const octokit = getOctokit();
            const [owner, _repo] = repo.split('/');
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo: _repo,
                path: 'public/data/projects.json',
            });
            // Decode base64
            const content = decodeURIComponent(escape(atob(data.content)));
            setProjects(JSON.parse(content));
            setFileSha(data.sha);
        } catch (error) {
            console.error(error);
            setMessage('Failed to load projects. Check repository name and token permissions.');
        } finally {
            setLoading(false);
        }
    };

    const loadSkills = async () => {
        try {
            const octokit = getOctokit();
            const [owner, _repo] = repo.split('/');
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo: _repo,
                path: 'public/data/skills.json',
            });
            const content = decodeURIComponent(escape(atob(data.content)));
            setSkills(JSON.parse(content));
            setSkillsSha(data.sha);
        } catch (error) {
            console.error(error);
        }
    };

    const loadResumeInfo = async () => {
        try {
            const octokit = getOctokit();
            const [owner, _repo] = repo.split('/');
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo: _repo,
                path: 'public/Jerry_Anane_CV.pdf',
            });
            setResumeSha(data.sha);
        } catch (error) {
            if (error.status !== 404) console.error(error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
                setNewProject({
                    ...newProject,
                    imageFileBase64: base64String,
                    imageFileName: safeFileName,
                    imageUrl: `projects/${safeFileName}`,
                    displayUrl: reader.result // This is for immediate dashboard preview
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const addProject = () => {
        if (!newProject.title) {
            DarkSwal.fire('Error', 'Project title is required!', 'error');
            return;
        }
        const projectToAdd = {
            title: newProject.title,
            description: newProject.description,
            imageUrl: newProject.imageUrl,
            liveUrl: newProject.liveUrl || '#',
            githubUrl: newProject.githubUrl || '#',
            techStack: typeof newProject.techStack === 'string'
                ? newProject.techStack.split(',').map(s => s.trim()).filter(s => s !== '')
                : newProject.techStack,
            _pendingImageBase64: newProject.imageFileBase64,
            _pendingImageName: newProject.imageFileName,
            _preview: newProject.displayUrl // Stays in state for dashboard preview
        };

        if (editingIndex !== null) {
            const updatedProjects = [...projects];
            updatedProjects[editingIndex] = projectToAdd;
            setProjects(updatedProjects);
            setEditingIndex(null);
            setNewProject({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', techStack: '', imageFileBase64: null, imageFileName: '', displayUrl: '' });
            DarkSwal.fire('Updated!', 'Project modified locally. Remember to click Sync!', 'success');
        } else {
            setProjects([projectToAdd, ...projects]);
            setNewProject({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', techStack: '', imageFileBase64: null, imageFileName: '', displayUrl: '' });
            DarkSwal.fire('Added!', 'New project added locally. Remember to click Sync!', 'success');
        }
    };

    const deleteProject = (index) => {
        DarkSwal.fire({
            title: 'Delete this project?',
            text: "It will be removed locally. Click 'Sync & Deploy' to finalize.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626', // bg-red-600 overrides the default blue mixin
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const newProjects = [...projects];
                newProjects.splice(index, 1);
                setProjects(newProjects);
                if (editingIndex === index) cancelEdit();
                DarkSwal.fire('Deleted!', 'Project removed locally. Remember to click Sync!', 'success');
            }
        });
    };

    const editProject = (index) => {
        setEditingIndex(index);
        const proj = projects[index];
        setNewProject({
            ...proj,
            techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : '',
            imageFileBase64: null,
            imageFileName: '',
            displayUrl: proj._preview || (proj.imageUrl.startsWith('http') ? proj.imageUrl : proj.imageUrl)
        });
        if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setNewProject({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', techStack: '', imageFileBase64: null, imageFileName: '', displayUrl: '' });
    };

    const addSkill = () => {
        if (!newSkill.name || !newSkill.icon) {
            DarkSwal.fire('Error', 'Name and Icon are required!', 'error');
            return;
        }
        const updatedSkills = { ...skills };
        if (editingSkillIndex !== null) {
            const { category, index } = editingSkillIndex;
            // If category changed, remove from old, add to new
            if (category !== newSkill.category) {
                updatedSkills[category].splice(index, 1);
                updatedSkills[newSkill.category].push({ name: newSkill.name, icon: newSkill.icon });
            } else {
                updatedSkills[category][index] = { name: newSkill.name, icon: newSkill.icon };
            }
            setEditingSkillIndex(null);
        } else {
            updatedSkills[newSkill.category].push({ name: newSkill.name, icon: newSkill.icon });
        }
        setSkills(updatedSkills);
        setNewSkill({ name: '', icon: '', category: 'frontend' });
    };

    const deleteSkill = (category, index) => {
        const updatedSkills = { ...skills };
        updatedSkills[category].splice(index, 1);
        setSkills(updatedSkills);
    };

    const editSkill = (category, index) => {
        const skill = skills[category][index];
        setNewSkill({ ...skill, category });
        setEditingSkillIndex({ category, index });
    };

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
            setPendingResume(base64String);
            DarkSwal.fire('Staged!', 'Resume added to pending changes. Remember to click "Sync & Deploy"!', 'info');
        };
        reader.readAsDataURL(file);
    };

    const saveChangesToGitHub = async () => {
        setLoading(true);
        setMessage('Initializing Sync...');
        let uploadedImages = [];
        let failedImages = [];

        try {
            const octokit = getOctokit();
            const [owner, _repo] = repo.split('/');

            // 1. Process all projects and upload images if needed
            for (const proj of projects) {
                if (proj._pendingImageBase64 && proj._pendingImageName) {
                    setMessage(`Uploading ${proj._pendingImageName}...`);
                    try {
                        let imageSha = null;
                        try {
                            const res = await octokit.rest.repos.getContent({
                                owner,
                                repo: _repo,
                                path: `public/projects/${proj._pendingImageName}`
                            });
                            imageSha = res.data.sha;
                        } catch (e) {
                            // 404 is expected for new files, anything else is a real error
                            if (e.status !== 404) throw e;
                        }

                        const uploadRes = await octokit.rest.repos.createOrUpdateFileContents({
                            owner,
                            repo: _repo,
                            path: `public/projects/${proj._pendingImageName}`,
                            message: `CMS: Add image for project "${proj.title}"`,
                            content: proj._pendingImageBase64,
                            sha: imageSha || undefined
                        });

                        if (uploadRes.status === 200 || uploadRes.status === 201) {
                            uploadedImages.push(proj._pendingImageName);
                        } else {
                            throw new Error(`Unexpected status: ${uploadRes.status}`);
                        }
                    } catch (uploadErr) {
                        console.error(`Upload failed for ${proj._pendingImageName}:`, uploadErr);
                        failedImages.push(`${proj._pendingImageName} (${uploadErr.message})`);
                    }
                }
            }

            if (failedImages.length > 0) {
                const failMsg = failedImages.join('\n');
                const proceed = await DarkSwal.fire({
                    title: 'Partial Upload Failure',
                    html: `<p>The following images failed to upload:</p><pre class="text-xs text-red-400 mt-2 text-left">${failMsg}</pre><p class="mt-2">Do you want to save the project text anyway?</p>`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Save Text Only',
                    cancelButtonText: 'Abort Sync'
                });
                if (!proceed.isConfirmed) {
                    setMessage('Sync Aborted');
                    setLoading(false);
                    return;
                }
            }

            // 2. Update projects.json
            setMessage('Saving projects.json...');
            const cleanProjects = projects.map(({ _pendingImageBase64, _pendingImageName, _preview, ...rest }) => rest);
            const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(cleanProjects, null, 2))));

            const { data } = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo: _repo,
                path: 'public/data/projects.json',
                message: 'CMS: Update projects catalog',
                content: contentBase64,
                sha: fileSha
            });

            setFileSha(data.content.sha);
            setProjects(cleanProjects);
            setNewProject({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', techStack: '', imageFileBase64: null, imageFileName: '', displayUrl: '' });

            // 3. Update skills.json
            setMessage('Saving skills.json...');
            const skillsContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(skills, null, 2))));
            const skillsRes = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo: _repo,
                path: 'public/data/skills.json',
                message: 'CMS: Update skills catalog',
                content: skillsContentBase64,
                sha: skillsSha
            });
            setSkillsSha(skillsRes.data.content.sha);

            // 4. Update Resume if pending
            if (pendingResume) {
                setMessage('Uploading Resume...');
                const resumeRes = await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo: _repo,
                    path: 'public/Jerry_Anane_CV.pdf',
                    message: 'CMS: Update Resume',
                    content: pendingResume,
                    sha: resumeSha || undefined
                });
                setResumeSha(resumeRes.data.content.sha);
                setPendingResume(null);
            }

            DarkSwal.fire({
                title: '🎉 Sync Succesful!',
                html: `<p>Catalog, skills, and resume updated successfully.</p>${uploadedImages.length > 0 ? `<p class="text-sm text-green-400 mt-2">Images Uploaded: ${uploadedImages.join(', ')}</p>` : ''}`,
                icon: 'success'
            });
            setMessage('');
        } catch (err) {
            console.error('Final sync failed:', err);
            DarkSwal.fire('Critical Sync Error', err.message, 'error');
            setMessage('Sync failed. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-8">
                <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">CMS Login</h2>
                    <div className="mb-4">
                        <label className="block text-sm mb-2">GitHub Repository (e.g., username/repo)</label>
                        <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} required
                            className="w-full p-2 bg-gray-700 text-white rounded outline-none" placeholder="jake-dev-official/portfolio" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm mb-2">Personal Access Token</label>
                        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} required
                            className="w-full p-2 bg-gray-700 text-white rounded outline-none" placeholder="ghp_xxxxxxxxxxxx" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold">Connect to GitHub</button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded">
                    <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded hover:bg-red-500 transition-colors">
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>

                {message && (
                    <div className="bg-blue-900 border border-blue-400 p-4 rounded mb-6 text-center">
                        {message}
                    </div>
                )}

                {/* Add/Edit Project Section */}
                <div ref={formRef} className={`p-6 rounded mb-8 shadow-lg transition-all duration-300 border-2 ${editingIndex !== null ? 'bg-blue-900/40 border-blue-500/50' : 'bg-gray-800 border-transparent'}`}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center justify-between border-b border-gray-700 pb-2">
                        <div className="flex items-center gap-2">
                            {editingIndex !== null ? <FaEdit className="text-blue-400" /> : <FaPlus className="text-green-500" />}
                            {editingIndex !== null ? <span className="text-blue-200">Edit Project</span> : 'Add New Project'}
                        </div>
                        {editingIndex !== null && (
                            <button onClick={cancelEdit} className="text-sm bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded transition-colors text-white">Cancel Edit</button>
                        )}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Project Title" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                        <input type="text" placeholder="Live Demo URL (optional)" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" value={newProject.liveUrl} onChange={e => setNewProject({ ...newProject, liveUrl: e.target.value })} />
                        <input type="text" placeholder="GitHub Repo URL (optional)" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" value={newProject.githubUrl} onChange={e => setNewProject({ ...newProject, githubUrl: e.target.value })} />
                        <input type="text" placeholder="Tech Stack (comma separated: React, Tailwind, etc)" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" value={newProject.techStack} onChange={e => setNewProject({ ...newProject, techStack: e.target.value })} />
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">
                                {editingIndex !== null ? "Replace Image (Optional)" : "Upload Project Image"}
                            </label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="p-1" />
                        </div>
                        <textarea placeholder="Project Description" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 h-24" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}></textarea>
                    </div>
                    <button onClick={addProject} className={`mt-6 px-8 py-3 rounded font-bold transition-colors w-full md:w-auto shadow-lg text-white ${editingIndex !== null ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
                        {editingIndex !== null ? '✓ Update Local Project' : '+ Stage Local Addition'}
                    </button>
                </div>

                {/* Resume Management Section */}
                <div className="p-6 rounded mb-8 shadow-lg bg-gray-800 border-transparent border-2">
                    <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                        <FaSave className="text-blue-400" /> Manage Resume (CV)
                    </h2>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <label className="text-sm text-gray-400">Upload your CV (PDF format)</label>
                            {pendingResume && (
                                <span className="text-[10px] bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-600/50">
                                    Pending Sync
                                </span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="p-1 text-sm bg-gray-700 rounded w-full md:w-auto"
                        />
                        <p className="text-xs text-gray-500 mt-1">Staged resume will be uploaded when you click "Sync & Deploy to GitHub".</p>
                    </div>
                </div>

                {/* Skills Management Section */}
                <div className={`p-6 rounded mb-8 shadow-lg transition-all duration-300 border-2 ${editingSkillIndex !== null ? 'bg-purple-900/40 border-purple-500/50' : 'bg-gray-800 border-transparent'}`}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center justify-between border-b border-gray-700 pb-2">
                        <div className="flex items-center gap-2">
                            {editingSkillIndex !== null ? <FaEdit className="text-purple-400" /> : <FaPlus className="text-green-500" />}
                            {editingSkillIndex !== null ? <span className="text-purple-200">Edit Skill</span> : 'Add New Skill'}
                        </div>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Skill Name (e.g. React)" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-purple-500" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} />
                        <input type="text" placeholder="Icon Name (e.g. FaReact)" className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-purple-500" value={newSkill.icon} onChange={e => setNewSkill({ ...newSkill, icon: e.target.value })} />
                        <select className="p-2 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-purple-500" value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}>
                            <option value="frontend">Frontend</option>
                            <option value="backend">Backend & Databases</option>
                        </select>
                    </div>
                    <button onClick={addSkill} className={`mt-6 px-8 py-3 rounded font-bold transition-colors w-full md:w-auto shadow-lg text-white ${editingSkillIndex !== null ? 'bg-purple-600 hover:bg-purple-500' : 'bg-green-600 hover:bg-green-500'}`}>
                        {editingSkillIndex !== null ? '✓ Update Local Skill' : '+ Stage Local Skill'}
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div>
                            <h3 className="font-bold mb-4 text-gray-400 uppercase tracking-wider text-sm">Frontend Skills</h3>
                            <div className="space-y-2">
                                {skills.frontend.map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                                        <span>{s.name} ({s.icon})</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => editSkill('frontend', idx)} className="text-blue-400 hover:text-blue-300" aria-label={`Edit ${s.name} Skill`} title="Edit Skill"><FaEdit /></button>
                                            <button onClick={() => deleteSkill('frontend', idx)} className="text-red-400 hover:text-red-300" aria-label={`Delete ${s.name} Skill`} title="Delete Skill"><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4 text-gray-400 uppercase tracking-wider text-sm">Backend Skills</h3>
                            <div className="space-y-2">
                                {skills.backend.map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                                        <span>{s.name} ({s.icon})</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => editSkill('backend', idx)} className="text-blue-400 hover:text-blue-300" aria-label={`Edit ${s.name} Skill`} title="Edit Skill"><FaEdit /></button>
                                            <button onClick={() => deleteSkill('backend', idx)} className="text-red-400 hover:text-red-300" aria-label={`Delete ${s.name} Skill`} title="Delete Skill"><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                <div className="bg-gray-800 p-6 rounded shadow-lg">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                        <h2 className="text-xl font-semibold">Current Projects</h2>
                        <button onClick={saveChangesToGitHub} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold disabled:opacity-50">
                            <FaSave /> {loading ? "Syncing..." : "Sync & Deploy to GitHub"}
                        </button>
                    </div>

                    {loading && projects.length === 0 ? (
                        <p className="text-center py-4">Loading from GitHub...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((proj, idx) => (
                                <div key={idx} className="flex items-center bg-gray-700 p-4 rounded gap-4 overflow-hidden shadow">
                                    {(proj._preview || proj.imageUrl) && (
                                        <img
                                            src={proj._preview || (proj.imageUrl.startsWith('http') ? proj.imageUrl : proj.imageUrl.startsWith('/') ? proj.imageUrl.substring(1) : proj.imageUrl)}
                                            alt="preview"
                                            className="w-20 h-14 object-cover rounded flex-shrink-0 bg-gray-600"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white truncate">{proj.title}</h3>
                                            {proj._pendingImageBase64 && (
                                                <span className="text-[10px] bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-600/50 flex flex-wrap shrink-0">
                                                    Pending Sync
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-1">{proj.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => editProject(idx)}
                                            className="bg-blue-600/20 hover:bg-blue-600 p-3 rounded text-blue-500 hover:text-white transition-all"
                                            title="Edit Project"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => deleteProject(idx)}
                                            className="bg-red-600/20 hover:bg-red-600 p-3 rounded text-red-500 hover:text-white transition-all"
                                            title="Delete Project"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && <p className="text-gray-400">No projects found. Add one above.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;

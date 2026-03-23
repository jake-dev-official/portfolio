import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { FaTrash, FaPlus, FaSave, FaSignOutAlt } from 'react-icons/fa';

const Admin = () => {
    const [token, setToken] = useState(localStorage.getItem('github_token') || '');
    const [repo, setRepo] = useState(localStorage.getItem('github_repo') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!token && !!repo);
    const [projects, setProjects] = useState([]);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Form State
    const [newProject, setNewProject] = useState({
        title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', imageFileBase64: null, imageFileName: ''
    });

    const getOctokit = () => new Octokit({ auth: token });

    useEffect(() => {
        if (isAuthenticated) {
            loadProjects();
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
                setNewProject({ ...newProject, imageFileBase64: base64String, imageFileName: safeFileName, imageUrl: `/projects/${safeFileName}` });
            };
            reader.readAsDataURL(file);
        }
    };

    const addProject = () => {
        if (!newProject.title) return;
        const projectToAdd = {
            title: newProject.title,
            description: newProject.description,
            imageUrl: newProject.imageUrl,
            liveUrl: newProject.liveUrl || '#',
            githubUrl: newProject.githubUrl || '#'
        };
        setProjects([projectToAdd, ...projects]);
    };

    const deleteProject = (index) => {
        const newProjects = [...projects];
        newProjects.splice(index, 1);
        setProjects(newProjects);
    };

    const saveChangesToGitHub = async () => {
        setLoading(true);
        setMessage('Saving changes to GitHub...');
        try {
            const octokit = getOctokit();
            const [owner, _repo] = repo.split('/');

            // Optional: upload image first if exists
            if (newProject.imageFileBase64) {
                setMessage('Uploading new image...');
                // Let's try to get image SHA if it exists to overwrite it, otherwise just create it
                let imageSha = null;
                try {
                    const res = await octokit.rest.repos.getContent({ owner, repo: _repo, path: `public/projects/${newProject.imageFileName}` });
                    imageSha = res.data.sha;
                } catch (e) { /* file doesn't exist, which is fine */ }

                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo: _repo,
                    path: `public/projects/${newProject.imageFileName}`,
                    message: `Add image for ${newProject.title}`,
                    content: newProject.imageFileBase64,
                    sha: imageSha || undefined
                });
            }

            setMessage('Saving projects.json...');
            const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(projects, null, 2))));
            const { data } = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo: _repo,
                path: 'public/data/projects.json',
                message: 'Update projects catalog via CMS',
                content: contentBase64,
                sha: fileSha
            });

            setFileSha(data.content.sha);
            setMessage('Successfully saved to GitHub! Deployment should start automatically.');
            setNewProject({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', imageFileBase64: null, imageFileName: '' });
        } catch (err) {
            console.error(err);
            setMessage('Failed to save changes: ' + err.message);
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
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded hover:bg-red-500">
                        <FaSignOutAlt /> Disconnect
                    </button>
                </div>

                {message && (
                    <div className="bg-blue-900 border border-blue-400 p-4 rounded mb-6 text-center">
                        {message}
                    </div>
                )}

                {/* Add Project Section */}
                <div className="bg-gray-800 p-6 rounded mb-8 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2"><FaPlus /> Add New Project</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Project Title" className="p-2 bg-gray-700 rounded" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                        <input type="text" placeholder="Live Demo URL (optional)" className="p-2 bg-gray-700 rounded" value={newProject.liveUrl} onChange={e => setNewProject({ ...newProject, liveUrl: e.target.value })} />
                        <input type="text" placeholder="GitHub Repo URL (optional)" className="p-2 bg-gray-700 rounded" value={newProject.githubUrl} onChange={e => setNewProject({ ...newProject, githubUrl: e.target.value })} />
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">Upload Project Image</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="p-1" />
                        </div>
                        <textarea placeholder="Project Description" className="p-2 bg-gray-700 rounded md:col-span-2 h-24" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}></textarea>
                    </div>
                    <button onClick={addProject} className="mt-4 bg-green-600 hover:bg-green-500 px-6 py-2 rounded font-bold">Stage Local Addition</button>
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
                                <div key={idx} className="flex items-center bg-gray-700 p-4 rounded gap-4">
                                    {proj.imageUrl && <img src={`${import.meta.env.BASE_URL}${proj.imageUrl.replace(/^\//, '')}`} alt="preview" className="w-24 h-16 object-cover rounded" />}
                                    <div className="flex-1">
                                        <h3 className="font-bold">{proj.title}</h3>
                                        <p className="text-sm text-gray-400 truncate">{proj.description}</p>
                                    </div>
                                    <button onClick={() => deleteProject(idx)} className="bg-red-600 p-3 rounded text-white hover:bg-red-500" title="Delete Project">
                                        <FaTrash />
                                    </button>
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

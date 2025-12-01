import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { projectService } from "@/services/api/projectService";
import ProjectForm from "@/components/molecules/ProjectForm";
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const projectsData = await projectService.getAll();
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectService.create(projectData);
      setProjects(prev => [newProject, ...prev]);
      setShowForm(false);
      toast.success("Project created successfully!");
    } catch (err) {
      console.error("Failed to create project:", err);
      toast.error("Failed to create project");
    }
  };

  const handleUpdateProject = async (projectData) => {
    if (!editingProject) return;

    try {
      const updatedProject = await projectService.update(editingProject.Id, projectData);
      setProjects(prev => prev.map(project => 
        project.Id === editingProject.Id ? updatedProject : project
      ));
      setEditingProject(null);
      toast.success("Project updated successfully!");
    } catch (err) {
      console.error("Failed to update project:", err);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

    try {
      await projectService.delete(projectId);
      setProjects(prev => prev.filter(project => project.Id !== projectId));
      toast.success("Project deleted successfully");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Failed to delete project");
    }
  };

  const getFilteredProjects = () => {
    let filtered = projects;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return <ErrorView message={error} onRetry={loadProjects} />;
  }

  const filteredProjects = getFilteredProjects();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and track progress
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2"
        >
          <ApperIcon name={showForm ? "X" : "Plus"} size={16} />
          <span>{showForm ? "Cancel" : "New Project"}</span>
        </Button>
      </div>

      {/* Project Form */}
      {(showForm || editingProject) && (
        <ProjectForm
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
          initialData={editingProject}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 task-card-shadow">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'active', 'planning', 'completed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Empty
          icon="FolderOpen"
          title="No projects found"
          description={searchQuery || statusFilter !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Create your first project to get started"}
          action={
            !searchQuery && statusFilter === 'all' ? (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Create Project
              </Button>
            ) : null
          }
        />
      ) : (
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 task-card-shadow hover:task-card-shadow-hover transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.Id}`)}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                </div>
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProject(project)}
                    className="p-2"
                  >
                    <ApperIcon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.Id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-3">
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority} priority
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                  {project.dueDate && (
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  )}
                </div>

                {/* View Tasks Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.Id}`);
                    }}
                  >
                    <ApperIcon name="Kanban" size={16} />
                    <span>View Tasks</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

};

export default Projects;
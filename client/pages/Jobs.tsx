
import React, { useState } from 'react';
import { 
  Briefcase, MapPin, DollarSign, Clock, Users, Search, 
  Trash2, MoreHorizontal, FileText, Building, Globe, Download,
  Eye, EyeOff, X
} from 'lucide-react';
import { Job, JobApplication, Status } from '../types';

// Mock Data for Jobs
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechGlobal Solutions',
    location: 'Remote (Europe/US)',
    type: 'Full-time',
    salary: '$120k - $150k',
    postedDate: '2 days ago',
    applicantsCount: 45,
    status: Status.ACTIVE,
    logoUrl: 'TG',
    description: 'We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building high-quality, responsive web applications using React and TypeScript.'
  },
  {
    id: '2',
    title: 'Digital Marketing Manager',
    company: 'Habesha Breweries',
    location: 'Addis Ababa, Ethiopia',
    type: 'Full-time',
    salary: 'Competitive',
    postedDate: '1 week ago',
    applicantsCount: 128,
    status: Status.ACTIVE,
    logoUrl: 'HB',
    description: 'Lead our digital marketing strategies, manage social media campaigns, and analyze performance metrics to grow our brand presence in East Africa.'
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'Creative Agency',
    location: 'Remote',
    type: 'Contract',
    salary: '$60 - $80 / hr',
    postedDate: '3 days ago',
    applicantsCount: 12,
    status: Status.PENDING,
    logoUrl: 'CA',
    description: 'We need a creative mind to design intuitive user interfaces for our international clients. Proficiency in Figma and Adobe Creative Suite is required.'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'FinTech Africa',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    salary: '$90k - $110k',
    postedDate: '5 days ago',
    applicantsCount: 34,
    status: Status.ACTIVE,
    logoUrl: 'FA',
    description: 'Join our infrastructure team to maintain and scale our cloud services. Experience with AWS, Docker, and Kubernetes is essential.'
  }
];

// Mock Data for Applications (kept for Modal usage)
const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: '101',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    applicantName: 'Abebe Bikila',
    applicantEmail: 'abebe.b@example.com',
    appliedDate: '1 day ago',
    status: 'New',
    resumeUrl: '#',
    avatar: 'AB'
  },
  {
    id: '102',
    jobId: '2',
    jobTitle: 'Digital Marketing Manager',
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sarah.j@example.com',
    appliedDate: '2 days ago',
    status: 'Interview',
    resumeUrl: '#',
    avatar: 'SJ'
  },
  {
    id: '103',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    applicantName: 'Michael Ross',
    applicantEmail: 'mike.r@example.com',
    appliedDate: '3 days ago',
    status: 'Rejected',
    resumeUrl: '#',
    avatar: 'MR'
  },
  {
    id: '104',
    jobId: '4',
    jobTitle: 'DevOps Engineer',
    applicantName: 'David Miller',
    applicantEmail: 'david.m@example.com',
    appliedDate: 'Just now',
    status: 'New',
    resumeUrl: '#',
    avatar: 'DM'
  },
  {
    id: '105',
    jobId: '2',
    jobTitle: 'Digital Marketing Manager',
    applicantName: 'Tigist Haile',
    applicantEmail: 'tigist.h@example.com',
    appliedDate: '1 week ago',
    status: 'Offer',
    resumeUrl: '#',
    avatar: 'TH'
  }
];

const Jobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Toggle Job Status Function
  const toggleJobStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === id) {
        return {
          ...job,
          status: job.status === Status.ACTIVE ? Status.SUSPENDED : Status.ACTIVE
        };
      }
      return job;
    }));
  };

  // Delete Job Function
  const handleDeleteJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
        setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    }
  };

  // Filtering Logic
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get Applicants for Selected Job
  const selectedJobApplicants = selectedJob 
    ? MOCK_APPLICATIONS.filter(app => app.jobId === selectedJob.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Jobs & Careers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage job listings and track candidate applications.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Briefcase size={24} />
                  </div>
                  <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Jobs</p>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                          {jobs.filter(j => j.status === Status.ACTIVE).length}
                      </h3>
                  </div>
              </div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                      <FileText size={24} />
                  </div>
                  <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">New Today</p>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">18</h3>
                  </div>
              </div>
          </div>
      </div>

      {/* Search & Actions */}
      <div className="flex justify-end gap-4 mt-8">
          <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      {/* CONTENT: JOBS LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {filteredJobs.map((job) => (
              <div key={job.id} className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group relative flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 shadow-inner">
                              {job.logoUrl}
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                  <Building size={14} />
                                  <span>{job.company}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                            onClick={(e) => handleDeleteJob(job.id, e)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Job"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Globe size={16} className="text-blue-500" />
                            {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <DollarSign size={16} className="text-emerald-500" />
                            {job.salary}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Clock size={16} className="text-orange-500" />
                            {job.type}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Users size={16} className="text-purple-500" />
                            {job.applicantsCount} Applicants
                        </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
                      <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              job.status === Status.ACTIVE 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                              : 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400'
                          }`}>
                              {job.status}
                          </span>
                          
                          <button 
                            onClick={(e) => toggleJobStatus(job.id, e)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                                job.status === Status.ACTIVE
                                ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                            }`}
                          >
                            {job.status === Status.ACTIVE ? (
                                <><EyeOff size={14} /> Take Down</>
                            ) : (
                                <><Eye size={14} /> Make Visible</>
                            )}
                          </button>

                          <button 
                            onClick={() => setSelectedJob(job)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                              View Details
                          </button>
                      </div>
                      
                      <div className="text-xs text-slate-400 font-medium">
                          Posted {job.postedDate}
                      </div>
                  </div>
                  
                  {/* Decorative Background Blur */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
              </div>
          ))}
      </div>

      {/* JOB DETAIL POPUP MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/80 backdrop-blur-sm transition-all" onClick={() => setSelectedJob(null)}></div>
            
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in ring-1 ring-black/5">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-200 shadow-inner">
                            {selectedJob.logoUrl}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedJob.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedJob.company} • {selectedJob.location}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedJob(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        
                        {/* Job Description */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-wide">Job Description</h3>
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {selectedJob.description || 'No description available for this position.'}
                                </p>
                            </div>
                            <div className="flex gap-4 mt-4 text-sm">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-500/20 font-medium">
                                    {selectedJob.type}
                                </span>
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20 font-medium">
                                    {selectedJob.salary}
                                </span>
                            </div>
                        </div>

                        {/* Applicants List */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                                    Applicants ({selectedJobApplicants.length})
                                </h3>
                            </div>
                            
                            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Applied</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {selectedJobApplicants.length > 0 ? (
                                            selectedJobApplicants.map((app) => (
                                                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                                        {app.applicantName}
                                                        <div className="text-xs text-slate-500 font-normal">{app.applicantEmail}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                        {app.appliedDate}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">
                                                            View Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No applicants found for this job yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end">
                    <button 
                        onClick={() => setSelectedJob(null)}
                        className="px-6 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm font-bold"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Jobs;

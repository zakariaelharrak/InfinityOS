/* InfinityOS — agency operations platform (front-end only, data kept in localStorage) */
(() => {
'use strict';

/* =====================================================================
   Utilities
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => Number(n || 0).toLocaleString('en-US');
const todayISO = () => new Date().toISOString().slice(0, 10);
const initials = n => String(n).trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
const nextId = (prefix, list) => { let n = list.length + 1; while (list.some(x => x.id === `${prefix}-${n}`)) n++; return `${prefix}-${n}`; };
const fmtSize = mb => (mb >= 1000 ? (mb / 1024).toFixed(1) + ' GB' : mb.toFixed(1) + ' MB');

/* Lucide-style inline icons */
const ICONS = {
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'folder-kanban': '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',
  'folder-open': '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  'square-check': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  wallet: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M14.5 9.5h-3a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-3"/><path d="M12 7.5v9"/>',
  'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  'dollar-sign': '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'cloud-upload': '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
};
const icon = (n, size = 16, cls = '') =>
  `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* =====================================================================
   Data (seeded from the Figma prototype, persisted in localStorage)
   ===================================================================== */
const DB_KEY = 'infinityos.db.v1';
const AUTH_KEY = 'infinityos.auth.v1';
const SB_KEY = 'infinityos.sidebar.v1';

const POSITIONS = ['Agency Director & Lead PM', 'Senior Art Director', 'Lead Media Producer', 'Growth & Performance Lead', 'Finance & Ops Specialist', 'Account Manager', 'Motion Designer', 'Developer'];
const DEPARTMENTS = ['Management', 'Creative & Media', 'Diffusion & Marketing', 'Operations & Finance', 'Engineering & Tech'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const PROJECT_STATUSES = ['Planning', 'In Progress', 'Completed'];
const TASK_STATUSES = ['To Do', 'In Progress', 'Done', 'Overdue'];
const FILE_STATUSES = ['Approved', 'In Review', 'Draft', 'Archived'];
const PLATFORMS = ['LinkedIn', 'Instagram', 'TikTok', 'X'];
const PUB_STATUSES = ['Draft', 'Scheduled', 'Published'];
const CLIENT_STATUSES = ['Active', 'Leads', 'Inactive'];
const API_TYPES = ['TikTok', 'WhatsApp API', 'Meta Ads', 'Gmail', 'LinkedIn', 'Instagram', 'Custom REST API'];

const seed = () => ({
  employees: [
    { id: 'emp-1', name: 'Alex Rivera', position: 'Agency Director & Lead PM', dept: 'Management', email: 'alex@InfinityOS.internal', joined: '2023-01-15', status: 'Active', vacations: 23, sick: 1, salary: 15000, bonus: 1500, start: '2026-06-30' },
    { id: 'emp-2', name: 'Jessica Day', position: 'Senior Art Director', dept: 'Creative & Media', email: 'jessica@InfinityOS.internal', joined: '2023-04-10', status: 'Active', vacations: 18, sick: 2, salary: 12000, bonus: 1200, start: '2023-04-10' },
    { id: 'emp-3', name: 'Marcus Sterling', position: 'Lead Media Producer', dept: 'Creative & Media', email: 'marcus@InfinityOS.internal', joined: '2023-06-01', status: 'Active', vacations: 20, sick: 0, salary: 11000, bonus: 1000, start: '2023-06-01' },
    { id: 'emp-4', name: 'Hannah Cole', position: 'Growth & Performance Lead', dept: 'Diffusion & Marketing', email: 'hannah@InfinityOS.internal', joined: '2023-09-12', status: 'Active', vacations: 21, sick: 1, salary: 10500, bonus: 900, start: '2023-09-12' },
    { id: 'emp-5', name: 'Devon Miles', position: 'Finance & Ops Specialist', dept: 'Operations & Finance', email: 'devon@InfinityOS.internal', joined: '2024-02-01', status: 'Active', vacations: 16, sick: 3, salary: 9500, bonus: 800, start: '2024-02-01' },
  ],
  clients: [
    { id: 'cli-1', name: 'Apex Global Tech', logo: 'AG', industry: 'SaaS & Enterprise', contact: 'Sarah Jenkins', email: 's.jenkins@apextech.io', phone: '+1 (555) 234-8901', status: 'Active', billed: 78500, lead: 'Alex Rivera' },
    { id: 'cli-2', name: 'Lumina Cosmetics', logo: 'LC', industry: 'E-Commerce / Beauty', contact: 'Marcus Vance', email: 'm.vance@luminacosmetics.com', phone: '+1 (555) 310-4422', status: 'Active', billed: 54000, lead: 'Jessica Day' },
    { id: 'cli-3', name: 'Vanguard Mobility', logo: 'VM', industry: 'Automotive & EV', contact: 'Elena Rostova', email: 'e.rostova@vanguardmobility.com', phone: '+1 (555) 778-1203', status: 'Active', billed: 92000, lead: 'Alex Rivera' },
    { id: 'cli-4', name: 'Solstice Energy', logo: 'SE', industry: 'Clean Tech', contact: 'David Kim', email: 'd.kim@solstice-energy.com', phone: '+1 (555) 902-6677', status: 'Leads', billed: 15000, lead: 'David Hall' },
    { id: 'cli-5', name: 'Kroma Apparel', logo: 'KA', industry: 'Fashion Retail', contact: 'Chloe Bennett', email: 'c.bennett@kromaapparel.com', phone: '+1 (555) 441-0098', status: 'Inactive', billed: 38200, lead: 'Jessica Day' },
  ],
  projects: [
    { id: 'prj-1', name: 'Apex Global Rebrand 2026', clientId: 'cli-1', manager: 'Alex Rivera', priority: 'High', progress: 68, start: '2026-02-01', deadline: '2026-04-15', status: 'In Progress', budget: 450000 },
    { id: 'prj-2', name: 'Lumina Summer Glow Campaign', clientId: 'cli-2', manager: 'Jessica Day', priority: 'Critical', progress: 85, start: '2026-01-10', deadline: '2026-03-25', status: 'In Progress', budget: 320000 },
    { id: 'prj-3', name: 'Vanguard Hyperion Launch Video', clientId: 'cli-3', manager: 'Marcus Sterling', priority: 'High', progress: 40, start: '2026-02-15', deadline: '2026-05-01', status: 'In Progress', budget: 60000 },
    { id: 'prj-4', name: 'Solstice Website Redesign', clientId: 'cli-4', manager: 'Alex Rivera', priority: 'Medium', progress: 15, start: '2026-03-01', deadline: '2026-06-30', status: 'Planning', budget: 28000,
      checklist: [
        { title: 'Define Website Structure & Sitemap Architecture', priority: 'Critical', done: true },
        { title: 'Create Low-Fidelity Wireframes for Key Pages', priority: 'Critical', done: false },
        { title: 'Design High-Fidelity Homepage & Landing Pages', priority: 'Critical', done: false },
        { title: 'Build a UI Design System & Component Library', priority: 'Critical', done: false },
        { title: 'Develop Responsive Layouts', priority: 'High', done: false },
        { title: 'Development Review', priority: 'High', done: false },
        { title: 'Final QA Testing', priority: 'Medium', done: false },
      ] },
    { id: 'prj-5', name: 'Kroma Winter Collection Lookbook', clientId: 'cli-5', manager: 'Jessica Day', priority: 'Low', progress: 100, start: '2025-10-01', deadline: '2025-12-15', status: 'Completed', budget: 18500 },
  ],
  tasks: [
    { id: 'tsk-1', title: 'Complete Brand Guidelines 2.0', desc: 'Finalize typography, colour and logo usage rules for the Apex rebrand and hand over the PDF kit.', projectId: 'prj-1', assignee: 'Jessica Day', priority: 'High', deadline: '2026-03-20', status: 'In Progress' },
    { id: 'tsk-2', title: 'Render 3D Vehicle Rigs for Vanguard', desc: 'Render the Hyperion vehicle rigs at 4K for the launch video and sync them to the shared S3 bucket.', projectId: 'prj-3', assignee: 'Marcus Sterling', priority: 'Critical', deadline: '2026-03-18', status: 'To Do' },
    { id: 'tsk-3', title: 'Finalize Influencer Media Plan', desc: 'Lock the influencer roster, deliverables and posting calendar for the Summer Glow campaign.', projectId: 'prj-2', assignee: 'Hannah Cole', priority: 'Medium', deadline: '2026-03-22', status: 'Done' },
    { id: 'tsk-4', title: 'Review Q1 Cashflow Audit', desc: 'Review receivables, pending invoices and projected cash position for Q1 and flag risks.', projectId: 'internal', assignee: 'Devon Miles', priority: 'High', deadline: '2026-03-15', status: 'Overdue' },
    { id: 'tsk-5', title: 'Design System Figma Components', desc: 'Review the existing website structure, identify usability issues, evaluate navigation, and highlight areas for design improvement.', projectId: 'prj-4', assignee: 'Jessica Day', priority: 'Medium', deadline: '2026-03-29', status: 'To Do' },
  ],
  files: [
    { id: 'fil-1', name: 'Apex_Brand_Kit_v3.pdf', type: 'PDF Document', projectId: 'prj-1', uploader: 'Jessica Day', size: 24.2, modified: '2026-03-10', status: 'Approved' },
    { id: 'fil-2', name: 'Vanguard_Hyperion_Cut04.mp4', type: 'Video MP4', projectId: 'prj-3', uploader: 'Marcus Sterling', size: 482.0, modified: '2026-03-11', status: 'In Review' },
    { id: 'fil-3', name: 'Lumina_Influencer_Roster.xlsx', type: 'Spreadsheet', projectId: 'prj-2', uploader: 'Hannah Cole', size: 3.1, modified: '2026-03-08', status: 'Approved' },
    { id: 'fil-4', name: 'Solstice_Wireframes_Export.fig', type: 'Design Asset', projectId: 'prj-4', uploader: 'Alex Rivera', size: 58.4, modified: '2026-03-05', status: 'Draft' },
    { id: 'fil-5', name: 'MSA_Vanguard_Signed_2026.pdf', type: 'Legal', projectId: 'prj-3', uploader: 'Devon Miles', size: 1.4, modified: '2026-02-14', status: 'Archived' },
  ],
  invoices: [
    { id: 'INV-2026-001', clientId: 'cli-1', projectId: 'prj-1', issued: '2026-02-01', due: '2026-03-01', amount: 24500, status: 'Paid' },
    { id: 'INV-2026-002', clientId: 'cli-2', projectId: 'prj-2', issued: '2026-02-15', due: '2026-03-15', amount: 16000, status: 'Pending' },
    { id: 'INV-2026-003', clientId: 'cli-3', projectId: 'prj-3', issued: '2026-03-01', due: '2026-03-31', amount: 35000, status: 'Pending' },
    { id: 'INV-2026-004', clientId: 'cli-5', projectId: 'prj-5', issued: '2026-01-10', due: '2026-02-10', amount: 9250, status: 'Overdue' },
  ],
  publications: [
    { id: 'pub-1', title: 'Apex Cloud Modernization Launch', clientId: 'cli-1', platform: 'LinkedIn', author: 'Hannah Cole', when: '2026-03-24 10:00', status: 'Scheduled', desc: '' },
    { id: 'pub-2', title: 'Behind the Scenes: Hyperion Dyno Run', clientId: 'cli-3', platform: 'Instagram', author: 'Marcus Sterling', when: '2026-03-20 18:30', status: 'Published', desc: '' },
    { id: 'pub-3', title: 'Summer Glow SPF 50 Launch Teaser', clientId: 'cli-2', platform: 'TikTok', author: 'Jessica Day', when: '2026-03-26 14:00', status: 'Scheduled', desc: '' },
    { id: 'pub-4', title: 'Clean Tech Transition Manifesto', clientId: 'cli-4', platform: 'X', author: 'Alex Rivera', when: '2026-03-18 09:00', status: 'Draft', desc: '' },
  ],
  automations: [
    { id: 'aut-1', name: 'TikTok', desc: 'Publications et statistiques TikTok', enabled: true, lastRun: '2 hours ago' },
    { id: 'aut-2', name: 'WhatsApp API', desc: 'Inbox et automations WhatsApp', enabled: true, lastRun: '15 mins ago' },
    { id: 'aut-3', name: 'Meta Ads', desc: 'Dépenses publicitaires (amount spent par campagne / adset / ad)', enabled: false, lastRun: '2 days ago' },
    { id: 'aut-4', name: 'Gmail', desc: 'Boîte email unifiée — recevoir et répondre depuis l\'ERP', enabled: true, lastRun: '1 day ago' },
  ],
  messages: {
    general: [
      { who: 'Alex Rivera', time: '10:14 AM', text: 'Hey team, did we push the 4K render pass to Vanguard yet?' },
      { who: 'Marcus Sterling', time: '10:16 AM', text: 'Yes, just synced to AWS S3. Client link sent to Elena.' },
      { who: 'Jessica Day', time: '10:18 AM', text: 'Lumina approved the moodboards for the summer lookbook as well!' },
    ],
    announcements: [
      { who: 'Alex Rivera', time: '9:00 AM', text: 'Q1 retrospective is on Friday at 3 PM in the main studio. Please bring your project notes.' },
      { who: 'Devon Miles', time: '9:30 AM', text: 'Reminder: all March expenses must be filed before the 28th.' },
    ],
  },
  activity: [
    { text: 'Marcus uploaded 4K ProRes cut for Vanguard Mobility', source: 'Production Media Hub', color: '#2563eb', when: '45m ago' },
    { text: 'Payment received: $24,500 from Apex Global Tech', source: 'Finance Ledger', color: '#10b981', when: '2 hours ago' },
    { text: 'Automated workflow #AUT-2 alerted Jessica of deadline', source: 'Automations & AI', color: '#f59e0b', when: '3 hours ago' },
  ],
  notifications: [
    { id: 'n1', text: 'Invoice INV-2026-004 is overdue', when: '10 min ago', read: false, route: 'finance' },
    { id: 'n2', text: 'Task overdue: Review Q1 Cashflow Audit', when: '1 hour ago', read: false, route: 'operations' },
    { id: 'n3', text: 'Marcus uploaded Vanguard_Hyperion_Cut04.mp4', when: '45m ago', read: false, route: 'files' },
    { id: 'n4', text: 'Payment received: $24,500 from Apex Global Tech', when: '2 hours ago', read: true, route: 'finance' },
  ],
});

let db = loadDB();
function normalize(d) {
  d.employees.forEach(e => { if (!e.password) e.password = 'employee123'; });
  if (!d.leaveRequests) d.leaveRequests = [
    { id: 'lv-1', empId: 'emp-2', type: 'Vacation', from: '2026-12-22', to: '2026-12-26', days: 4, reason: 'Family trip', status: 'Pending', created: '2026-11-05' },
    { id: 'lv-2', empId: 'emp-3', type: 'Sick', from: '2026-10-14', to: '2026-10-14', days: 1, reason: 'Flu', status: 'Approved', created: '2026-10-14' },
  ];
  d.notifications.forEach(n => { if (!n.for) n.for = 'admin'; });
  return d;
}
function loadDB() {
  try { const raw = localStorage.getItem(DB_KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) { /* ignore */ }
  return normalize(seed());
}
function save() { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { /* storage unavailable */ } }

const clientById = id => db.clients.find(c => c.id === id);
const clientName = id => clientById(id)?.name || '—';
const projectById = id => db.projects.find(p => p.id === id);
const projectName = id => id === 'internal' ? 'Internal Operations' : (projectById(id)?.name || '—');
const empNames = () => db.employees.map(e => e.name);

/* =====================================================================
   Auth (demo only: credentials live in this file — swap for a real API)
   ===================================================================== */
const ADMIN = { email: 'alex@infinityos.internal', password: 'admin123', name: 'Alex Rivera', title: 'Super Admin' };
const DEMO = { admin: [ADMIN.email, ADMIN.password], employee: ['jessica@infinityos.internal', 'employee123'] };
function authenticate(email, pass) {
  if (email === ADMIN.email && pass === ADMIN.password) return { email: ADMIN.email, name: ADMIN.name, role: 'admin', title: ADMIN.title };
  const e = db.employees.find(x => x.id !== 'emp-1' && x.email.toLowerCase() === email && x.password === pass && x.status === 'Active');
  return e ? { email: e.email, name: e.name, role: 'employee', title: e.position, empId: e.id } : null;
}
function getAuth() {
  for (const store of [localStorage, sessionStorage]) {
    try { const raw = store.getItem(AUTH_KEY); if (raw) { const a = JSON.parse(raw); if (!a.role || a.role === 'Super Admin') { a.role = 'admin'; a.title = 'Super Admin'; } return a; } } catch (e) { /* ignore */ }
  }
  return null;
}
function setAuth(user, remember) {
  clearAuth();
  const store = remember ? localStorage : sessionStorage;
  try { store.setItem(AUTH_KEY, JSON.stringify({ email: user.email, name: user.name, role: user.role, title: user.title, empId: user.empId })); } catch (e) { /* ignore */ }
}
function clearAuth() { try { localStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ } }

/* ----- role helpers ----- */
const EMP_ROUTES = ['operations', 'files', 'hr', 'publications', 'communication'];
const isAdmin = () => getAuth()?.role === 'admin';
const myName = () => getAuth()?.name;
const myEmp = () => db.employees.find(e => e.id === getAuth()?.empId);
const allowed = r => isAdmin() || EMP_ROUTES.includes(r);
const homeRoute = () => isAdmin() ? 'dashboard' : 'operations';
const empNameById = id => db.employees.find(e => e.id === id)?.name || 'Former employee';
const empIdByName = n => db.employees.find(e => e.name === n)?.id;
function canDel(coll, item) {
  if (isAdmin()) return true;
  return (coll === 'files' && item.uploader === myName()) || (coll === 'publications' && item.author === myName());
}
function countWeekdays(a, b) {
  let d = new Date(a + 'T00:00:00Z'); const end = new Date(b + 'T00:00:00Z'); let n = 0;
  while (d <= end) { const w = d.getUTCDay(); if (w !== 0 && w !== 6) n++; d = new Date(d.getTime() + 864e5); }
  return n;
}
function navFor() {
  if (isAdmin()) return NAV;
  return [
    { sec: 'Teams', items: [['operations', 'My Tasks', 'square-check'], ['hr', 'My Leave', 'clock']] },
    { sec: 'Production', items: [['files', 'Files', 'folder-open']] },
    { sec: 'Diffusion', items: [['publications', 'Publications', 'share-2']] },
    { sec: 'Team', items: [['communication', 'Communication', 'message-square']] },
  ];
}
function quickCreate() {
  return isAdmin()
    ? [['project', 'New Project', 'folder-kanban'], ['task', 'Assign Task', 'square-check'], ['client', 'Enrol Client', 'building-2'], ['invoice', 'Issue Invoice', 'wallet'], ['publication', 'Schedule Publication', 'share-2'], ['file', 'Upload Asset', 'cloud-upload'], ['employee', 'Add Employee', 'users']]
    : [['file', 'Upload File', 'cloud-upload'], ['publication', 'Schedule Publication', 'share-2'], ['leave', 'Request Leave', 'clock']];
}
const myNotifs = () => { const a = getAuth(); const k = a?.role === 'admin' ? 'admin' : a?.empId; return db.notifications.filter(n => n.for === k); };

/* =====================================================================
   UI state (filters, views)
   ===================================================================== */
const DEFAULT_UI = () => ({
  projects: { q: '', status: 'All', priority: 'All', manager: 'All', view: 'table' },
  files: { q: '', type: 'All', status: 'All', view: 'table' },
  operations: { q: '', priority: 'All', status: 'All', view: 'table' },
  hr: { q: '', dept: 'All', leave: 'Pending' },
  clients: { q: '', status: 'All' },
  finance: { q: '', status: 'All' },
  publications: { q: '', platform: 'All', status: 'All' },
  automations: { q: '', state: 'All' },
  channel: 'general',
});
const ui = DEFAULT_UI();
const resetFilters = page => { const d = DEFAULT_UI()[page]; if (!d) return; const keep = ui[page].view; Object.assign(ui[page], d); if (keep) ui[page].view = keep; };

/* =====================================================================
   Toasts
   ===================================================================== */
function toast({ type = 'success', title, message = '', action = null, duration = 5000 }) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const ic = type === 'error' ? 'alert-triangle' : type === 'info' ? 'info' : 'check';
  el.innerHTML = `<div class="t-ic">${icon(ic, 16)}</div><div class="t-body"><b>${esc(title)}</b>${message ? `<p>${esc(message)}</p>` : ''}${action ? `<button class="t-act">${esc(action.label)}</button>` : ''}</div><button class="t-x" aria-label="Dismiss">${icon('x', 14)}</button>`;
  const root = $('#toast-root');
  root.appendChild(el);
  while (root.children.length > 4) root.firstChild.remove();
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 200); };
  let timer = setTimeout(close, duration);
  el.addEventListener('mouseenter', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => { timer = setTimeout(close, 2000); });
  $('.t-x', el).addEventListener('click', close);
  if (action) $('.t-act', el).addEventListener('click', () => { action.fn(); close(); });
}

/* =====================================================================
   Overlays: modal, confirm, drawer
   ===================================================================== */
let lastFocus = null;
function closeModal() { const r = $('#modal-root'); if (r.firstChild) { r.innerHTML = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus?.(); } }
function closeDrawer() { $('#drawer-root').innerHTML = ''; }
function closeAll() { $('#modal-root').innerHTML = ''; closeDrawer(); }

function askConfirm({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', onConfirm }) {
  lastFocus = document.activeElement;
  const ic = tone === 'danger' ? 'alert-triangle' : tone === 'green' ? 'circle-check' : 'info';
  const btn = tone === 'danger' ? 'btn-danger' : tone === 'green' ? 'btn-success' : 'btn-primary';
  $('#modal-root').innerHTML = `
    <div class="overlay" data-overlay>
      <div class="modal confirm" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" aria-describedby="cf-m">
        <div class="c-ic ${tone === 'danger' ? '' : tone}">${icon(ic, 20)}</div>
        <h2 id="cf-t">${esc(title)}</h2>
        <p id="cf-m">${esc(message)}</p>
        <div class="modal-f"><button class="btn btn-outline" data-close>${esc(cancelLabel)}</button><button class="btn ${btn}" data-ok>${esc(confirmLabel)}</button></div>
      </div>
    </div>`;
  const root = $('#modal-root');
  $('[data-close]', root).addEventListener('click', closeModal);
  $('[data-ok]', root).addEventListener('click', () => { closeModal(); onConfirm(); });
  $('[data-ok]', root).focus();
}

function fieldHTML(f, v) {
  const val = v ?? '';
  const req = f.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
  let ctl;
  if (f.type === 'select') {
    const opts = (f.options || []).map(o => {
      const ov = typeof o === 'object' ? o.value : o, ol = typeof o === 'object' ? o.label : o;
      return `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`;
    }).join('');
    ctl = `<div class="sel"><select name="${f.name}" id="f-${f.name}">${f.placeholder ? `<option value="" ${val === '' ? 'selected' : ''} disabled hidden>${esc(f.placeholder)}</option>` : ''}${opts}</select>${icon('chevron-down', 16)}</div>`;
  } else if (f.type === 'textarea') {
    ctl = `<textarea name="${f.name}" id="f-${f.name}" rows="${f.rows || 5}" placeholder="${esc(f.placeholder || '')}">${esc(val)}</textarea>`;
  } else if (f.type === 'file') {
    ctl = `<label class="file" id="f-${f.name}"><input type="file" name="${f.name}" hidden><span class="file-text">${esc(f.placeholder || 'Upload file')}</span>${icon('folder-open', 16)}</label>`;
  } else {
    ctl = `<input type="${f.type || 'text'}" name="${f.name}" id="f-${f.name}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${f.min != null ? `min="${f.min}"` : ''} ${f.step ? `step="${f.step}"` : ''} ${f.list ? `list="${f.list}"` : ''} autocomplete="off">`;
  }
  return `<div class="field" data-field="${f.name}"><label for="f-${f.name}">${esc(f.label)}${req}</label>${ctl}<div class="err" role="alert" hidden></div></div>`;
}

function openForm({ title, fields, values = {}, submitLabel = 'Submit', cancelLabel = 'Cancel', note = '', datalists = '', onSubmit }) {
  lastFocus = document.activeElement;
  const rows = [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i], nx = fields[i + 1];
    if (f.half && nx && nx.half) { rows.push(`<div class="row2">${fieldHTML(f, values[f.name])}${fieldHTML(nx, values[nx.name])}</div>`); i++; }
    else rows.push(fieldHTML(f, values[f.name]));
  }
  $('#modal-root').innerHTML = `
    <div class="overlay" data-overlay>
      <form class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" novalidate>
        <div class="modal-h"><h2>${esc(title)}</h2><button type="button" data-close aria-label="Close">${icon('x', 16)}</button></div>
        <div class="modal-b">${rows.join('')}${note ? `<p class="hint">${note}</p>` : ''}${datalists}</div>
        <div class="modal-f"><button type="button" class="btn btn-outline" data-close>${esc(cancelLabel)}</button><button type="submit" class="btn btn-primary">${esc(submitLabel)}</button></div>
      </form>
    </div>`;
  const form = $('#modal-root form');
  $$('[data-close]', form).forEach(b => b.addEventListener('click', closeModal));
  fields.forEach(f => {
    if (f.type === 'file') {
      const wrap = $(`#f-${f.name}`, form), input = $('input', wrap), text = $('.file-text', wrap);
      input.addEventListener('change', () => { const file = input.files[0]; text.textContent = file ? file.name : (f.placeholder || 'Upload file'); wrap.classList.toggle('has', !!file); clearErr(form, f.name); });
    }
    if (f.optionsFn && f.dependsOn) {
      const dep = form.elements[f.dependsOn], sel = form.elements[f.name];
      const rebuild = () => {
        const opts = f.optionsFn(dep.value);
        sel.innerHTML = `<option value="" selected disabled hidden>${esc(f.placeholder || '')}</option>` + opts.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
      };
      dep.addEventListener('change', rebuild);
      if (dep.value) { rebuild(); if (values[f.name]) sel.value = values[f.name]; }
    }
    const el = form.elements[f.name];
    if (el) el.addEventListener('input', () => clearErr(form, f.name));
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const out = {}; let firstBad = null;
    fields.forEach(f => {
      const el = form.elements[f.name];
      let v = f.type === 'file' ? (el.files[0] || null) : el.value.trim();
      let msg = '';
      if (f.required && (v === '' || v === null)) msg = f.type === 'select' ? 'Please choose an option.' : f.type === 'file' ? 'Please choose a file.' : 'This field is required.';
      else if (f.type === 'number' && v !== '') {
        const num = Number(v);
        if (Number.isNaN(num)) msg = 'Enter a valid number.';
        else if (f.min != null && num < f.min) msg = `Must be ${f.min} or more.`;
        v = num;
      } else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address.';
      out[f.name] = v;
      if (msg) { setErr(form, f.name, msg); firstBad = firstBad || el; }
    });
    if (firstBad) { (firstBad.type === 'file' ? firstBad.closest('label') : firstBad).focus?.(); return; }
    if (onSubmit(out) !== false) closeModal();
  });
  const first = form.querySelector('input:not([type=file]), select, textarea');
  if (first) first.focus();
}
function setErr(form, name, msg) { const f = $(`[data-field="${name}"]`, form); f.classList.add('bad'); const e = $('.err', f); e.textContent = msg; e.hidden = false; }
function clearErr(form, name) { const f = $(`[data-field="${name}"]`, form); if (!f) return; f.classList.remove('bad'); $('.err', f).hidden = true; }

function openDrawer({ label, title, rows, footer, onMount }) {
  lastFocus = document.activeElement;
  $('#drawer-root').innerHTML = `
    <div class="drawer-ov" data-drawer-overlay>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="drawer-h"><div><small>${esc(label)}</small><h2>${esc(title)}</h2></div><button data-close-drawer aria-label="Close">${icon('x', 18)}</button></div>
        <div class="drawer-b">${rows}</div>
        <div class="drawer-f">${footer}</div>
      </aside>
    </div>`;
  $('#drawer-root [data-close-drawer]').focus();
  if (onMount) onMount($('#drawer-root'));
}
const kv = list => list.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('');

/* =====================================================================
   Shared view helpers
   ===================================================================== */
const PRI_CLS = { Critical: 'pill-red', High: 'pill-amber', Medium: 'pill-grey', Low: 'pill-grey' };
const priPill = p => `<span class="pill ${PRI_CLS[p] || 'pill-grey'}">${esc(p)}</span>`;
const PSTAT_CLS = { Planning: 'pill-amber', 'In Progress': 'pill-blue', Completed: 'pill-green' };
const TSTAT_CLS = { 'To Do': 'pill-blue', 'In Progress': 'pill-blue', Done: 'pill-green', Overdue: 'pill-red' };
const INV_CLS = { Paid: 'pill-green', Pending: 'pill-amber', Overdue: 'pill-red' };
const CLI_CLS = { Active: 'pill-green', Leads: 'pill-grey', Inactive: 'pill-grey' };
const PUB_CLS = { Scheduled: 'pill-amber', Published: 'pill-green', Draft: 'pill-amber' };
const pill = (txt, cls, extra = '') => `<span class="pill ${cls} ${extra}">${esc(txt)}</span>`;

const pageHead = ({ parent, crumb, title, sub, action = '' }) => `
  <div class="page-head">
    <div>
      <div class="crumb"><span>${esc(parent)}</span>${icon('chevron-right', 12)}<b>${esc(crumb)}</b></div>
      <h1>${esc(title)}</h1><p>${esc(sub)}</p>
    </div>${action}
  </div>`;
const addBtn = (label, entity, ic = 'plus') => `<button class="btn btn-primary" data-action="open-new" data-entity="${entity}">${icon(ic, 14)}<span>${esc(label)}</span></button>`;
const searchBox = (page, ph, val, cls = '') => `<label class="search ${cls}"><span class="sr">Search</span>${icon('search', 13)}<input type="search" data-filter="${page}.q" value="${esc(val)}" placeholder="${esc(ph)}" autocomplete="off"></label>`;
const chips = (page, key, opts, cur, label = '') => `<div class="chips" role="group" aria-label="${esc(label || key)}">${label ? `<span class="chips-label">${esc(label)}</span>` : ''}${opts.map(o => `<button type="button" class="chip ${o === cur ? 'on' : ''}" aria-pressed="${o === cur}" data-action="set-filter" data-page="${page}" data-key="${key}" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
const selFilter = (page, key, label, opts, cur) => `<div class="sel sm"><select data-filter="${page}.${key}" aria-label="${esc(label)}"><option value="All">${esc(label)}: All</option>${opts.map(o => `<option value="${esc(o)}" ${o === cur ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${icon('chevron-down', 14)}</div>`;
const emptyRows = (page, cols) => `<tr><td colspan="${cols}" style="height:auto"><div class="empty"><b>No results</b>Nothing matches the current filters.<br><button data-action="clear-filters" data-page="${page}">Clear filters</button></div></td></tr>`;
const emptyCard = (page, what) => `<div class="empty card-empty"><b>No ${what} found</b>Nothing matches the current filters.<br><button data-action="clear-filters" data-page="${page}">Clear filters</button></div>`;
const match = (q, ...parts) => !q.trim() || parts.join(' ').toLowerCase().includes(q.trim().toLowerCase());

function logActivity(text, source, color = '#2563eb') {
  db.activity.unshift({ text, source, color, when: 'just now' });
  db.activity = db.activity.slice(0, 8);
}
function addNotification(text, route, to = 'admin') {
  db.notifications.unshift({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), text, when: 'just now', read: false, route, for: to });
  db.notifications = db.notifications.slice(0, 60);
}

/* =====================================================================
   Pages
   ===================================================================== */
function pageDashboard() {
  const active = db.projects.filter(p => p.status === 'In Progress').length;
  const accounts = new Set(db.projects.filter(p => p.status !== 'Completed').map(p => p.clientId)).size;
  const pending = db.tasks.filter(t => t.status !== 'Done').length;
  const overdue = db.tasks.filter(t => t.status === 'Overdue').length;
  const completed = 18 + db.projects.filter(p => p.status === 'Completed').length;
  const revenue = 124000 + db.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const live = db.projects.filter(p => p.status !== 'Completed').slice(0, 4);
  const barCls = p => p >= 80 ? 'green' : p < 25 ? 'amber' : '';
  const deliverables = db.tasks.slice(0, 3);
  return `<div class="page-inner">
    ${pageHead({ parent: 'InfinityOS', crumb: 'Dashboard Overview', title: 'Executive Agency Overview', sub: 'Central operations, financial balance and active agency throughput',
      action: `<a class="btn btn-outline" href="#/analytics">${icon('chart-column', 14)}<span>Full Analytics</span></a>` })}
    <div class="grid kpis">
      <div class="kpi"><div class="k-top"><span>Collected Revenue</span><span class="c-green">${icon('dollar-sign', 16)}</span></div><div class="k-val">$${money(revenue)}</div><div class="k-note up">${icon('arrow-up-right', 14)}+14.2% vs last month</div></div>
      <div class="kpi"><div class="k-top"><span>Active Projects</span><span class="c-blue">${icon('folder-kanban', 16)}</span></div><div class="k-val">${active}</div><div class="k-note">Across ${accounts} key client accounts</div></div>
      <div class="kpi"><div class="k-top"><span>Retained Clients</span><span class="c-blue">${icon('building', 16)}</span></div><div class="k-val">${db.clients.length}</div><div class="k-note up">${icon('trending-up', 12)}2 onboarding</div></div>
      <div class="kpi"><div class="k-top"><span>Pending Tasks</span><span class="c-orange">${icon('square-check', 16)}</span></div><div class="k-val">${pending}</div><div class="k-note ${overdue ? 'bad' : ''}">${overdue} overdue item${overdue === 1 ? '' : 's'} flagged</div></div>
      <div class="kpi"><div class="k-top"><span>Completed Projects</span><span class="c-green">${icon('circle-check', 16)}</span></div><div class="k-val">${completed}</div><div class="k-note">100% On-time delivery rate</div></div>
    </div>
    <div class="row-2">
      <section class="card">
        <div class="card-head"><div><h2>Production Portfolio Velocity</h2><div class="sub">Live milestones for current agency engagements</div></div><a class="link" href="#/projects">All Projects ${icon('chevron-right', 12)}</a></div>
        ${live.length ? live.map(p => `<div class="proj-item"><div class="pi-top"><span>${esc(p.name)}</span><span>${p.progress}%</span></div><div class="bar lg" role="progressbar" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100"><i class="${barCls(p.progress)}" style="width:${p.progress}%"></i></div><div class="pi-bot"><span>Client: ${esc(clientName(p.clientId))}</span><span>Due: ${esc(p.deadline)}</span></div></div>`).join('') : '<div class="empty">No active projects.</div>'}
      </section>
      <section class="card">
        <h2>Quick Actions</h2><div class="sub">Instant creation shortcuts</div>
        <div class="qa">
          <button data-action="open-new" data-entity="task"><span class="l"><span class="c-green">${icon('square-check', 16)}</span>Assign Production Task</span><span class="r">${icon('chevron-right', 12)}</span></button>
          <button data-action="open-new" data-entity="invoice"><span class="l"><span class="c-orange">${icon('wallet', 16)}</span>Generate Client Invoice</span><span class="r">${icon('chevron-right', 12)}</span></button>
          <button data-action="open-new" data-entity="publication"><span class="l"><span style="color:#f43f5e">${icon('share-2', 16)}</span>Schedule Social Release</span><span class="r">${icon('chevron-right', 12)}</span></button>
          <button data-action="goto" data-route="hr"><span class="l"><span class="c-blue">${icon('users', 16)}</span>Review Leave Requests (${db.leaveRequests.filter(r => r.status === 'Pending').length} pending)</span><span class="r">${icon('chevron-right', 12)}</span></button>
        </div>
      </section>
    </div>
    <div class="row-half">
      <section class="card">
        <h2 class="with-icon">${icon('clock', 16)}Upcoming Production Deliverables</h2>
        ${deliverables.length ? deliverables.map(t => `<div class="list-row"><div><b>${esc(t.title)}</b><small>${esc(projectName(t.projectId))} • ${esc(t.assignee)}</small></div><span class="date-pill ${t.priority === 'Critical' || t.status === 'Overdue' ? 'red' : ''}">${esc(t.deadline)}</span></div>`).join('') : '<div class="empty">No deliverables.</div>'}
      </section>
      <section class="card">
        <h2 class="with-icon">${icon('activity', 16)}Recent Agency Activity Feed</h2>
        <div class="feed">${db.activity.slice(0, 4).map(a => `<div class="feed-item"><i style="background:${esc(a.color)}"></i><div><b>${esc(a.text)}</b><small>${esc(a.source)} • ${esc(a.when)}</small></div></div>`).join('')}</div>
      </section>
    </div>
  </div>`;
}

function pageGeneral() {
  const ps = db.projects;
  const count = s => ps.filter(p => p.status === s).length;
  return `<div class="page-inner">
    ${pageHead({ parent: 'Production', crumb: 'General Overview', title: 'Production Operations', sub: 'High-level tracking of active client pipelines, workloads and schedules', action: addBtn('Create Project', 'project') })}
    <div class="grid kpis">
      <div class="kpi plain"><div class="k-top"><span>Total Projects</span></div><div class="k-val">${ps.length}</div></div>
      <div class="kpi plain"><div class="k-top"><span>In Progress</span></div><div class="k-val c-blue">${count('In Progress')}</div></div>
      <div class="kpi plain"><div class="k-top"><span>In Planning</span></div><div class="k-val c-amber">${count('Planning')}</div></div>
      <div class="kpi plain"><div class="k-top"><span>Completed</span></div><div class="k-val c-green">${count('Completed')}</div></div>
      <div class="kpi plain"><div class="k-top"><span>Delayed</span></div><div class="k-val c-red">0</div></div>
    </div>
    <section class="card">
      <div class="card-head"><div><h2>Agency Production Timeline (Q1 - Q2 2026)</h2><div class="sub">Project delivery schedules across active accounts</div></div>
        <div class="legend"><span><i style="background:#2563eb"></i>High Priority</span><span><i style="background:#10b981"></i>On Track</span></div></div>
      ${ps.length ? ps.map((p, i) => `<div class="tl-item"><div class="tl-top"><span>${esc(p.name)} (${esc(clientName(p.clientId))})</span><span>${esc(p.start)} → ${esc(p.deadline)}</span></div><div class="tl-track"><div class="tl-fill ${i % 2 ? 'indigo' : ''}" style="width:${Math.max(p.progress, 14)}%">${p.progress}% Completed</div></div></div>`).join('') : '<div class="empty">No projects yet.</div>'}
    </section>
    <section class="table-wrap">
      <div class="t-head"><h2 style="font-size:14px;font-weight:600">Current Production Tasks</h2><a class="link" href="#/operations">Manage Operations →</a></div>
      <div class="table-scroll"><table class="t"><thead><tr><th>Task Name</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Deadline</th><th>Status</th></tr></thead><tbody>
        ${db.tasks.length ? db.tasks.map(t => `<tr><td class="name">${esc(t.title)}</td><td>${esc(projectName(t.projectId))}</td><td>${esc(t.assignee)}</td><td>${priPill(t.priority)}</td><td>${esc(t.deadline)}</td><td>${pill(t.status, TSTAT_CLS[t.status])}</td></tr>`).join('') : '<tr><td colspan="6"><div class="empty">No tasks.</div></td></tr>'}
      </tbody></table></div>
    </section>
  </div>`;
}

function fileUsed() { return db.files.reduce((s, f) => s + f.size, 0); }
function pageFiles() {
  const f = ui.files, used = fileUsed(), pct = used / (2 * 1024 * 1024) * 100;
  const types = [...new Set(db.files.map(x => x.type))];
  const list = db.files.filter(x => (f.type === 'All' || x.type === f.type) && (f.status === 'All' || x.status === f.status) && match(f.q, x.name, projectName(x.projectId), x.uploader));
  const grid = f.view === 'grid';
  const toolbar = `<div class="toolbar">
      ${searchBox('files', 'Filter files by name or project...', f.q, 'grow')}
      ${selFilter('files', 'type', 'Type', types, f.type)}${selFilter('files', 'status', 'Status', FILE_STATUSES, f.status)}
      <div class="viewtoggle"><button class="tab ${grid ? '' : 'on-blue'}" data-action="set-view" data-page="files" data-value="table">Table View</button><button class="tab ${grid ? 'on-blue' : ''}" data-action="set-view" data-page="files" data-value="grid">Grid Cards</button></div>
    </div>`;
  const body = grid
    ? `<div class="files-grid"><button class="upload-tile" data-action="open-new" data-entity="file">${icon('file-text', 32)}<span>Upload File</span></button>${list.length ? list.map(x => `<div class="fcard"><div class="thumb">${icon('file-text', 32)}</div><b title="${esc(x.name)}">${esc(x.name)}</b><div class="proj">${esc(projectName(x.projectId))}</div><div class="meta"><span>${fmtSize(x.size)}</span><span>${esc(x.modified)}</span></div>${canDel('files', x) ? `<button class="trash" aria-label="Delete ${esc(x.name)}" data-action="delete" data-coll="files" data-id="${x.id}">${icon('trash-2', 14)}</button>` : ''}</div>`).join('') : emptyCard('files', 'files')}</div>`
    : `<section class="table-wrap"><div class="table-scroll"><table class="t"><thead><tr><th>File Name</th><th>Type</th><th>Associated Project</th><th>Uploaded By</th><th>Size</th><th>Modified</th><th>Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
        ${list.length ? list.map(x => `<tr><td><span class="file-name">${icon('file-text', 16)}${esc(x.name)}</span></td><td>${esc(x.type)}</td><td>${esc(projectName(x.projectId))}</td><td>${esc(x.uploader)}</td><td class="mono">${fmtSize(x.size)}</td><td>${esc(x.modified)}</td><td>${pill(x.status, 'pill-green')}</td><td class="ta-r">${canDel('files', x) ? `<button class="trash" aria-label="Delete ${esc(x.name)}" data-action="delete" data-coll="files" data-id="${x.id}">${icon('trash-2', 14)}</button>` : ''}</td></tr>`).join('') : emptyRows('files', 8)}
      </tbody></table></div></section>`;
  return `<div class="page-inner">
    ${pageHead({ parent: 'Production', crumb: grid ? 'Digital Asset Hub' : 'Files', title: 'Files & Media Storage', sub: 'Manage digital master files, brand decks, scripts and contract attachments', action: addBtn('Upload Asset', 'file', 'cloud-upload') })}
    <section class="card storage"><div class="s-ic">${icon('folder-open', 22)}</div><div><b>Agency Cloud Vault Storage</b><small>${used.toFixed(1)} MB used of 2.0 TB Tier (${(Math.floor(pct * 100) / 100).toFixed(2)}% occupied)</small></div><div class="s-bar"><div class="bar lg"><i style="width:${Math.max(pct, 3)}%"></i></div></div></section>
    ${toolbar}${body}
  </div>`;
}

const STATUS_ORDER = PROJECT_STATUSES;
function filteredProjects() {
  const f = ui.projects, kan = f.view === 'kanban';
  return db.projects.filter(p => (kan || f.status === 'All' || p.status === f.status) && (f.priority === 'All' || p.priority === f.priority) && (f.manager === 'All' || p.manager === f.manager) && match(f.q, p.name, clientName(p.clientId), p.manager))
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
}
function pageProjects() {
  const f = ui.projects, kan = f.view === 'kanban', list = filteredProjects();
  const tabs = kan ? '' : `<div class="tabs" role="group" aria-label="Status">${['All', ...PROJECT_STATUSES].map(s => `<button class="tab ${f.status === s ? 'on-blue' : ''}" aria-pressed="${f.status === s}" data-action="set-filter" data-page="projects" data-key="status" data-value="${s}">${s}</button>`).join('')}</div>`;
  const toolbar = `<div class="toolbar sep">
      ${searchBox('projects', 'Filter files by name or project...', f.q, 'grow')}
      ${selFilter('projects', 'priority', 'Priority', PRIORITIES, f.priority)}${selFilter('projects', 'manager', 'Manager', empNames(), f.manager)}
      ${tabs}
      <div class="tabs"><button class="tab ${kan ? '' : 'on'}" data-action="set-view" data-page="projects" data-value="table">Table</button><button class="tab ${kan ? 'on' : ''}" data-action="set-view" data-page="projects" data-value="kanban">Kanban</button></div>
    </div>`;
  let body;
  if (kan) {
    body = `<div class="kanban">${PROJECT_STATUSES.map(s => { const items = list.filter(p => p.status === s); return `<div class="col" data-drop="${s}"><div class="col-head"><span>${s}</span><span class="count">${items.length}</span></div>${items.map(p => `<button class="kcard" draggable="true" data-drag="${p.id}" data-action="view-project" data-id="${p.id}"><div class="kc-client">${esc(clientName(p.clientId))}</div><div class="kc-name">${esc(p.name)}</div><div class="bar"><i style="width:${p.progress}%"></i></div><div class="kc-foot"><span>Lead: ${esc(p.manager)}</span><span>${esc(p.deadline)}</span></div></button>`).join('')}</div>`; }).join('')}</div>`;
  } else {
    body = `<section class="table-wrap"><div class="table-scroll"><table class="t"><thead><tr><th>Project Name</th><th>Client</th><th>Manager</th><th>Priority</th><th>Progress</th><th>Deadline</th><th>Budget</th><th>Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
      ${list.length ? list.map(p => `<tr><td><button class="linkbtn" data-action="view-project" data-id="${p.id}">${esc(p.name)}</button></td><td>${esc(clientName(p.clientId))}</td><td>${esc(p.manager)}</td><td>${priPill(p.priority)}</td><td><div class="bar mini-bar" role="progressbar" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p.progress}%"></i></div></td><td>${esc(p.deadline)}</td><td class="strong" style="font-weight:600">${money(p.budget)} MAD</td><td>${pill(p.status, PSTAT_CLS[p.status])}</td><td class="ta-r"><button class="trash" aria-label="Delete ${esc(p.name)}" data-action="delete" data-coll="projects" data-id="${p.id}">${icon('trash-2', 14)}</button></td></tr>`).join('') : emptyRows('projects', 9)}
    </tbody></table></div></section>`;
  }
  return `<div class="page-inner">
    ${pageHead({ parent: 'Production', crumb: 'Projects Master', title: 'Agency Projects', sub: 'Track deliverables, team assignment, budget utilization and milestones', action: addBtn('New Project', 'project') })}
    ${toolbar}${body}
  </div>`;
}

const KCOLS = ['To Do', 'In Progress', 'Done'];
function taskKanban(list, showAssignee) {
  return `<div class="kanban">${KCOLS.map(s => {
    const items = list.filter(t => s === 'To Do' ? (t.status === 'To Do' || t.status === 'Overdue') : t.status === s);
    return `<div class="col" data-drop="${s}" data-kind="task"><div class="col-head"><span>${s}</span><span class="count">${items.length}</span></div>${items.map(t => `<button class="kcard" draggable="true" data-drag="${t.id}" data-action="view-task" data-id="${t.id}"><div class="kc-client">${esc(projectName(t.projectId))}</div><div class="kc-name">${esc(t.title)}</div>${t.desc ? `<div class="kc-desc">${esc(t.desc)}</div>` : ''}<div class="kc-foot"><span class="kc-l">${showAssignee ? esc(t.assignee) + ' ' : ''}${priPill(t.priority)}</span><span>${t.status === 'Overdue' ? pill('Overdue', 'pill-red') + ' ' : ''}${esc(t.deadline)}</span></div></button>`).join('') || '<div class="col-empty">No tasks</div>'}</div>`;
  }).join('')}</div>`;
}
function pageOperations() {
  const f = ui.operations, admin = isAdmin(), kan = !admin || f.view === 'kanban', me = myName();
  const base = admin ? db.tasks : db.tasks.filter(t => t.assignee === me);
  const list = base.filter(t => (f.priority === 'All' || t.priority === f.priority) && (kan || f.status === 'All' || t.status === f.status) && match(f.q, t.title, projectName(t.projectId), t.assignee));
  const toolbar = `<div class="toolbar">
      ${searchBox('operations', 'Filter files by name or project...', f.q, 'grow')}
      ${chips('operations', 'priority', ['All', ...PRIORITIES], f.priority, 'Priority Filter:')}
      ${kan ? '' : selFilter('operations', 'status', 'Status', TASK_STATUSES, f.status)}
      ${admin ? `<div class="tabs"><button class="tab ${kan ? '' : 'on'}" data-action="set-view" data-page="operations" data-value="table">Table</button><button class="tab ${kan ? 'on' : ''}" data-action="set-view" data-page="operations" data-value="kanban">Kanban</button></div>` : ''}
    </div>`;
  const head = admin
    ? pageHead({ parent: 'Teams', crumb: 'Daily Operations', title: 'Operations & Tasks', sub: 'Manage employee operational pipelines, assignments and subtasks', action: addBtn('Create Task', 'task') })
    : pageHead({ parent: 'Teams', crumb: 'My Tasks', title: 'My Operations', sub: 'Your assigned tasks. Drag a card to change its status, or open it to add notes.' });
  const body = kan
    ? taskKanban(list, admin)
    : `<section class="table-wrap"><div class="table-scroll"><table class="t"><thead><tr><th>Task Title</th><th>Project</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th class="ta-r">Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
      ${list.length ? list.map(t => `<tr class="clickable" data-action="view-task" data-id="${t.id}" tabindex="0"><td class="name ${t.status === 'Done' ? 'done' : ''}">${esc(t.title)}${t.updated ? `<small class="upd">Updated by ${esc(t.updated.by)} · ${esc(t.updated.when)}</small>` : ''}</td><td>${esc(projectName(t.projectId))}</td><td>${esc(t.assignee)}</td><td>${priPill(t.priority)}</td><td>${esc(t.deadline)}</td><td class="ta-r"><span class="status-text">${esc(t.status)}</span></td><td class="ta-r"><button class="trash" aria-label="Delete ${esc(t.title)}" data-action="delete" data-coll="tasks" data-id="${t.id}">${icon('trash-2', 14)}</button></td></tr>`).join('') : emptyRows('operations', 7)}
    </tbody></table></div></section>`;
  return `<div class="page-inner">${head}${toolbar}${body}</div>`;
}

const LEAVE_CLS = { Pending: 'pill-amber', Approved: 'pill-green', Rejected: 'pill-red' };
const leaveType = r => r.type === 'Sick' ? 'Sick leave' : 'Vacation';
function pageHR() {
  const f = ui.hr;
  const list = db.employees.filter(e => (f.dept === 'All' || e.dept === f.dept) && match(f.q, e.name, e.position, e.dept, e.email));
  const reqs = db.leaveRequests.slice().sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  const pend = reqs.filter(r => r.status === 'Pending').length;
  const lr = reqs.filter(r => f.leave === 'All' || r.status === f.leave);
  return `<div class="page-inner">
    ${pageHead({ parent: 'Teams', crumb: 'HR & People', title: 'Human Resources', sub: 'Manage agency talent, roles, departments and leave schedules', action: addBtn('Add Employee', 'employee') })}
    <section class="table-wrap">
      <div class="t-head"><h2 style="font-size:14px;font-weight:600">Leave Requests${pend ? ` <span class="pill pill-amber" style="margin-left:6px">${pend} pending</span>` : ''}</h2>${chips('hr', 'leave', ['Pending', 'Approved', 'Rejected', 'All'], f.leave)}</div>
      <div class="table-scroll"><table class="t"><thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
        ${lr.length ? lr.map(r => `<tr><td><span class="person"><span class="avatar">${esc(initials(empNameById(r.empId)))}</span>${esc(empNameById(r.empId))}</span></td><td>${leaveType(r)}</td><td>${esc(r.from)} → ${esc(r.to)}</td><td>${r.days}</td><td>${esc(r.reason || '—')}</td><td>${pill(r.status, LEAVE_CLS[r.status])}</td><td class="ta-r">${r.status === 'Pending' ? `<div class="cell-flex end"><button class="btn btn-sm" style="background:var(--green-100);color:var(--green-700)" data-action="leave-approve" data-id="${r.id}">Approve</button><button class="btn btn-danger-o btn-sm" data-action="leave-reject" data-id="${r.id}">Reject</button></div>` : '—'}</td></tr>`).join('') : `<tr><td colspan="7" style="height:auto"><div class="empty"><b>No ${f.leave === 'All' ? '' : esc(f.leave.toLowerCase()) + ' '}leave requests</b>Employees can request time off from their own workspace.</div></td></tr>`}
      </tbody></table></div>
    </section>
    <div class="toolbar">
      ${searchBox('hr', 'Filter files by name or project...', f.q, 'grow')}
      ${selFilter('hr', 'dept', 'Department', DEPARTMENTS, f.dept)}
    </div>
    <section class="table-wrap"><div class="table-scroll"><table class="t"><thead><tr><th>Employee</th><th>Position</th><th>Department</th><th>Email</th><th>Joined</th><th>Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
      ${list.length ? list.map(e => `<tr class="clickable" data-action="view-employee" data-id="${e.id}" tabindex="0"><td><span class="person"><span class="avatar">${esc(initials(e.name))}</span>${esc(e.name)}</span></td><td>${esc(e.position)}</td><td>${esc(e.dept)}</td><td class="mono">${esc(e.email)}</td><td>${esc(e.joined)}</td><td>${pill(e.status, 'pill-green')}</td><td class="ta-r"><button class="trash" aria-label="Delete ${esc(e.name)}" data-action="delete" data-coll="employees" data-id="${e.id}">${icon('trash-2', 14)}</button></td></tr>`).join('') : emptyRows('hr', 7)}
    </tbody></table></div></section>
  </div>`;
}

function pageMyLeave() {
  const e = myEmp(); if (!e) return '<div class="page-inner"><div class="empty">Your employee profile was not found.</div></div>';
  const reqs = db.leaveRequests.filter(r => r.empId === e.id).sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  const pendDays = reqs.filter(r => r.status === 'Pending' && r.type === 'Vacation').reduce((s, r) => s + r.days, 0);
  return `<div class="page-inner">
    ${pageHead({ parent: 'Teams', crumb: 'My Leave', title: 'Leave & Time Off', sub: 'Request vacations or sick leave and follow their approval status', action: addBtn('Request Leave', 'leave', 'clock') })}
    <div class="grid kpis k3">
      <div class="kpi plain"><div class="k-top"><span>Vacation Days Available</span></div><div class="k-val c-green">${e.vacations}</div></div>
      <div class="kpi plain"><div class="k-top"><span>Pending Vacation Days</span></div><div class="k-val c-orange">${pendDays}</div></div>
      <div class="kpi plain"><div class="k-top"><span>Sick Days Taken</span></div><div class="k-val">${e.sick}</div></div>
    </div>
    <section class="table-wrap"><div class="t-head"><h2 style="font-size:14px;font-weight:600">My Requests</h2></div><div class="table-scroll"><table class="t"><thead><tr><th>Type</th><th>Dates</th><th>Working Days</th><th>Reason</th><th>Requested</th><th>Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
      ${reqs.length ? reqs.map(r => `<tr><td class="name">${leaveType(r)}</td><td>${esc(r.from)} → ${esc(r.to)}</td><td>${r.days}</td><td>${esc(r.reason || '—')}</td><td>${esc(r.created)}</td><td>${pill(r.status, LEAVE_CLS[r.status])}</td><td class="ta-r">${r.status === 'Pending' ? `<button class="btn btn-danger-o btn-sm" data-action="leave-cancel" data-id="${r.id}">Cancel</button>` : '—'}</td></tr>`).join('') : '<tr><td colspan="7" style="height:auto"><div class="empty"><b>No requests yet</b>Use “Request Leave” to ask for time off.</div></td></tr>'}
    </tbody></table></div></section>
  </div>`;
}

function pageClients() {
  const f = ui.clients;
  const list = db.clients.filter(c => (f.status === 'All' || c.status === f.status) && match(f.q, c.name, c.industry, c.contact));
  return `<div class="page-inner">
    ${pageHead({ parent: 'Diffusion', crumb: 'Accounts Directory', title: 'Client Accounts', sub: 'Manage brands, contracts, account leads and financial lifetime value', action: addBtn('Enrol New Client', 'client') })}
    <div class="toolbar">
      ${searchBox('clients', 'Search clients by brand name or sector...', f.q, '')}
      ${chips('clients', 'status', ['All', ...CLIENT_STATUSES], f.status)}
    </div>
    <div class="cards-3">${list.length ? list.map(c => `<button class="client" data-action="view-client" data-id="${c.id}"><div class="c-top"><div class="logo-tile">${esc(c.logo)}</div>${pill(c.status, CLI_CLS[c.status])}</div><h3>${esc(c.name)}</h3><div class="ind">${esc(c.industry)}</div><dl><div class="r"><dt>Primary Contact:</dt><dd>${esc(c.contact)}</dd></div><div class="r"><dt>Account Lead:</dt><dd>${esc(c.lead)}</dd></div><div class="r tot"><dt>Total Billed:</dt><dd>$${money(c.billed)}</dd></div></dl></button>`).join('') : emptyCard('clients', 'clients')}</div>
  </div>`;
}

function pageFinance() {
  const f = ui.finance;
  const total = db.invoices.reduce((s, i) => s + i.amount, 0);
  const paid = db.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const list = db.invoices.filter(i => (f.status === 'All' || i.status === f.status) && match(f.q, i.id, clientName(i.clientId), projectName(i.projectId)));
  return `<div class="page-inner">
    ${pageHead({ parent: 'Diffusion', crumb: 'Finance & Invoicing', title: 'Agency Financials', sub: 'Invoices, audit logs, taxes, line items and accounts receivable', action: addBtn('Issue Invoice', 'invoice') })}
    <div class="grid kpis k3">
      <div class="kpi plain"><div class="k-top"><span>Total Invoiced Amount</span></div><div class="k-val">$${money(total)}</div></div>
      <div class="kpi plain"><div class="k-top"><span>Settled (Paid)</span></div><div class="k-val c-green">$${money(paid)}</div></div>
      <div class="kpi plain"><div class="k-top"><span>Outstanding Receivables</span></div><div class="k-val c-orange">$${money(total - paid)}</div></div>
    </div>
    <div class="toolbar">
      ${searchBox('finance', 'Search invoice, client or project...', f.q, '')}
      ${chips('finance', 'status', ['All', 'Paid', 'Pending', 'Overdue'], f.status)}
    </div>
    <section class="table-wrap"><div class="table-scroll"><table class="t"><thead><tr><th>Invoice #</th><th>Client</th><th>Associated Project</th><th>Issued</th><th>Due Date</th><th>Amount</th><th>Status</th><th class="ta-r">Actions</th></tr></thead><tbody>
      ${list.length ? list.map(i => `<tr><td class="strong" style="font-size:11px">${esc(i.id)}</td><td class="name" style="font-weight:600;color:var(--ink-2)">${esc(clientName(i.clientId))}</td><td>${esc(projectName(i.projectId))}</td><td>${esc(i.issued)}</td><td>${esc(i.due)}</td><td class="strong">$${money(i.amount)}</td><td>${pill(i.status, INV_CLS[i.status])}</td><td class="ta-r"><div class="cell-flex end">${i.status !== 'Paid' ? `<button class="btn btn-sm" style="background:var(--green-100);color:var(--green-700)" data-action="mark-paid" data-id="${esc(i.id)}">Mark Paid</button>` : ''}<button class="trash" aria-label="Delete ${esc(i.id)}" data-action="delete" data-coll="invoices" data-id="${esc(i.id)}">${icon('trash-2', 14)}</button></div></td></tr>`).join('') : emptyRows('finance', 8)}
    </tbody></table></div></section>
  </div>`;
}

function pagePublications() {
  const f = ui.publications;
  const list = db.publications.filter(p => (f.platform === 'All' || p.platform === f.platform) && (f.status === 'All' || p.status === f.status) && match(f.q, p.title, clientName(p.clientId), p.author));
  return `<div class="page-inner">
    ${pageHead({ parent: 'Diffusion', crumb: 'Social Calendar & Content', title: 'Publications Hub', sub: 'Multi-platform social distribution, client content calendars and queues', action: addBtn('Schedule Publication', 'publication') })}
    <div class="toolbar">
      ${chips('publications', 'platform', ['All', ...PLATFORMS], f.platform, 'Platform:')}
      <div class="toolbar" style="margin-left:auto">${searchBox('publications', 'Search publications...', f.q, '')}${selFilter('publications', 'status', 'Status', PUB_STATUSES, f.status)}</div>
    </div>
    <div class="cards-3" style="gap:16px">${list.length ? list.map(p => `<article class="pub"><div class="p-top">${pill(p.platform, 'pill-tag')}${pill(p.status, PUB_CLS[p.status])}</div><h3>${esc(p.title)}</h3><div class="p-client">Client: ${esc(clientName(p.clientId))}</div><div class="p-foot"><span style="font-family:var(--font)">Author: ${esc(p.author)}</span><span>${esc(p.when)}</span></div>${canDel('publications', p) ? `<button class="trash" aria-label="Delete ${esc(p.title)}" data-action="delete" data-coll="publications" data-id="${p.id}">${icon('trash-2', 14)}</button>` : ''}</article>`).join('') : emptyCard('publications', 'publications')}</div>
  </div>`;
}

function pageCommunication() {
  const ch = ui.channel, msgs = db.messages[ch] || [];
  const me = getAuth()?.name, ro = !isAdmin() && ch === 'announcements';
  return `<div class="page-inner">
    ${pageHead({ parent: 'Admin', crumb: 'Internal Communication', title: 'Communication', sub: 'Studio-wide bulletins, internal broadcasts and real-time team threads',
      action: `<button class="btn btn-outline" data-action="switch-channel">${ch === 'general' ? 'Announcements' : '#agency-general'}</button>` })}
    <section class="card chat">
      <div class="chat-h"><span class="ch">${icon('message-square', 16)}<b>#${ch === 'general' ? 'agency-general' : 'announcements'}</b></span><small>${db.employees.length} members</small></div>
      <div class="msgs" id="msgs">${msgs.map(m => `<div class="msg ${m.who === me ? 'me' : ''}"><div class="who">${esc(m.who)}<small>${esc(m.time)}</small></div><div class="bubble">${esc(m.text)}</div></div>`).join('') || '<div class="empty">No messages yet. Say hello!</div>'}</div>
      ${ro ? '<div class="composer ro">Only admins can post in #announcements. Switch to #agency-general to chat with the team.</div>' : `<form class="composer" id="composer" autocomplete="off"><input name="msg" placeholder="Send internal message to #${ch === 'general' ? 'agency-general' : 'announcements'}..." aria-label="Message"><button class="btn btn-primary" aria-label="Send">${icon('send', 16)}</button></form>`}
    </section>
  </div>`;
}

function pageAnalytics() {
  const rev = [['Nov', 42], ['Dec', 68], ['Jan', 55], ['Feb', 84], ['Mar', 110]];
  const max = Math.max(...rev.map(r => r[1]));
  const alloc = [['Creative & 3D Media', 45, ''], ['Performance Marketing', 30, 'indigo'], ['Engineering & Tech', 25, 'green']];
  return `<div class="page-inner">
    ${pageHead({ parent: 'Admin', crumb: 'Performance Intelligence', title: 'Agency Analytics', sub: 'High-fidelity metrics on production velocity, profitability margins and revenue trends' })}
    <div class="row-half" style="grid-template-columns:1fr 1fr">
      <section class="card"><h2>Monthly Billing Revenue (MADk)</h2><div class="sub">Historical client billing trend 2026</div>
        <div class="bars">${rev.map(([m, v]) => `<div class="bar-col" title="${m}: ${v}k MAD"><span class="v">${v}k</span><div class="b" style="height:${Math.round(v / max * 150)}px"></div></div>`).join('')}</div>
        <div class="bar-labels">${rev.map(([m]) => `<span>${m}</span>`).join('')}</div>
      </section>
      <section class="card"><h2>Production Stage Allocation</h2><div class="sub">Current distribution across active departments</div>
        <div class="alloc">${alloc.map(([n, v, c]) => `<div><div class="a-top"><span>${n}</span><span>${v}%</span></div><div class="bar"><i class="${c}" style="width:${v}%"></i></div></div>`).join('')}</div>
      </section>
    </div>
  </div>`;
}

function pageAutomations() {
  const f = ui.automations;
  const list = db.automations.filter(a => (f.state === 'All' || (f.state === 'Active') === a.enabled) && match(f.q, a.name, a.desc));
  return `<div class="page-inner">
    ${pageHead({ parent: 'Admin', crumb: 'Autonomous Ops', title: 'Automations & AI Workflows', sub: 'Self-executing triggers, deadline alerts, smart notifications and AI helpers', action: addBtn('Add APIs', 'automation', 'sparkles') })}
    <div class="toolbar">${searchBox('automations', 'Search integrations...', f.q, '')}${chips('automations', 'state', ['All', 'Active', 'Paused'], f.state)}</div>
    <div>${list.length ? list.map(a => `<div class="auto ${a.enabled ? '' : 'off'}"><div class="a-ic">${icon('zap', 20)}</div><div><b>${esc(a.name)}</b><div class="a-d">${esc(a.desc)}</div><div class="a-l">• Last run: ${esc(a.lastRun)}</div></div><div class="a-end">${a.enabled ? '' : `<button class="trash" aria-label="Delete ${esc(a.name)}" data-action="delete" data-coll="automations" data-id="${a.id}">${icon('trash-2', 14)}</button>`}<button class="switch" role="switch" aria-checked="${a.enabled}" aria-label="${esc(a.name)}" data-action="toggle-automation" data-id="${a.id}"></button></div></div>`).join('') : emptyCard('automations', 'integrations')}</div>
  </div>`;
}

const NAV = [
  { sec: 'Dashboard', items: [['dashboard', 'Dashboard Overview', 'layout-dashboard']] },
  { sec: 'Production', items: [['general', 'General', 'layers'], ['projects', 'Projects', 'folder-kanban'], ['files', 'Files', 'folder-open']] },
  { sec: 'Teams', items: [['operations', 'Operations', 'square-check'], ['hr', 'RH / Human Resources', 'users']] },
  { sec: 'Diffusion', items: [['clients', 'Clients', 'building-2'], ['finance', 'Finance', 'wallet'], ['publications', 'Publications', 'share-2']] },
  { sec: 'Admin', items: [['communication', 'Communication', 'message-square'], ['analytics', 'Analytics', 'chart-column'], ['automations', 'Automations & AI', 'sparkles']] },
];
const ROUTES = {
  dashboard: ['Dashboard Overview', pageDashboard], general: ['Production Operations', pageGeneral], projects: ['Agency Projects', pageProjects], files: ['Files & Media Storage', pageFiles],
  operations: ['Operations & Tasks', pageOperations], hr: ['Human Resources', () => isAdmin() ? pageHR() : pageMyLeave()], clients: ['Client Accounts', pageClients], finance: ['Agency Financials', pageFinance],
  publications: ['Publications Hub', pagePublications], communication: ['Communication', pageCommunication], analytics: ['Agency Analytics', pageAnalytics], automations: ['Automations & AI Workflows', pageAutomations],
};

/* =====================================================================
   Forms & record drawers
   ===================================================================== */
const projectOptions = () => [{ value: 'internal', label: 'Internal Operations' }, ...db.projects.map(p => ({ value: p.id, label: p.name }))];
const clientOptions = () => db.clients.map(c => ({ value: c.id, label: c.name }));

function openProjectForm(id) {
  const p = id ? projectById(id) : null;
  openForm({
    title: p ? 'Edit' : 'Add New',
    values: p ? { name: p.name, client: clientName(p.clientId), manager: p.manager, priority: p.priority, deadline: p.deadline, budget: p.budget, status: p.status } : { priority: 'High', deadline: todayISO() },
    datalists: `<datalist id="client-list">${db.clients.map(c => `<option value="${esc(c.name)}"></option>`).join('')}</datalist>`,
    fields: [
      { name: 'name', label: 'Project Name', placeholder: 'e.g. Acme Super Brand Overhaul', required: true },
      { name: 'client', label: 'Client', placeholder: 'e.g. Acme Super Brand Overhaul', required: true, list: 'client-list' },
      { name: 'manager', label: 'Project Manager', type: 'select', options: empNames(), placeholder: 'Choose manager', required: true, half: true },
      { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, placeholder: 'Priority', required: true, half: true },
      { name: 'deadline', label: 'Target Deadline', type: 'date', required: true, half: true },
      { name: 'budget', label: 'Allocated Budget (MAD)', type: 'number', min: 0, placeholder: '250,000', required: true, half: true },
      ...(p ? [{ name: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES, required: true }] : []),
    ],
    onSubmit(v) {
      let cli = db.clients.find(c => c.name.toLowerCase() === v.client.toLowerCase()), extra = '';
      if (!cli) {
        cli = { id: nextId('cli', db.clients), name: v.client, logo: initials(v.client), industry: 'To be defined', contact: '—', email: '', phone: '', status: 'Leads', billed: 0, lead: v.manager };
        db.clients.push(cli); extra = ` New client “${cli.name}” was added as a lead.`;
      }
      if (p) {
        Object.assign(p, { name: v.name, clientId: cli.id, manager: v.manager, priority: v.priority, deadline: v.deadline, budget: v.budget, status: v.status });
        if (v.status === 'Completed') p.progress = 100;
        logActivity(`Project “${p.name}” was updated`, 'Projects Master');
        toast({ title: 'Project updated', message: p.name + extra });
      } else {
        const np = { id: nextId('prj', db.projects), name: v.name, clientId: cli.id, manager: v.manager, priority: v.priority, progress: 0, start: todayISO(), deadline: v.deadline, status: 'Planning', budget: v.budget };
        db.projects.push(np);
        logActivity(`New project created: ${np.name}`, 'Projects Master');
        toast({ title: 'Project created', message: np.name + extra });
      }
      save(); afterChange(); return true;
    },
  });
}

function openTaskForm(id) {
  const t = id ? db.tasks.find(x => x.id === id) : null;
  openForm({
    title: t ? 'Edit' : 'Add New',
    values: t ? { title: t.title, desc: t.desc, project: t.projectId, assignee: t.assignee, priority: t.priority, deadline: t.deadline, status: t.status } : { deadline: todayISO() },
    fields: [
      { name: 'title', label: 'Task Title', placeholder: 'e.g. Master Final 4K Audio Pass', required: true },
      { name: 'desc', label: 'Task Description', type: 'textarea', placeholder: 'e.g. Edit clips and add effects', rows: 5 },
      { name: 'project', label: 'Associated Project', type: 'select', options: projectOptions(), placeholder: 'Project', required: true },
      { name: 'assignee', label: 'Assignee', type: 'select', options: empNames(), placeholder: 'Employee Name', required: true, half: true },
      { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, placeholder: 'Priority', required: true, half: true },
      { name: 'deadline', label: 'Deadline', type: 'date', required: true, ...(t ? { half: true } : {}) },
      ...(t ? [{ name: 'status', label: 'Status', type: 'select', options: TASK_STATUSES, required: true, half: true }] : []),
    ],
    onSubmit(v) {
      if (t) {
        Object.assign(t, { title: v.title, desc: v.desc, projectId: v.project, assignee: v.assignee, priority: v.priority, deadline: v.deadline, status: v.status });
        toast({ title: 'Task updated', message: t.title });
      } else {
        db.tasks.push({ id: nextId('tsk', db.tasks), title: v.title, desc: v.desc, projectId: v.project, assignee: v.assignee, priority: v.priority, deadline: v.deadline, status: 'To Do' });
        logActivity(`Task assigned to ${v.assignee}: ${v.title}`, 'Operations');
        addNotification(`New task assigned to you: ${v.title}`, 'operations', empIdByName(v.assignee));
        toast({ title: 'Task created', message: `${v.title} → ${v.assignee}` });
      }
      save(); afterChange(); return true;
    },
  });
}

function openEmployeeForm(id) {
  const e = id ? db.employees.find(x => x.id === id) : null;
  openForm({
    title: e ? 'Edit' : 'Add New',
    values: e ? { name: e.name, role: e.position, dept: e.dept, vacations: e.vacations, sick: e.sick, salary: e.salary, bonus: e.bonus } : {},
    note: 'The employee signs in with their company email (shown on their record) and this password.',
    fields: [
      { name: 'name', label: 'Employee Name', placeholder: 'e.g. Ahmed Kadim', required: true },
      { name: 'role', label: 'Role', type: 'select', options: POSITIONS, placeholder: 'Role', required: true, half: true },
      { name: 'dept', label: 'Department', type: 'select', options: DEPARTMENTS, placeholder: 'Department', required: true, half: true },
      { name: 'vacations', label: 'Vacations', type: 'number', min: 0, placeholder: '18', required: true, half: true },
      { name: 'sick', label: 'Sick Days', type: 'number', min: 0, placeholder: '3', required: true, half: true },
      { name: 'salary', label: 'Salary', type: 'number', min: 0, placeholder: '10,000', required: true, half: true },
      { name: 'bonus', label: 'Bonus', type: 'number', min: 0, placeholder: '1,000', required: true, half: true },
      { name: 'password', label: e ? 'New Login Password (leave blank to keep)' : 'Login Password', placeholder: 'min. 6 characters', required: !e },
    ],
    onSubmit(v) {
      if (v.password && v.password.length < 6) { setErr($('#modal-root form'), 'password', 'Use at least 6 characters.'); return false; }
      if (e) {
        Object.assign(e, { name: v.name, position: v.role, dept: v.dept, vacations: v.vacations, sick: v.sick, salary: v.salary, bonus: v.bonus });
        if (v.password) e.password = v.password;
        toast({ title: 'Employee updated', message: e.name + (v.password ? ' · password changed' : '') });
      } else {
        const base = v.name.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '') || 'user'; let email, n = 1;
        do { email = base + (n > 1 ? n : '') + '@InfinityOS.internal'; n++; } while (db.employees.some(x => x.email.toLowerCase() === email.toLowerCase()) || email.toLowerCase() === ADMIN.email);
        db.employees.push({ id: nextId('emp', db.employees), name: v.name, position: v.role, dept: v.dept, email, joined: todayISO(), status: 'Active', vacations: v.vacations, sick: v.sick, salary: v.salary, bonus: v.bonus, start: todayISO(), password: v.password });
        logActivity(`${v.name} joined the agency`, 'Human Resources', '#10b981');
        toast({ title: 'Employee added', message: `${v.name} can now sign in as ${email}`, duration: 8000 });
      }
      save(); afterChange(); return true;
    },
  });
}

function openClientForm(id) {
  const c = id ? clientById(id) : null;
  openForm({
    title: c ? 'Edit' : 'Add New',
    values: c ? { name: c.name, industry: c.industry, contact: c.contact, email: c.email, phone: c.phone, lead: c.lead, status: c.status } : { status: 'Leads' },
    fields: [
      { name: 'name', label: 'Brand Name', placeholder: 'e.g. Acme Corporation', required: true },
      { name: 'industry', label: 'Industry', placeholder: 'e.g. SaaS & Enterprise', required: true },
      { name: 'contact', label: 'Primary Contact', placeholder: 'e.g. Sarah Jenkins', required: true, half: true },
      { name: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', half: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@brand.com', required: true },
      { name: 'lead', label: 'Account Lead', type: 'select', options: empNames(), placeholder: 'Account lead', required: true, half: true },
      { name: 'status', label: 'Status', type: 'select', options: CLIENT_STATUSES, required: true, half: true },
    ],
    onSubmit(v) {
      if (c) { Object.assign(c, { name: v.name, industry: v.industry, contact: v.contact, email: v.email, phone: v.phone, lead: v.lead, status: v.status }); toast({ title: 'Client updated', message: c.name }); }
      else {
        db.clients.push({ id: nextId('cli', db.clients), name: v.name, logo: initials(v.name), industry: v.industry, contact: v.contact, email: v.email, phone: v.phone, status: v.status, billed: 0, lead: v.lead });
        logActivity(`New client enrolled: ${v.name}`, 'Accounts Directory', '#10b981');
        toast({ title: 'Client enrolled', message: v.name });
      }
      save(); afterChange(); return true;
    },
  });
}

function openInvoiceForm() {
  openForm({
    title: 'Add New',
    fields: [
      { name: 'client', label: 'Target Client', type: 'select', options: clientOptions(), placeholder: 'Apex Global Tech', required: true },
      { name: 'project', label: 'Project Milestone', type: 'select', placeholder: 'Select a client first', required: true, dependsOn: 'client', options: [], optionsFn: cid => db.projects.filter(p => p.clientId === cid).map(p => ({ value: p.id, label: p.name })) },
      { name: 'amount', label: 'Invoice Total ($)', type: 'number', min: 1, placeholder: '12500', required: true },
    ],
    note: 'Issued today, payment due in 30 days.',
    onSubmit(v) {
      const due = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      const year = new Date().getFullYear();
      let n = db.invoices.length + 1, id; do { id = `INV-${year}-${String(n).padStart(3, '0')}`; n++; } while (db.invoices.some(i => i.id === id));
      db.invoices.push({ id, clientId: v.client, projectId: v.project, issued: todayISO(), due, amount: v.amount, status: 'Pending' });
      logActivity(`Invoice ${id} issued to ${clientName(v.client)}`, 'Finance Ledger', '#10b981');
      toast({ title: 'Invoice issued', message: `${id} · $${money(v.amount)} to ${clientName(v.client)}` });
      save(); afterChange(); return true;
    },
  });
}

function openPublicationForm() {
  const admin = isAdmin();
  openForm({
    title: 'Add New',
    values: { when: todayISO() + 'T10:00' },
    fields: [
      { name: 'title', label: 'Content Headline / Title', placeholder: 'e.g. Q2 Product Reveal Teaser', required: true },
      { name: 'client', label: 'Client', type: 'select', options: clientOptions(), placeholder: 'Client Name', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: PLATFORMS, placeholder: 'Platform', required: true, half: admin },
      ...(admin ? [{ name: 'author', label: 'Content Author', type: 'select', options: empNames(), placeholder: 'Author', required: true, half: true }] : []),
      { name: 'when', label: 'Publish Date & Time', type: 'datetime-local', required: true },
      { name: 'file', label: 'Content File', type: 'file', placeholder: 'File' },
      { name: 'desc', label: 'Description', type: 'textarea', placeholder: 'Description', rows: 4 },
    ],
    onSubmit(v) {
      const author = admin ? v.author : myName();
      db.publications.push({ id: nextId('pub', db.publications), title: v.title, clientId: v.client, platform: v.platform, author, when: v.when.replace('T', ' '), status: 'Scheduled', desc: v.desc });
      logActivity(`Publication scheduled on ${v.platform}: ${v.title}`, 'Publications Hub', '#f59e0b');
      if (!admin) addNotification(`${author} scheduled a ${v.platform} publication: ${v.title}`, 'publications');
      toast({ title: 'Publication scheduled', message: `${v.title} · ${v.platform}` });
      save(); afterChange(); return true;
    },
  });
}

function fileTypeFor(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return { pdf: 'PDF Document', mp4: 'Video MP4', mov: 'Video MOV', xlsx: 'Spreadsheet', csv: 'Spreadsheet', fig: 'Design Asset', psd: 'Design Asset', png: 'Image', jpg: 'Image', jpeg: 'Image', docx: 'Document', doc: 'Document', pptx: 'Presentation' }[ext] || 'File';
}
function openFileForm() {
  openForm({
    title: 'Add New',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'e.g. Acme Super Brand Overhaul' },
      { name: 'project', label: 'Associated Project', type: 'select', options: projectOptions(), placeholder: 'Project (optional)' },
      { name: 'file', label: 'File', type: 'file', placeholder: 'Upload file', required: true },
    ],
    onSubmit(v) {
      const base = v.name || v.file.name;
      const name = v.name && !v.name.includes('.') && v.file.name.includes('.') ? v.name + '.' + v.file.name.split('.').pop() : base;
      db.files.push({ id: nextId('fil', db.files), name, type: fileTypeFor(v.file.name), projectId: v.project || 'internal', uploader: getAuth().name, size: Math.max(v.file.size / 1048576, 0.1), modified: todayISO(), status: 'Draft' });
      logActivity(`${getAuth().name} uploaded ${name}`, 'Production Media Hub');
      if (!isAdmin()) addNotification(`${getAuth().name} uploaded ${name}`, 'files');
      toast({ title: 'File uploaded', message: name });
      save(); afterChange(); return true;
    },
  });
}

function openLeaveForm() {
  const e = myEmp(); if (!e) return;
  openForm({
    title: 'Request Leave', submitLabel: 'Send request',
    values: { type: 'Vacation', from: todayISO(), to: todayISO() },
    note: `You have ${e.vacations} vacation day${e.vacations === 1 ? '' : 's'} available. Weekends are not counted.`,
    fields: [
      { name: 'type', label: 'Leave Type', type: 'select', options: [{ value: 'Vacation', label: 'Vacation' }, { value: 'Sick', label: 'Sick leave' }], required: true },
      { name: 'from', label: 'From', type: 'date', required: true, half: true },
      { name: 'to', label: 'To', type: 'date', required: true, half: true },
      { name: 'reason', label: 'Reason (optional)', type: 'textarea', rows: 3, placeholder: 'e.g. Family trip' },
    ],
    onSubmit(v) {
      const form = $('#modal-root form');
      if (v.to < v.from) { setErr(form, 'to', 'End date must be on or after the start date.'); return false; }
      const days = countWeekdays(v.from, v.to);
      if (!days) { setErr(form, 'to', 'These dates contain no working days.'); return false; }
      if (v.type === 'Vacation') {
        const pend = db.leaveRequests.filter(r => r.empId === e.id && r.status === 'Pending' && r.type === 'Vacation').reduce((s, r) => s + r.days, 0);
        const avail = e.vacations - pend;
        if (days > avail) { setErr(form, 'to', `You only have ${Math.max(avail, 0)} vacation day(s) available.`); return false; }
      }
      db.leaveRequests.push({ id: nextId('lv', db.leaveRequests), empId: e.id, type: v.type, from: v.from, to: v.to, days, reason: v.reason, status: 'Pending', created: todayISO() });
      addNotification(`${e.name} requested ${days} day${days === 1 ? '' : 's'} of ${v.type === 'Sick' ? 'sick leave' : 'vacation'} (${v.from} → ${v.to})`, 'hr');
      logActivity(`${e.name} requested leave (${v.from} → ${v.to})`, 'Human Resources', '#f59e0b');
      toast({ title: 'Request sent', message: `${days} working day${days === 1 ? '' : 's'} · waiting for approval` });
      save(); afterChange(); return true;
    },
  });
}

function openAutomationForm() {
  openForm({
    title: 'Add New', submitLabel: 'Next',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Whatsap API', required: true },
      { name: 'type', label: 'Type', type: 'select', options: API_TYPES, placeholder: 'API Type', required: true },
    ],
    onSubmit(v) {
      setTimeout(() => openForm({
        title: `Connect ${v.name}`, submitLabel: 'Connect', cancelLabel: 'Cancel',
        fields: [
          { name: 'key', label: 'API Key / Token', type: 'password', placeholder: 'Paste your key', required: true },
          { name: 'endpoint', label: 'Webhook URL (optional)', type: 'url', placeholder: 'https://' },
        ],
        note: `Type: ${esc(v.type)}. Keys are not stored in this demo.`,
        onSubmit() {
          db.automations.push({ id: nextId('aut', db.automations), name: v.name, desc: `${v.type} integration`, enabled: true, lastRun: 'never' });
          logActivity(`Integration connected: ${v.name}`, 'Automations & AI', '#f59e0b');
          toast({ title: 'Integration connected', message: v.name });
          save(); afterChange(); return true;
        },
      }), 0);
      return true;
    },
  });
}

function openSettings() {
  const u = getAuth();
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="overlay" data-overlay><div class="modal" role="dialog" aria-modal="true" aria-label="Settings">
    <div class="modal-h"><h2>Settings</h2><button type="button" data-close aria-label="Close">${icon('x', 16)}</button></div>
    <div class="modal-b">
      <div class="person"><span class="avatar" style="width:40px;height:40px;font-size:13px">${esc(initials(u.name))}</span><div><div style="font-size:13px">${esc(u.name)}</div><div class="hint" style="font-weight:400">${esc(u.email)} · ${esc(u.title)}</div></div></div>
      <div class="kv" style="border-top:1px solid var(--line-2)"><span>Workspace</span><span>InfinityOS 1.0.1</span></div>
      <div class="kv"><span>Data storage</span><span>This browser only</span></div>
      <div><button class="btn btn-danger-o" data-action="reset-data">Reset demo data</button><p class="hint" style="margin-top:6px">Restores the original sample records from the design.</p></div>
    </div>
    <div class="modal-f"><button type="button" class="btn btn-outline" data-close>Close</button></div></div></div>`;
  $$('#modal-root [data-close]').forEach(b => b.addEventListener('click', closeModal));
}
function openHelp() {
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="overlay" data-overlay><div class="modal" role="dialog" aria-modal="true" aria-label="Help and support">
    <div class="modal-h"><h2>Help & Support</h2><button type="button" data-close aria-label="Close">${icon('x', 16)}</button></div>
    <div class="modal-b">
      <div class="kv" style="border-top:1px solid var(--line-2)"><span>Search anything</span><span>Use the top search bar</span></div>
      <div class="kv"><span>Create records</span><span>Quick Create menu</span></div>
      <div class="kv"><span>Close dialogs</span><span>Esc</span></div>
      <div class="kv"><span>Contact</span><span>support@infinityos.internal</span></div>
    </div>
    <div class="modal-f"><button type="button" class="btn btn-outline" data-close>Close</button></div></div></div>`;
  $$('#modal-root [data-close]').forEach(b => b.addEventListener('click', closeModal));
}

/* ----- record drawers ----- */
function drawerProject(id) {
  const p = projectById(id); if (!p) return;
  const tasks = p.checklist || db.tasks.filter(t => t.projectId === p.id).map(t => ({ title: t.title, priority: t.priority, done: t.status === 'Done' }));
  openDrawer({
    label: 'Project Record', title: p.name,
    rows: kv([['Id', p.id], ['Name', p.name], ['Client', clientName(p.clientId)], ['Client Id', p.clientId], ['Manager', p.manager], ['Priority', p.priority], ['Progress', p.progress], ['Start', p.start], ['Deadline', p.deadline], ['Status', p.status], ['Budget', money(p.budget) + ' MAD']])
      + `<div class="kv block"><span>Tasks</span></div><div class="sub-tasks">${tasks.length ? tasks.map(t => `<div class="st ${t.done ? 'done' : ''}"><span>${esc(t.title)}</span>${priPill(t.priority)}</div>`).join('') : '<div class="hint" style="padding:8px 0">No tasks linked to this project yet.</div>'}</div>`,
    footer: `<button class="btn btn-soft" data-action="export" data-coll="projects" data-id="${p.id}">Export Audit</button>
      <button class="btn btn-primary" data-action="edit" data-entity="project" data-id="${p.id}">Edit</button>
      ${p.status !== 'Completed' ? `<button class="btn btn-success" data-action="finish-project" data-id="${p.id}">Mark As Finished</button>` : ''}
      <button class="btn btn-danger-o" data-action="delete" data-coll="projects" data-id="${p.id}">Delete Project</button>`,
  });
}
function drawerTask(id) {
  const t = db.tasks.find(x => x.id === id); if (!t) return;
  const upd = t.updated ? [['Last update', `${t.updated.by} · ${t.updated.when}`]] : [];
  if (!isAdmin()) {
    if (t.assignee !== myName()) return;
    const opts = (t.status === 'Overdue' ? ['Overdue'] : []).concat(['To Do', 'In Progress', 'Done']);
    openDrawer({
      label: 'My Task', title: t.title,
      rows: kv([['Associated Project', projectName(t.projectId)], ['Priority', t.priority], ['Deadline', t.deadline], ...upd])
        + `<div class="field" style="margin-top:16px"><label for="t-status">Status</label><div class="sel"><select id="t-status">${opts.map(s => `<option ${s === t.status ? 'selected' : ''}>${s}</option>`).join('')}</select>${icon('chevron-down', 16)}</div></div>`
        + `<div class="field" style="margin-top:12px"><label for="t-desc">Description / progress notes</label><textarea id="t-desc" rows="7" placeholder="Describe what you have done or what is blocking you...">${esc(t.desc || '')}</textarea></div>`,
      footer: `<button class="btn btn-outline" data-close-drawer>Cancel</button><button class="btn btn-primary" data-action="save-task" data-id="${t.id}">Save changes</button>`,
    });
    return;
  }
  openDrawer({
    label: 'Task Record', title: t.title,
    rows: kv([['Task Title', t.title], ['Associated Project', projectName(t.projectId)], ['Assignee', t.assignee], ['Priority', t.priority], ['Deadline', t.deadline], ['Status', t.status], ...upd]) + `<div class="kv block"><span>Task Description</span><span>${esc(t.desc || 'No description provided.')}</span></div>`,
    footer: `<button class="btn btn-soft" data-action="export" data-coll="tasks" data-id="${t.id}">Export Audit</button><button class="btn btn-primary" data-action="edit" data-entity="task" data-id="${t.id}">Edit</button>${t.status !== 'Done' ? `<button class="btn btn-success" data-action="complete-task" data-id="${t.id}">Mark As Done</button>` : ''}<button class="btn btn-danger-o" data-action="delete" data-coll="tasks" data-id="${t.id}">Delete Task</button>`,
  });
}
function drawerEmployee(id) {
  const e = db.employees.find(x => x.id === id); if (!e) return;
  openDrawer({
    label: 'Human Resources', title: e.name,
    rows: kv([['Name', e.name], ['Login Email', e.email], ['Position', e.position], ['Department', e.dept], ['Available Vacations Days', e.vacations], ['Sick Days', e.sick], ['Salary', money(e.salary) + ' MAD'], ['Bonus', money(e.bonus) + ' MAD'], ['Start Working', e.start]]),
    footer: `<div class="two"><button class="btn btn-soft" data-action="export" data-coll="employees" data-id="${e.id}">Export Audit</button><button class="btn btn-primary" data-action="edit" data-entity="employee" data-id="${e.id}">Edit</button></div><button class="btn btn-danger-o" data-action="delete" data-coll="employees" data-id="${e.id}">Delete Employee</button>`,
  });
}
function drawerClient(id) {
  const c = clientById(id); if (!c) return;
  const act = db.projects.filter(p => p.clientId === c.id && p.status !== 'Completed').length;
  openDrawer({
    label: 'Client Record', title: c.name,
    rows: kv([['Id', c.id], ['Name', c.name], ['Logo', c.logo], ['Industry', c.industry], ['Contact', c.contact], ['Email', c.email || '—'], ['Phone', c.phone || '—'], ['Status', c.status], ['Revenue', c.billed], ['Active Projects', act], ['Manager', c.lead]]),
    footer: `<div class="two"><button class="btn btn-soft" data-action="export" data-coll="clients" data-id="${c.id}">Export Audit</button><button class="btn btn-primary" data-action="edit" data-entity="client" data-id="${c.id}">Edit</button></div><button class="btn btn-danger-o" data-action="delete" data-coll="clients" data-id="${c.id}">Delete Client</button>`,
  });
}

/* =====================================================================
   Actions
   ===================================================================== */
const SINGULAR = { projects: 'Project', tasks: 'Task', files: 'File', employees: 'Employee', clients: 'Client', invoices: 'Invoice', publications: 'Publication', automations: 'Integration' };
const LABEL = { projects: 'name', tasks: 'title', files: 'name', employees: 'name', clients: 'name', invoices: 'id', publications: 'title', automations: 'name' };

function requestDelete(coll, id) {
  const item = db[coll].find(x => x.id === id); if (!item) return;
  if (!canDel(coll, item)) { toast({ type: 'error', title: 'Not allowed', message: 'You can only delete items you created.' }); return; }
  const name = item[LABEL[coll]], what = SINGULAR[coll];
  const extra = coll === 'clients' && db.projects.some(p => p.clientId === id) ? ' Projects linked to this client will keep their records but show no client name.' : '';
  askConfirm({
    title: `Delete ${what.toLowerCase()}?`, message: `“${name}” will be removed from the workspace.${extra}`, confirmLabel: 'Delete', tone: 'danger',
    onConfirm() {
      const idx = db[coll].findIndex(x => x.id === id);
      const [removed] = db[coll].splice(idx, 1);
      logActivity(`${what} deleted: ${name}`, 'Workspace', '#f43f5e');
      save(); closeDrawer(); afterChange();
      toast({ type: 'success', title: `${what} deleted`, message: name, duration: 7000, action: { label: 'Undo', fn() { db[coll].splice(idx, 0, removed); save(); afterChange(); toast({ type: 'info', title: `${what} restored`, message: name }); } } });
    },
  });
}

function exportRecord(coll, id) {
  const item = db[coll].find(x => x.id === id); if (!item) return;
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), exportedBy: getAuth().email, record: item }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${coll}-${id}-audit.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  toast({ type: 'info', title: 'Audit exported', message: a.download });
}

const OPENERS = { leave: openLeaveForm, project: openProjectForm, task: openTaskForm, employee: openEmployeeForm, client: openClientForm, invoice: openInvoiceForm, publication: openPublicationForm, file: openFileForm, automation: openAutomationForm };
const DRAWERS = { project: drawerProject, task: drawerTask, employee: drawerEmployee, client: drawerClient };

function afterChange() { renderPage(); renderBell(); }

const ACTIONS = {
  'toggle-sidebar'() { const s = $('.shell'); s.classList.toggle('collapsed'); try { localStorage.setItem(SB_KEY, s.classList.contains('collapsed') ? '1' : '0'); } catch (e) { /* ignore */ } },
  'open-sidebar'() { $('.shell').classList.add('open'); },
  'close-sidebar'() { $('.shell').classList.remove('open'); },
  'open-new'(el) { closeMenus(); OPENERS[el.dataset.entity]?.(); },
  edit(el) { closeDrawer(); OPENERS[el.dataset.entity]?.(el.dataset.id); },
  'view-project'(el) { drawerProject(el.dataset.id); },
  'view-task'(el, e) { if (e.target.closest('.trash')) return; drawerTask(el.dataset.id); },
  'view-employee'(el, e) { if (e.target.closest('.trash')) return; drawerEmployee(el.dataset.id); },
  'view-client'(el) { drawerClient(el.dataset.id); },
  delete(el, e) { e.stopPropagation(); requestDelete(el.dataset.coll, el.dataset.id); },
  export(el) { exportRecord(el.dataset.coll, el.dataset.id); },
  'set-filter'(el) { ui[el.dataset.page][el.dataset.key] = el.dataset.value; renderPage(); },
  'set-view'(el) { ui[el.dataset.page].view = el.dataset.value; renderPage(); },
  'clear-filters'(el) { resetFilters(el.dataset.page); renderPage(); },
  'finish-project'(el) {
    const p = projectById(el.dataset.id);
    askConfirm({ title: 'Mark project as finished?', message: `“${p.name}” will move to Completed and its progress will be set to 100%.`, confirmLabel: 'Mark as finished', tone: 'green', onConfirm() {
      p.status = 'Completed'; p.progress = 100; logActivity(`Project completed: ${p.name}`, 'Projects Master', '#10b981'); save(); closeDrawer(); afterChange(); toast({ title: 'Project completed', message: p.name });
    } });
  },
  'complete-task'(el) {
    const t = db.tasks.find(x => x.id === el.dataset.id); t.status = 'Done'; logActivity(`Task completed: ${t.title}`, 'Operations', '#10b981'); save(); closeDrawer(); afterChange(); toast({ title: 'Task marked as done', message: t.title });
  },
  'mark-paid'(el) {
    const inv = db.invoices.find(i => i.id === el.dataset.id);
    askConfirm({ title: 'Mark invoice as paid?', message: `${inv.id} · $${money(inv.amount)} from ${clientName(inv.clientId)} will be recorded as settled.`, confirmLabel: 'Mark as paid', tone: 'green', onConfirm() {
      inv.status = 'Paid'; const c = clientById(inv.clientId); if (c) c.billed += inv.amount;
      logActivity(`Payment received: $${money(inv.amount)} from ${clientName(inv.clientId)}`, 'Finance Ledger', '#10b981'); addNotification(`Payment received: $${money(inv.amount)} from ${clientName(inv.clientId)}`, 'finance');
      save(); afterChange(); toast({ title: 'Invoice marked as paid', message: inv.id });
    } });
  },
  'toggle-automation'(el) {
    const a = db.automations.find(x => x.id === el.dataset.id); a.enabled = !a.enabled; a.lastRun = a.enabled ? 'just now' : a.lastRun; save(); renderPage();
    toast({ type: a.enabled ? 'success' : 'info', title: `${a.name} ${a.enabled ? 'enabled' : 'paused'}`, message: a.enabled ? 'The workflow is running again.' : 'The workflow will not run until re-enabled.' });
  },
  'switch-channel'() { ui.channel = ui.channel === 'general' ? 'announcements' : 'general'; renderPage(); },
  'reset-data'() {
    askConfirm({ title: 'Reset demo data?', message: 'All changes you made will be lost and the original sample data will be restored.', confirmLabel: 'Reset', tone: 'danger', onConfirm() { db = normalize(seed()); save(); closeAll(); renderPage(); renderBell(); toast({ type: 'info', title: 'Demo data restored' }); } });
  },
  logout() {
    closeMenus();
    askConfirm({ title: 'Sign out?', message: 'You will need to sign in again to access InfinityOS.', confirmLabel: 'Sign out', tone: 'blue', onConfirm() { clearAuth(); closeAll(); location.hash = '#/login'; toast({ type: 'info', title: 'Signed out', message: 'See you soon.' }); } });
  },
  settings() { closeMenus(); openSettings(); },
  help() { closeMenus(); openHelp(); },
  menu(el) { toggleMenu(el.dataset.menu); },
  'read-all'() { myNotifs().forEach(n => { n.read = true; }); save(); renderBell(true); },
  'open-notif'(el) { const n = db.notifications.find(x => x.id === el.dataset.id); if (n) { n.read = true; save(); renderBell(); closeMenus(); location.hash = '#/' + n.route; } },
  'goto-result'(el) {
    const { type, id } = el.dataset; closeMenus(); $('#gsearch-input').value = '';
    const route = { project: 'projects', task: 'operations', client: 'clients', file: 'files' }[type];
    if (currentRoute() !== route) location.hash = '#/' + route;
    setTimeout(() => { if (DRAWERS[type]) DRAWERS[type](id); }, 30);
  },
  'demo-login'(el) { const f = $('#login-form'); const [em, pw] = DEMO[el.dataset.who] || DEMO.admin; f.elements.email.value = em; f.elements.password.value = pw; f.elements.password.focus(); },
  goto(el) { location.hash = '#/' + el.dataset.route; },
  'save-task'(el) {
    const t = db.tasks.find(x => x.id === el.dataset.id); if (!t) return;
    const st = $('#t-status').value, desc = $('#t-desc').value.trim();
    const cs = st !== t.status, cd = desc !== (t.desc || '');
    if (!cs && !cd) { closeDrawer(); return; }
    t.status = st; t.desc = desc; t.updated = { by: myName(), when: todayISO() };
    const what = [cs ? `status → ${st}` : '', cd ? 'description updated' : ''].filter(Boolean).join(', ');
    logActivity(`${myName()} updated “${t.title}” (${what})`, 'Operations', st === 'Done' ? '#10b981' : '#2563eb');
    addNotification(`${myName()} updated “${t.title}” (${what})`, 'operations');
    save(); closeDrawer(); afterChange(); toast({ title: 'Task updated', message: t.title });
  },
  'leave-approve'(el) {
    const r = db.leaveRequests.find(x => x.id === el.dataset.id); if (!r) return; const e = db.employees.find(x => x.id === r.empId);
    askConfirm({ title: 'Approve leave request?', message: `${empNameById(r.empId)} · ${leaveType(r)} · ${r.from} → ${r.to} (${r.days} working day${r.days === 1 ? '' : 's'})${r.type === 'Vacation' ? '. The days will be deducted from their vacation balance.' : '.'}`, confirmLabel: 'Approve', tone: 'green', onConfirm() {
      r.status = 'Approved';
      if (e) { if (r.type === 'Vacation') e.vacations = Math.max(0, e.vacations - r.days); else e.sick += r.days; }
      addNotification(`Your ${leaveType(r).toLowerCase()} request (${r.from} → ${r.to}) was approved`, 'hr', r.empId);
      logActivity(`Leave approved for ${empNameById(r.empId)}`, 'Human Resources', '#10b981');
      save(); afterChange(); toast({ title: 'Leave approved', message: empNameById(r.empId) });
    } });
  },
  'leave-reject'(el) {
    const r = db.leaveRequests.find(x => x.id === el.dataset.id); if (!r) return;
    askConfirm({ title: 'Reject leave request?', message: `${empNameById(r.empId)} · ${leaveType(r)} · ${r.from} → ${r.to}. The employee will be notified.`, confirmLabel: 'Reject', tone: 'danger', onConfirm() {
      r.status = 'Rejected';
      addNotification(`Your ${leaveType(r).toLowerCase()} request (${r.from} → ${r.to}) was rejected`, 'hr', r.empId);
      logActivity(`Leave rejected for ${empNameById(r.empId)}`, 'Human Resources', '#f43f5e');
      save(); afterChange(); toast({ type: 'info', title: 'Leave rejected', message: empNameById(r.empId) });
    } });
  },
  'leave-cancel'(el) {
    const r = db.leaveRequests.find(x => x.id === el.dataset.id); if (!r || r.status !== 'Pending' || r.empId !== getAuth().empId) return;
    askConfirm({ title: 'Cancel this request?', message: `Your ${leaveType(r).toLowerCase()} request for ${r.from} → ${r.to} will be withdrawn.`, confirmLabel: 'Cancel request', cancelLabel: 'Keep it', tone: 'danger', onConfirm() {
      const i = db.leaveRequests.indexOf(r); db.leaveRequests.splice(i, 1); save(); afterChange(); toast({ type: 'info', title: 'Request cancelled' });
    } });
  },
  'toggle-pass'(el) { const i = $('#login-form').elements.password; const show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.innerHTML = icon(show ? 'eye-off' : 'eye', 16); el.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); },
};

/* =====================================================================
   Menus, search, notifications
   ===================================================================== */
function closeMenus() { $$('.menu').forEach(m => { m.hidden = true; }); const r = $('#gsearch-results'); if (r) r.hidden = true; $$('[data-menu][aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
function toggleMenu(name) {
  const m = $(`#menu-${name}`); if (!m) return;
  const open = m.hidden; closeMenus(); m.hidden = !open;
  $$(`[data-menu="${name}"]`).forEach(b => b.setAttribute('aria-expanded', String(open)));
  if (name === 'bell') renderBell(true);
}
function renderBell(list) {
  const mine = myNotifs(), unread = mine.filter(n => !n.read).length;
  const dot = $('#bell-dot'); if (dot) dot.hidden = unread === 0;
  const el = $('#notif-list'); if (!el || (!list && $('#menu-bell').hidden)) return;
  el.innerHTML = mine.length ? mine.map(n => `<button class="notif-item ${n.read ? '' : 'unread'}" data-action="open-notif" data-id="${n.id}"><span class="nd"></span><span>${esc(n.text)}<small>${esc(n.when)}</small></span></button>`).join('') : '<div class="res-empty">You are all caught up.</div>';
}
function runSearch(q) {
  const box = $('#gsearch-results'); q = q.trim();
  if (!q) { box.hidden = true; return; }
  const admin = isAdmin(), me = myName();
  const tasks = ['Tasks', 'task', db.tasks.filter(t => (admin || t.assignee === me) && match(q, t.title, t.assignee)).map(t => [t.id, t.title, t.assignee])];
  const files = ['Files', 'file', db.files.filter(f => match(q, f.name, projectName(f.projectId))).map(f => [f.id, f.name, projectName(f.projectId)])];
  const groups = (admin ? [
    ['Projects', 'project', db.projects.filter(p => match(q, p.name, clientName(p.clientId))).map(p => [p.id, p.name, clientName(p.clientId)])],
    tasks,
    ['Clients', 'client', db.clients.filter(c => match(q, c.name, c.industry, c.contact)).map(c => [c.id, c.name, c.industry])],
    files,
  ] : [tasks, files]).filter(g => g[2].length);
  box.hidden = false;
  box.innerHTML = groups.length ? groups.map(([label, type, items]) => `<div class="res-group">${label}</div>${items.slice(0, 4).map(([id, name, sub]) => `<button class="res-item" data-action="goto-result" data-type="${type}" data-id="${esc(id)}"><span><b>${esc(name)}</b><small>${esc(sub)}</small></span></button>`).join('')}`).join('') : `<div class="res-empty">No results for “${esc(q)}”.</div>`;
}

/* =====================================================================
   Rendering
   ===================================================================== */
function currentRoute() { return (location.hash.replace(/^#\/?/, '').split('?')[0]) || 'dashboard'; }

function mountLogin() {
  $('#app').innerHTML = `
  <div class="login">
    <div class="login-art">
      <div class="logo"><div class="logo-mark">${icon('zap', 16)}</div><div><b>InfinityOS</b><small>Version 1.0.1</small></div></div>
      <div><h2>Run every project, client and invoice from one workspace.</h2>
        <ul><li>${icon('check', 16)}Live production timelines and kanban boards</li><li>${icon('check', 16)}Invoicing, receivables and client accounts</li><li>${icon('check', 16)}Social calendar, automations and team chat</li></ul></div>
      <small class="foot">© ${new Date().getFullYear()} InfinityOS</small>
    </div>
    <div class="login-form"><div class="login-card">
      <h1>Welcome back</h1><p>Sign in to your agency workspace.</p>
      <form id="login-form" novalidate>
        <div class="banner" id="login-error" role="alert" hidden>${icon('alert-triangle', 16)}<span></span></div>
        <div class="field"><label for="l-email">Email</label><div class="iw">${icon('mail', 16)}<input id="l-email" name="email" type="email" placeholder="you@company.com" autocomplete="username"></div></div>
        <div class="field"><label for="l-pass">Password</label><div class="iw">${icon('lock', 16)}<input id="l-pass" name="password" type="password" placeholder="••••••••" autocomplete="current-password"><button type="button" class="eye" data-action="toggle-pass" aria-label="Show password">${icon('eye', 16)}</button></div></div>
        <div class="opts"><label><input type="checkbox" name="remember" checked> Keep me signed in</label></div>
        <button class="btn btn-primary btn-block" type="submit">Sign in</button>
      </form>
      <div class="demo"><b>Demo access</b>
        <div class="d-row"><span>Admin<br><code>${DEMO.admin[0]}</code> · <code>${DEMO.admin[1]}</code></span><button class="btn btn-outline btn-sm" data-action="demo-login" data-who="admin">Fill in</button></div>
        <div class="d-row"><span>Employee<br><code>${DEMO.employee[0]}</code> · <code>${DEMO.employee[1]}</code></span><button class="btn btn-outline btn-sm" data-action="demo-login" data-who="employee">Fill in</button></div></div>
    </div></div>
  </div>`;
  document.title = 'Sign in · InfinityOS';
  const form = $('#login-form'), err = $('#login-error');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.elements.email.value.trim().toLowerCase(), pass = form.elements.password.value;
    const fail = m => { $('span', err).textContent = m; err.hidden = false; form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); };
    if (!email || !pass) return fail('Enter your email and password.');
    const u = authenticate(email, pass);
    if (!u) return fail('Invalid email or password.');
    setAuth(u, form.elements.remember.checked);
    location.hash = '#/' + (u.role === 'admin' ? 'dashboard' : 'operations');
    toast({ title: `Welcome back, ${u.name.split(' ')[0]}`, message: 'You are signed in.' });
  });
  form.elements.email.focus();
}

function mountShell(route, user) {
  let collapsed = false; try { collapsed = localStorage.getItem(SB_KEY) === '1'; } catch (e) { /* ignore */ }
  $('#app').innerHTML = `
  <div class="shell ${collapsed ? 'collapsed' : ''}">
    <div class="sb-scrim" data-action="close-sidebar"></div>
    <aside class="sidebar" aria-label="Primary">
      <div class="sb-head">
        <div class="logo"><div class="logo-mark">${icon('zap', 16)}</div><div><b>InfinityOS</b><small>Version 1.0.1</small></div></div>
        <button class="icon-btn" id="sb-toggle" data-action="toggle-sidebar" aria-label="Toggle sidebar">${icon('chevron-left', 16)}</button>
      </div>
      <nav class="sb-nav">${navFor().map(g => `<div class="nav-sec"><div class="nav-label">${g.sec}</div>${g.items.map(([r, label, ic]) => `<a class="nav-item ${r === route ? 'on' : ''}" href="#/${r}" ${r === route ? 'aria-current="page"' : ''} title="${esc(label)}">${icon(ic, 16)}<span>${esc(label)}</span></a>`).join('')}</div>`).join('')}</nav>
      <div class="sb-foot">
        <button class="foot-btn" data-action="settings">${icon('settings', 16)}<span>Settings</span></button>
        <button class="foot-btn" data-action="help">${icon('circle-help', 16)}<span>Help & Support</span></button>
        <div class="menu-anchor"><button class="user-btn" data-action="menu" data-menu="user" aria-haspopup="menu" aria-expanded="false"><span class="avatar">${esc(initials(user.name))}</span><span class="user-meta"><b>${esc(user.name)}</b><small>${esc(user.title)}</small></span></button>
          <div class="menu up" id="menu-user" role="menu" hidden><div class="menu-head"><span>${esc(user.email)}</span></div><button class="menu-item" role="menuitem" data-action="settings">${icon('settings', 14)}Settings</button><div class="menu-sep"></div><button class="menu-item danger" role="menuitem" data-action="logout">${icon('log-out', 14)}Sign out</button></div></div>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="burger" data-action="open-sidebar" aria-label="Open menu">${icon('menu', 18)}</button>
        <div class="gsearch"><label class="box">${icon('search', 16)}<span class="sr">Search</span><input id="gsearch-input" type="search" placeholder="Search projects, tasks, clients, files..." autocomplete="off"></label><div class="results" id="gsearch-results" hidden></div></div>
        <div class="top-actions">
          <div class="menu-anchor"><button class="btn btn-primary btn-sm" data-action="menu" data-menu="create" aria-haspopup="menu" aria-expanded="false">${icon('plus', 16)}<span>Quick Create</span>${icon('chevron-down', 12)}</button>
            <div class="menu" id="menu-create" role="menu" hidden>
              ${quickCreate().map(([e, l, ic]) => `<button class="menu-item" role="menuitem" data-action="open-new" data-entity="${e}">${icon(ic, 14)}${l}</button>`).join('')}
            </div></div>
          <div class="menu-anchor"><button class="bell-btn" data-action="menu" data-menu="bell" aria-label="Notifications" aria-haspopup="menu" aria-expanded="false">${icon('bell', 16)}<span class="dot" id="bell-dot" hidden></span></button>
            <div class="menu notif" id="menu-bell" hidden><div class="menu-head"><b style="color:var(--ink-2)">Notifications</b><button data-action="read-all">Mark all as read</button></div><div class="notif-list" id="notif-list"></div></div></div>
        </div>
      </header>
      <main class="page" id="page"></main>
    </div>
  </div>`;
  const input = $('#gsearch-input');
  input.addEventListener('input', () => runSearch(input.value));
  input.addEventListener('focus', () => { if (input.value.trim()) runSearch(input.value); });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; closeMenus(); input.blur(); } if (e.key === 'ArrowDown') { $('#gsearch-results .res-item')?.focus(); e.preventDefault(); } });
  renderPage(); renderBell();
}

function renderPage() {
  const route = currentRoute(), page = $('#page'); if (!page || !ROUTES[route]) return;
  const active = document.activeElement, key = active?.dataset?.filter, pos = active?.selectionStart;
  const scrollY = window.scrollY;
  page.innerHTML = ROUTES[route][1]();
  window.scrollTo(0, scrollY);
  if (key) { const el = $(`[data-filter="${key}"]`, page); if (el) { el.focus(); if (pos != null && el.setSelectionRange && el.type !== 'search') { try { el.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } } else if (pos != null) { const v = el.value; el.value = ''; el.value = v; } } }
  if (route === 'communication') { const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight; bindComposer(); }
}
function bindComposer() {
  const form = $('#composer'); if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = form.elements.msg.value.trim(); if (!text) return;
    const u = getAuth(), d = new Date();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    db.messages[ui.channel].push({ who: u.name, time, text }); save(); renderPage(); $('#composer input').focus();
  });
}

function render() {
  const route = currentRoute(), user = getAuth();
  closeAll();
  if (!user) { if (route !== 'login') { location.hash = '#/login'; return; } mountLogin(); return; }
  if (route === 'login' || !ROUTES[route] || !allowed(route)) { location.hash = '#/' + homeRoute(); return; }
  mountShell(route, user);
  document.title = `${ROUTES[route][0]} · InfinityOS`;
  window.scrollTo(0, 0);
}

/* =====================================================================
   Global events
   ===================================================================== */
document.addEventListener('click', e => {
  if (e.target.matches('.overlay[data-overlay]')) { closeModal(); return; }
  if (e.target.matches('[data-drawer-overlay]')) { closeDrawer(); return; }
  if (e.target.closest('[data-close-drawer]')) { closeDrawer(); return; }
  const el = e.target.closest('[data-action]');
  if (!el) { if (!e.target.closest('.menu-anchor') && !e.target.closest('.gsearch')) closeMenus(); return; }
  const fn = ACTIONS[el.dataset.action];
  if (fn) { if (!['menu', 'open-notif', 'goto-result', 'read-all'].includes(el.dataset.action)) { /* keep menus open only for their own controls */ } fn(el, e); }
  if (!el.closest('.menu-anchor') && !el.closest('.gsearch')) closeMenus();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('#modal-root').firstChild) closeModal();
    else if ($('#drawer-root').firstChild) closeDrawer();
    else closeMenus();
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-action]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-filter]'); if (!el) return;
  const [page, key] = el.dataset.filter.split('.'); ui[page][key] = el.value; renderPage();
});
document.addEventListener('change', e => {
  const el = e.target.closest('select[data-filter]'); if (!el) return;
  const [page, key] = el.dataset.filter.split('.'); ui[page][key] = el.value; renderPage();
});
/* kanban drag & drop */
let dragId = null;
document.addEventListener('dragstart', e => { const c = e.target.closest('[data-drag]'); if (!c) return; dragId = c.dataset.drag; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (err) { /* ignore */ } });
document.addEventListener('dragend', () => { dragId = null; $$('.dragging, .over').forEach(x => x.classList.remove('dragging', 'over')); });
document.addEventListener('dragover', e => { const col = e.target.closest('[data-drop]'); if (col && dragId) { e.preventDefault(); $$('.col.over').forEach(c => c !== col && c.classList.remove('over')); col.classList.add('over'); } });
function dropTask(id, s) {
  const t = db.tasks.find(x => x.id === id); if (!t) return;
  if (!isAdmin() && t.assignee !== myName()) return;
  const cur = t.status === 'Overdue' ? 'To Do' : t.status;
  if (cur === s) { renderPage(); return; }
  const prev = t.status, prevUpd = t.updated;
  t.status = s; t.updated = { by: myName(), when: todayISO() };
  logActivity(`${myName()} moved “${t.title}” to ${s}`, 'Operations', s === 'Done' ? '#10b981' : '#2563eb');
  if (!isAdmin()) addNotification(`${myName()} moved “${t.title}” to ${s}`, 'operations');
  save(); renderPage(); renderBell();
  toast({ type: 'info', title: `Moved to ${s}`, message: t.title, action: { label: 'Undo', fn() { t.status = prev; t.updated = prevUpd; save(); renderPage(); } } });
}
document.addEventListener('drop', e => {
  const col = e.target.closest('[data-drop]'); if (!col || !dragId) return; e.preventDefault();
  const id = dragId, s = col.dataset.drop; dragId = null;
  if (col.dataset.kind === 'task') { dropTask(id, s); return; }
  const p = projectById(id);
  if (!p || p.status === s) { renderPage(); return; }
  const prev = { status: p.status, progress: p.progress };
  p.status = s; if (s === 'Completed') p.progress = 100;
  logActivity(`“${p.name}” moved to ${s}`, 'Projects Master'); save(); renderPage();
  toast({ type: 'info', title: `Moved to ${s}`, message: p.name, action: { label: 'Undo', fn() { Object.assign(p, prev); save(); renderPage(); } } });
});
window.addEventListener('hashchange', render);
window.addEventListener('storage', e => { if (e.key === AUTH_KEY && !getAuth()) render(); });

render();
})();

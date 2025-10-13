import { Application, CreateApplicationData, Note, CreateNoteData, ApiResponse } from '../types';

// Mock data
const mockApplications: Application[] = [
  {
    id: '1',
    company: 'TechCorp',
    role: 'Senior Frontend Developer',
    date: '2024-01-15',
    updatedAt: '2024-01-20',
    status: 'Interviewing',
    notes: [
      {
        id: '1',
        content: 'Had initial phone screening with HR. Moving to technical round.',
        createdAt: '2024-01-18'
      }
    ],
    history: [
      { date: '2024-01-15', event: 'Application submitted' },
      { date: '2024-01-18', event: 'Phone screening completed' },
      { date: '2024-01-20', event: 'Status changed to Interviewing' }
    ]
  },
  {
    id: '2',
    company: 'StartupXYZ',
    role: 'Full Stack Developer',
    date: '2024-01-10',
    updatedAt: '2024-01-12',
    status: 'Applied',
    notes: [],
    history: [
      { date: '2024-01-10', event: 'Application submitted' }
    ]
  },
  {
    id: '3',
    company: 'BigTech Inc',
    role: 'React Developer',
    date: '2024-01-05',
    updatedAt: '2024-01-25',
    status: 'Offer',
    notes: [
      {
        id: '2',
        content: 'Great interview process. Team seems fantastic!',
        createdAt: '2024-01-22'
      },
      {
        id: '3',
        content: 'Received offer! Salary: $120k + equity. Need to respond by Friday.',
        createdAt: '2024-01-25'
      }
    ],
    history: [
      { date: '2024-01-05', event: 'Application submitted' },
      { date: '2024-01-08', event: 'Phone screening completed' },
      { date: '2024-01-15', event: 'Technical interview completed' },
      { date: '2024-01-22', event: 'Final interview completed' },
      { date: '2024-01-25', event: 'Offer received' }
    ]
  },
  {
    id: '4',
    company: 'MidCorp',
    role: 'Frontend Engineer',
    date: '2023-12-28',
    updatedAt: '2024-01-03',
    status: 'Rejected',
    notes: [
      {
        id: '4',
        content: 'They went with a candidate with more backend experience.',
        createdAt: '2024-01-03'
      }
    ],
    history: [
      { date: '2023-12-28', event: 'Application submitted' },
      { date: '2024-01-02', event: 'Phone screening completed' },
      { date: '2024-01-03', event: 'Application rejected' }
    ]
  },
  {
    id: '5',
    company: 'WebAgency',
    role: 'React Native Developer',
    date: '2023-12-20',
    updatedAt: '2023-12-20',
    status: 'Archived',
    notes: [],
    history: [
      { date: '2023-12-20', event: 'Application submitted' },
      { date: '2023-12-20', event: 'Application archived - position filled' }
    ]
  }
];

let applications = [...mockApplications];

export async function getApplications(): Promise<ApiResponse<Application[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: applications.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      });
    }, 300);
  });
}

export async function getApplication(id: string): Promise<ApiResponse<Application>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const application = applications.find(app => app.id === id);
      if (application) {
        resolve({ data: application });
      } else {
        reject(new Error('Application not found'));
      }
    }, 200);
  });
}

export async function createApplication(data: CreateApplicationData): Promise<ApiResponse<Application>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newApplication: Application = {
        id: (applications.length + 1).toString(),
        company: data.company,
        role: data.role,
        date: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: data.status,
        notes: [],
        history: [
          { date: new Date().toISOString().split('T')[0], event: 'Application submitted' }
        ]
      };
      
      applications.push(newApplication);
      resolve({ data: newApplication });
    }, 500);
  });
}

export async function updateApplicationStatus(id: string, status: Application['status']): Promise<ApiResponse<Application>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const applicationIndex = applications.findIndex(app => app.id === id);
      if (applicationIndex === -1) {
        reject(new Error('Application not found'));
        return;
      }

      const application = applications[applicationIndex];
      const updatedApplication = {
        ...application,
        status,
        updatedAt: new Date().toISOString().split('T')[0],
        history: [
          ...application.history,
          { date: new Date().toISOString().split('T')[0], event: `Status changed to ${status}` }
        ]
      };
      
      applications[applicationIndex] = updatedApplication;
      resolve({ data: updatedApplication });
    }, 300);
  });
}

export async function addNoteToApplication(id: string, data: CreateNoteData): Promise<ApiResponse<Note>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const applicationIndex = applications.findIndex(app => app.id === id);
      if (applicationIndex === -1) {
        reject(new Error('Application not found'));
        return;
      }

      const newNote: Note = {
        id: Date.now().toString(),
        content: data.content,
        createdAt: new Date().toISOString()
      };
      
      applications[applicationIndex].notes.push(newNote);
      applications[applicationIndex].updatedAt = new Date().toISOString().split('T')[0];
      applications[applicationIndex].history.push({
        date: new Date().toISOString().split('T')[0],
        event: 'Note added'
      });
      
      resolve({ data: newNote });
    }, 200);
  });
}

export async function deleteNote(applicationId: string, noteId: string): Promise<ApiResponse<void>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const applicationIndex = applications.findIndex(app => app.id === applicationId);
      if (applicationIndex === -1) {
        reject(new Error('Application not found'));
        return;
      }

      const noteIndex = applications[applicationIndex].notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) {
        reject(new Error('Note not found'));
        return;
      }

      applications[applicationIndex].notes.splice(noteIndex, 1);
      applications[applicationIndex].updatedAt = new Date().toISOString().split('T')[0];
      
      resolve({ data: undefined });
    }, 200);
  });
}

import apiClient from './apiClient';
import type { Application, NewApplication, ApplicationUpdate, Note } from './types';

// |--- Job Applications ---

/**
 * Fetches all job applications for the logged-in user.
 */
export const getAllApplications = async (): Promise<Application[]> => {
  const response = await apiClient.get<Application[]>('/applications');
  return response.data;
};

/**
 * Fetches a single job application by its ID.
 */
export const getApplicationById = async (id: string): Promise<Application> => {
  const response = await apiClient.get<Application>(`/applications/${id}`);
  return response.data;
};

/**
 * Creates a new job application.
 */
export const createApplication = async (newApplicationData: NewApplication): Promise<Application> => {
  const response = await apiClient.post<Application>('/applications', newApplicationData);
  return response.data;
};

/**
 * Updates an existing job application.
 */
export const updateApplication = async (id: string, updateData: ApplicationUpdate): Promise<Application> => {
  const response = await apiClient.put<Application>(`/applications/${id}`, updateData);
  return response.data;
};

/**
 * Archives a job application (soft delete).
 */
export const archiveApplication = async (id: string): Promise<void> => {
  await apiClient.delete(`/applications/${id}`);
};

// |--- Application Notes ---

/**
 * Adds a note to a specific application.
 */
export const addNoteToApplication = async (applicationId: string, content: string): Promise<Note> => {
  const response = await apiClient.post<Note>(`/applications/${applicationId}/notes`, { content });
  return response.data;
};

/**
 * Updates a specific note within an application.
 */
export const updateNote = async (applicationId: string, noteId: string, content: string): Promise<Note> => {
  const response = await apiClient.put<Note>(`/applications/${applicationId}/notes/${noteId}`, { content });
  return response.data;
};

/**
 * Deletes a note from an application.
 */
export const deleteNote = async (applicationId: string, noteId: string): Promise<void> => {
  await apiClient.delete(`/applications/${applicationId}/notes/${noteId}`);
};

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

// A helper to create an authenticated API client
const createApiClient = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return axios.create({
    baseURL: '/api', // We'll use a proxy to avoid CORS issues
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If auth is done and there's no user, redirect to login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    // If there is a user, fetch their links
    if (user) {
      fetchLinks();
    }
  }, [user, authLoading, router]);

  const fetchLinks = async () => {
    try {
      setLoadingLinks(true);
      setError('');
      const apiClient = await createApiClient();
      const { data } = await apiClient.get('/links');
      setLinks(data);
    } catch (err) {
      setError('Failed to fetch links. Please try again.');
      console.error(err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink) return;
    try {
      setError('');
      const apiClient = await createApiClient();
      const { data: addedLink } = await apiClient.post('/links', { url: newLink });
      setLinks([addedLink, ...links]);
      setNewLink('');
    } catch (err) {
      setError('Failed to add link. Please make sure the URL is valid.');
      console.error(err);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      setError('');
      const apiClient = await createApiClient();
      await apiClient.delete(`/links/${linkId}`);
      setLinks(links.filter(link => link.id !== linkId));
    } catch (err) {
       setError('Failed to delete link.');
       console.error(err);
    }
  };

  // Render a loading state while checking for user session or loading links
  if (authLoading || loadingLinks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is authenticated, render the dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">LinkMonitor.io</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">Welcome, {user.email}</span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <div className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded">{error}</div>}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Add a new link</h2>
            <form onSubmit={handleAddLink} className="flex">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://example.com/affiliate-link"
                required
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700"
              >
                Add Link
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Your Links</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {links.length > 0 ? links.map((link) => (
                  <li key={link.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{link.url}</p>
                      {/* Status display will be added later */}
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Added on: {new Date(link.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button onClick={() => handleDeleteLink(link.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </div>
                  </li>
                )) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">You haven't added any links yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

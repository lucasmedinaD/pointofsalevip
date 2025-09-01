import { useState } from 'react';

const sampleLinks = [
  { id: 1, url: 'https://amazon.com/product-a', status: 'OK', lastScanned: '2 hours ago' },
  { id: 2, url: 'https://bestbuy.com/product-b', status: '404 Not Found', lastScanned: '2 hours ago' },
  { id: 3, url: 'https://walmart.com/product-c', status: 'Out of Stock', lastScanned: '2 hours ago' },
];

export default function DashboardPage() {
  const [links, setLinks] = useState(sampleLinks);
  const [newLink, setNewLink] = useState('');

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLink) return;
    const newLinkObject = {
      id: links.length + 1,
      url: newLink,
      status: 'Pending',
      lastScanned: 'Never',
    };
    setLinks([...links, newLinkObject]);
    setNewLink('');
  };

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
              <button className="px-4 py-2 text-sm text-gray-700">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                {links.map((link) => (
                  <li key={link.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{link.url}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            link.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {link.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Last scanned: {link.lastScanned}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

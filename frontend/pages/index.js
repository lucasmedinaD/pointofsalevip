import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to LinkMonitor.io</h1>
      <p className="text-lg text-gray-600 mb-8">Stop losing money on broken affiliate links.</p>
      <div className="flex space-x-4">
        <Link href="/login">
          <a className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Login</a>
        </Link>
        <Link href="/register">
          <a className="px-6 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-gray-100">
            Sign Up
          </a>
        </Link>
      </div>
    </div>
  );
}

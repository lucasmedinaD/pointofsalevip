import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

// A helper to create an authenticated API client
const createApiClient = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return axios.create({
    baseURL: '/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const plans = [
  {
    name: 'Hobby',
    price: '$12',
    priceId: 'price_hobby_placeholder', // Replace with your actual Stripe Price ID
    features: ['500 Links', 'Daily Scans', 'Email Alerts'],
  },
  {
    name: 'Pro',
    price: '$25',
    priceId: 'price_pro_placeholder', // Replace with your actual Stripe Price ID
    features: ['2,000 Links', 'Daily Scans', 'Email & Slack Alerts', 'Priority Support'],
  },
];

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (priceId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiClient = await createApiClient();
      const { data } = await apiClient.post('/billing/create-checkout-session', { priceId });
      // Redirect to Stripe Checkout
      router.push(data.url);
    } catch (err) {
      setError('Failed to start subscription. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Basic Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">LinkMonitor.io</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4">Pricing Plans</h1>
          <p className="text-xl text-center text-gray-600 mb-12">Choose the plan that's right for you.</p>
          {error && <div className="mb-8 text-center text-red-600 bg-red-100 p-3 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-white rounded-lg shadow-lg p-8 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-4xl font-extrabold text-gray-900">{plan.price}<span className="text-lg font-medium text-gray-500">/mo</span></p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <button
                    onClick={() => handleSubscribe(plan.priceId)}
                    disabled={loading || authLoading}
                    className="w-full py-3 px-6 border border-transparent rounded-md text-center font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Redirecting...' : 'Subscribe'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

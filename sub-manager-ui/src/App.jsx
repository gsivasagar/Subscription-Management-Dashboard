import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// CRITICAL: Ensure cookies are sent with requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({
    serviceName: '',
    cost: '',
    billingCycle: 'MONTHLY',
    startDate: ''
  });

  // 1. Check Login Status on Load and Start Polling
  useEffect(() => {
    let intervalId;

    axios.get('/api/user')
      .then(res => {
        // Safety Check: Ensure we actually have user data
        if (res.data && (res.data.id || res.data.emails)) {
            setUser(res.data);
            fetchSubs();

            // Start polling every 5 seconds for live updates
            intervalId = setInterval(fetchSubs, 5000);
        }
      })
      .catch(() => console.log("Not logged in"));

    // Cleanup interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const fetchSubs = () => {
      axios.get('/api/subscriptions')
        .then(res => setSubs(res.data))
        .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/subscriptions', form)
      .then(response => {
        setSubs([...subs, response.data]);
        setForm({ serviceName: '', cost: '', billingCycle: 'MONTHLY', startDate: '' });
      })
      .catch(error => alert("Error adding: " + error.message));
  };

  const handleDelete = (id) => {
    if(!window.confirm("Delete this subscription?")) return;
    axios.delete(`/api/subscriptions/${id}`)
      .then(() => setSubs(subs.filter(sub => sub.id !== id)))
      .catch(error => console.error(error));
  };

  // --- VIEW 1: LOGIN PAGE ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              {/* <span className="text-3xl"></span> */}
            </div>
            <h1 className="text-3xl font-extrabold mb-4 text-gray-800 text-center">
              Subscription Manager
            </h1>
            <p className="mb-8 text-gray-500 leading-relaxed text-center">
              Stop losing money on forgotten subscriptions. Track, manage, and get alerted before you pay.
            </p>
            
            <a 
                href={`${API_URL}/auth/google`} 
                className="flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md w-full"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                Sign in with Google
            </a>
        </div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  // If we get here, 'user' is guaranteed to exist.
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
       
       {/* NAVBAR */}
       <nav className="bg-indigo-600 text-white shadow-lg relative">
         <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
            
            <div className="flex items-center gap-2">
              {/* <span className="text-2xl">💎</span> */}
            </div>

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <h1 className="text-xl font-bold tracking-wide uppercase whitespace-nowrap">
                  My Subscriptions
                </h1>
            </div>
            
            <div className="flex items-center gap-4 bg-indigo-700 px-4 py-2 rounded-full shadow-inner">
                {/* SAFETY CHECK: Use a default image if google photo is missing */}
                <img 
                  src={user.photos && user.photos[0] ? user.photos[0].value : "https://ui-avatars.com/api/?name=" + (user.displayName || "User")} 
                  className="w-8 h-8 rounded-full border-2 border-indigo-300" 
                  alt="User" 
                />
                <span className="font-medium text-sm hidden sm:block">
                  {user.displayName || "User"}
                </span>
                <a href={`${API_URL}/auth/logout`} className="text-indigo-200 hover:text-white text-sm font-bold ml-2 border-l pl-3 border-indigo-500">
                  Logout
                </a>
            </div>
         </div>
       </nav>

       <div className="max-w-6xl mx-auto p-6">
        
        {/* ADD FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>➕</span> Add New Subscription
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <input type="text" name="serviceName" placeholder="Service Name (e.g. Netflix)" value={form.serviceName} onChange={handleChange} className="md:col-span-4 bg-gray-50 border border-gray-200 rounded-lg p-3" required />
            <input type="number" name="cost" placeholder="Cost" value={form.cost} onChange={handleChange} className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-3" step="0.01" required />
            <select name="billingCycle" value={form.billingCycle} onChange={handleChange} className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-3" required />
            <button type="submit" className="md:col-span-2 bg-indigo-600 text-white font-bold rounded-lg p-3 hover:bg-indigo-700 transition-all">Add</button>
          </form>
        </div>

        {/* LIST SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subs.map(sub => (
            <div key={sub.id} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-2xl"></div>
              <div className="flex justify-between items-start mb-4 pl-3">
                <h3 className="text-xl font-bold text-gray-800">{sub.serviceName}</h3>
                <button onClick={() => handleDelete(sub.id)} className="text-gray-300 hover:text-red-500 text-xl font-bold">×</button>
              </div>
              <div className="pl-3">
                <p className="text-gray-500 text-xs uppercase font-bold">Renews: <span className="text-indigo-600">{sub.nextRenewalDate || "Unknown"}</span></p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">${sub.cost}</span>
                  <span className="text-sm text-gray-400 font-medium">/ {sub.billingCycle ? sub.billingCycle.toLowerCase() : 'mo'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">No subscriptions yet.</p>
            <p className="text-gray-300 text-sm">Add one above to get started!</p>
          </div>
        )}

       </div>
    </div>
  );
}

export default App;
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// axios.defaults.withCredentials = true;

// function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Attempt to get user
//     axios.get('http://localhost:3000/api/user')
//       .then(res => {
//         console.log("USER DATA:", res.data); // Look at Console for this!
//         if (res.data && (res.data.id || res.data.emails)) {
//             setUser(res.data);
//         }
//       })
//       .catch(err => console.log("Login Check Failed:", err));
//   }, []);

//   // VIEW 1: LOGIN PAGE
//   if (!user) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//         <h1 className="text-3xl font-bold mb-4">Subscription Manager</h1>
//         <a 
//             href="http://localhost:3000/auth/google" 
//             className="bg-white px-6 py-3 rounded shadow font-bold text-blue-600"
//         >
//             Login with Google
//         </a>
//       </div>
//     );
//   }

//   // VIEW 2: SAFE MODE DASHBOARD (No Lists, No Images)
//   return (
//     <div className="p-10">
//        <h1 className="text-4xl font-bold text-green-600 mb-4">
//          DASHBOARD WORKING
//        </h1>
       
//        <p className="text-xl mb-4">
//          Welcome, {user.displayName || "User"}
//        </p>

//        <div className="bg-yellow-100 p-4 mb-4 border border-yellow-400 text-yellow-800">
//          If you see this, the app is NOT broken. The crash was caused by the subscription list or profile photo.
//        </div>

//        <a 
//          href="http://localhost:3000/auth/logout"
//          className="bg-red-500 text-white px-4 py-2 rounded"
//        >
//          Logout (Reset)
//        </a>
//     </div>
//   );
// }

// export default App;
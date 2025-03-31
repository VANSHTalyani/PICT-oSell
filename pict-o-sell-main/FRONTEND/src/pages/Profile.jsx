import { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';

function Profile() {
  const [user] = useState({
    // Dummy data - replace with actual user data later
    name: 'John Doe',
    email: 'john.doe@college.edu',
    avatar: 'https://placehold.co/100x100',
  });

  const [listings] = useState([
    // Dummy data - replace with actual listings later
    {
      id: 1,
      title: 'Data Structures Textbook',
      price: 299,
      image: 'https://placehold.co/300x200',
      status: 'active',
    },
    // Add more dummy listings here
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button className="ml-auto flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <FiEdit2 />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">My Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{listing.title}</h3>
                <p className="text-primary-600 font-semibold">₹{listing.price}</p>
                <p className="text-sm text-gray-500 capitalize">{listing.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
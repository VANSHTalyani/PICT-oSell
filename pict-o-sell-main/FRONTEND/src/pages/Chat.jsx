import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

function Chat() {
  const [message, setMessage] = useState('');
  const [chats] = useState([
    // Dummy data - replace with actual chat data later
    {
      id: 1,
      user: {
        name: 'Jane Smith',
        avatar: 'https://placehold.co/40x40',
      },
      lastMessage: 'Is this still available?',
      timestamp: '2 hours ago',
    },
  ]);

  const [messages] = useState([
    // Dummy data - replace with actual messages later
    {
      id: 1,
      sender: 'them',
      text: 'Hi, is this still available?',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Yes, it is!',
      timestamp: '10:31 AM',
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement send message logic
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)] flex">
        {/* Chat list */}
        <div className="w-1/3 border-r">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <div className="space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <img
                    src={chat.user.avatar}
                    alt={chat.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chat.user.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium">Jane Smith</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'me' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'me'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'me' ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <FiSend />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
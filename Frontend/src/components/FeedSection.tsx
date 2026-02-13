import { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';

interface FeedPost {
  id: number;
  ownerName: string;
  busName: string;
  location: string;
  imageUrl: string;
  likes: number;
  comments: Comment[];
  description: string;
  liked: boolean;
}

interface Comment {
  id: number;
  username: string;
  text: string;
  timestamp: string;
}

const mockPosts: FeedPost[] = [
  {
    id: 1,
    ownerName: 'Metro Express',
    busName: 'Luxury AC Sleeper',
    location: 'New York - Boston Route',
    imageUrl: 'https://images.pexels.com/photos/1592800/pexels-photo-1592800.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 234,
    comments: [
      { id: 1, username: 'traveler_john', text: 'Amazing service! Very comfortable ride.', timestamp: '2h ago' },
      { id: 2, username: 'maria_travels', text: 'Clean and well maintained buses', timestamp: '5h ago' }
    ],
    description: 'Experience luxury travel with our new AC sleeper coaches. Comfortable seats, WiFi, and entertainment system included!',
    liked: false
  },
  {
    id: 2,
    ownerName: 'City Transport Co',
    busName: 'Premium Semi-Sleeper',
    location: 'Chicago - Detroit Route',
    imageUrl: 'https://images.pexels.com/photos/385997/pexels-photo-385997.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 156,
    comments: [
      { id: 1, username: 'alex_rider', text: 'Best bus service in the region!', timestamp: '1h ago' }
    ],
    description: 'New premium semi-sleeper buses now available on Chicago-Detroit route. Book your comfortable journey today!',
    liked: false
  },
  {
    id: 3,
    ownerName: 'Royal Travels',
    busName: 'Volvo Multi-Axle',
    location: 'Los Angeles - San Francisco',
    imageUrl: 'https://images.pexels.com/photos/139830/pexels-photo-139830.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 189,
    comments: [
      { id: 1, username: 'sarah_west', text: 'Punctual and professional service', timestamp: '3h ago' },
      { id: 2, username: 'mike_tours', text: 'Love the new fleet!', timestamp: '4h ago' }
    ],
    description: 'Introducing our new Volvo multi-axle buses with enhanced safety features and comfort.',
    liked: false
  }
];

function FeedSection() {
  const [posts, setPosts] = useState<FeedPost[]>(mockPosts);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});

  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: number) => {
    if (!newComment[postId]?.trim()) return;

    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              {
                id: post.comments.length + 1,
                username: 'current_user',
                text: newComment[postId],
                timestamp: 'Just now'
              }
            ]
          }
        : post
    ));

    setNewComment({ ...newComment, [postId]: '' });
  };

  const toggleComments = (postId: number) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Bus Owners Feed
      </h2>

      <div className="space-y-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.01] transition-all duration-300 animate-fade-in-up"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{post.ownerName}</h3>
                  <p className="text-sm text-gray-600">{post.busName}</p>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {post.location}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{post.description}</p>
            </div>

            <div className="relative overflow-hidden group">
              <img
                src={post.imageUrl}
                alt={post.busName}
                className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 group transition-all"
                  >
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        post.liked
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600 group-hover:text-red-500'
                      }`}
                    />
                    <span className="text-gray-700 font-semibold">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-semibold">{post.comments.length}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {showComments[post.id] && (
                <div className="border-t pt-4 animate-slide-down">
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900">{comment.username}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FeedSection;

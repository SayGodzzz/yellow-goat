import React, { useState, useEffect } from 'react';
import { API } from '../App';

export default function Dashboard({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newShort, setNewShort] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (currentPage === 'home') {
      fetchNews();
    }
  }, [currentPage]);

  const fetchNews = async () => {
    try {
      const response = await API.get('/news');
      setNews(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (user.role !== 'admin') {
      alert('Only admins can create news');
      return;
    }

    try {
      await API.post('/news', {
        title: newTitle,
        description: newDescription,
        short_description: newShort,
        image_url: newImage,
      });

      setNewTitle('');
      setNewDescription('');
      setNewShort('');
      setNewImage('');
      fetchNews();
    } catch (err) {
      alert('Error creating news: ' + err.message);
    }
  };

  const handleLike = async (newsId) => {
    try {
      const hasLiked = news.find(n => n.id === newsId)?.user_liked;
      if (hasLiked) {
        await API.post(`/news/${newsId}/unlike`);
      } else {
        await API.post(`/news/${newsId}/like`);
      }
      fetchNews();
    } catch (err) {
      console.error('Error liking news:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="header">
        <div className="logo">YC</div>
        <div className="header-title">Yellow Goat</div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="container">
        {currentPage === 'home' && (
          <> 
            <div className="welcome-box">
              <p className="welcome-text">Hey {user.username},</p>
              <p className="welcome-text">schön, dich hier in Yellow Goat zu sehen!</p>
            </div>

            <div className="selector-buttons">
              <button className="selector-btn active">Projekte</button>
              <button className="selector-btn">Für mich</button>
              <button className="selector-btn">Über YellowGoat</button>
              <button className="selector-btn">Time Control</button>
            </div>

            {user.role === 'admin' && (
              <form onSubmit={handleCreateNews} className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-4">Neue News erstellen</h3>
                <input
                  type="text"
                  placeholder="Titel"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Kurzbeschreibung"
                  value={newShort}
                  onChange={(e) => setNewShort(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
                />
                <textarea
                  placeholder="Beschreibung"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
                  rows="4"
                  required
                ></textarea>
                <input
                  type="url"
                  placeholder="Bild URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
                />
                <button
                  type="submit"
                  className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
                >
                  News erstellen
                </button>
              </form>
            )} 

            <div className="news-section">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="news-card"
                  onClick={() => setSelectedNews(item)}
                >
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="news-card-image" />
                  )}
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-gray-600 mt-2">{item.short_description}</p>
                  <div className="news-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleLike(item.id); }} className="flex-1">
                      ❤️ {item.likes_count}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedNews(item); }} className="flex-1">
                      💬 {item.comments_count}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {currentPage === 'chat' && (
          <div className="text-center text-gray-500 py-20">
            <h2 className="text-2xl font-bold mb-4">Chat</h2>
            <p>Chat-System wird bald implementiert...</p>
          </div>
        )}

        {currentPage === 'users' && (
          <div className="text-center text-gray-500 py-20">
            <h2 className="text-2xl font-bold mb-4">Mitarbeiterverzeichnis</h2>
            <p>Mitarbeiterliste wird bald implementiert...</p>
          </div>
        )}

        {currentPage === 'projects' && (
          <div className="text-center text-gray-500 py-20">
            <h2 className="text-2xl font-bold mb-4">Projekte</h2>
            <p>Projektmanagement wird bald implementiert...</p>
          </div>
        )}
      </div>

      {/* Modal für vollständige News */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <button
              onClick={() => setSelectedNews(null)}
              className="float-right text-2xl font-bold text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            {selectedNews.image_url && (
              <img src={selectedNews.image_url} alt={selectedNews.title} className="w-full max-h-80 object-cover rounded mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-4">{selectedNews.title}</h2>
            <p className="text-gray-700 mb-6">{selectedNews.description}</p>
            <p className="text-sm text-gray-500">Von {selectedNews.username}</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="footer">
        <button
          onClick={() => setCurrentPage('home')}
          className={currentPage === 'home' ? 'active' : ''}
        >
          🏠 Startseite
        </button>
        <button
          onClick={() => setCurrentPage('chat')}
          className={currentPage === 'chat' ? 'active' : ''}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setCurrentPage('users')}
          className={currentPage === 'users' ? 'active' : ''}
        >
          👥 Mitarbeiter
        </button>
        <button
          onClick={() => setCurrentPage('projects')}
          className={currentPage === 'projects' ? 'active' : ''}
        >
          📁 Projekte
        </button>
      </div>
    </div>
  );
}
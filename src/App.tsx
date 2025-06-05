import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faSearch,
  faSpinner,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import './App.css'

function App() {
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState('1')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('contents')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true)
    // Giả lập delay tìm kiếm
    setTimeout(() => setIsSearching(false), 1000)
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="icon-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search in document..."
              onChange={handleSearch}
            />
            <span className="search-icon">
              {isSearching ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
            </span>
          </div>
        </div>

        <div className="header-right">
          <div className="zoom-controls">
            <button className="icon-button">
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
            </button>
            <span>100%</span>
            <button className="icon-button">
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
            </button>
          </div>

          <div className="page-controls">
            <button className="icon-button">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <input
              type="text"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              className="page-input"
            />
            <span>/ 10</span>
            <button className="icon-button">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-tabs">
            <button
              className={`tab ${activeTab === 'contents' ? 'active' : ''}`}
              onClick={() => setActiveTab('contents')}
            >
              Contents
            </button>
            <button
              className={`tab ${activeTab === 'thumbnails' ? 'active' : ''}`}
              onClick={() => setActiveTab('thumbnails')}
            >
              Thumbnails
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'contents' ? (
              <div className="table-of-contents">
                <div className="toc-item">Chapter 1: Introduction</div>
                <div className="toc-item">Chapter 2: Getting Started</div>
                <div className="toc-item">Chapter 3: Advanced Topics</div>
              </div>
            ) : (
              <div className="thumbnails">
                <div className="thumbnail">Page 1</div>
                <div className="thumbnail">Page 2</div>
                <div className="thumbnail">Page 3</div>
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <div className="content">
          <div className="document-view">
            <span>No file selected</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

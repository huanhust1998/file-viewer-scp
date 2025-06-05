/**
 * STEP1: Config PDF.js worker: Đảm nhận xử lý các tác vụ nặng, đây là tác vụ quan trọng vì nó tránh việc tác động và main thread
 *  - Phân tích cú pháp (parsing) file PDF:
      +> File PDF có cấu trúc nhị phân phức tạp, cần giải nén, giải mã (decoding) và phân tích cấu trúc (xref, fonts, images...).
    - Render nội dung PDF:
      +> Chuyển đổi dữ liệu PDF thành các thành phần hiển thị (text, vector graphics, hình ảnh) trên Canvas/SVG.
    - Tính toán layout:
      +> Xử lý các phép toán phức tạp như chia trang, căn chỉnh văn bản, phân tích font chữ.

      [Main Thread] ────────────> [UI Render, Events]
       │
       │ (Gửi task)
       ↓
      [PDF Worker] ───────────> [Parse PDF, Render Pages]
       │
       │ (Gửi kết quả)
       ↑
      [Main Thread] <─────────── [Text/Canvas Data]
    
    STEP2: Sử dụng <Document/> và <Page/> trong react-pdf để view file

 */

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
import { Document, Page, pdfjs } from 'react-pdf'

type PDFViewerProps = {
  url?: string
}

//Config worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState('1')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // const [activeTab, setActiveTab] = useState('contents')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true)
    // Giả lập delay tìm kiếm
    setTimeout(() => setIsSearching(false), 1000)
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setCurrentPage(numPages.toString())
  }

  return (
    <>
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
        {/* Content */}
        <div className="content">
          <div className="document-view">
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={parseInt(currentPage)} />
            </Document>
          </div>
        </div>
      </main>
    </>
  )
}

export default PDFViewer

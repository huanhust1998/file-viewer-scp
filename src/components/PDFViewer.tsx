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
    
    STEP2: Sử dụng <Document/> và <Page/> trong react-pdf để view file, đồng thời cần thêm TextLayer và AnnotationLayer 

 */

/**
 * 1. Tại sao cần phải thêm TextLayer và AnnotationLayer
 * - Về bản chất thì react-pdf dựa trên thư viện PDF.js để phân tích cú pháp và render các tệp PDF.
 * - PDF.js đọc tệp PDF và trích xuất tất cả các thành phần cấu thành trang, bao gồm văn bản, hình ảnh đường vẽ ..., cùng thông tin về vị trí và kiểu dáng của chúng
 * - PDF.js sử dụng API của Canvas HTML5 để vẽ các thành phần này lên <canvas>
 * - react-pdf tạo ra một lớp văn bản riêng biệt là TextLayer bằng cách sử dụng các phần tử HTML(div, span) => giúp cho người dùng có thể tương tác với PDF.
 * - react-pdf đồng thời cũng tạo ra một lớp AnnotationLayer để giúp hiển thị và tương tác với các thành phần Links, Highlight ...
 */

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faSearch,
  faSpinner,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

type PDFViewerProps = {
  url?: string;
};

//Config worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // const [activeTab, setActiveTab] = useState('contents');
  const [errorMsg, setErrorMes] = useState<string>();
  const [inputPage, setInputPage] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [zoom, setZoom] = useState<number>(100);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      try {
        setIsSearching(true);
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage);
        const textContent = await page.getTextContent();
        // const viewport = page.getViewport({ scale: 1.0 });
        const textItems = textContent.items.map((item: any) => ({
          text: item.str,
          transform: item.transform,
          width: item.width,
          height: item.height,
          // position: {
          //   left: item.transform[4],
          //   top: viewport.height - item.transform
          // }
        }));
        const pageText = textItems.map((item) => item.text).join(" ");
        const regex = new RegExp(searchKeyword, "gi");
        const allMatches = pageText.match(regex);
        if (Array.isArray(allMatches)) setSearchResults(allMatches);
      } catch (error) {
        console.log({ error });
      } finally {
        setIsSearching(false);
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: { message: string }) => {
    setErrorMes(error.message);
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button
            className="icon-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="menu"
            type="button"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search in document..."
              value={searchKeyword}
              disabled={isSearching}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchKeyword(e.target.value);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleSearch(e)
              }
            />
            <span className="search-icon">
              {isSearching ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
            </span>
          </div>
          {!!searchResults.length && <div>1/{searchResults.length}</div>}
        </div>

        <div className="header-right">
          <div className="zoom-controls">
            <button
              className="icon-button"
              type="button"
              title="faMagnifyingGlassMinus"
              onClick={() => {
                if (zoom === 25) return;
                setZoom((zoom) => zoom - 25);
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
            </button>
            <span>{zoom}%</span>
            <button
              className="icon-button"
              type="button"
              title="faMagnifyingGlassPlus"
              onClick={() => {
                if (zoom === 200) return;
                setZoom((zoom) => zoom + 25);
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
            </button>
          </div>

          <div className="page-controls">
            <button
              className="icon-button"
              type="button"
              title="previous-page"
              onClick={() => {
                if (currentPage === 1) return;
                setCurrentPage((currentPage) => currentPage - 1);
                setInputPage((inputPage) => inputPage - 1);
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!inputPage) setCurrentPage(1);
                  else setCurrentPage(inputPage);
                }
              }}
              className="page-input"
              title="page-input"
            />
            <span>/ {numPages}</span>
            <button
              className="icon-button"
              type="button"
              title="next-page"
              onClick={() => {
                if (currentPage === numPages) return;
                setCurrentPage((currentPage) => currentPage + 1);
                setInputPage((inputPage) => inputPage + 1);
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Content */}
        {!errorMsg ? (
          <div className="content">
            <div className="document-view">
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              >
                {Array.from(new Array(numPages), (_, index) => index + 1).map(
                  (item, index) => (
                    <Page
                      pageNumber={item}
                      scale={zoom / 100}
                      key={index}
                    />
                  )
                )}
              </Document>
            </div>
          </div>
        ) : (
          <p>Loading PDF error</p>
        )}
      </main>
    </>
  );
};

export default PDFViewer;

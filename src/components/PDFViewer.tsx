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

import { useRef, useState } from "react";
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

type SearchResult = {
  pageNumber: number;
  text: string;
  index: number;
  position?: {
    lef: number;
    top: number;
    width: number;
    height: number;
  };
};

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [isOutlineVisible, setIsOutlineVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [zoom, setZoom] = useState<number>(100);
  const [pageInput, setPageInput] = useState<string>("1");
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigateSearchResult = (direction: "next" | "prev") => {};

  const handleSearchKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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

  const handlePrevPage = () => {};

  const handleNextPage = () => {};

  const handlePageInputChange = () => {};

  const handlePageInputKeyDown = () => {};

  const handlePageInputBlur = () => {};

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {};

  const onDocumentLoadError = (error: { message: string }) => {};

  const renderPage = () => {
    return <></>;
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button
            className="icon-button"
            onClick={() => setIsOutlineVisible(!isOutlineVisible)}
            title="menu"
            type="button"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              disabled={isSearching}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            <span className="search-icon">
              {isSearching ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
            </span>
          </div>
          {searchResults.length > 0 && (
            <div className="search-result">
              <span>
                {currentSearchIndex + 1}/{searchResults.length}
              </span>
              <div className="page-controls">
                <button
                  className="icon-button"
                  type="button"
                  title="previous-result"
                  onClick={() => navigateSearchResult("prev")}
                  disabled={currentSearchIndex <= 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  title="next-page"
                  onClick={() => navigateSearchResult("next")}
                  disabled={currentSearchIndex >= Number(searchQuery?.length)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="header-right">
          <div className="zoom-controls">
            <span>{zoom}%</span>
            <input
              type="range"
              min={25}
              max={200}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              title="range-zoom"
            />
          </div>

          <div className="page-controls">
            <button
              className="icon-button"
              type="button"
              title="previous-page"
              onClick={handlePrevPage}
              disabled={page <= 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
              className="page-input"
              title="page-input"
            />
            <span>/ {numPages}</span>
            <button
              className="icon-button"
              type="button"
              title="next-page"
              onClick={handleNextPage}
              disabled={page >= numPages}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      {url ? (
        <div className="main" ref={containerRef}>
          {loading && !error && <div>Loading ...</div>}
          {error && (
            <div>
              <div>Lối tải tài liệu</div>
              <div>{error}</div>
            </div>
          )}
          {!error && (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div>Đang tải trang</div>}
            >
              {numPages > 0 && (
                <div>
                  {Array.from(new Array(numPages), (_, index) => index + 1).map(
                    renderPage
                  )}
                </div>
              )}
            </Document>
          )}
        </div>
      ) : (
        <div>
          <div>Không có tài liệu</div>
        </div>
      )}
    </>
  );
};

export default PDFViewer;

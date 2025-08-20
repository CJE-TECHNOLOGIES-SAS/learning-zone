import HTMLFlipBook from "react-pageflip";
import pages from "../components/pagesDataStudent";
import "../components/styles/manualBookStudent.css";
import { useEffect, useRef } from "react";

const ManualBookStudent = () => {
  const bookRef = useRef<any>(null);

  const nextPage = () => {
    bookRef.current?.pageFlip().flipNext();
  };

  const prevPage = () => {
    bookRef.current?.pageFlip().flipPrev();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        prevPage();
      }
    };
        document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="book-container">
      <div>
        <HTMLFlipBook
          ref={bookRef}
          width={850}
          height={550}
          size="fixed"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1536}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startPage={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="book-flip"
        >
          {pages.map((page, index) => {
            const isCover = index === 0;
            const isBackCover = index === pages.length - 1;
            const pageClass = isCover
              ? "page cover-page"
              : isBackCover
              ? "page back-cover"
              : "page";

            return (
              <div key={index} className={pageClass}>
                <div className="page-content">{page.component}</div>
              </div>
            );
          })}
        </HTMLFlipBook>
      </div>

    </div>
  );
};

export default ManualBookStudent;

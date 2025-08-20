declare module "react-pageflip" {
  import * as React from "react";

  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    usePortrait?: boolean;
    startPage?: number;
    flippingTime?: number;
    drawShadow?: boolean;
    autoSize?: boolean;
    className?: string;
    children: React.ReactNode;
    
  }
  


  export default HTMLFlipBook;
}

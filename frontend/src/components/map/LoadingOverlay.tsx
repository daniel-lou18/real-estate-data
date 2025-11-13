interface LoadingOverlayProps {
  message?: string;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center";
}

const LoadingOverlay = ({
  message = "Loading...",
  position = "top-right",
}: LoadingOverlayProps) => {
  const getPositionStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      background: "rgba(255, 255, 255, 0.9)",
      padding: "8px 12px",
      borderRadius: "4px",
      fontSize: "14px",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    };

    switch (position) {
      case "top-right":
        return { ...baseStyles, top: "10px", right: "10px" };
      case "top-left":
        return { ...baseStyles, top: "10px", left: "10px" };
      case "bottom-right":
        return { ...baseStyles, bottom: "10px", right: "10px" };
      case "bottom-left":
        return { ...baseStyles, bottom: "10px", left: "10px" };
      case "center":
        return {
          ...baseStyles,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
      default:
        return { ...baseStyles, top: "10px", right: "10px" };
    }
  };

  return <div style={getPositionStyles()}>{message}</div>;
};

export default LoadingOverlay;

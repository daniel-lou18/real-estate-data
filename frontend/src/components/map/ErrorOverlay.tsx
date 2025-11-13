interface ErrorOverlayProps {
  message?: string;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center";
  variant?: "error" | "warning" | "info";
}

const ErrorOverlay = ({
  message = "An error occurred",
  position = "top-right",
  variant = "error",
}: ErrorOverlayProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return {
          background: "rgba(239, 68, 68, 0.9)",
          color: "white",
        };
      case "warning":
        return {
          background: "rgba(245, 158, 11, 0.9)",
          color: "white",
        };
      case "info":
        return {
          background: "rgba(59, 130, 246, 0.9)",
          color: "white",
        };
      default:
        return {
          background: "rgba(239, 68, 68, 0.9)",
          color: "white",
        };
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      padding: "8px 12px",
      borderRadius: "4px",
      fontSize: "14px",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      ...getVariantStyles(),
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

export default ErrorOverlay;

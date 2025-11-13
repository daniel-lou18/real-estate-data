import { useState, useCallback, useMemo } from "react";
import { useChat } from "@/hooks/chat";
import { useAggregatesFromParams } from "./useAggregatesFromParams";
import { useFilters } from "../map";

export type DataSource = "chat" | "map" | null;

/**
 * Orchestrates data from multiple sources (chat and map)
 * Manages which data source is most recent and should be displayed
 */
export function useDataOrchestrator() {
  const { state: filterState } = useFilters();
  const {
    data: chatData,
    isProcessing: chatProcessing,
    ...chatRest
  } = useChat();
  const { communeQuery, sectionQuery } = useAggregatesFromParams();
  const {
    data: mapData,
    isLoading: mapLoading,
    isError: isMapError,
    error: mapError,
  } = filterState.level === "section" ? sectionQuery : communeQuery;

  // Track the most recent data source
  const [lastDataSource, setLastDataSource] = useState<DataSource>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [manualOverride, setManualOverride] = useState<DataSource | null>(null);

  // Generate dynamic map data from chat results
  // Determine which data to show based on recency
  const { currentData, currentSource } = useMemo(() => {
    // Manual override takes precedence
    if (manualOverride) {
      if (manualOverride === "chat" && chatData.length > 0) {
        return { currentData: chatData, currentSource: "chat" as DataSource };
      }
      if (manualOverride === "map" && mapData && mapData.length > 0) {
        return { currentData: mapData, currentSource: "map" as DataSource };
      }
    }

    // If chat data is processing, show it immediately
    if (chatProcessing && chatData.length > 0) {
      return { currentData: chatData, currentSource: "chat" as DataSource };
    }

    // If we have chat data and it's newer than map data
    if (chatData.length > 0 && lastDataSource === "chat") {
      return { currentData: chatData, currentSource: "chat" as DataSource };
    }

    // If we have map data and it's newer than chat data
    if (mapData && mapData.length > 0 && lastDataSource === "map") {
      return { currentData: mapData, currentSource: "map" as DataSource };
    }

    // Default to chat data if available, otherwise map data
    if (chatData.length > 0) {
      return { currentData: chatData, currentSource: "chat" as DataSource };
    }

    if (mapData && mapData.length > 0) {
      return { currentData: mapData, currentSource: "map" as DataSource };
    }

    return { currentData: [], currentSource: null };
  }, [chatData, mapData, chatProcessing, lastDataSource, manualOverride]);

  // Update data source when chat data changes
  const handleChatDataUpdate = useCallback(() => {
    if (chatData.length > 0) {
      setLastDataSource("chat");
      setLastUpdateTime(Date.now());
    }
  }, [chatData]);

  // Update data source when map data changes
  const handleMapDataUpdate = useCallback(() => {
    if (mapData && mapData.length > 0) {
      setLastDataSource("map");
      setLastUpdateTime(Date.now());
    }
  }, [mapData]);

  // Auto-update when data changes
  useMemo(() => {
    if (chatData.length > 0) {
      handleChatDataUpdate();
    }
  }, [chatData, handleChatDataUpdate]);

  useMemo(() => {
    if (mapData && mapData.length > 0) {
      handleMapDataUpdate();
    }
  }, [mapData, handleMapDataUpdate]);

  // Toggle between data sources
  const handleDataSourceToggle = useCallback(() => {
    if (currentSource === "chat" && mapData && mapData.length > 0) {
      setManualOverride("map");
    } else if (currentSource === "map" && chatData.length > 0) {
      setManualOverride("chat");
    }
  }, [currentSource, mapData, chatData]);

  // Force switch to map data (called when map is clicked)
  const handleMapClick = useCallback(() => {
    if (mapData && mapData.length > 0) {
      setManualOverride("map");
      setLastDataSource("map");
      setLastUpdateTime(Date.now());
    }
  }, [mapData]);

  return {
    // Current data to display
    data: currentData,
    dataSource: currentSource,

    // Individual data sources (for debugging/advanced usage)
    chatData,
    mapData,

    // Loading and error states
    isProcessing: chatProcessing || mapLoading,
    chatProcessing,
    mapLoading,
    isMapError,
    mapError,

    // Metadata
    lastUpdateTime,
    lastDataSource,

    // Chat functionality
    ...chatRest,

    // Toggle functionality
    handleDataSourceToggle,
    handleMapClick,
  };
}
